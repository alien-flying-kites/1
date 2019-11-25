import React, { Component } from 'react';
import { Card, Row, Col, Checkbox, Button, Select, Pagination, List, Modal, message, Form, Input } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import CONSTANTS from '../../../../utils/constant';
import Preview from '../components/preview';
import LabelListComponent from '../components/label'
import CheckImgComponent from '../components/checkimg'
import SelectInputComponent from '../components/selectInputCom'
import styles from './style.less';
import noData from '../../../../assets/noPic.jpg';

const { Option } = Select;
const { confirm } = Modal;

@connect(({ tagDetail, tag, loading }) => ({
  tagDetail,
  tag,
  loading: loading.effects['tagDetail/getTaskimgList'],
  loading1: loading.effects['tagDetail/getRightLabelList'],
  loading2: loading.effects['tagDetail/getLabelList'],
}))

class TagDetailMarkedFolderDoublePage extends Component {
  state = {
    page1: {
      pageindex: 1,
      limit: 20,
    },
    page2: {
      pageindex: 1,
      limit: 20,
    },
    labelpage: {
      pageindex: 1,
      limit: 10,
    },
    selectCheck1: [],
    selectCheck2: [],
    modalVisible: false,
    previewData: {},
    labelid1: null,
    labelid2: null,
    labelname1: '',
    labelname2: '',
    combinVisible: false,
  };

