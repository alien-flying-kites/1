import React, { Component } from 'react';
import { Card, Row, Col, Checkbox, Button, message, Pagination, List, Modal, Form, Input } from 'antd';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import router from 'umi/router';
import Preview from '../components/preview';
import styles from './style.less';
import CheckImgComponent from '../components/checkimg'
import CONSTANTS from '../../../../utils/constant';
import noData from '../../../../assets/noPic.jpg';

const { confirm } = Modal;

@connect(({ tagDetail, tag, loading }) => ({
  tagDetail,
  tag,
  loading: loading.effects['tagDetail/getTaskimgList'],
}))

class TagDetailUnmarkedPage extends Component {
  state = {
    page: {
      pageindex: 1,
      limit: 20,
    },
    currentPage: 1,
    selectCheck: [],
    taskid: '',
    modalVisible: false,
    previewData: {},
    isFolder: false,
    labelpage: {
      pageindex: 1,
      limit: 10,
    },
    inputVisible: false,
    editItem: '',
  };

  componentDidMount () {
    const isfolder = localStorage.getItem(CONSTANTS.TRAINING_ISFOLDER)
    // console.log(isfolder)
    if (isfolder === 'false') {
      this.setState({
        isFolder: false,
      })
    } else {
      this.setState({
        isFolder: true,
      })
    }
    this.init()
  }

  componentWillUnmount = () => {
    this.setState = (state,callback) => {
      return;
    };
  }

