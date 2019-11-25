import React, { Component } from 'react'
import router from 'umi/router'
import { message, Popconfirm, Modal, Icon } from 'antd'
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva'
import CusTable from './CusTable'
import styles from '@/pages/training/style.less'

const projectState = [
  { value: -1, name: '全部状态' },
  { value: 0, name: '初始化' },
  { value: 1, name: '创建中' },
  { value: 2, name: '运行中' },
  { value: 3, name: '运行失败' },
  { value: 4, name: '正在停止' },
  { value: 5, name: '已停止' },
  { value: 6, name: '停止失败' },
]

class Training extends Component {
  state = {
    pageSize: 10,
    currentPage: 0,
    searchName: '',
    projectState: -1,
    showDelModal: false,
    showDescModal: false,
    projectDesc: ''
  }
  
  columns = [
    {
      title: '名称',
      dataIndex: 'projectname',
      align: 'center',
      render: (text, record) => (
        <a onClick={() => this.toDetailPage(record)}>{text || 'unknown'}</a>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      render: text => {
        let filter = projectState.filter(v => v.value == text)
        if (filter.length) {
          return filter[0].name
        }
        return 'unknown'
      }
    },
    {
      title: '版本数量',
      dataIndex: 'version',
      align: 'center',
      render: text => (
        <span>{text.length}</span>
      )
    },
    {
      title: '项目环境',
      dataIndex: 'env',
      align: 'center',
      render: text => {
        return text || '--'
      }
    },
    {
      title: '项目框架',
      dataIndex: 'frame',
      align: 'center',
      render: text => {
        return text || '--'
      }
    },
    {
      title: '类型',
      dataIndex: 'scene',
      align: 'center',
      render: text => {
        if (text == 0) {
          return '图像'
        }
        return '音频'
      }
    },
    {
      title: '训练任务',
      dataIndex: 'missionname',
      align: 'center',
      render: text => {
        return text || '--'
      }
    },
    {
      title: '描述',
      dataIndex: 'desc',
      align: 'center',
      render: (text, record) => {
        return (
          <div>
            <span className={styles.longText}>
            {text || '--'}
            </span>
            <Icon type="edit" style={{color: '#519FE8'}} onClick={() => {this.showDesc(text, record)}}/>
          </div>
        )
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatetime',
      align: 'center'
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (text, record) => {
        return (
          <Popconfirm
            title="确定要删除项目?"
            onConfirm={() => this.delConfirm(record)}
            onCancel={() => {}}
            okText="确定"
            cancelText="取消"
          >
            <a disabled={Boolean(record.status == 2)} href="#">删除</a>
          </Popconfirm>
        )
      }
    },
  ]

  componentWillMount () {
    console.log('will mount')
    this.requestList()
  }

  componentWillUpdate () {
    console.log('will update');
  }
  
  componentDidUpdate () {
    console.log('did update');
    this.requestList()
  }

  toDetailPage = record => {
    localStorage.setItem('proDetail', JSON.stringify(record))
    router.push('training/detail')
  }

  selectState = (state) => {
    this.setState({projectState: state})
  }

  searchByName = (name) => {
    this.setState({searchName: name})
  }

  refreshList = () => {
    this.requestList()
  }

  editDescription = (desc, record) => {
    console.log('edit', desc, record)
  }

  createProject = () => {
    router.push('/training/create-project')
  }

  updateTable = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    if (this.state.pageSize != pageSize) {
      this.setState({
        pageSize: pageSize,
        currentPage: current - 1
      })
    } else {
      this.setState({
        currentPage: current - 1
      })
    }
  }

  requestList = () => {
    const params = {
      isopen: 0,
      pageindex: this.state.currentPage,
      limit: this.state.pageSize,
      name: this.state.searchName
    }
    if (this.state.projectState != -1) {
      params.status = this.state.projectState
    }
    this.props.dispatch({
      type: 'training/fetch',
      payload: params
    })
  }

  delConfirm = (record) => {
    if (record.status == 2) {
      message.warn('项目运行中，无法进行删除操作')
      return;
    }
    this.props.dispatch({
      type: 'training/delProject', 
      payload: {
        projectid: record.projectid,
        wsname: record.ws_name
      }
    }).then(({ code, msg }) => {
      if (code == 200) {
        this.requestList()
        return message.success('删除项目，操作成功')
      }
      message.error(`删除项目，操作失败`)
      if (msg) message.error(msg)
    })
  }
  
  showDesc = (text, record) => {
    this.setState({
      showDescModal: true,
      projectDesc: text || ''
    })
  }

  closeDescModal = () => {
    this.setState({
      showDescModal: false,
      projectDesc: ''
    })
  }

  render() {
    return (
      <PageHeaderWrapper>
        <CusTable 
          {...this.props}
          projectState={projectState}
          columns={this.columns}
          createProject={this.createProject}
          selectState={this.selectState}
          searchByName={this.searchByName}
          refreshList={this.refreshList}
          pageSize={this.state.pageSize}
          updateTable={this.updateTable}
        />
        <Modal
          title="项目描述"
          visible={this.state.showDescModal}
          onCancel={this.closeDescModal}
          footer={null}
        >
          <p>{this.state.projectDesc}</p>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default connect()(Training)
