import React from 'react'
import { Table, Button, Select, Input } from 'antd'
import { connect } from 'dva'

const { Option } = Select
const { Search } = Input

const CusTable = props => {
  const { 
    projectState,
    columns,
    projectList, 
    loading,
    createProject,
    selectState,
    searchByName,
    refreshList,
    pageSize,
    updateTable
  } = props
  return (
    <div style={{ margin: '10px 0', background: '#fff' }}>
      <div style={{ padding: '15px 10px 10px' }}>
        <Button type="primary" onClick={createProject}>新建项目</Button>
        <div style={{ float: "right" }}>
          <Select defaultValue="全部状态" style={{ width: 120 }} onChange={selectState}>
            {
              projectState.map(item => {
                if (item.value == 1 || item.value == 4) return 
                return <Option value={item.value} key={item.value}>{item.name}</Option>
              })
            }
          </Select>
          <Search
            allowClear={true}
            placeholder="请输入名称查询"
            onSearch={(v) => searchByName(v)}
            style={{ width: 200, margin: "0 5px" }}
          />
          <Button onClick={refreshList} icon="sync" />
        </div>
      </div>
      <Table
        rowKey="projectid"
        dataSource={projectList.data}
        columns={columns}
        loading={loading}
        style={{ marginTop: 15, overflow: 'auto' }}
        pagination={{
          pageSize: pageSize,
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20"],
          total: projectList.totalCount,
          showTotal: () => `Total: ${projectList.totalCount}`,
        }}
        onChange={(pagination, filters, sorter) => updateTable(pagination, filters, sorter)}
      />
    </div>
  );
}

function mapStateToProps(state) {
  const { training, loading } = state
  const { projectList } = training
  return {
    loading: loading.effects['training/fetch'],
    projectList
  }
}

export default connect(mapStateToProps)(CusTable)
