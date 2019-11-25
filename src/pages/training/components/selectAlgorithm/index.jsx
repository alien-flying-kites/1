import React, { Component } from 'react'
import { connect } from 'dva'
import SelectAlgorithm from './SelectAIgorithm'
import styles from '@/pages/training/style.less'

class SelectAlgorithmModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedEle: null,
      selectedItem: null,
      searchName: '',
      pageSize: 10,
    }
  }

  componentWillReceiveProps(props) {
    this.requestList()
  }
  
  componentWillMount() {
    this.setState({
      searchName: '',
      pageSize: 10,
      selectedItem: null
    }, () => {
      this.requestList()
    })
  }

  requestList = (pageIndex = 0) => {
    const params = {
      pageindex: pageIndex,
      limit: this.state.pageSize,
      name: this.state.searchName,
      frame: this.props.frame
    }
    this.props.dispatch({
      type: 'training/fetchAlgorithm',
      payload: params
    })
  }

  handleOk = () => {
    this.props.handleOk('algorithm', this.state.selectedItem)
  }

  handleCancel = () => {
    this.props.handleCancel('algorithm')
  }

  search = ({ current }) => {
    let searchVal = current.state.value
    this.setState({searchName: searchVal ? searchVal.trim() : ''}, () => {
      this.requestList()
    })
  }

  updateTable = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination
    const isChangeSize = Boolean(this.state.pageSize != pageSize)
    this.setState({
      pageSize: pageSize,
      selectedItem: null
    }, () => {
      this.requestList(current - 1)
    })
  }

  clickItem = (e, record, index) => {
    const ele = e.target.parentNode
    const oldEle = this.state.selectedEle
    if (oldEle) {
      oldEle.classList.remove(styles.bg)
    }
    ele.classList.add(styles.bg)
    this.setState({
      selectedEle: ele,
      selectedItem: record
    })
  }

  render () {
    return (
      <SelectAlgorithm 
        {...this.props} 
        updateTable={this.updateTable}
        handleOk={this.handleOk}
        handleCancel={this.handleCancel}
        pageSize={this.state.pageSize}
        clickItem={this.clickItem}
        search={this.search}
      />
    );
  }
}

export default connect()(SelectAlgorithmModal)
