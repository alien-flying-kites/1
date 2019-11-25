import React, { Component } from 'react';
import { Card, Modal, Col, Checkbox, Button, message, Typography, List, Pagination, Breadcrumb } from 'antd';
// import { PageHeaderWrapper } from '@ant-design/pro-layout';
// import { find, findIndex } from 'lodash';
import { connect } from 'dva';
import router from 'umi/router';
import CONSTANTS from '../../../../utils/constant';
import styles from './style.less';
import UploadImg from './components/uploadImg';
import noData from '../../../../assets/noPic.jpg';

// const { Meta } = Card;
// const { Paragraph } = Typography;
const { confirm } = Modal;

@connect(({ dataset, loading }) => ({
  dataset,
  loading: loading.effects['dataset/getimgList'],
}))

class DatasetImgList extends Component {
  state = {
    selectCheck: [],
    datasetid: '',
    datasetname: '123',
    modalVisible: false,
    foldername: '231',
    folderpath: false,
    page: {
      pageindex: 1,
      limit: 10,
    },
    currentPage: 1,
    floderid: '',
  };

  componentDidMount() {
    const { floderid, page } = this.state;
    const { dispatch } = this.props;
    // console.log(this.props.location.params)
    if (this.props.location.params && this.props.location.params.floderid) {
      localStorage.setItem(CONSTANTS.TRAINING_FOLDERID, this.props.location.params.floderid);
      this.setState({
        floderid: this.props.location.params.floderid,
      })
    }
    if (this.props.location.params && !this.props.location.params.floderid) {
      localStorage.removeItem(CONSTANTS.TRAINING_FOLDERID);
      this.setState({
        floderid: '',
      })
    }
    const itemdatasetid = localStorage.getItem(CONSTANTS.TRAINING_DATASETID)
    const itemdatasetname = localStorage.getItem(CONSTANTS.TRAINING_DATASETNAME)
    const itemfoldername = localStorage.getItem(CONSTANTS.TRAINING_FOLDERNAME)
    const itemfoldernum = localStorage.getItem(CONSTANTS.TRAINING_FOLDERNUM)
    const itemfolderid = localStorage.getItem(CONSTANTS.TRAINING_FOLDERID)
    console.log('itemfolderid', itemfoldernum, itemfolderid)
    if (itemfoldernum && Number(itemfoldernum) <= 1) {
      this.setState({
        folderpath: false,
     })
    }
    if (itemfoldernum && Number(itemfoldernum) > 1) {
      this.setState({
        folderpath: true,
     })
    }
    if (itemdatasetid) {
      this.setState({
         datasetid: itemdatasetid,
         datasetname: itemdatasetname,
         foldername: itemfoldername,
      })
    }
    if (itemfolderid) {
      this.setState({
        floderid: itemfolderid,
      })
    }
    const param = {
      datasetid: itemdatasetid,
      pageindex: page.pageindex - 1,
      limit: page.limit,
    }
    if (itemfoldernum && Number(itemfoldernum) > 1) {
      param.floderid = itemfolderid
    }
    // console.log(param)
    dispatch({
      type: 'dataset/getimgList',
      payload: {
        ...param,
      },
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'dataset/resetDataset',
    })
  }

  /**
   * 添加上传
   */
  handleAdd = (fields, uid) => {
    console.log('uid-----', uid)
    const { dispatch } = this.props;
    const uploadArr = fields.upload
    uploadArr.map((item, i) => {
      const userName = localStorage.getItem(CONSTANTS.TRAINING_USERNAME);
      const token = localStorage.getItem(CONSTANTS.TRAINING_TOKE);
      const datasetid = localStorage.getItem(CONSTANTS.TRAINING_DATASETID);
      const params = {
        token,
        user: userName,
        datasetid,
        task_id: uid[i],
        filename: item.name,
      };
      if (this.state.folderpath) {
        params.floderid = this.state.floderid
      }
      dispatch({
        type: 'dataset/uploadSinglePic',
        payload: params,
      }).then(res => {
        if (res && res.code === 200) {
          this.getImgList();
        } else {
          message.error('操作失败');
        }
      });
    })
    this.handleModalVisible();
  }

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  /**
   * 监听选择框的变化
   */
  onChange = checkedValues => {
    this.setState({ selectCheck: checkedValues })
  }

  totallyUnselected = () => {
    this.setState({ selectCheck: [] })
  }

  allSelected = () => {
    const {
      dataset: { datasetImgList },
    } = this.props;
    const imglist = datasetImgList.list
    // console.log(imglist)
    const arr = []
    imglist.map(item => {
      arr.push(item.imgid)
    })
    // console.log(arr)
    this.setState({ selectCheck: arr })
  }

