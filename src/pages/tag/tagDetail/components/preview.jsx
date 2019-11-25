import { Form, Input, Modal, Upload, Icon, Button, message } from 'antd';
import React, { Component } from 'react';
import { FormattedMessage } from 'umi-plugin-react/locale';
import Mark from '@/components/Mark'
import styles from './style.less';

const { Dragger } = Upload;

class UploadImgForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmLoading: false,
      previewContent: {},
    };
  }

  componentDidMount() {
    // console.log(this.props.values)
    this.setState({
      previewContent: this.props.values,
    })
  }

  handleOk = () => {
    const { form, handleAdd } = this.props;
    this.props.handleOk(this.state.selectedArr)
    form.validateFields((err, fieldsValue) => {
       if (err) return;
       form.resetFields();
       handleAdd(fieldsValue, this.state.fileData);
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

  render() {
    const { modalVisible, handleModalVisible } = this.props;
    const { previewContent } = this.state;
    return (
      <Modal
        destroyOnClose
        title="预览"
        footer={null}
        visible={modalVisible}
        confirmLoading={this.state.confirmLoading}
        onCancel={() => handleModalVisible()}
      >
        <div className={styles.modelImgWarp}>
          {/* <img alt="priview" src={previewContent.imgpath}></img> */}
          <Mark data={previewContent}></Mark>
        </div>
      </Modal>
    );
  }
}
export default Form.create()(UploadImgForm);
