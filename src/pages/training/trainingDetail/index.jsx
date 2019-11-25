import React, { Component } from 'react'
import router from 'umi/router'
import { message } from 'antd'
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva'
import ProjectDetail from './ProjectDetail'
import SelectEnvModal from '../components/selectEnv'
import { strict } from 'assert'

class TrainingDetail extends Component {
  queryTimer = null;
  downloadTimer = null;
  state = {
    show: false,
    storageSize: 5,
    selectedType: 0,
    showSpin: false,
    projectInfo: null,
    projectDesc: '',
  }

  componentWillMount () {
    const { projectid } = JSON.parse(localStorage.getItem('proDetail'))
    this.getProjectIntr(projectid)
    this.findProjectById(projectid)
  }

  switchTab = async (activeKey, projectId) => {
    if (activeKey !== '1') return
    this.getProjectIntr(projectId)
  }
  
  getProjectIntr = async (projectId) => {
    const { dispatch } = this.props
    const { code, msg, data } = await dispatch({
      type: 'training/getProjectIntr',
      payload: {
        projectid: projectId
      }
    })
    if (code != 200) {
      message.error('获取项目介绍失败')
      if (msg) message.error(msg)
    }
    if (typeof data == 'string') {
      this.setState({projectDesc: data})
    }
  }

  delProject = () => {
    console.log('del')
  }

  modifyProject = () => {
    console.log('modify')
  }

  handleOk = async (form, hardConfig, projectId, matchName) => {
    if (this.state.showSpin) return
    let { dispatch } = this.props
    form.validateFields(async (err, values) => {
      if (err) return
      console.log('fields value:', values)
      let { type, config, storage } = values
      let s = parseInt(storage)
      if (s < 5 || s > 200) {
        form.setFields({
          'storage': {
            errors: [new Error('存储配置范围 5 ~ 200')]
          }
        })
        return;
      } 
      let { cpu, gpu, memory } = hardConfig[type].config[config]
      let params = {
        cpu, gpu, memory,
        projectid: projectId, 
        size: storage
      }
      const res = await dispatch({
        type: 'training/runProject',
        payload: params
      })
      let { code, msg } = res
      if (code == 200) {
        return this.checkProjectStatus(projectId, matchName)
      }
      message.error(`项目运行失败`)
      if (msg) message.error(msg)
      await this.updateProjectStatus(projectId, 3) // 更新项目状态为失败
      router.push('/training')
    })
  }

  checkProjectStatus = (projectId, matchName) => {
    const { dispatch } = this.props
    // 轮询项目状态
    this.setState({showSpin: true})
    let num = 0, isRunning = false
    this.queryTimer = setInterval(async () => {
      ++num
      try {
        let queryRes = await dispatch({
          type: 'training/queryProjectStatus'
        })
        const { notebooks } = queryRes
        if (notebooks && typeof notebooks == 'object') {
          for (let i = 0; i < notebooks.length; i++) {
            let item = notebooks[i]
            const { status } = item
            if (item.name != matchName) continue
            console.log(`match_project_status_${num}: `, status)
            if (status && status.hasOwnProperty('running')) {
              isRunning = true
              clearInterval(this.queryTimer)
              this.updateProjectStatus(projectId, 2)
              break
            }
          }
        }
        if (num >= 40) {
          clearInterval(this.queryTimer)
          this.setState({showSpin: false})
          if (isRunning) return
          message.error('项目运行超时')
          await this.updateProjectStatus(projectId, 3)
          router.push('/training')
        }
      } catch (e) {
        clearInterval(this.queryTimer)
        this.setState({showSpin: false})
        message.error('运行失败，请求异常')
      }
    }, 3000)
  }

  updateProjectStatus = async (projectId, status) => {
    const { dispatch } = this.props
    const { code, msg } = await dispatch({
      type: 'training/updateProjectStatus',
      payload: {
        projectid: projectId,
        status: status
      }
    })
    if (status == 3) return
    this.findProjectById(projectId)
    if (code == 200) {
      setTimeout(() => {
        this.setState({show: false, showSpin: false})
        message.success('项目运行成功')
      }, 15000)
      return
    }
    this.setState({show: false, showSpin: false})
    message.error('项目运行失败')
    if (msg) message.error(msg)
    router.push('/training')
  }

