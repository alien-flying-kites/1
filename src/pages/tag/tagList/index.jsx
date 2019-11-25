import React, { Component, Fragment } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Button, Card, Badge, Col, Form, Progress, Input, Row, Select, Modal, message, Divider } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import { routerRedux } from 'dva/router';
import styles from './style.less';
import StandardTable from './components/StandardTable';
import CONSTANTS from '../../../utils/constant';
import Socket from '../../../utils/socketIo'

const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;

const statusMap = ['0'];
const scene = ['人脸'];

const typeMap = ['landmark', 'facerecogntion'];
const type = ['人脸检测', '人脸识别'];

@connect(({ tag, loading }) => ({
  tag,
  loading: loading.effects['tag/getTagList'],
}))

class TagList extends Component {
  state = {
    selectedRows: [],
    page: {
      pageNo: 1,
      pageSize: 10,
    },
    progress: 0,
    tagStatus: 1,
    tagmsg: '',
    taskid: '',
    // disable: false,
  };

  columns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'taskid',
    // },
    {
      title: '标注任务名称',
      dataIndex: 'taskname',
      render: (val, cl) => <a onClick={() => this.viewDetial(val, cl)}>{val}</a>,
    },
    {
      title: '场景',
      dataIndex: 'scene',
      align: 'center',
      render(val) {
        return <Badge status={statusMap[val]} text={scene[val]} />;
      },
    },
    {
      title: '类型',
      dataIndex: 'labeltype',
      render: (val, record) => (
        (
          val === 'facerecogntion' ? <span>人脸识别</span> : <span>人脸检测</span>
        )
      ),
    },
    {
      title: '标注进度(已标注个数/总数)',
      dataIndex: 'imgnumber',
      render: (text, record) => {
        if (this.state.taskid && this.state.taskid === record.taskid && this.state.tagStatus && this.state.tagStatus !== 7) {
          if (this.state.progress && this.state.progress === 0) {
            record.progress = Number(0)
          } else if (this.state.progress && this.state.progress !== 0) {
            record.progress = Number(this.state.progress).toFixed(2)
          } else {
            record.progress = Number((record.islabel + record.isclean) / (record.imgnumber)).toFixed(2)
          }
          if (this.state.tagStatus && this.state.tagStatus === 6) {
            record.status = 2
          }
          if (this.state.tagmsg && this.state.tagmsg !== '') {
            record.tagmsg = `(${this.state.tagmsg})`
          } else {
            // record.tagmsg = (record.islabel) + (record.isclean) / (record.imgnumber)
            record.tagmsg = `(${Number(record.islabel) + Number(record.isclean)} / ${Number(record.imgnumber)})`
          }
        } else if (this.state.taskid && this.state.taskid !== record.taskid) {
            if (record.status === 2) {
              record.status = 2
              record.progress = Number(record.progress).toFixed(2)
              record.tagmsg = `${record.tagmsg}`
            } else {
              record.progress = Number((Number(record.islabel) + Number(record.isclean)) / (record.imgnumber)).toFixed(2)
            }
          // record.progress = ((record.islabel + record.isclean) / (record.imgnumber)).toFixed(2)
          // record.tagmsg = `(${record.islabel + record.isclean} / ${record.imgnumber})`
          // record.status = 0
        } else if (!this.state.taskid) {
          if (record.imgnumber !== 0) {
            record.progress = Number((Number(record.islabel) + Number(record.isclean)) / (record.imgnumber)).toFixed(2)
          } else {
            record.progress = 0
          }
          // console.log('taskid 与我无瓜hhhhh', typeof (Number(record.progress).toFixed(2) * 100))
          record.tagmsg = `(${Number(record.islabel) + Number(record.isclean)} / ${Number(record.imgnumber)})`
          record.status = 0
        } else if (this.state.taskid && this.state.taskid === record.taskid && this.state.tagStatus && this.state.tagStatus === 7) {
          record.status = 0
        }
        return (
          <span>
              {record.status === 2 ? <span>智能标注中</span> : <span>普通标注</span>}
              <Progress showInfo={false} strokeColor={{ from: '#108ee9',
            to: '#108ee9' }} percent={(Number(record.progress) * 100)} size="small" />
            <span>{(record.progress * 100).toFixed(2)}%</span>
            <span style={{ marginLeft: '5px' }}>{record.tagmsg}</span>
        </span>
        )
      },
    },
    {
      title: '描述',
      dataIndex: 'desc',
      render: (text, record) => (
        (
          !text || text === 'undefined' ? <span>--</span> : <span className={styles.longText}>{text}</span>
        )
      ),
    },
    {
      title: '创建人',
      dataIndex: 'user',
    },
    {
      title: '创建时间',
      dataIndex: 'updatetime',
    },
    {
      title: '操作',
      render: (text, record) => {
        return (
          <Fragment>
          <a onClick={() => this.startTrain(record)}>生成训练数据</a>
          <Divider type="vertical" />
          {record.status === 2 ? <span>
            {this.state.tagStatus === 6 ? <span><a onClick={() => this.pauseAutoMark(record)}>
            暂停标注</a> <Divider type="vertical" /> <a disabled>
            删除</a></span> : <span><a disabled>开始标注</a><Divider type="vertical" /> <a disabled>
            删除</a></span>
            }
          </span> : <span>
            {(record.islabel + record.isclean) === (record.imgnumber) ? <span><a disabled>开始标注</a><Divider type="vertical" /><a onClick={() => this.handleDelete(true, record)}>删除</a></span> : <span><a onClick={() => this.startAutoMark(record)}>开始标注</a><Divider type="vertical" /><a onClick={() => this.handleDelete(true, record)}>删除</a></span>}
          </span>}
        </Fragment>
        )
      }
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    const { page } = this.state;
    dispatch({
      type: 'tag/getTagList',
      payload: {
        ...page,
      },
    });
    this.getSocketMsg()
  }

