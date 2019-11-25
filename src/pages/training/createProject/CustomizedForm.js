import React from 'react'
import { Button, Select, Input, Icon, Form, Checkbox } from 'antd'
import styles from '@/pages/training/style.less'

const { Option } = Select
const { TextArea } = Input
const CheckboxGroup = Checkbox.Group

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 13 },
  },
}

const tailFormItemLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 13, offset: 5 },
  },
}

const CustomizedForm = props => {
  const {
    handleSubmit,
    frameOption,
    envOption,
    missionOption,
    selectType,
    selectedType,
    selectDataset,
    selectedDataset,
    removeOption,
    useInnerAlgorithm,
    isUseInnerAlgorithm,
    selectAlgorithmType,
    selectedAlgorithm,
    select
  } = props
  const { getFieldDecorator } = props.form
  return (
    <Form {...formItemLayout} className={styles.form} onSubmit={(e) => handleSubmit(e, props.form)}>
      <Form.Item label="项目名称">
        {getFieldDecorator('projectname', {
          rules: [
            {
              required: true,
              message: '请输入项目名名称',
            },
            {
              max: 40,
              message: '项目名称最多40个字'
            }
          ],
        })(<Input placeholder="项目名称最多40个字" />)}
      </Form.Item>
      <Form.Item label="项目框架">
        {getFieldDecorator('frame', {
          rules: [
            {
              required: true,
              message: '请选择项目框架'
            }
          ]
        })(<CheckboxGroup options={frameOption} />)}
      </Form.Item>
      <Form.Item label="类型">
        <div>
          <Select defaultValue={selectedType} style={{ width: 100 }} onChange={state => selectType(state, props.form)}>
            <Option value={0}>图像</Option>
            <Option value={1}>音频</Option>
          </Select>
          {getFieldDecorator('missionid', {
            rules: [
              {
                required: true,
                message: '请选择训练任务'
              }
            ]
          })(
            <Select style={{ width: 150, marginLeft: 10 }}>
              {
                missionOption.map(item => {
                  if (item.scene == selectedType) {
                    return <Option key={item.missionid} value={item.missionid}>{item.missionname}</Option>
                  }
                })
              }
            </Select>
          )}
        </div>
      </Form.Item>
      <Form.Item label="项目环境">
        {getFieldDecorator('env', {
          rules: [
            {
              required: true,
              message: '请选择项目环境'
            }
        ]})(
          <Select>
            {
              envOption.map((item, key) => {
                return <Option key={key} value={item}>{item}</Option>
              })
            }
          </Select>
        )}
      </Form.Item>
      <Form.Item label="数据集" >
        <div className={styles.btnGroup}>
          <Button onClick={selectDataset}>
            <Icon type="plus" />
            选择数据集
          </Button>
        </div>
        <div className={styles.selectedItemBox}>
          {
            selectedDataset.map(item => {
              return (
                <span key={item.isOpen?item.opendatasetid:item.oaldatasetid} >
                  {item.isOpen?item.opendatasetname:item.oaldatasetname}
                  <Icon type="close" onClick={() => removeOption(item)} />
                </span>
              )
            })
          }
        </div>
      </Form.Item>
      <Form.Item label="是否预置算法" >
        <div>
          <Select defaultValue={0} style={{ width: 100 }} onChange={useInnerAlgorithm}>
            <Option value={0}>否</Option>
            <Option value={1}>是</Option>
          </Select>
          {
            isUseInnerAlgorithm ? (
              <>
                <Select defaultValue={0} style={{ width: 150, marginLeft: 10 }} onSelect={(v, k) => selectAlgorithmType(v, k)}>
                  <Option value={0}>mxnet</Option>
                  <Option value={1}>tensorflow</Option>
                </Select>
                <Button onClick={select}>选择</Button>
              </>
            ) : <></>
          }
        </div>
        {
          selectedAlgorithm ? (
            <div>
              已选算法：{selectedAlgorithm && selectedAlgorithm.openmodelname} &nbsp;
              ({selectedAlgorithm && selectedAlgorithm.missionname}, &nbsp;{selectedAlgorithm && selectedAlgorithm.frame})
            </div>
          ) : <></>
        }
      </Form.Item>
      <Form.Item label="项目描述">
        {getFieldDecorator('desc', {
          rules: [
            {
              max: 100,
              message: '项目描述最多100字'
            }
          ]
        })(<TextArea rows={4} placeholder="项目描述最多100字" initialvalue="" />)}
      </Form.Item>
      {/* <Form.Item wrapperCol={{ span: 12, offset: 5 }}> */}
      <Form.Item {...tailFormItemLayout }>
        <Button type="primary" htmlType="submit">创建</Button>
      </Form.Item>
    </Form>
  );
}

export default Form.create({})(CustomizedForm)