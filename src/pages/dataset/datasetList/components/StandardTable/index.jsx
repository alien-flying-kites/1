import { Alert, Table } from 'antd';
import React, { Component, Fragment } from 'react';
import styles from './index.less';

function initTotalList(columns) {
  if (!columns) {
    return [];
  }

  const totalList = [];
  columns.forEach(column => {
    if (column.needTotal) {
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends Component {
  static getDerivedStateFromProps(nextProps) {
    // clean state
    if (!nextProps.selectedRows || nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList,
      };
    }

    return null;
  }

  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);
    this.state = {
      selectedRowKeys: [],
      needTotalList,
    };
  }

  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    const currySelectedRowKeys = selectedRowKeys;
    let { needTotalList } = this.state;
    needTotalList = needTotalList.map(item => ({
      ...item,
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex || 0]), 0),
    }));
    const { onSelectRow } = this.props;

    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({
      selectedRowKeys: currySelectedRowKeys,
      needTotalList,
    });
  };

  handleTableChange = (pagination, filters, sorter, ...rest) => {
    const { onChange } = this.props;

    if (onChange) {
      onChange(pagination, filters, sorter, ...rest);
    }
  };

  cleanSelectedKeys = () => {
    if (this.handleRowSelectChange) {
      this.handleRowSelectChange([], []);
    }
  };

  showTotal = (total, range) => `当前${range[0]}到${range[1]}条,总共${total}条`;

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const { data, rowKey, showSelect, ...rest } = this.props;
    const { list = [] } = data || {};
    // console.log(data)
    // console.log(list)
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: this.showTotal,
      current: data.pageNo,
      pageSize: data.pageSize,
      total: data.totalnum,
    };
    const rowSelection = {
      type: 'radio',
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };
    return (
      <div className={styles.standardTable}>
        {/* <div className={styles.tableAlert}>
          <Alert
            message={
              <Fragment>
                已选择{' '}
                <a
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {selectedRowKeys.length}
                </a>{' '}
                项&nbsp;&nbsp;
                {needTotalList.map((item, index) => (
                  <span
                    style={{
                      marginLeft: 8,
                    }}
                    key={item.dataIndex}
                  >
                    {item.title}
                    总计&nbsp;
                    <span
                      style={{
                        fontWeight: 600,
                      }}
                    >
                      {item.render ? item.render(item.total, item, index) : item.total}
                    </span>
                  </span>
                ))}
                <a
                  onClick={this.cleanSelectedKeys}
                  style={{
                    marginLeft: 24,
                  }}
                >
                  清空
                </a>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div> */}
        <Table
          rowKey={rowKey || 'key'}
          // rowSelection={rowSelection}
          dataSource={list}
          pagination={paginationProps}
          onChange={this.handleTableChange}
          {...rest}
        />
      </div>
    );
  }
}

export default StandardTable;
