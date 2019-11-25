import { Form, Button, List, Input, Modal, message, Pagination } from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import styles from './style.less';
import CONSTANTS from '../../../../utils/constant';

const { confirm } = Modal;

@connect(({ tagDetail, loading }) => ({
  tagDetail,
  loading: loading.effects['tagDetail/getLabelList'],
}))

class TaskLabelForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputVisible: false,
      editItem: '',
      labelpage: {
        pageindex: 1,
        limit: 10,
      },
      currentPage: 1,
    };
  }

  componentDidMount() {
  }

   /**
   * 选择标签
   */
  handleLabelSelect = item => {
    this.props.labelSelect(item)
    console.log(item)
    // const { dispatch } = this.props;
    // const { selectCheck } = this.state
    // const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    // if (selectCheck.length > 0) {
    //   // console.log('选择标签')
    //   const arr = selectCheck.toString()
    //   const params = {
    //     taskid: itemtaskid,
    //     labelid: item.labelid,
    //     updateids: arr,
    //   }
    //   const formData = new FormData()
    //   formData.append('taskid', params.taskid)
    //   formData.append('labelid', params.labelid)
    //   formData.append('updateids', params.updateids)
    //   dispatch({
    //     type: 'tagDetail/updateLabelTaskid',
    //     payload: formData,
    //   }).then(res => {
    //     // console.log(res)
    //     if (res && res.code === 200) {
    //       this.handleSelectChange(item.labelid)
    //     }
    //   })
    // } else {
    //   this.handleSelectChange(item.labelid)
    // }
  }

  /**
   * 添加标签
   */
  handleInputVisible = flag => {
    this.setState({
      inputVisible: !!flag,
    });
  }

  /**
   * 添加标签
   */
  addLabel = () => {
    const { dispatch, form } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      // console.log('err, fieldsValue---->', err, fieldsValue);
      if (!fieldsValue.labelname || fieldsValue.labelname === 'undefined') {
        this.handleInputVisible()
        this.setState({
          editItem: '',
        })
      } else {
        const params = {
          taskid: itemtaskid,
          name: fieldsValue.labelname,
        }
        // console.log(params)
        const formData = new FormData()
        formData.append('taskid', params.taskid)
        formData.append('name', params.name)
        dispatch({
          type: 'tagDetail/addLabel',
          payload: formData,
        }).then(res => {
          this.handleInputVisible()
          // console.log(res)
          if (res && res.code === 200) {
            this.props.updateLabel()
          }
        })
      }
    });
  }

  /**
   * 编辑标签
   */
  editLabel = item => {
    const { dispatch, form } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const { editItem } = this.state
    // console.log(item)
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      // console.log('err, fieldsValue---->', err, fieldsValue);
      if (!fieldsValue.labelname || fieldsValue.labelname === 'undefined') {
        // this.handleLabelEdit()
        this.setState({
          editItem: '',
        })
      } else {
        const params = {
          taskid: itemtaskid,
          name: fieldsValue.labelname,
          labelid: editItem.labelid,
        }
        // console.log(params)
        const formData = new FormData()
        formData.append('taskid', params.taskid)
        formData.append('name', params.name)
        formData.append('labelid', params.labelid)
        dispatch({
          type: 'tagDetail/updateLabel',
          payload: formData,
        }).then(res => {
          // this.handleLabelEdit()
          this.setState({
            editItem: '',
          })
          // console.log(res)
          if (res && res.code === 200) {
            this.props.updateLabel()
          }
        })
      }
    });
  }

   /**
   * 删除标注标签
   */
  handleLabelDelete = (flag, record) => {
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const self = this
    confirm({
      title: '删除以下选中的标签?',
      content: `标签名称: ${record.name}`,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        const params = {
          labelid: `${record.labelid}`,
        };
        const formData = new FormData()
        formData.append('labelid', params.labelid)
        formData.append('taskid', itemtaskid)
        dispatch({
          type: 'tagDetail/deleteLabel',
          payload: formData,
        }).then(res => {
          // console.log(res)
          if (res && res.code === 200) {
            message.success('删除成功');
            self.props.updateLabel()
          } else {
            message.error('操作失败');
          }
        })
      },
      onCancel() {},
    });
  };

  /**
   * 更新编辑标签
   */
  handleLabelEdit = (flag, record) => {
    this.setState({
      editItem: record,
    })
  }

  /**
   *  列表标签切换页码
   */
  handleLabelChange = (page, pageSize) => {
    // console.log(page, pageSize)
    this.setState({
      labelpage: {
        pageindex: page,
        limit: pageSize,
      },
    });
    this.props.resetSelected(page, pageSize)
    // this.props.updateLabel()
  }

  render() {
    const {
      tagDetail: { labelList },
      loading,
      form: { getFieldDecorator },
    } = this.props;
    const { inputVisible, editItem, labelpage, currentPage } = this.state
    let labellist = []
    let labelNum = 1
    if (labelList && labelList.list) {
      labellist = labelList.list
      labelNum = labelList.totalnum
    }
    return (
      <div style={{ padding: '24px' }}>
      <p className={styles.tagLabelText}>
        标注
      </p>
      <p>
        <Button icon="plus" onClick={() => this.handleInputVisible(true)}>标签</Button>
      </p>
      <List
        bordered
        loading={loading}
        dataSource={labellist}
        className={styles.listStyle}
        renderItem={item => {
          if ((item && item.labelid) || item.labelid === 0) {
            return (
              <div>
                {item.labelid === editItem.labelid ? <Form>
                <Form.Item>
                  {getFieldDecorator('labelname', {
                    rules: [
                      {
                        initialValue: item.name,
                      },
                      { pattern: /^[^\s]*$/, message: '禁止输入空格' },
                    ],
                  })(
                    <Input
                      autoFocus
                      maxLength={10}
                      onPressEnter={() => this.editLabel(item)}
                      onBlur={() => this.editLabel(item)}
                    />,
                  )}
                </Form.Item>
              </Form> : <List.Item className={styles.labelListItem}
                actions={[
                <Button key="list-loadmore-edit" type="link" icon="edit" size="small" onClick={() => this.handleLabelEdit(true, item)}></Button>,
                 <Button key="list-loadmore-more" icon="delete" type="link" onClick={() => this.handleLabelDelete(true, item)}></Button>]
                }>
              <List.Item.Meta style={{ width: '60px', cursor: 'pointer' }} onClick={() => this.handleLabelSelect(item)}
                description={item.name}
              />
            </List.Item>}
              </div>
            )
          }
          return <div></div>
        }}
      />
      {inputVisible ? <Form>
        <Form.Item>
          {getFieldDecorator('labelname', {
             rules: [
              { pattern: /^[^\s]*$/, message: '禁止输入空格' },
            ],
          })(
            <Input
              allowClear
              autoFocus
              maxLength={10}
              onPressEnter={this.addLabel}
              onBlur={this.addLabel}
              placeholder="请输入标签名称"
            />,
          )}
        </Form.Item>
      </Form> : null}
      {labelNum > 0 ?
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Pagination
            simple
            total={labelNum}
            pageSize={labelpage.limit}
            defaultCurrent={currentPage}
            onChange={this.handleLabelChange}
            onShowSizeChange={this.showSizeChanger}
          />
        </div> : null
      }
    </div>
    )
  }
}
export default Form.create()(TaskLabelForm);
