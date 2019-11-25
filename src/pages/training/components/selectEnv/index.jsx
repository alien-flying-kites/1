import React, { Component } from 'react'
import { connect } from 'dva'
import SelectEnv from './SelectEnv'

class SelectEnvModal extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'training/fetchHardConfig'
    })
  }

  componentWillUpdate() {
    this.props.dispatch({
      type: 'training/fetchHardConfig'
    })
  }

  render () {
    return (
      <SelectEnv 
        {...this.props} 
      />
    );
  }
}

export default connect()(SelectEnvModal)
