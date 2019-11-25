import { Modal, Tabs, Button, Table, Input } from 'antd'
import { connect } from 'dva'
import styles from '@/pages/training/style.less'

const { TabPane } = Tabs

const columns = [
  {
    title: '名称',
    dataIndex: 'openmodelname',
    key: 'openmodelname',
    align: 'center',
    render: text => {
      return text || 'unknown'
    }
  },
  {
    title: '用途',
    dataIndex: 'missionname',
    key: 'missionname',
    align: 'center',
    render: text => {
      return text || ''
    }
  },
  {
    title: '引擎类型',
    dataIndex: 'frame',
    key: 'frame',
    align: 'center',
    render: text => {
      return text || ''
    }
  },
]

const SelectAg = props => {
  const searchRef = React.createRef()
  const { show, algorithmList, loading, handleOk, handleCancel, pageSize, updateTable, clickItem, search } = props
  return (
    <Modal
      title="选择算法"
      visible={show}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Tabs type="card">
        <TabPane tab="预置算法" key="1">
          <Table 
            id="algorithm-table"
            rowKey="openmodelid"
            className={styles.modalTable}
            dataSource={algorithmList.data} 
            columns={columns} 
            loading={loading} 
            style={{background: "#fff"}}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              defaultPageSize: pageSize, 
              pageSizeOptions:  ["10", "20"],
              total: algorithmList.totalCount,
              showTotal: () => `Total: ${algorithmList.totalCount}`,
            }}
            onChange={updateTable}
            onRow={(record, index) => {
              return {
                onClick: event => {clickItem(event, record, index)}
              }
            }}
          />
        </TabPane>
      </Tabs>
      <div className={styles.modalSearchBox}>
        <Input ref={searchRef} allowClear style={{width: 120}}/>
        <Button onClick={() => search(searchRef)}>查询</Button>
      </div>
    </Modal>
  )
}

function mapStateToProps(state) {
  const { loading, training } = state
  const { algorithmList } = training
  return {
    loading: loading.effects['training/fetcheAlgorithm'],
    algorithmList
  }
}
export default connect(mapStateToProps)(SelectAg)