  /**
   * 批量删除图片
   */
  delete = () => {
    const { selectCheck, datasetid } = this.state;
    const { dispatch } = this.props;
    const self = this;
    // console.log(selectCheck)
    if (selectCheck.length <= 0) {
      return message.error('请选择要删除的图片');
    }
    const arr = selectCheck.toString()
    confirm({
      title: '删除以下选中的图片?',
      content: `图片id: ${selectCheck}`,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        const params = {
          imgids: `${arr}`,
          datasetid,
        };
        // console.log(params)
        const formData = new FormData()
        formData.append('datasetid', params.datasetid)
        formData.append('imgids', params.imgids)
        dispatch({
          type: 'dataset/delDatasetImg',
          payload: formData,
        }).then(res => {
          if (res && res.code === 200) {
            message.success('删除成功');
            self.getImgList();
            // self.child.cleanSelectedKeys();
          } else {
            message.error('操作失败');
          }
        })
      },
      onCancel() {},
    });
  }

  goToList = () => {
    router.push('/dataset');
  }

  goToFolder = () => {
    router.push('/dataset/detail-folder');
  }

  getImgList = () => {
    const { datasetid, page } = this.state
    const { dispatch } = this.props;
    const params = {
      datasetid,
      pageindex: page.pageindex - 1,
      limit: page.limit,
    }
    if (this.state.folderpath) {
      params.floderid = this.state.floderid
    }
    // console.log(params)
    dispatch({
      type: 'dataset/getimgList',
      payload: params,
    });
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
    if (this.state.folderpath) {
      params.floderid = this.state.floderid
    }
    // console.log(params)
    dispatch({
      type: 'dataset/getimgList',
      payload: params,
    });
  };

  /**
   * 分页改变每页条数
   */
  showSizeChanger = (current, size) => {
    // console.log(current, size)
    const { datasetid, folderpath } = this.state
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
    if (folderpath) {
      params.floderid = this.state.floderid
    }
    // console.log(params)
    dispatch({
      type: 'dataset/getimgList',
      payload: params,
    });
  }

  render() {
    const { modalVisible, datasetname, foldername, currentPage, page, folderpath } = this.state;
    const {
      dataset: { datasetImgList },
      loading,
    } = this.props;
    // console.log(datasetImgList);
    // console.log(page);
    let datalist = []
    let totalNum = 1
    datalist = datasetImgList.list
    totalNum = datasetImgList.totalnum

    const nullData = {};
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };
    // console.log('---------------------', loading, datalist, totalNum)
    return (
      // <PageHeaderWrapper
      // title={
      //   <Button style={{ paddingLeft: 0 }} type="link" onClick={this.goToList}>数据标注管理</Button>
      // }>
      <div className={styles.contentWarp}>
        <div className={styles.breadcrumbItem}>
        <Breadcrumb>
          <Breadcrumb.Item onClick={this.goToList}><a>数据集管理</a></Breadcrumb.Item>
          {/* <Breadcrumb.Item onClick={this.goToList}><a>{datasetname}</a></Breadcrumb.Item> */}
          { folderpath ? <Breadcrumb.Item onClick={this.goToFolder}><a>{datasetname}</a>
          </Breadcrumb.Item> : <Breadcrumb.Item>{datasetname}</Breadcrumb.Item>}
          { folderpath ? <Breadcrumb.Item><a>{foldername}</a>
          </Breadcrumb.Item> : null}
          {/* {folderpath ? <span>
            <Breadcrumb.Item onClick={this.goToFolder}>
            <a>{datasetname}</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{foldername}</Breadcrumb.Item></span> : <Breadcrumb.Item>
            <a>{datasetname}</a>
            </Breadcrumb.Item>
          } */}
        </Breadcrumb>
        </div>
        <div style={{ background: '#fff', padding: '30px', margin: '24px' }}>
          <Checkbox.Group onChange={this.onChange} value={this.state.selectCheck}>
            <div className={styles.tableListOperator}>
              <Button icon="upload" type="primary" onClick={() => this.handleModalVisible(true)}>
                上传
              </Button>
              <span>
                <Button onClick={this.delete}>删除</Button>
                <Button onClick={this.allSelected}>全选</Button>
                <Button onClick={this.totallyUnselected}>全不选</Button>
              </span>
            </div>
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
                  <List.Item key={item.imgid} className={styles.imgListItem}>
                  <div className={styles.checkboxItem}>
                    <Checkbox value={item.imgid} className={styles.checkbox} ></Checkbox>
                  </div>
                  <Card className={styles.imgBox} bordered={false}>
                    <img alt="example" src={item.imgpath} />
                  </Card>
                </List.Item>
                </Col>
              );
              }

              return (
                <div>
                  {/* {totalNum > 0 ? null :
                  <div>
                    <img alt="nodata" src={noData}></img>
                  </div>} */}
                </div>
              );
            }}
          />
          </Checkbox.Group>
          {totalNum > 0 ?
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
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
          </div> : <div className={styles.nodataWarp}>
                    <img alt="nodata" src={noData}></img>
                  </div>
          }
          <UploadImg modalVisible={modalVisible} {...parentMethods}/>
        </div>
      </div>
      // </PageHeaderWrapper>
    );
  }
}

export default DatasetImgList;
