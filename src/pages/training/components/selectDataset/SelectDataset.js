import React from 'react'
import { Modal, Tabs, Button, Input  } from 'antd'
import styles from '../../style.less'
import DatasetList from './DatasetList'

const { TabPane } = Tabs;

const SelectDataset = props => {
  const searchRef = React.createRef()
  const { 
    switchTab,
    handleCancel, 
    handleOk, 
    show, 
    search,
  } = props;
  return (
    <Modal
      title="数据集选择"
      visible={show}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Tabs onChange={switchTab} type="card">
        <TabPane tab="公开数据集" key="open">
          <DatasetList {...props} />
        </TabPane>
        <TabPane tab="个人数据集" key="oal">
          <DatasetList {...props} />
        </TabPane>
      </Tabs>
      <div className={styles.modalSearchBox}>
        <Input ref={searchRef} allowClear style={{width: 120}}/>
        <Button onClick={() => search(searchRef)}>查询</Button>
      </div>
    </Modal>
  );
}

export default SelectDataset