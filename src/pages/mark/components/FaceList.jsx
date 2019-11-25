import React from 'react';
import { Card, Button, Tooltip, Input, Icon, List, Popconfirm, Skeleton } from 'antd';
import { findIndex } from 'lodash';
import ToolbarButton from './ToolbarButton';

class FaceList extends React.Component {
  state = {
    inputVisible: false,
    inputValue: '',
    newValue: '',
  };


  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  };

  handleInputChange = e => {
    // console.log('value 编辑-----', e.target.value)
    e.target.value = e.target.value.trim()
    this.setState({ inputValue: e.target.value });
  };

  handleNewLabelChange = e => {
    // console.log('value  新增-----', e.target.value)
    e.target.value = e.target.value.trim()
    this.setState({ newValue: e.target.value });
  };

  handleInputConfirm = () => {
    const { inputValue } = this.state;
    if (!inputValue) {
      this.setState({
        inputVisible: false,
        inputValue: '',
      });
      return
    }
    const { data, onAdd } = this.props;
    const faceIndex = findIndex(data.face, item => item.label === inputValue)
    console.log('faceIndex----->', faceIndex)
    if (faceIndex === -1) {
      this.setState({
        inputVisible: false,
        inputValue: '',
      });
      onAdd && onAdd(inputValue)
    }
  };

  saveInputRef = input => (this.input = input);

  saveNewName = input => (this.newNameInput = input);

  render() {
    const { inputVisible, inputValue, newValue } = this.state;
    const { data, selected, onSelect=()=>{}, toAddBorder } = this.props;
    return (
      <Card title={`人脸列表(${data.face.length})`} extra={<Tooltip placement="topLeft" title="快速新增"><Button onClick={toAddBorder} type="link" icon="border" /></Tooltip>} style={this.props.style} bodyStyle={{ padding: '24px 0',overflowY: 'auto', height: this.props.height || 'calc( 100vh - 525px )' }}>
        <List
          size="large"
          itemLayout="horizontal"
          dataSource={data.face}
          renderItem={item => {
            const itemProps = {
              style: {
                paddingLeft: 24,
                paddingRight: 24,
                cursor: 'pointer',
              },
              onClick: () => { onSelect(item) } ,
            };
            const iconProps = {};
            if (item.id === selected) {
              itemProps.style.background = '#1890ff';
              itemProps.style.color = '#ffffff'
              iconProps.style = {
                color: '#ffffff',
              }
            }
            return (
              <List.Item
                actions={[
                    <Popconfirm placement="topRight" title={<Input ref={this.saveNewName} type="text" size="small" onChange={this.handleNewLabelChange}/>} icon={<Icon type="edit" />}
                                onConfirm={() => this.props.onUpdate(item.id, newValue)} okText="修改" cancelText="取消">
                      <a key="list-loadmore-edit" {...iconProps} onClick={() => {
                        setTimeout(() => {
                          if (this.newNameInput) {
                            this.newNameInput.input.value = item.label
                            this.newNameInput.focus()
                            this.newNameInput.select()
                          }
                        })
                      }}><Icon type="edit" /></a>
                    </Popconfirm>
                    ,
                    <Popconfirm placement="topRight" title="确认要删除该人脸?" onConfirm={() => this.props.onRemove(item.id)} okText="删除" cancelText="取消">
                      <a key="list-loadmore-more" {...iconProps}><Icon type="delete" /></a>
                    </Popconfirm>
                    ,
                ]}
                {...itemProps}
              >
                { item.label }
              </List.Item>
            )
          }}
        />
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
            style={{ margin: '16px 24px', width: 'calc( 100% - 48px )', height: 32 }}
          />
        )}
        {!inputVisible && (
          <Button style={{ margin: '16px 24px', width: 'calc( 100% - 48px )' }} onClick={this.showInput} type="dashed" icon="plus" block>
          </Button>
        )}
      </Card>
    )
  }
}

export default FaceList;
