import React, { Component } from 'react';

class DatasetDetail extends Component {
  state = {};

  componentDidMount() {
    console.log(this.props.location.params)
  }

  handleSubmit = () => {};

  render() {
    return <div>Recorrect and Mark</div>;
  }
}

export default DatasetDetail;
