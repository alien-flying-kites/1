import React from 'react';
import { Tooltip, Button } from 'antd';
import styles from '../index.less';

const upperFirst = str => str.toLowerCase().replace(/( |^)[a-z]/g, l => l.toUpperCase());

const ToolbarButton = props => {
  const { icon, text, onClick, disabled, loading } = props;
  let btnProps = {
    icon,
    type: props.buttonType || 'link',
    onClick,
  }
  if (disabled) {
    btnProps.disabled = true
  }
  if (loading) {
    btnProps.loading = true
  }
  return (
      <Tooltip
        title={upperFirst(text)}
        placement="bottom"
        overlayClassName={styles.tooltip}
      >
        <Button style={{ color: '#333' }} {...btnProps}/>
      </Tooltip>
  );
};

export default ToolbarButton;
