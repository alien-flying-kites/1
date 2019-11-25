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
  loading1: loading.effects['tagDetail/getLabelList'],
}))

class TagDetailMarkedFolderPage extends Component {
  state = {
    page: {
      pageindex: 1,
      limit: 20,
    },
    labelpage: {
      pageindex: 1,
      limit: 10,
    },
    selectCheck: [],
    modalVisible: false,
    previewData: {},
    labelid: null,
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
    const { page, labelpage, labelid } = this.state;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const labelparams = {
      limit: labelpage.limit,
      pageindex: labelpage.pageindex - 1,
      taskid: itemtaskid,
    }
    // 获取全部标签列表
    dispatch({
      type: 'tagDetail/getAllLabelList',
      payload: {
        taskid: itemtaskid,
      },
    })
    // console.log(labelparams)
    dispatch({
      type: 'tagDetail/getLabelList',
      payload: {
        ...labelparams,
      },
    }).then(res => {
      // console.log(res)
      if (res && res.code === 200 && res.data.list && res.data.list.length > 0) {
        const params = {
          limit: page.limit,
          pageindex: page.pageindex - 1,
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
        this.setState({
          labelid: res.data.list[0].labelid,
        })
      }
    });
  }

   /**
   * 图片列表分页改变页码
   */
  handleStandardTableChange = (page, pageSize) => {
    const { labelid } = this.state
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
      labelid,
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
   * 分页改变每页条数
   */
  showSizeChanger = (current, size) => {
    // console.log(current, size)
    const { labelid } = this.state
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
      islabel: 1,
      labelid,
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
  resetSelected = (page, pageSize) => {
    // console.log(page, pageSize)
    this.setState({
      labelpage: {
        pageindex: page,
        limit: pageSize,
      },
      selectCheck: [],
    }, () => {
      this.init()
    });
  }

  /**
   * 下拉选择框改变
   */
  handleSelectChange = (value, option) => {
    const { dispatch } = this.props;
    // const { labelOption, page } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    // console.log(value, option)
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
      selectCheck: [],
      labelid: value,
      page: {
        limit: 20,
        pageindex: 1,
      },
    })
  }

  updateRightCheck = item => {
    // console.log('点击啦', item)
    this.setState({ selectCheck: item })
  }

  updateLabel = () => {
    // console.log('子组件传消息啦')
    this.init()
  }

  labelSelect = item => {
    // console.log('子组件点击啦', item)
    this.handleLabelSelect(item)
  }

  // resetSelected = (page, pageSize) => {
  //   this.setState({
  //     labelpage: {
  //       pageindex: page,
  //       limit: pageSize,
  //     },
  //     selectCheck: [],
  //   });
  // }

    /**
   * 监听多选框的变化
   */
  onChange = checkedValues => {
    this.setState({ selectCheck: checkedValues })
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
      const arr = selectCheck.toString()
      const params = {
        taskid: itemtaskid,
        labelid: item.labelid,
        updateids: arr,
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
          this.handleSelectChange(item.labelid)
        }
      })
    } else {
      this.handleSelectChange(item.labelid)
    }
  }

  /**
   * 清洗
   */
  handleClean = () => {
    const { dispatch } = this.props;
    const { selectCheck, labelid } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    if (selectCheck.length > 0) {
      // console.log('选择标签')
      const arr = selectCheck.toString()
      const params = {
        taskid: itemtaskid,
        isclean: 1,
        cleanids: arr,
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
          this.handleSelectChange(labelid)
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
    router.push('/tag/tagDetail/markedFolderDoublePage');
  }

  render() {
    const {
      tagDetail: { taskImgList, labelList, alllabelList },
      loading,
      loading1,
      form: { getFieldDecorator },
      tag: { tasklabeling },
    } = this.props;
    const { modalVisible, previewData, labelid } = this.state;
    let datalist = []
    let totalNum = 1
    if (taskImgList && taskImgList.list) {
      datalist = taskImgList.list
      totalNum = taskImgList.totalnum
    }
    let labellist = []
    if (labelList && labelList.list) {
      labellist = labelList.list
    }
    const parentMethods = {
      handleModalVisible: this.handleModalVisible,
    };
    const allLabel = alllabelList ? alllabelList.list : []
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
          <Button type="primary" ghost icon="border" style={{ borderRadius: '0px' }} title="单屏"></Button>
          <Button icon="switcher" onClick={this.goToDoubleFolder} style={{ borderRadius: '0px' }} title="双屏"></Button>
        </p>
        <Row>
          <Col xxl={18} xl={18} lg={14} md={24} sm={24}>
            <div style={{ padding: '24px', borderRight: '1px solid #999' }}>
            <SelectInputComponent loading={loading} allLabel={allLabel}
             labellist={labellist} labelid={labelid} handleSelectChange={this.handleSelectChange}/>
            <CheckImgComponent loading={loading} data={datalist}
             totalNum={totalNum} updateCheck={this.updateRightCheck}
             handleTableChange={this.handleStandardTableChange}
             showRightSizeChanger={this.showSizeChanger} isshow/>
            </div>
          </Col>
          <Col xxl={6} xl={6} lg={10} md={12} sm={12}>
          <LabelListComponent loading={loading1} updateLabel={this.updateLabel}
           labelSelect={this.labelSelect} resetSelected={this.resetSelected}/>
          </Col>
        </Row>
        {previewData && Object.keys(previewData).length ?
           <Preview modalVisible={modalVisible} {...parentMethods} values={previewData}/> : null
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
})(TagDetailMarkedFolderPage);
export default WarpForm;
