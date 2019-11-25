import React, { Component } from 'react'
import router from 'umi/router'
import { message } from 'antd'
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva'
import styles from '@/pages/training/style.less'
import SelectDatasetModal from '../components/selectDataset'
import SelectAlgorithmModal from '../components/selectAlgorithm'
import CustomizedForm from './CustomizedForm'

class CreateProject extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      loading: true,
      isUseInnerAlgorithm: 0,
      algorithmType: 'mxnet',
      showDatasetModal: false,
      showAlgorithmModal: false,
      selectedDataset: [],
      selectedFrame: [],
      selectedAlgorithm: null,
      selectedMission: '',
      selectedType: 0,
    }
  }

  componentWillMount () {
    this.props.dispatch({type: 'training/fetchConfig'})
  }

  selectDataset = () => {
    this.setState({showDatasetModal: true})
  }

  useInnerAlgorithm = (state) => {
    this.setState({isUseInnerAlgorithm: state})
    if (state == 0) {
      this.setState({
        isUseInnerAlgorithm: state,
        selectedAlgorithm: null,
      })
    } else {
      if (this.state.selectedAlgorithm) {
        this.setState({
          isUseInnerAlgorithm: state,
        })
      } else {
        this.setState({
          isUseInnerAlgorithm: state,
        })
      }
    }
  }

  removeOption = (item) => {
    let arr = this.state.selectedDataset;
    let key = item.isOpen?'opendatasetid':'oaldatasetid'
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][key] == item[key]) {
        arr.splice(i, 1)
        this.setState({selectedDataset: arr})
        break
      }
    }
  }

  handleOk = (type, data) => {
    if (type == 'dataset') {
      this.setState({
        selectedDataset: data, 
        showDatasetModal: false,
      })
    } 
    if (type == 'algorithm') {
      this.setState({
        showAlgorithmModal: false,
        selectedAlgorithm: data || null,
      })
    }
  }

  handleCancel = (type) => {
    if (type == 'dataset') {
      this.setState({showDatasetModal: false})
    }
    if (type == 'algorithm') {
      this.setState({showAlgorithmModal: false})
    }
  }

  updateSelectedFrame = (item) => {
    let arr = this.state.selectedFrame
    let index = arr.indexOf(item)
    if (index == -1) {
      arr.push(item)
    } else {
      arr.splice(index, 1)
    }
    this.setState({selectedFrame: arr})
  }

  isCheckedFrame = (frameName) => {
    if (this.state.selectedFrame.indexOf(frameName) == -1) {
      return false
    }
    return true
  }

  selectType = (state, form) => {
    this.setState({selectedType: state})
    form.setFieldsValue({missionid: ''})
  }

  selectAlgorithmType = (v, { props: { children } }) => {
    this.setState({algorithmType: children})
  } 

  select = () => {
    this.setState({showAlgorithmModal: true})
  }

  handleSubmit = async (e, form) => {
    e.preventDefault();
    let params = {}, flag = false
    form.validateFields((err, values) => {
      console.log('form:', err, values)
      if (!err) {
        params = values
        params.frame = values.frame.join()
        flag = true
      }
    })
    let openIdArr = [], privateIdArr = []
    this.state.selectedDataset.map(item => {
      if (item.isOpen) {
        openIdArr.push(item.opendatasetid)
      } else {
        privateIdArr.push(item.oaldatasetid)
      }
    })
    if (!params.projectname || params.projectname.trim() == '') {
      form.setFields({
        'projectname': {
          errors: [new Error('请输入项目名称')]
        }
      })
      return
    }
    params.opendataset = openIdArr.join()
    params.oaldataset = privateIdArr.join()
    params.openmodelid = -1
    if (this.state.isUseInnerAlgorithm && this.state.selectedAlgorithm) {
      params.openmodelid = this.state.selectedAlgorithm.openmodelid
    }
    if (!params.desc) params.desc = ''
    if (!flag) return
    const { code, msg } = await this.props.dispatch({
      type: 'training/createProject',
      payload: params
    })
    if (code == 200) {
      message.success('新建项目成功')
      setTimeout(() => {
        router.push('/training')
      }, 500)
      return
    }
    message.error('新建项目失败')
    message.error(msg)
  }

  render() {
    return (
      <PageHeaderWrapper>
        <div className={styles.contentBox}>
          <CustomizedForm 
            {...this.props}
            handleSubmit={this.handleSubmit}
            selectType={this.selectType}
            selectedType={this.state.selectedType}
            selectDataset={this.selectDataset}
            selectedDataset={this.state.selectedDataset}
            removeOption={this.removeOption}
            useInnerAlgorithm={this.useInnerAlgorithm}
            isUseInnerAlgorithm={this.state.isUseInnerAlgorithm}
            selectAlgorithmType={this.selectAlgorithmType}
            select={this.select}
            selectedAlgorithm ={this.state.selectedAlgorithm}
          />
          <SelectDatasetModal 
            show={this.state.showDatasetModal} 
            selectedArr={this.state.selectedArr} 
            handleOk={this.handleOk} 
            handleCancel={this.handleCancel}/>
          <SelectAlgorithmModal 
            show={this.state.showAlgorithmModal} 
            frame={this.state.algorithmType} 
            handleOk={this.handleOk} 
            handleCancel={this.handleCancel}/>
        </div>
      </PageHeaderWrapper>
    );
  }
}

function mapStateToProps(state) {
  const { loading, training } = state
  const { envOption, frameOption, missionOption } = training
  return {
    loading: loading.effects['training/fetchConfig'],
    envOption,
    frameOption,
    missionOption
  }
}

export default connect(mapStateToProps)(CreateProject)