import React, { Component, Fragment } from 'react';
import { Button, Card, Badge, Col, Form, Input, Row, message, Modal } from 'antd';
import { connect } from 'dva';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import router from 'umi/router';
import { routerRedux } from 'dva/router';
import styles from './style.less';
import StandardTable from './components/StandardTable';
import CONSTANTS from '../../../utils/constant';


const FormItem = Form.Item;
const { confirm } = Modal;

const statusMap = ['0'];
const status = ['人脸'];

@connect(({ dataset, loading }) => ({
  dataset,
  loading: loading.effects['dataset/fetch'],
}))
class Dataset extends Component {
  // state = {
  //   page: {
  //     pageNo: 1,
  //     pageSize: 10,
  //   },
  //   selectedRows: [],
  //   formValues: {},
  // };

  columns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'datasetid',
    // },
    {
      title: '数据集名称',
      dataIndex: 'datasetname',
      render: (val, cl) => <a onClick={() => this.viewDetial(val, cl)}>{val}</a>,
    },
    {
      title: '场景',
      dataIndex: 'scene',
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '数量',
      dataIndex: 'imgnumber',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      render: (val, record) => (
        (
          val === 'undefined' || val === '' || !val ? <span>--</span> : <span className={styles.longText}>{val}</span>
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
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleDelete(true, record)}>删除</a>
        </Fragment>
      ),
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      page: {
        pageNo: 1,
        pageSize: 10,
      },
      selectedRows: [],
      formValues: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { page } = this.state;
    dispatch({
      type: 'dataset/fetch',
      payload: {
        ...page,
      },
    });
  }

  /**
   * 分页改变页码
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
    // console.log('formValues---', formValues)
    const params = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      name: formValues.datasetname,
    };

    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    this.setState({
      page: {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      },
      selectedRows: [],
    });

    dispatch({
      type: 'dataset/fetch',
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
        name: fieldsValue.datasetname,
      };
      this.setState({
        formValues: fieldsValue,
        page: {
          pageNo: 1,
          pageSize: page.pageSize,
        },
      });
      dispatch({
        type: 'dataset/fetch',
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
    this.setState({
      formValues: {},
      page: {
        pageNo: 1,
        pageSize: 10,
      },
    });
    const params = {
      pageNo: 1,
      pageSize: page.pageSize,
    };
    dispatch({
      type: 'dataset/fetch',
      payload: params,
    });
  };

  /**
   * 删除数据集
   */
  handleDelete = (flag, record) => {
    // console.log(record)
    const { dispatch } = this.props;
    // const newMap = selectedRows.map(item => `用户名称:${item.userName};账号:${item.loginName}`);
    const self = this;
    confirm({
      title: '删除以下选中的数据集?',
      content: `数据集名称: ${record.datasetname}`,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        const params = {
          datasetid: `${record.datasetid}`,
        };
        const formData = new FormData()
        formData.append('datasetid', params.datasetid)
        dispatch({
          type: 'dataset/delDataset',
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
   * 数据集详情
   */
  viewDetial = async (val, item) => {
    // console.log('viewDetial item----->', item.flodernumber);
    localStorage.setItem(CONSTANTS.TRAINING_DATASETID, item.datasetid);
    localStorage.setItem(CONSTANTS.TRAINING_DATASETNAME, item.datasetname);
    localStorage.setItem(CONSTANTS.TRAINING_FOLDERNUM, item.flodernumber);
    if (item && item.flodernumber > 1) {
      router.push('/dataset/detail-folder');
      // router.push({
      //   pathname: `/dataset/operation/detail-folder/${item.datasetid}`,
      //   params: item.datasetid,
      // });
      // this.props.dispatch(routerRedux.push({
      //   pathname: '/dataset/operation/detail-folder',
      //   params: item,
      // }))
    }
    if (item && item.flodernumber <= 1) {
      console.log('单个文件夹~')
      router.push('/dataset/img-list');
      // this.props.dispatch(routerRedux.push({
      //   pathname: '/dataset/operation/img-list',
      //   params: item,
      // }))
    }
  };

  toAdd = () => {
    router.push('/dataset/add');
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
            <FormItem label="数据集名称">
            {getFieldDecorator('datasetname')(<Input placeholder="请输入数据集名称" />)}
            {/* {(<Input placeholder="请输入用户名称" />)} */}
            </FormItem>
          </Col>
          <Col xxl={4} lg={4} md={4} sm={24}>
            <span className={styles.submitButtons}>
              <Button
              onClick={this.handleSearch}
              type="primary"
              loading={loading}
              htmlType="submit">
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
      dataset: { datasetList },
      loading,
    } = this.props;
    // console.log(datasetList);
    const { selectedRows, page } = this.state;
    datasetList.pageNo = page.pageNo
    datasetList.pageSize = page.pageSize
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
          <div className={styles.tableListForm}>{this.renderSimpleForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.toAdd()}>
                新增数据集
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={datasetList}
              rowKey="datasetid"
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

export default Form.create()(Dataset);