  init = () => {
    const { dispatch } = this.props;
    const { page } = this.state;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    this.setState({
      taskid: itemtaskid,
    })
    const params = {
      limit: page.limit,
      pageindex: page.pageindex - 1,
      taskid: itemtaskid,
      islabel: 0,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: {
        ...params,
      },
    });
  }

  /**
   * 分页改变页码
   */
  handleStandardTableChange = (page, pageSize) => {
    // const { taskid } = this.state
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    // console.log(taskid)
    this.setState({
      page: {
        pageindex: page,
        limit: pageSize,
      },
      selectCheck: [],
    });
    const params = {
      limit: pageSize,
      pageindex: page - 1,
      taskid: itemtaskid,
      islabel: 0,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: params,
    });
  };

  /**
   * 分页改变每页条数
   */
  showSizeChanger = (current, size) => {
    // console.log(current, size)
    const { taskid } = this.state
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    this.setState({
      page: {
        limit: size,
        pageindex: current,
      },
      selectCheck: [],
    })
    const params = {
      limit: size,
      pageindex: current - 1,
      taskid: itemtaskid,
      islabel: 0,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: params,
    });
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
      selectCheck: [],
    });
  }

   /**
   * 监听选择框的变化
   */
  onChange = checkedValues => {
    const { selectCheck } = this.state;
    // console.log(`checked = ${checkedValues}`);
    this.setState({ selectCheck: checkedValues })
  }

    /**
   * 选择标签
   */
  handleLabelSelect = item => {
    // console.log(item)
    const { dispatch } = this.props;
    const { selectCheck } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    if (selectCheck.length > 0) {
      // console.log('选择标签')
      // const arr = selectCheck.toString()
      const arr = []
      selectCheck.map(val => {
        arr.push(val.imgid)
      })
      const newarr = arr.toString()
      const params = {
        taskid: itemtaskid,
        labelid: item.labelid,
        updateids: newarr,
      }
      const formData = new FormData()
      formData.append('taskid', params.taskid)
      formData.append('labelid', params.labelid)
      formData.append('updateids', params.updateids)
      dispatch({
        type: 'tagDetail/updateLabelTaskid',
        payload: formData,
      }).then(res => {
        // console.log(res)
        if (res && res.code === 200) {
          this.init()
        }
      })
    } else {
      message.error('请选择图片')
    }
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
            this.init()
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
            this.init()
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
            self.init()
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
   * 清洗
   */
  handleClean = () => {
    const { dispatch } = this.props;
    const { selectCheck } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    if (selectCheck.length > 0) {
      // console.log('选择标签')
      // const arr = selectCheck.toString()
      const arr = []
      selectCheck.map(val => {
        arr.push(val.imgid)
      })
      const newarr = arr.toString()
      const params = {
        taskid: itemtaskid,
        isclean: 1,
        cleanids: newarr,
      }
      const formData = new FormData()
      formData.append('taskid', params.taskid)
      formData.append('isclean', params.isclean)
      formData.append('cleanids', params.cleanids)
      dispatch({
        type: 'tagDetail/cleanLabelTaskid',
        payload: formData,
      }).then(res => {
        // console.log(res)
        if (res && res.code === 200) {
          this.init()
          this.getSingletask()
          this.setState({
            selectCheck: [],
          })
        }
      })
    } else {
      message.error('请选择要清洗的图片')
    }
  }

  getSingletask = () => {
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const params = {
      taskid: itemtaskid,
    }
    dispatch({
      type: 'tagDetail/getSingleTask',
      payload: {
        ...params,
      },
    });
  }

     /**
   * 开始自动标注
   */
  startAutoMark = () => {
    const { dispatch } = this.props;
    const { isFolder } = this.state
    let labeltype = ''
    if (isFolder) {
      labeltype = 'facerecogntion'
    } else {
      labeltype = 'landmark'
    }
    const userName = localStorage.getItem(CONSTANTS.TRAINING_USERNAME);
    const taskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const formData = new FormData()
    formData.append('taskid', taskid)
    formData.append('user', userName)
    formData.append('labeltype', labeltype)
    dispatch({
      type: 'tag/autoLabel',
      payload: formData,
    }).then(res => {
      if (res && res.code === 200) {
        message.success('开始标注');
        // this.handleSearch();
      }
    })
  }

   /**
   * 暂停自动标注
   */
  pauseAutoMark = () => {
    const { dispatch } = this.props;
    const taskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const formData = new FormData()
    formData.append('taskid', taskid)
    // formData.append('user', userName)
    // formData.append('labeltype', record.labeltype)
    dispatch({
      type: 'tag/pauseLabel',
      payload: formData,
    }).then(res => {
      if (res && res.code === 200) {
        message.success('暂停标注');
        // this.handleSearch();
      }
    })
  }

  /**
   * 重新标注
   */
  gotoDetail = () => {
    const { tagDetail: { taskImgList } } = this.props
    const { selectCheck, page } = this.state;
    let datalist = null
    if (taskImgList && taskImgList.list) {
      datalist = taskImgList.list
    }
    if (selectCheck.length === 1) {
      for (let i = 0; i <= datalist.length; i++) {
        console.log(selectCheck, datalist[i])
        if (selectCheck[0].imgid === datalist[i].imgid) {
          // console.log(i)
          selectCheck[0].index = i
          selectCheck[0].currentPage = page.pageindex
          selectCheck[0].limit = page.limit
          break
        }
      }
      // router.push('/tag/tagDetail/detailPage');
      this.props.dispatch({
        type: 'tagDetail/setModel',
        payload: true,
      });
      router.push({
        pathname: `/tag/tagDetail/detailPage/${selectCheck[0].imgid}`,
        params: selectCheck[0],
      });
      // this.props.dispatch(routerRedux.push({
      //   pathname: '/tag/tagDetail/detailPage',
      //   params: selectCheck[0],
      // }))
    } else if (selectCheck.length <= 0) {
      message.error('请选择图片')
    } else if (selectCheck.length > 1) {
      message.error('只能选择一张图片')
    }
  }

  updateRightCheck = item => {
    // console.log('点击啦', item)
    this.setState({ selectCheck: item })
  }

  /**
   * model框
   */
  handleModalVisible = (flag, record) => {
    // console.log(record)
    this.setState({
      modalVisible: !!flag,
      previewData: record || {},
    });
  };

  isFolderCom = () => {
    const {
      tagDetail: { taskImgList, labelList },
      loading,
      loading1,
      form: { getFieldDecorator },
    } = this.props;
    const { currentPage, page, selectCheck, editItem,
      modalVisible, previewData, labelpage, inputVisible } = this.state;
    let datalist = []
    let totalNum = 1
    if (taskImgList && taskImgList.list) {
      datalist = taskImgList.list
      totalNum = taskImgList.totalnum
    }
    let labellist = []
    let labelNum = 1
    if (labelList && labelList.list) {
      labellist = labelList.list
      labelNum = labelList.totalnum
    }
    const nullData = {};
    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <div>
        <Row>
          <Col xxl={18} xl={18} lg={14} md={24} sm={24}>
            <div style={{ padding: '24px', borderRight: '1px solid #999' }}>
            <CheckImgComponent loading={loading} data={datalist}
             totalNum={totalNum} updateCheck={this.updateRightCheck}
             handleTableChange={this.handleStandardTableChange}
             showRightSizeChanger={this.showSizeChanger} isshow/>
              {/* <div>
                <Checkbox.Group onChange={this.onChange} value={selectCheck}>
                  <List
                    rowKey="id"
                    loading={loading}
                    dataSource={[nullData, ...datalist]}
                    renderItem={item => {
                      if (item && item.imgid) {
                        return (
                          <Col xxl={3} xl={3} lg={4} md={6} sm={6} style={{ background: '#f4f4f4' }} className={styles.cardCol}>
                            <List.Item key={item.imgid} className={styles.imgListItem}>
                            <div className={styles.checkboxItem}>
                              <Checkbox value={item} className={styles.checkbox} ></Checkbox>
                            </div>
                            <Card className={styles.imgBox} bordered={false}
                              onClick={() => this.handleModalVisible(true, item)}>
                              <img alt="example" src={item.imgpath} />
                            </Card>
                          </List.Item>
                          </Col>
                        );
                      }
                      return (
                        <div></div>
                      )
                    }}
                  />
                </Checkbox.Group>
                {totalNum > 0 ?
                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <Pagination
                    size="small"
                    total={totalNum}
                    showTotal={(total, range) => `当前${range[0]}到${range[1]}条，共${total}条`}
                    pageSize={page.limit}
                    defaultCurrent={currentPage}
                    current={page.pageindex}
                    showSizeChanger
                    onChange={this.handleStandardTableChange}
                    onShowSizeChange={this.showSizeChanger}
                  />
                </div> : <div className={styles.nodataWarp}><img alt="nodata" src={noData}></img></div>
                }
              </div> */}
            </div>
          </Col>
          <Col xxl={6} xl={6} lg={10} md={12} sm={12}>
            <div style={{ padding: '24px' }}>
              <p className={styles.tagLabelText}>
                标注
              </p>
              <p>
                <Button icon="plus" onClick={() => this.handleInputVisible(true)}>标签</Button>
              </p>
              <List
                bordered
                loading={loading1}
                dataSource={labellist}
                className={styles.listStyle}
                renderItem={item => {
                  if ((item && item.labelid) || item.labelid === 0) {
                    return (
                      <div>
                        {item.labelid === editItem.labelid ?
                        <Form>
                          <Form.Item>
                            {getFieldDecorator('labelname', {
                              rules: [
                                {
                                  initialValue: item.name,
                                },
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
                        <List.Item.Meta style={{ width: '60px' }} onClick={() => this.handleLabelSelect(item)}
                          description={item.name}
                        />
                      </List.Item>}
                    </div>
                    )
                  }
                  return null
                }}
              />
              {inputVisible ? <Form>
                <Form.Item>
                  {getFieldDecorator('labelname', {
                  })(
                    <Input
                      allowClear
                      autoFocus
                      maxLength={10}
                      // onPressEnter={this.addLabel}
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
          </Col>
        </Row>
        {previewData && Object.keys(previewData).length ?
           <Preview modalVisible={modalVisible} {...parentMethods} values={previewData}/> : null
         }
      </div>
    )
  }

  isunFolderCom = () => {
    const {
      tagDetail: { taskImgList },
      loading,
    } = this.props;
    const { currentPage, page, selectCheck, modalVisible, previewData, isFolder } = this.state;
    // console.log(isFolder)
    let datalist = []
    let totalNum = 1
    if (taskImgList && taskImgList.list) {
      datalist = taskImgList.list
      totalNum = taskImgList.totalnum
    }
    const nullData = {};
    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <div>
        <Checkbox.Group onChange={this.onChange} value={selectCheck}>
          <List
            rowKey="id"
            loading={loading}
            gutter={{
              md: 4,
              lg: 24,
              xl: 48,
            }}
            dataSource={[nullData, ...datalist]}
            renderItem={item => {
              if (item && item.imgid) {
              return (
                <Col xxl={3} xl={3} lg={4} md={6} sm={12} style={{ background: '#f4f4f4' }} className={styles.cardCol}>
                  <List.Item key={item.imgid} className={styles.imgListItem}
                  >
                  <div className={styles.checkboxItem}>
                    <Checkbox value={item} className={styles.checkbox} ></Checkbox>
                  </div>
                  <Card className={styles.imgBox} bordered={false}
                  onClick={() => this.handleModalVisible(true, item)}>
                    <img alt="example" src={item.imgpath} />
                  </Card>
                </List.Item>
                </Col>
              );
              }
              return (
                <div></div>
              )
            }}
          />
        </Checkbox.Group>
        {totalNum > 0 ?
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Pagination
              total={totalNum}
              showTotal={(total, range) => `${range[0]}-${range[1]}，共${total}条`}
              pageSize={page.limit}
              defaultCurrent={currentPage}
              showSizeChanger
              onChange={this.handleStandardTableChange}
              onShowSizeChange={this.showSizeChanger}
            />
          </div> : <div className={styles.nodataWarp}>
                    <img alt="nodata" src={noData}></img>
                  </div>
          }
        {previewData && Object.keys(previewData).length ?
          <Preview modalVisible={modalVisible} {...parentMethods} values={previewData}/> : null
        }
      </div>
    )
  }

  render() {
    const { isFolder } = this.state;
    const {
      tag: { tasklabeling },
    } = this.props;
    const taskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    return (
      <div style={{ background: '#fff' }}>
        {
          isFolder ? <div className={styles.topbuttonbox}>
          {tasklabeling && taskid === tasklabeling.taskid ? <span>{
            tasklabeling.msg_status === 7 ? <span>
              <Button type="primary" onClick={this.startAutoMark} style={{ marginLeft: '16px' }}>自动标注</Button>
              <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>清洗</Button>
            </span> : <span>
            <Button type="primary" onClick={this.pauseAutoMark} style={{ marginLeft: '16px' }}>暂停标注</Button>
            <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>清洗</Button>
            </span>
          }</span> : <span>
            <Button type="primary" onClick={this.startAutoMark} style={{ marginLeft: '16px' }}>自动标注</Button>
             <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>清洗</Button>
          </span>
          }
        </div> : <div className={styles.topbuttonbox}>
          {tasklabeling && taskid === tasklabeling.taskid ? <span>{
            tasklabeling.msg_status === 7 ? <span>
              <Button type="primary" onClick={this.startAutoMark} style={{ marginLeft: '16px' }}>自动标注</Button>
              <Button type="primary" style={{ marginLeft: '16px' }} onClick={this.gotoDetail}>重新标注</Button>
          <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>清洗</Button>
            </span> : <span>
            <Button type="primary" onClick={this.pauseAutoMark} style={{ marginLeft: '16px' }}>暂停标注</Button>
            <Button type="primary" style={{ marginLeft: '16px' }} disabled>重新标注</Button>
          <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>清洗</Button>
            </span>
          }</span> : <span>
            <Button type="primary" onClick={this.startAutoMark} style={{ marginLeft: '16px' }}>自动标注</Button>
            <Button type="primary" style={{ marginLeft: '16px' }} onClick={this.gotoDetail}>重新标注</Button>
          <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>清洗</Button>
          </span>
          }
        </div>
        }
        {/* {tasklabeling && taskid === tasklabeling.taskid ? <span>{tasklabeling.msg_status === 7 ?
          null : <Button type="primary" onClick={this.pauseAutoMark}>暂停标注</Button>
        }</span> : null }
        {tasklabeling && taskid === tasklabeling.taskid && tasklabeling.msg_status !== 7 ?
          <Button type="primary" disabled style={{ marginLeft: '16px' }}>重新标注</Button> : <Button type="primary" style={{ marginLeft: '16px' }}>重新标注</Button>
        } */}
        {
          isFolder ? <div>{this.isFolderCom()}</div> :
          <div>{this.isunFolderCom()}</div>
        }
      </div>
    );
  }
}

const WarpForm = Form.create({
  onValuesChange({ dispatch }) {
    // 表单项变化时请求数据
    // 模拟查询表单生效
  },
})(TagDetailUnmarkedPage);
export default WarpForm;