  componentDidMount () {
    this.init()
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return false
    };
    const { dispatch } = this.props
    dispatch({
      type: 'tagDetail/resettaskImgList',
    })
  }

  /**
   * 页面初始化
   * 请求标签列表之后，根据第一个标签id获取图片列表
   */
  init = () => {
    const { dispatch } = this.props;
    const { page1, page2, labelpage } = this.state;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const labelparams = {
      limit: labelpage.limit,
      pageindex: labelpage.pageindex - 1,
      taskid: itemtaskid,
    }
    console.log(labelparams)
    // 获取全部标签列表
    dispatch({
      type: 'tagDetail/getAllLabelList',
      payload: {
        taskid: itemtaskid,
      },
    })
    // console.log(labelparams)
    // 获取分页标签
    dispatch({
      type: 'tagDetail/getLabelList',
      payload: {
        ...labelparams,
      },
    }).then(res => {
      console.log(res)
      if (res && res.code === 200 && res.data.list && res.data.list.length > 0) {
        if (res.data.list.length === 1) {
          const params = {
            limit: page1.limit,
            pageindex: page1.pageindex - 1,
            taskid: itemtaskid,
            labelid: res.data.list[0].labelid,
            islabel: 1,
            isclean: 0,
          }
          console.log(params)
          dispatch({
            type: 'tagDetail/getTaskimgList',
            payload: {
              ...params,
            },
          });
          dispatch({
            type: 'tagDetail/getRightLabelList',
            payload: {
              ...params,
            },
          });
          setTimeout(() => {
            this.setState({
              labelid1: res.data.list[0].labelid,
              labelid2: res.data.list[1].labelid,
              labelname1: res.data.list[0].name,
              labelname2: res.data.list[1].name,
            })
          }, 500)
        }
        if (res.data.list.length > 1) {
          const params1 = {
            limit: page1.limit,
            pageindex: page1.pageindex - 1,
            taskid: itemtaskid,
            labelid: res.data.list[0].labelid,
            islabel: 1,
            isclean: 0,
          }
          console.log(params1)
          dispatch({
            type: 'tagDetail/getTaskimgList',
            payload: {
              ...params1,
            },
          });
          setTimeout(() => {
            this.setState({
              labelid1: res.data.list[0].labelid,
              labelname1: res.data.list[0].name,
            })
          }, 500)
          const params2 = {
            limit: page2.limit,
            pageindex: page2.pageindex - 1,
            taskid: itemtaskid,
            labelid: res.data.list[1].labelid,
            islabel: 1,
            isclean: 0,
          }
          // console.log(params)
          dispatch({
            type: 'tagDetail/getRightLabelList',
            payload: {
              ...params2,
            },
          });
          setTimeout(() => {
            this.setState({
              labelid2: res.data.list[1].labelid,
              labelname2: res.data.list[1].name,
            })
          }, 500)
        }
      }
    });
  }

    /**
   * 图片列表分页改变页码-左侧
   */
  handleStandardTableChange = (page, pageSize) => {
    const { labelid1 } = this.state
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    // console.log(taskid)
    this.setState({
      page1: {
        pageindex: page,
        limit: pageSize,
      },
      selectCheck1: [],
    });
    const params = {
      limit: pageSize,
      pageindex: page - 1,
      taskid: itemtaskid,
      labelid: labelid1,
      islabel: 1,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: params,
    });
  };

      /**
   * 图片列表分页改变页码-右侧
   */
  handleStandardTableChange2 = (page, pageSize) => {
    const { labelid2 } = this.state
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    // console.log(taskid)
    this.setState({
      page2: {
        pageindex: page,
        limit: pageSize,
      },
      selectCheck2: [],
    });
    const params = {
      limit: pageSize,
      pageindex: page - 1,
      taskid: itemtaskid,
      labelid: labelid2,
      islabel: 1,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getRightLabelList',
      payload: params,
    });
  };

  /**
   * 分页改变每页条数-左侧
   */
  showSizeChanger = (current, size) => {
    // console.log(current, size)
    const { labelid1 } = this.state
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    this.setState({
      page1: {
        limit: size,
        pageindex: current,
      },
      selectCheck1: [],
    })
    const params = {
      limit: size,
      pageindex: current - 1,
      taskid: itemtaskid,
      islabel: 1,
      labelid: labelid1,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: params,
    });
  }

    /**
   * 分页改变每页条数-右侧
   */
  showSizeChanger2 = (current, size) => {
    // console.log(current, size)
    const { labelid2 } = this.state
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    this.setState({
      page2: {
        limit: size,
        pageindex: current,
      },
      selectCheck2: [],
    })
    const params = {
      limit: size,
      pageindex: current - 1,
      taskid: itemtaskid,
      islabel: 1,
      labelid: labelid2,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getRightLabelList',
      payload: params,
    });
  }

  resetSelected = (page, pageSize) => {
    console.log('切换页码', page, pageSize)
    this.setState({
      labelpage: {
        pageindex: page,
        limit: pageSize,
      },
      selectCheck1: [],
      selectCheck2: [],
    }, () => {
      this.init()
    });
  }

  /**
   * 下拉选择框改变-左侧
   */
  handleSelectChange = (value, option) => {
    const { dispatch } = this.props;
    // const { labelOption, page } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    console.log('左侧', value, option)
    const params = {
      limit: 20,
      pageindex: 0,
      taskid: itemtaskid,
      labelid: value,
      islabel: 1,
      isclean: 0,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: {
        ...params,
      },
    });
    this.setState({
      selectCheck1: [],
      labelid1: value,
      page1: {
        limit: 20,
        pageindex: 1,
      },
    })
    if (option && option.props) {
      this.setState({
        labelname1: option.props.children,
      })
    }
  }

   /**
   * 下拉选择框改变-右侧
   */
  handleSelectChange2 = (value, option) => {
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const params = {
      limit: 20,
      pageindex: 0,
      taskid: itemtaskid,
      labelid: value,
      islabel: 1,
      isclean: 0,
    }
    console.log('右侧', value, option)
    dispatch({
      type: 'tagDetail/getRightLabelList',
      payload: {
        ...params,
      },
    });
    this.setState({
      selectCheck2: [],
      labelid2: value,
      page2: {
        limit: 20,
        pageindex: 1,
      },
    })
    if (option && option.props) {
      this.setState({
        labelname2: option.props.children,
      })
    }
  }

  updateRightCheck = item => {
    console.log('右边点击啦', item)
    this.setState({ selectCheck1: item })
  }

  updateLeftCheck = item => {
    console.log('左边点击啦', item)
    this.setState({ selectCheck2: item })
  }

  /**
   * 监听多选框的变化-左侧
   */
  onChange = checkedValues => {
    // console.log(checkedValues)
    
  }

   /**
   * 监听多选框的变化-右侧
   */
  onChange2 = checkedValues => {
    // console.log(checkedValues)
    this.setState({ selectCheck2: checkedValues })
  }

  /**
   * 搜索 - 左侧
   */
  onSearch = val => {
    console.log('左侧搜索', val)
    if (val && val.length > 0) {
      this.setState({
        inputSelet: true,
      })
    } else {
      this.setState({
        inputSelet: false,
      })
    }
  }

   /**
   * 搜索 - 右侧
   */
  onSearch2 = val => {
    console.log('右侧搜索', val)
    if (val && val.length > 0) {
      this.setState({
        inputSelet2: true,
      })
    } else {
      this.setState({
        inputSelet2: false,
      })
    }
  }

  /**
   * 聚焦
   */
  onFocus = () => {
    console.log('focus');
  }

  /**
   * modal框
   */
  handleModalVisible = (flag, record) => {
    // console.log(record)
    this.setState({
      modalVisible: !!flag,
      previewData: record || {},
    });
  };

  updateLabel = () => {
    console.log('子组件传消息啦')
    this.init()
  }

  labelSelect = item => {
    console.log('子组件点击啦', item)
    this.handleLabelSelect(item)
  }

  /**
   * 选择标签
   */
  handleLabelSelect = item => {
    console.log(item)
    const { dispatch } = this.props;
    const { selectCheck1, selectCheck2, labelid1 } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    if (selectCheck1.length > 0 || selectCheck2.length > 0) {
      // console.log('选择标签')
      // console.log(selectCheck1, selectCheck2)
      const arr = []
      selectCheck1.map(val => {
        arr.push(val.imgid)
      })
      selectCheck2.map(data => {
        arr.push(data.imgid)
      })
      const newarr = arr.toString()
      const params = {
        taskid: itemtaskid,
        labelid: item.labelid,
        updateids: newarr,
      }
      // console.log(params)
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
          this.handleSelectChange(labelid1)
          this.setState({
            selectCheck1: [],
            selectCheck2: [],
          })
        }
      })
    } else {
      this.handleSelectChange(item.labelid)
      this.setState({
        labelid1: item.labelid,
        labelname1: item.name,
      })
    }
  }

  /**
   * 移动到右侧
   */
  combineToright = () => {
    const { dispatch } = this.props;
    const { selectCheck1, labelid2, labelid1 } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    if (selectCheck1.length <= 0) {
      return message.error('请选择左侧图片');
    }
    const arr = []
    selectCheck1.map(val => {
      arr.push(val.imgid)
    })
    const newArr = arr.toString()
    const params = {
      taskid: itemtaskid,
      labelid: labelid2,
      updateids: newArr,
    }
    // console.log(params)
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
        this.handleSelectChange2(labelid2)
        this.handleSelectChange(labelid1)
        this.setState({
          selectCheck1: [],
          selectCheck2: [],
        })
      }
    })
  }

   /**
   * 移动到左侧
   */
  combineToLeft = () => {
    const { dispatch } = this.props;
    const { selectCheck2, labelid2, labelid1 } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    if (selectCheck2.length <= 0) {
      return message.error('请选择右侧图片');
    }
    const arr = []
    selectCheck2.map(val => {
      arr.push(val.imgid)
    })
    const newArr = arr.toString()
    const params = {
      taskid: itemtaskid,
      labelid: labelid1,
      updateids: newArr,
    }
    // console.log(params)
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
        this.handleSelectChange2(labelid2)
        this.handleSelectChange(labelid1)
        this.setState({
          selectCheck1: [],
          selectCheck2: [],
        })
      }
    })
  }

  /**
   * 合并到一起
   */
  combineTogether = (flag, record) => {
    const { dispatch, form } = this.props;
    const { labelid2, labelid1 } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const self = this
    form.validateFieldsAndScroll((err, fieldsValue) => {
      console.log('fieldsValue- labelid', fieldsValue)
      if (!fieldsValue.labelid && fieldsValue.labelid !== 0) {
        message.error('请选择要合并的标签');
      } else {
        const params = {
          taskid: itemtaskid,
          tolabelid: fieldsValue.labelid,
        }
        if (fieldsValue.labelid === labelid2) {
          params.fromlabelid = labelid1
        } else {
          params.fromlabelid = labelid2
        }
        console.log('两个标签id', params.fromlabelid, params.tolabelid)
        if (params.fromlabelid === params.tolabelid) {
          return message.error('标签一样，不可合并')
        }
        // console.log(params)
        const formData = new FormData()
        formData.append('taskid', params.taskid)
        formData.append('fromlabelid', params.fromlabelid)
        formData.append('tolabelid', params.tolabelid)
        fieldsValue.labelid = ''
        dispatch({
          type: 'tagDetail/combineLabelTaskid',
          payload: formData,
        }).then(res => {
          // console.log(res)
          if (res && res.code === 200) {
            this.hideModal()
            this.handleSelectChange2(labelid2)
            this.handleSelectChange(labelid1)
            this.setState({
              selectCheck1: [],
              selectCheck2: [],
            })
          }
        })
      }
    });
    // this.combinCom()
  }

  hideModal = () => {
    this.setState({
      combinVisible: false,
    })
  }

  showModal = () => {
    const { labelid1, labelid2 } = this.state
    console.log(labelid1, labelid2)
    if (labelid1 === labelid2) {
      return message.error('id相同不可合并')
    }
    const { dispatch, form } = this.props;
    this.props.form.resetFields();
    this.setState({
      combinVisible: true,
    })
  }

   /**
   * 清洗
   */
  handleClean = () => {
    const { dispatch } = this.props;
    const { selectCheck1, selectCheck2, labelid1, labelid2 } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    if (selectCheck1.length > 0 || selectCheck2.length > 0) {
      // console.log('选择标签')
      // console.log(selectCheck1, selectCheck2)
      const arr = []
      selectCheck1.map(val => {
        arr.push(val.imgid)
      })
      selectCheck2.map(data => {
        arr.push(data.imgid)
      })
      const newarr = arr.toString()
      const params = {
        taskid: itemtaskid,
        isclean: 1,
        cleanids: newarr,
      }
      // console.log(params)
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
          this.handleSelectChange(labelid1)
          this.handleSelectChange2(labelid2)
          this.getSingletask()
          this.setState({
            selectCheck1: [],
            selectCheck2: [],
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

  goToDoubleFolder = () => {
    router.push('/tag/tagDetail/markedFolderPage');
  }

  render() {
    const nullData = []
    const {
      tagDetail: { taskImgList, labelList, righLlabelList, alllabelList },
      loading,
      loading1,
      loading2,
      form: { getFieldDecorator },
      tag: { tasklabeling },
    } = this.props;
    const { modalVisible, previewData, labelid1,
      labelid2, labelname1, labelname2 } = this.state;
    let datalist = []
    let totalNum = 1
    if (taskImgList && taskImgList.list) {
      datalist = taskImgList.list
      totalNum = taskImgList.totalnum
    }
    let datalist2 = []
    let totalNum2 = 1
    if (righLlabelList && righLlabelList.list) {
      datalist2 = righLlabelList.list
      totalNum2 = righLlabelList.totalnum
    }
    let labellist = []
    if (labelList && labelList.list) {
      labellist = labelList.list
    }
    // console.log(labelList)
    const allLabel = alllabelList ? alllabelList.list : []
    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    const taskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    return (
      <div style={{ background: '#fff' }}>
        <div className={styles.topbuttonbox}>
          {tasklabeling && taskid === tasklabeling.taskid ? <span>{tasklabeling.msg_status === 7 ?
            null : <Button type="primary" onClick={this.pauseAutoMark}>暂停标注</Button>
          }</span> : null }
          <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>清洗</Button>
        </div>
        <p>
          <Button icon="border" onClick={this.goToDoubleFolder} style={{ borderRadius: '0px' }}></Button>
          <Button icon="switcher" type="primary" ghost style={{ borderRadius: '0px' }} ></Button>
        </p>
        <Row>
          <Col xxl={8} xl={8} lg={8} md={24} sm={24} loading={loading}>
            <div style={{ padding: '16px' }}>
              <SelectInputComponent loading={loading2} allLabel={allLabel} labellist={labellist} labelid={labelid1} handleSelectChange={this.handleSelectChange} />
              <CheckImgComponent loading={loading} data={datalist} totalNum={totalNum} updateCheck={this.updateRightCheck} handleTableChange={this.handleStandardTableChange} showRightSizeChanger={this.showSizeChanger} isshow={false}/>
            </div>
          </Col>
          <Col xxl={1} xl={1} lg={1} md={24} sm={24} style={{ height: '100%' }} className={styles.operationCol}>
            <div className={styles.operationWarp}>
              <Button size="small" icon="arrow-left" onClick={this.combineToLeft}></Button>
              <Button size="small" icon="arrow-right" onClick={this.combineToright}></Button>
              <Button size="small" onClick={this.showModal}>合并</Button>
            </div>
          </Col>
          <Col xxl={8} xl={8} lg={6} md={24} sm={24} loading={loading1}>
            <div style={{ padding: '16px' }}>
            <SelectInputComponent loading={loading2} allLabel={allLabel} labellist={labellist} labelid={labelid2} handleSelectChange={this.handleSelectChange2} isDouble/>
              <CheckImgComponent loading={loading1} data={datalist2} totalNum={totalNum2} updateCheck={this.updateLeftCheck} handleTableChange={this.handleStandardTableChange2} showRightSizeChanger={this.showSizeChanger2} isshow={false}/>
          </div>
          </Col>
          <Col xxl={6} xl={6} lg={10} md={12} sm={12} loading={loading2} >
            <LabelListComponent updateLabel={this.updateLabel} labelSelect={this.labelSelect} resetSelected={this.resetSelected}/>
          </Col>
        </Row>
        {previewData && Object.keys(previewData).length ?
          <Preview modalVisible={modalVisible} {...parentMethods} values={previewData}/> : null
         }
        <Modal
          title="Modal"
          visible={this.state.combinVisible}
          onOk={this.combineTogether}
          onCancel={this.hideModal}
          okText="确认"
          cancelText="取消"
        >
        <p>将标签{labelname1}和{labelname2}合并为：</p>
        {
          <Form>
            <Form.Item>
              {getFieldDecorator('labelid', {
                  initialValue: labelid1,
              })(
                <Select className={styles.selectItem} style={{ width: '100%', textAlign: 'center' }}>
                  <Option value={labelid1}>{labelname1}</Option>
                  <Option value={labelid2}>{labelname2}</Option>
              </Select>,
              )}
            </Form.Item>
          </Form>}
        </Modal>
    </div>
    );
  }
}

const WarpForm = Form.create({
  onValuesChange({ dispatch }) {
  },
})(TagDetailMarkedFolderDoublePage);
export default WarpForm;
