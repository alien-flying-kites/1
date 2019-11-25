import { Component } from 'react'
import { connect } from 'dva'
import SelectDataset from './SelectDataset'

class SelectDatasetModal extends Component {
  state = {
    currentPage: 0,
    pageSize: 10,
    selectedArr: [],
    searchName: '',
    tabIndex: "open",
  }
  
  componentWillMount () {
    this.setState({
      pageSize: 10,
      searchName: '',
    }, () => {
      this.requestList()
    })
  }

  colorRandom = (i) => {
    let colorArr = [
      'rgba(132, 212, 125, 0.8)',
      'rgba(252, 92, 2, 0.8)',
      'rgba(196, 54, 73, 0.8)',
      'rgba(33, 60, 116, 0.8)',
      'rgba(87, 161, 81, 0.8)',
      'rgba(145, 193, 88, 0.8)',
      'rgba(125, 179, 32, 0.8)',
      'rgba(96, 178, 254, 0.8)',
      'rgba(4, 201, 164, 0.8)',
      'rgba(158, 153, 184, 0.8)',
    ];
    return colorArr[parseInt(i%10) - 1]
  }

  getFirstChar = (str) => {
    if (str && str.length > 0) {
      return str[0];
    }
    return '集'
  }

  handleOk = () => {
    this.props.handleOk('dataset', this.state.selectedArr)
  }

  handleCancel = () => {
    this.props.handleCancel('dataset')
  }

  switchTab = (key) => {
    this.setState({tabIndex: key}, () => {
      this.requestList()
    })
  }

  selectItem = (item, tabIndex, key) => {
    item.isOpen = Boolean(tabIndex == 'open')
    let arr = this.state.selectedArr
    if (arr.length < 1) {
      arr.push(item)
      this.setState({selectedArr: arr}, () => {
        this.requestList(this.state.currentPage)
      })
      return
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][key] == item[key]) {
        arr.splice(i, 1)
        break
      }
      if (i == (arr.length - 1)) {
        arr.push(item)
        break
      }
    }
    this.setState({selectedArr: arr}, () => {
      this.requestList(this.state.currentPage)
    })
  }

  checkStatus = (selectedArr, item) => {
    let status = selectedArr.some(v => v.opendatasetid == item.opendatasetid)
    return status
  }

  search = ({ current }) => {
    let searchVal = current.state.value
    this.setState({searchName: searchVal ? searchVal.trim() : ''}, () => {
      this.requestList()
    })
  }

  changePage = (page, pageSize) => {
    const pageIndex = page - 1
    this.setState({currentPage: pageIndex}, () => {
      this.requestList(pageIndex)
    })
  }

  changePageSize = (current, size) => {
    this.setState({pageSize: size}, () => {
      this.requestList()
    })
  }

  requestList = (pageIndex = 0) => {
    const params = {
      isOpen: Boolean(this.state.tabIndex == "open"),
      pageindex: pageIndex,
      limit: this.state.pageSize,
      name: this.state.searchName
    }
    this.props.dispatch({
      type: 'training/fetchDataset',
      payload: params
    })
  }

  render () {
    return (
      <SelectDataset 
        {...this.props}
        switchTab={this.switchTab}
        handleCancel={this.handleCancel}
        handleOk={this.handleOk}
        pageSize={this.state.pageSize}
        changePage={this.changePage}
        changePageSize={this.changePageSize}
        selectItem={this.selectItem}
        getFirstChar={this.getFirstChar}
        colorRandom={this.colorRandom}
        selectedArr={this.state.selectedArr}
        search={this.search}
        tabIndex={this.state.tabIndex}
      />
    );
  }
}

export default connect()(SelectDatasetModal)