  getSocketMsg = () => {
    const { dispatch } = this.props
    Socket.on('msg', data => {
      // console.log(data)
      dispatch({
        type: 'tag/autoLabeling',
        payload: data,
      })
      this.setState({
        progress: Number(data.progress).toFixed(2),
        tagStatus: data.msg_status,
        tagmsg: data.msg,
        taskid: data.taskid,
      })
    })
  }

  /**
   * 分页改变页码
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
    // console.log('formValues==', formValues)
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    };
    if (formValues && formValues.labeltype && formValues.labeltype !== '0') {
      params.labeltype = formValues.labeltype
    }
    if (formValues && formValues.taskname && (formValues.taskname !== '' || formValues.taskname !== 'undefined')) {
      params.name = formValues.taskname
    }
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    // console.log('params---', params)
    this.setState({
      page: {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      },
      selectedRows: [],
    });

    dispatch({
      type: 'tag/getTagList',
      payload: params,
    });
  };

   /**
   * 搜索查询
   */
  handleSearch = () => {
    const { dispatch, form } = this.props;
    const { page } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = {
        ...page,
        pageNo: 1,
      }
      this.setState({
        formValues: fieldsValue,
        page: {
          pageNo: 1,
          pageSize: page.pageSize,
        },
      });
      if (fieldsValue.labeltype && fieldsValue.labeltype !== '0') {
        params.labeltype = fieldsValue.labeltype
      }
      if (fieldsValue.taskname && (fieldsValue.taskname !== '' || fieldsValue.taskname !== 'undefined')) {
        params.name = fieldsValue.taskname
      }
      // console.log(params)
      dispatch({
        type: 'tag/getTagList',
        payload: params,
      });
    });
  };

   /**
   * 查询重置
   */
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.props.form.setFieldsValue({});
    const { page } = this.state;
    // console.log('page----------', page)
    this.setState({
      formValues: {},
      page: {
        pageNo: 1,
        pageSize: page.pageSize,
      },
    });
    const params = {
      pageNo: 1,
      pageSize: page.pageSize,
    };
    dispatch({
      type: 'tag/getTagList',
      payload: params,
    });
  };

  toAdd = () => {
    router.push('/tag/add');
  };

  /**
   * 标注详情
   */
  viewDetial = async (val, item) => {
    // console.log('viewDetial item----->', item);
    // console.log('viewDetial after format:', item);
    localStorage.setItem(CONSTANTS.TRAINING_TASKID, item.taskid);
    localStorage.setItem(CONSTANTS.TRAINING_TASKNAME, item.taskname);
    if (item.labeltype === 'facerecogntion') {
      // 跳转到人脸识别页面
      localStorage.setItem(CONSTANTS.TRAINING_ISFOLDER, true);
      router.push('/tag/tagDetail/markedFolderPage');
    }
    if (item.labeltype === 'landmark') {
      // 跳转到人脸检测页面
      localStorage.setItem(CONSTANTS.TRAINING_ISFOLDER, false);
      router.push('/tag/tagDetail/markedPage');
      // router.push({
      //   pathname: `/tag/tagDetail/markedPage/${item.taskid}`,
      //   params: item.taskid,
      // });
    }
    // router.push('/tag/tagDetail');
    // this.props.dispatch(routerRedux.push({
    //   pathname: '/tag/tagDetail',
    //   params: item,
    // }))
  };

  /**
   * 生成训练数据
   */
  startTrain = record => {
    const { dispatch } = this.props;
    const formData = new FormData()
    formData.append('taskid', record.taskid)
    dispatch({
      type: 'tag/startrec',
      payload: formData,
    }).then(res => {
      if (res && res.code === 200) {
        message.success('已开始生成训练数据，生成结束可在私人数据集中选择');
        // this.handleSearch();
      }
      if (res && res.code === 306) {
        message.error('任务繁忙');
        // this.handleSearch();
      }
      if (res && res.code === 307) {
        message.error('无已标注信息生成训练数据');
        // this.handleSearch();
      }
    })
  }

  /**
   * 开始自动标注
   */
  startAutoMark = record => {
    const { dispatch } = this.props;
    const userName = localStorage.getItem(CONSTANTS.TRAINING_USERNAME);
    // console.log(record)
    record.status = 2
    const formData = new FormData()
    formData.append('taskid', record.taskid)
    formData.append('user', userName)
    formData.append('labeltype', record.labeltype)
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
  pauseAutoMark = record => {
    const { dispatch } = this.props;
    const formData = new FormData()
    formData.append('taskid', record.taskid)
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
   * 删除标注任务
   */
  handleDelete = (flag, record) => {
    const { dispatch } = this.props;
    const self = this;
    confirm({
      title: '删除以下选中的标注任务?',
      content: `标注名称: ${record.taskname}`,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        const params = {
          taskid: `${record.taskid}`,
        };
        const formData = new FormData()
        formData.append('taskid', params.taskid)
        dispatch({
          type: 'tag/delTag',
          payload: formData,
        }).then(res => {
          // console.log(res)
          if (res && res.code === 200) {
            message.success('删除成功');
            self.handleSearch();
          } else {
            message.error('操作失败');
          }
        })
      },
      onCancel() {},
    });
  };

  /**
   * 查询组件
   */
  renderSimpleForm() {
    const { form, loading } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <Row
          gutter={{
            md: 4,
            lg: 24,
            xl: 48,
          }}
        >
          <Col xxl={5} xl={6} lg={8} md={8} sm={24}>
            <FormItem label="类型">
              {getFieldDecorator('labeltype', {
                initialValue: '0',
              })(<Select>
              <Option value="0">全部</Option>
              <Option value="landmark">人脸检测</Option>
              <Option value="facerecogntion">人脸分类</Option>
            </Select>)}
            </FormItem>
          </Col>
          <Col xxl={5} xl={6} lg={8} md={8} sm={24}>
            <FormItem label="任务名称">
              {getFieldDecorator('taskname')(<Input placeholder="输入标注任务名称" />)}
            </FormItem>
          </Col>
          <Col xxl={4} lg={4} md={4} sm={24}>
            <span className={styles.submitButtons}>
              <Button onClick={this.handleSearch} type="primary" htmlType="submit">
                查询
              </Button>
              <Button
                style={{
                  marginLeft: 8,
                }}
                onClick={this.handleFormReset}
              >
                重置
              </Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      tag: { tagList },
      loading,
    } = this.props;
    const { selectedRows, page } = this.state;
    tagList.pageNo = page.pageNo
    tagList.pageSize = page.pageSize
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.toAdd()}>
                新增数据标注
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={tagList}
              rowKey="taskid"
              columns={this.columns}
              // onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Form.create()(TagList);