  handleCancel = async (projectId) => {
    this.setState({show: false})
    if (this.queryTimer) clearInterval(this.queryTimer)
    if (this.state.showSpin) {
      await this.updateProjectStatus(projectId, 3)
      router.push('/training')
    }
  }

  stop = async (projectId) => {
    const { dispatch } = this.props
    const { code, msg } = await dispatch({
      type: 'training/stopProject',
      payload:{
        projectid: projectId
      }
    })
    this.findProjectById(projectId)
    if (code == 200) {
      message.success('停止项目成功')
      return
    }
    message.error('停止项目失败')
    if (msg) message.error(msg)
    router.push('/training')
  }

  run = () => {
    this.setState({show: true})
  }

  enter = async (projectId) => {
    const { dispatch } = this.props
    const { code, msg, data } = await dispatch({
      type: 'training/enterProject',
      payload:{
        projectid: projectId
      }
    })
    if (code == 200) {
      if (data && typeof data == 'string') {
        window.open(data, '_blank').location;
      } else {
        message.error('进入项目失败，地址为空')
      }
      return
    }
    message.error('进入项目失败')
    if (msg) message.error(msg)
  }

  addStorageSize = (form) => {
    if (this.state.storageSize >= 200) return
    this.setState({storageSize: this.state.storageSize + 1}, () => {
      form.setFieldsValue({'storage': this.state.storageSize})
    })
  }

  minusStorageSize = (form) => {
    if (this.state.storageSize <= 5) return
    this.setState({storageSize: this.state.storageSize - 1}, () => {
      form.setFieldsValue({'storage': this.state.storageSize})
    })
  }

  changeType = (e) => {
    const type = e.target.value
    this.setState({selectedType: type})
    return type
  }

  delModelVersion = async (projectId, record) => {
    const { dispatch } = this.props
    const res = await dispatch({
      type: "training/delModelVersion",
      payload: {
        versionid: record.versionid
      }
    })
    this.findProjectById(projectId)
    const { code, msg } = res
    if (code == 200) {
      message.success('模型版本删除成功')
      return
    }
    message.error('模型版本删除失败')
    if (msg) message.error(msg)
  }

  downloadModelFiles = (version) => {
    const { files } = version
    this.downloadFile(files)

  }

  downloadFile = (fileArr, index = 0) => {
    if (fileArr.length < 0 || index >= fileArr.length) return
    if (index == 0) {
      window.open(fileArr[index].dlpath)
      this.downloadFile(fileArr, ++index)
      return
    }
    setTimeout(() => {
      window.open(fileArr[index].dlpath)
      this.downloadFile(fileArr, ++index)
    }, 2000)
  }

  findProjectById = async (projectId) => {
    const { dispatch } = this.props
    const res = await dispatch({
      type: 'training/findProjectById',
      payload: {
        projectid: projectId
      }
    })
    const { code, msg, data } = res
    if (code !== 200) {
      message.error('获取项目信息失败')
      if (msg) message.error(msg)
      return
    }
    if (data) {
      this.setState({projectInfo: data})
    }
  }

  changeStorageByInput = (e, form) => {
    console.log('change', e.target.value, form)
    const inputVal = parseInt(e.target.value) || 5
    let storage = inputVal
    form.setFieldsValue({'storage': inputVal})
    this.setState({storageSize: storage})
  }

  render() {
    return (
      <PageHeaderWrapper>
        <ProjectDetail 
          {...this.props}
          switchTab={this.switchTab}
          delProject={this.delProject}
          modifyProject={this.modifyProject}
          enter={this.enter}
          run={this.run}
          stop={this.stop}
          project={this.state.projectInfo}
          projectDesc={this.state.projectDesc}
          delModelVersion={this.delModelVersion}
          downloadModelFiles={this.downloadModelFiles}
        />
        <SelectEnvModal 
          show={this.state.show}
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          storageSize={this.state.storageSize}
          addStorageSize={this.addStorageSize}
          minusStorageSize={this.minusStorageSize}
          changeType={this.changeType}
          selectedType={this.state.selectedType}
          showSpin={this.state.showSpin}
          changeStorageByInput={this.changeStorageByInput}
        />
      </PageHeaderWrapper>
    );
  }
}

export default connect()(TrainingDetail)
