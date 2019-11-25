import { Divider, Switch } from 'antd';
import React from 'react';

import ToolbarButton from './ToolbarButton';
import styles from '../index.less';

const FlowToolbar = props => {
  const { saveOnSwitch, setSaveOnSwitch } = props
  return (
    <div className={styles.toolbar}>
      <ToolbarButton onClick={props.save} icon="save" text="保存" />
      <ToolbarButton icon="undo" onClick={() => props.addHisAction(null, 'UN-DO')} text="撤销" />
      <ToolbarButton icon="redo" onClick={() => props.addHisAction(null, 'RE-DO')} text="重做" />
      <Divider type="vertical" />
      <ToolbarButton icon="zoom-out" text="缩小" onClick={props.zoomIn}/>
      <ToolbarButton icon="zoom-in" text="放大" onClick={props.zoomOut} />
      <ToolbarButton icon="column-width" text="适应" onClick={props.reset} />
      <ToolbarButton icon="drag" text="拖动" onClick={props.drag} />
      <Divider type="vertical" />
      <ToolbarButton icon="arrow-left" text="上一张" onClick={props.handleCliclPre}/>
      <ToolbarButton icon="arrow-right" text="下一张" onClick={props.handleCliclNext}/>
      <Divider type="vertical" />
      <Switch size="small" style={{ marginRight: 8 }} checked={saveOnSwitch} onChange={setSaveOnSwitch}/>切图时保存
    </div>
  )
};

export default FlowToolbar;
