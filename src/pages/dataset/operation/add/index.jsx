import React, { Component } from 'react';
import styles from './style.less';
import { Form, Input, Radio, Progress, message, Card, Button, Icon, Popover } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { v1 } from 'node-uuid';
import { connect } from 'dva';
import router from 'umi/router';
import CONSTANTS from '../../../../utils/constant';
import Socket from '../../../../utils/socketIo'
import { getUploadObj } from '@/utils/upload'

@connect(({ dataset, loading }) => ({
  dataset,
}))
class AddDataset extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
  }

  state = {
    fileData: { task_id: v1() },
    disable: false,
    donestatus: false,
    inputdisabled: false,
    uploadstatus: '待上传',
    files: [],
    progress: 0,
  };

  componentDidMount() {
    this.getSocketMsg()
    this.newUpload()
  }

  newUpload = () => {
    const { uid, uploaderObj } = getUploadObj()
    this.uid = uid
    this.uploaderObj = uploaderObj
  }

  componentWillUnmount = () => {
  }

  datasetNameCom = getFieldDecorator =>
    <Form.Item label={<FormattedMessage id="add-dataset.dataset-name" />}>
      {getFieldDecorator('datasetname', {
        rules: [
          {
            required: true,
            message: '请填写数据集名称!',
          },
          { pattern: /^[^\s]*$/, message: '禁止输入空格' },
        ],
      })(
        <Input
          maxLength={20}
          placeholder={formatMessage({
            id: 'add-dataset.please-enter-the-name-of-the-dataset',
          })}
        />,
      )}
    </Form.Item>;

  sceneCom = getFieldDecorator =>
    <Form.Item label={<FormattedMessage id="add-dataset.scene" />}>
      {getFieldDecorator('scene', {
        rules: [
          {
            required: true,
            message: '请选择场景',
          },
        ],
        initialValue: '0',
      })(
        <Radio.Group buttonStyle="solid">
          <Radio.Button value="0">人脸</Radio.Button>
        </Radio.Group>,
      )}
    </Form.Item>;

  descCom = getFieldDecorator => (
    <Form.Item label={<FormattedMessage id="add-dataset.desc" />}>
      {getFieldDecorator('desc', {
        rules: [
          {
            required: false,
          },
          { pattern: /^[^\s]*$/, message: '禁止输入空格' },
        ],
      })(
        <Input
          maxLength={50}
          placeholder={formatMessage({
            id: 'add-dataset.please-enter-the-desc',
          })}
        />,
      )}
    </Form.Item>
  );

  stateCom = () => (
    <Form.Item label="状态">
        <p>{this.state.uploadstatus}</p>
    </Form.Item>
  )

  normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  getSocketMsg = () => {
    Socket.on('msg', data => {
      console.log('socket msg: ', data)
      if (data.msg_status === 4) {
        this.setState({
          uploadstatus: '解压中',
        })
      }
      if (data.msg_status === 5) {
        this.setState({
          uploadstatus: '遍历图片',
        })
      }
      if (data.msg_status === 7) {
        this.setState({
          uploadstatus: '完成',
          disable: false,
          donestatus: true,
        })
      }
    })
  }

  handleChange = info => {
    let fileList = [...info.fileList];
    fileList = fileList.slice(-12);
    fileList = fileList.map(file => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
  };

  uploadCom = getFieldDecorator => {
    const { inputdisabled, progress } = this.state
    let selectedFile = this.state.files.length ? this.state.files[0].name : null
    return (
      <Form.Item required label={<FormattedMessage id="add-dataset.upload" />}>
        <div>
          <input
            disabled={inputdisabled} 
            type="file"
            title=""
            id="fileupload"
            accept=".zip, .rar, .gz"
            multiple={false}
            name="file"
            onChange={e => this.inputonchange(e)} />
          <label htmlFor="fileupload">
            <Icon type="plus" style={{fontSize: '3rem', display: 'block', marginTop: '40px'}}/>
            点击选择文件
          </label>
          <div className={styles.selectedFileName}>
            <Popover content={selectedFile} title=''>
            {selectedFile}
            </Popover>
          </div>
          <Progress
            showInfo
            style={{ display: `${Boolean(inputdisabled) ? 'block' : 'none'}` }}
            strokeColor={{
              from: '#108ee9', to: '#108ee9' }}
            percent={progress}
            size="small" />
        </div>
      </Form.Item>
    );
  };

  handleSubmit = event => {
    event.preventDefault();
    // console.log(this.fileInput.current.files[0].name)
    // alert(
    //   `Selected file - ${
    //     this.fileInput.current.files[0].name
    //   }`
    // );
  }

  inputonchange = e => {
    const arr = []
    arr.push(e.target.files[0])
    if (e.target.files[0] === 'undefined' || e.target.files[0] === undefined) {
      // console.log('1111111111111111111111111111')
    }
    this.setState({
      files: arr,
    })
  }

  handleAdd = () => {
    const { form } = this.props;
    const { files } = this.state
    form.validateFieldsAndScroll((err, fieldsValue) => {
      console.log('err, fieldsValue---->', err, fieldsValue);
      const { datasetname, desc } = fieldsValue
      if (!datasetname || datasetname.trim() == '') {
        form.setFields({
          'datasetname': {
            errors: [new Error('请输入数据名称')]
          }
        })
        return
      }
      if (desc === 'undefined') {
        fieldsValue.desc = ''
      }
      if (err) return
      if (files.length === 0 || files[0] === 'undefined' || files[0] === undefined) {
        message.error('请上传文件')
        return
      }
      if (files[0].size < 1024 * 1024 * 5) {
        message.error('上传文件小于5MB')
        return
      }
      if (files[0].size > 1024 * 1024 * 1024 * 5) {
        message.error('上传文件大于5GB')
        return
      }
        fieldsValue.upload = files
      this.todoAddDataset(fieldsValue);
    });
  };

  goToList = () => {
    // router.push('/dataset');
    window.history.back();
  }

  todoAddDataset = fieldsValue => {
    const file = fieldsValue.upload;
    const params = {
      name: fieldsValue.datasetname,
      scene: 0,
      desc: fieldsValue.desc || '',
    }
    this.startUpload(file, params)
  }

  startUpload = (file, params) => {
    const self = this
    const { dispatch } = this.props
    const uploader = this.uploaderObj
    // 开始上传时，调用该方法
    uploader.on('startUpload', () => {
      self.setState({
        inputdisabled: true,
        disable: true,
      })
    })
     // 一个分片上传成功后，调用该方法
    uploader.on('uploadProgress', (data, percentage) => {
      self.setState({
        progress: parseInt(percentage.toFixed(4) * 10000) / 100,
        uploadstatus: '上传中',
      })
    })
    uploader.on('uploadSuccess', record => { // 整个文件的所有分片都上传成功后，调用该方法
      self.setState({
        disable: true,
        progress: 100,
      })
      const formData = new FormData()
      formData.append('isoriginal', 1)
      formData.append('task_id', this.uid)
      formData.append('scene', params.scene)
      formData.append('desc', params.desc)
      formData.append('user', localStorage.getItem(CONSTANTS.TRAINING_USERNAME))
      formData.append('filename', record.name)
      formData.append('batchname', params.name)
      formData.append('token', localStorage.getItem(CONSTANTS.TRAINING_TOKE))
      dispatch({
        type: 'dataset/add',
        payload: formData,
      }).then(res => {
        if (res && res.code === 200) {
          message.success('添加成功');
          this.newUpload()
        } else {
          message.error('操作失败');
          return
        }
      });
    })
    uploader.on('uploadError', error => { // 上传过程中发生异常，调用该方法
      message.error('上传失败 001')
      console.error(error)
    })
    uploader.on('error', err => {
      message.error('上传失败 002', err)
    })
    try {
      uploader.addFiles(file)
      uploader.upload()
    } catch (e) {
      message.error('上传失败 003', e)
    }
  }

  todoAdd = fieldsValue => {
    this.setState({
      disable: true,
    })
    const { dispatch } = this.props;
    const userName = localStorage.getItem(CONSTANTS.TRAINING_USERNAME);
    const token = localStorage.getItem(CONSTANTS.TRAINING_TOKE);
    const params = fieldsValue;
    params.token = token
    params.user = userName
    params.task_id = this.state.fileData.task_id
    dispatch({
      type: 'dataset/add',
      payload: params,
    }).then(res => {
      if (res && res.code === 200) {
        message.success('添加成功');
        this.setState({
          disable: false,
        })
      } else {
        message.error('操作失败');
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const formItemLayouts = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 12, offset: 5 },
      },
    }
    const { disable, donestatus } = this.state
    return (
      <div className={styles.filterCardList}>
         <PageHeaderWrapper>
          <Card bordered={false} className={styles.contentBox}>
            <Form {...formItemLayouts} className={styles.form}>
              {this.datasetNameCom(getFieldDecorator)}
              {this.sceneCom(getFieldDecorator)}
              {this.uploadCom(getFieldDecorator)}
              {this.descCom(getFieldDecorator)}
              {this.stateCom()}
              <Form.Item {...tailFormItemLayout}>
                {
                  donestatus ?
                  <Button type="primary" onClick={this.goToList}>完成</Button> :
                  <span>
                    <Button
                      onClick={this.goToList}
                      disabled={disable} >
                      取消
                    </Button>
                    <Button
                      onClick={this.handleAdd}
                      style={{ marginLeft: 16 }}
                      type="primary"
                      htmlType="submit"
                      disabled={disable} >
                      新增
                    </Button>
                  </span>
                }
              </Form.Item>
            </Form>
          </Card>
        </PageHeaderWrapper>
      </div>
    );
  }
}
const WarpForm = Form.create({
  onValuesChange({ dispatch }) {
    // 表单项变化时请求数据
    // 模拟查询表单生效
  },
})(AddDataset);
export default WarpForm;
