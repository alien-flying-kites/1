import { Form, Select, Icon, Input, Checkbox, Col, Pagination } from 'antd';
import React, { Component, Fragment } from 'react';
import styles from './style.less';
import noData from '../../../../assets/noPic.jpg';
import { filter } from 'lodash'

const { Option } = Select;
const maxDataLength = 15

class SelectInputCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      miniOptions: [],
      allOptions: [],
      initlabelid: null,
    };
  }

  componentDidMount () {
    this.setState({
      miniOptions: this.props.labellist,
      allOptions: this.props.allLabel,
      initlabelid: this.props.labelid,
    })
  }

  componentWillReceiveProps(props) {
    // console.log(props.labellist)
    this.setState({
      miniOptions: props.labellist,
      allOptions: props.allLabel,
      initlabelid: props.labelid,
    })
  }

  onFocus = () => {
    console.log('对焦搜索')
    console.log('this.input--', this.input)
    // this.input.focus()
  }

  /**
   * 搜索
   */
  onSearch = val => {
    console.log('搜索', val)
    const { allOptions } = this.state
    const vlLower = val.toString().toLowerCase();
    // console.log(vlLower)
    const resultFilter = filter(allOptions, fitem => fitem.name.toString().toLowerCase().indexOf(vlLower) !== -1)
    // console.log(resultFilter)
    // console.log('resultFilter过滤', resultFilter.splice(0, maxDataLength))
    const result = resultFilter.splice(0, maxDataLength);
    this.setState({
      miniOptions: result,
    })
  }

  handleSelectChange = (value, option) => {
    // console.log('select 改变了', value, option)
    this.props.handleSelectChange(value, option)
  }


  render() {
    const { initlabelid, miniOptions } = this.state;
    const resultoptions = miniOptions.map(item => {
      // console.log(item)
      if ((item && item.labelid) || item.labelid === 0) {
        return (
          <Option key={item.labelid} value={item.labelid}>
          {item.name}
          </Option>
        )
      }
     return null
    });
    let defaultValue
    if (this.props.isDouble) {
      defaultValue = this.props.labellist && this.props.labellist.length > 0 ? this.props.labellist[1].labelid : null
    } else {
      defaultValue = this.props.labellist && this.props.labellist.length > 0 ? this.props.labellist[0].labelid : null
    }
    console.log(defaultValue)
    // console.log(this.props.labelid, defaultValue, initlabelid)
    return (
      <Select
        showSearch
        optionFilterProp="children"
        onSearch={this.onSearch}
        autoClearSearchValue
        suffixIcon={<Icon type="search" />}
        placeholder="此处可输入搜索"
        style={{ width: '100%' }}
        // ref={ ref => this.input = ref }
        // className={styles.selectItem}
        onChange={this.handleSelectChange}
        defaultValue={defaultValue}
        onFocus={this.onFocus}
        value={initlabelid}
        filterOption={(input, option) =>
          option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }>
        {resultoptions}
        {/* {inputSelet ? alllabeloptions : labeloptions} */}
      </Select>
    )
  }

}

export default Form.create()(SelectInputCom);
