import React, { Component } from 'react';
import { Card, Row, Col, Checkbox, Button, message, Pagination, List, Icon } from 'antd';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Preview from '../components/preview';
import styles from './style.less';
import CONSTANTS from '../../../../utils/constant';
import noData from '../../../../assets/noPic.jpg';

@connect(({ tagDetail, loading }) => ({
  tagDetail,
  loading: loading.effects['tagDetail/getTaskimgList'],
}))

class TagDetailWashedPage extends Component {
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
  };

  componentDidMount () {
    this.init()
  }

  init = () => {
    const { dispatch } = this.props;
    const { page } = this.state;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)

    const params = {
      limit: page.limit,
      pageindex: page.pageindex - 1,
      taskid: itemtaskid,
      islabel: 0,
      isclean: 1,
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
      isclean: 1,
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
      isclean: 1,
    }
    // console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: params,
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
        isclean: 0,
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
   * model框
   */
  handleModalVisible = (flag, record) => {
    // console.log(record)
    this.setState({
      modalVisible: !!flag,
      previewData: record || {},
    });
  };

  render() {
    const {
      tagDetail: { taskImgList },
      loading,
    } = this.props;
    const { currentPage, page, selectCheck, modalVisible, previewData } = this.state;
    // console.log(loading, taskImgList)
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
      <div style={{ background: '#fff' }}>
        <div className={styles.topbuttonbox}>
          {/* <Button type="primary">重新标注</Button> */}
          <Button type="primary" onClick={this.handleClean} style={{ marginLeft: '16px' }}>取消清洗</Button>
        </div>
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
                  <Checkbox value={item.imgid} className={styles.checkbox} ></Checkbox>
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
    );
  }
}

export default TagDetailWashedPage;
