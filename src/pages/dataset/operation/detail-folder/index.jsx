import React, { Component } from 'react';
import { Card, Pagination, Col, Checkbox, List, Breadcrumb, Tooltip } from 'antd';
// import { PageHeaderWrapper } from '@ant-design/pro-layout';
// import { find, findIndex } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import router from 'umi/router';
import styles from './style.less';
import CONSTANTS from '../../../../utils/constant';
import imgURL from '../../../../assets/folder.jpg';
import noData from '../../../../assets/noPic.jpg';

const { Meta } = Card;

@connect(({ dataset, loading }) => ({
  dataset,
  loading: loading.effects['dataset/getDatasetFolder'],
}))

class DatasetFolderDetail extends Component {
  state = {
    selectCheck: [],
    datasetname: '',
    datasetid: '',
    page: {
      pageindex: 0,
      limit: 10,
    },
    currentPage: 1,
  };

  componentDidMount() {
    const { datasetid, page } = this.state;
    const { dispatch } = this.props;
    console.log(this.props.match.params)
    const itemdatasetid = localStorage.getItem(CONSTANTS.TRAINING_DATASETID)
    const itemdatasetname = localStorage.getItem(CONSTANTS.TRAINING_DATASETNAME)
    // if (this.props.location.params && this.props.location.params.datasetid) {
    //   this.setState({ datasetid: this.props.location.params.datasetid })
    // }
    // console.log(itemdatasetname)
    if (itemdatasetid) {
      // this.setState({ datasetid: this.props.location.params.datasetid })
      this.setState({
        datasetid: itemdatasetid,
        datasetname: itemdatasetname,
      })
    }
    const param = {
      datasetid: itemdatasetid,
      pageindex: page.pageindex,
      limit: page.limit,
    }
    dispatch({
      type: 'dataset/getDatasetFolder',
      payload: {
        ...param,
      },
    });
    // console.log(datasetFolderList)
    // if (datasetFolderList) {
    //   this.setState({
    //     datalist: datasetFolderList.list,
    //     totalNum: datasetFolderList.totalnum,
    //   })
    // } else {
    //   this.setState({
    //     datalist: [],
    //     totalNum: 0,
    //   })
    // }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'dataset/resetDatasetFolder',
    })
  }

  onChange = checkedValues => {
    const { selectCheck } = this.state;
    // console.log(`checked = ${checkedValues}`);
    this.setState({ selectCheck: checkedValues })
  }

  viewDetial = item => {
    localStorage.setItem(CONSTANTS.TRAINING_FOLDERNAME, item.name);
    this.props.dispatch(routerRedux.push({
      pathname: '/dataset/img-list',
      params: item,
    }))
  }

   /**
   * 分页改变页码
   */
  handleStandardTableChange = (page, pageSize) => {
    // console.log(page, pageSize)
    const { datasetid } = this.state
    const { dispatch } = this.props;
    this.setState({
      page: {
        pageindex: page,
        limit: pageSize,
      },
      selectCheck: [],
    });
    const params = {
      datasetid,
      pageindex: page - 1,
      limit: pageSize,
    }
    // console.log(params)
    dispatch({
      type: 'dataset/getDatasetFolder',
      payload: params,
    });
  };

  /**
   * 分页改变每页条数
   */
  showSizeChanger = (current, size) => {
    // console.log(current, size)
    const { datasetid } = this.state
    const { dispatch } = this.props;
    this.setState({
      page: {
        limit: size,
        pageindex: current,
      },
      selectCheck: [],
    })
    const params = {
      datasetid,
      pageindex: current - 1,
      limit: size,
    }
    // console.log(params)
    dispatch({
      type: 'dataset/getDatasetFolder',
      payload: params,
    });
  }

  goToList = () => {
    router.push('/dataset');
  }

  render() {
    const { currentPage, page } = this.state;
    const { dataset: { datasetFolderList } } = this.props
    const {
      loading,
    } = this.props;
    let datalist = []
    let totalNum = 1
    // console.log(datasetFolderList);
    if (datasetFolderList) {
      datalist = datasetFolderList.list
      totalNum = datasetFolderList.totalnum
    } else {
      datalist = []
      totalNum = 0
    }
    const nullData = {};
    return (
      <div className={styles.contentWarp}>
        <div className={styles.breadcrumbItem}>
        <Breadcrumb>
          <Breadcrumb.Item onClick={this.goToList}><a>数据集管理</a></Breadcrumb.Item>
          <Breadcrumb.Item>
            {this.state.datasetname}
          </Breadcrumb.Item>
        </Breadcrumb>
        </div>
        <div style={{ background: '#fff', padding: '30px', margin: '24px' }}>
          <Checkbox.Group>
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
              if (item && item.floderid) {
              return (
                <Col xxl={3} xl={3} lg={4} md={6} sm={12} style={{ background: '#f4f4f4' }} className={styles.cardCol}>
                  <List.Item key={item.floderid} className={styles.imgListItem}>
                  <Card
                    bordered={false}
                    hoverable
                    className={styles.imgBox}
                    onClick={() => this.viewDetial(item)}
                    cover={<img alt="example" src={imgURL}
                    title="123"/>}
                >
                  <Tooltip title={item.name} className={styles.textcenter}>
                    <div>{item.name}</div>
                  </Tooltip>
                    {/* <Meta description={item.name} className={styles.textcenter}/> */}
                </Card>
                </List.Item>
                </Col>
              );
              }
              return (
                <div>
                  {totalNum > 0 ? null :
                  <div className={styles.nodataWarp}>
                    <img alt="nodata" src={noData}></img>
                  </div>}
                </div>
              );
            }}
          />
          </Checkbox.Group>
          {totalNum > 0 ? <div style={{ textAlign: 'center', marginTop: '24px' }}>
            {/* <Pagination defaultCurrent={currentPage} total={500}></Pagination> */}
            <Pagination
              total={totalNum}
              showTotal={(total, range) => `当前${range[0]}到${range[1]}条，共${total}条`}
              pageSize={page.limit}
              defaultCurrent={currentPage}
              showSizeChanger
              onChange={this.handleStandardTableChange}
              onShowSizeChange={this.showSizeChanger}
            />
          </div> : null
          }
        </div>
      </div>
    );
  }
}

export default DatasetFolderDetail;
