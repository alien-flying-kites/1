import React from 'react'
import { Modal, Radio, Form, Icon, Input, Spin, Button } from 'antd'
import { connect } from 'dva'
import styles from '@/pages/training/style.less'

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}

const SelectEnv = props => {
  const modalRef = React.createRef()
  const { 
    show, 
    handleOk, 
    handleCancel, 
    form, 
    storageSize, 
    addStorageSize, 
    minusStorageSize, 
    changeType,
    selectedType,
    hardConfig,
    showSpin,
    changeStorageByInput
  } = props
  let config = []
  if (hardConfig.length > 0) {
    config = hardConfig[selectedType].config
  }
  const { getFieldDecorator } = form
  const projectInfo = JSON.parse(localStorage.getItem('proDetail'))
  const { projectid, ws_name } = projectInfo
  return (
    <Modal
      className={styles.modalStyle}
      ref={modalRef}
      title="选择运行环境"
      visible={show}
      keyboard={!showSpin}
      maskClosable={!showSpin}
      onOk={() => handleOk(form, hardConfig, projectid, ws_name)}
      onCancel={() => handleCancel(projectid)}
      okButtonProps={{ disabled: Boolean(showSpin) }}
    >
      <Form {...formItemLayout}>
        <Form.Item label="类型" required>
          {getFieldDecorator('type', {
            rules: [
              {
                required: true,
                message: '请选择类型'
              }
            ],
            initialValue: hardConfig.length > 0 ? selectedType : '',
            getValueFromEvent: (e) => changeType(e)
          })(
            <Radio.Group buttonStyle="solid" disabled={showSpin}>
            {
              hardConfig.map((item, i) => {
                return <Radio.Button key={i} value={i}>{item.hardname}</Radio.Button>
              })
            }
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="规格">
          {getFieldDecorator('config', {
            rules: [
              {
                required: true,
                message: '请选择规格'
              }
            ],
            initialValue: 0
          })(
            <Radio.Group buttonStyle="solid" disabled={showSpin}>
            {
              config.map((item, i) => {
                return (
                  <Radio.Button key={i} value={i}>
                  {item.gpu? `GPU: ${item.gpu}*p100`:''} CPU: {item.cpu}核 {item.memory}GB
                  </Radio.Button>
                )
              })
            }
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label="存储配置">
          {getFieldDecorator('storage', {
            rules: [
              {
                required: true,
                pattern: /^[1-9][0-9]{0,2}$/,
                message: '请设置存储配置，输入纯数字'
              }, 
            ],
            initialValue: storageSize,
          })(
            <Input 
              disabled={showSpin}
              onChange={(e) => changeStorageByInput(e, form)}
              style={{width: 160, textAlign: 'center'}}
              addonBefore={<Icon type="minus" onClick={() => minusStorageSize(form)}/>} 
              addonAfter={<Icon type="plus" onClick={() => addStorageSize(form)}/>} 
            />
          )}
        </Form.Item>
      </Form>
      <Spin spinning={showSpin} tip="项目启动运行中" className={styles.spin}></Spin>
    </Modal>
  )
}

function mapStateToProps(state) {
  const { loading, training } = state
  const { hardConfig } = training
  return {
    loading: loading.effects['training/fetcheHardConfig'],
    hardConfig
  }
}

export default connect(mapStateToProps)(Form.create({})(SelectEnv))