import { Form, Input, Modal, Upload, Icon, Button, message } from 'antd';
import React, { Component } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { v1 } from 'node-uuid';
import request from '@/utils/request'

const { Dragger } = Upload;

class UploadImgForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileData: { task_id: v1() },
      confirmLoading: false,
      currentTaskid: '',
      taskids: [],
    };
  }

  state = {
    taskids: [],
  }

  handleCancel = () => {
    this.props.handleCancel('')
  }

  handleOk = () => {
    const { form, handleAdd } = this.props;
    this.props.handleOk(this.state.selectedArr)
    form.validateFields((err, fieldsValue) => {
      // console.log(this.state.fileData)
       if (err) return;
       form.resetFields();
       handleAdd(fieldsValue, this.state.taskids);
      this.props.handleOk(this.state.selectedArr)
     });
     this.setState({
      confirmLoading: true,
     })
  }

  normFile = e => {
    // console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  upload = getFieldDecorator => {
    const self = this
    const props = {
      name: 'file',
      multiple: false,
      accept: '.png, .jpg',
      action: `${request.host}file/upload`,
      // data: {
      //   taskid: self.state.currentTaskid,
      // },
      onChange(info) {
        // console.log('---333333333333333333333333333------')
        const { status } = info.file;
        if (status !== 'uploading') {
          // console.log(info.file, info.fileList);
        }
        if (status === 'done') {
          // message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
      beforeUpload (file) {
        console.log(self.state.taskids)
        // console.log(this.state.taskids)
        // const arr = self.state.taskids.push(file.uid)
        const arr = self.state.taskids
        const uuid = v1()
        arr.push(uuid)
        self.setState({
          taskids: arr,
          currentTaskid: uuid,
        })
        console.log('444444444444444444444444444', arr, uuid)
      },
      onPreview(file) {
        // console.log('---file---22222222222------', file)
      },
    };
    const { currentTaskid } = this.state
    // console.log('currentTaskid-----', currentTaskid)
    const data = {
      task_id: currentTaskid,
    }
    // console.log('data-----', data)
    return (
      <Form.Item label={<FormattedMessage id="add-dataset.upload" />}>
        {getFieldDecorator('upload', {
           valuePropName: 'fileList',
           getValueFromEvent: this.normFile,
          rules: [
            {
              required: true,
              message: '请上传文件',
            },
          ],
        })(
          <Dragger {...props} data={data}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">点击或将文件拖拽这里上传</p>
          <p className="ant-upload-hint">
            仅支持jpg/png格式图片，建议使用非中文命名
          </p>
        </Dragger>,
        )}
      </Form.Item>
    );
  };

  render() {
    const { form, handleAdd, modalVisible, handleModalVisible } = this.props;
    const { getFieldDecorator } = form;
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        // console.log(fieldsValue)
       // form.resetFields();
        handleAdd(fieldsValue, this.state.taskids);
        this.setState({
          taskids: [],
         })
      });
    };
    return (
      <Modal
        destroyOnClose
        title="上传图片"
        visible={modalVisible}
        onOk={okHandle}
        confirmLoading={this.state.confirmLoading}
        onCancel={() => handleModalVisible()}
      >
        {this.upload(getFieldDecorator)}
      </Modal>
    );
  }
}
export default Form.create()(UploadImgForm);
