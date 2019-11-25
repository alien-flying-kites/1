import { connect } from 'dva'
import { Table, Divider, Popconfirm, Popover } from 'antd'
import styles from '@/pages/training/style.less'

const Release = props => {
  const { project, delModelVersion, downloadModelFiles } = props
  const { frame, projectid, missionname, scene, version } = project
  const getColumns = (scene, missionname, frame) => {
    const sceneName = scene ? '音频' : '图像'
    const columns = [
      {
        title: '模型名称',
        dataIndex: 'filename',
        align: 'center'
      },
      {
        title: '版本',
        dataIndex: 'versionname',
        align: 'center'
      },
      {
        title: '场景',
        align: 'center',
        render: () => {
          return `${sceneName}:  ${missionname}`
        }
      },
      {
        title: '框架',
        align: 'center',
        render: () => {
          return frame || '--'
        }
      },
      {
        title: '描述',
        dataIndex: 'desc',
        align: 'center',
        render: text => {
          return (
            <Popover content={text || '暂无'} title="描述">
              <span className={styles.longText}>{text || '--'}</span>
            </Popover>
          )
        }
      },
      {
        title: '操作',
        key: 'action',
        align: 'center',
        render: (text, record) => {
          return (
          <span>
            <a onClick={() => downloadModelFiles(record)}>下载</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除模型?"
              onConfirm={() => delModelVersion(projectid, record)}
              onCancel={() => {}}
              okText="确定"
              cancelText="取消"
            >
              <a href="#">删除</a>
            </Popconfirm>
          </span>
          )
        }
      }
    ]
    return columns
  }
  return (
    <>
      <Table
        rowKey="versionid"
        dataSource={version}
        columns={getColumns(scene, missionname, frame)}
        style={{ marginTop: 15, overflow: 'auto' }}
        pagination={{
          defaultPageSize: 10,
          showQuickJumper: true,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20"],
          total: version.length,
          showTotal: () => `Total: ${version.length}`,
        }}
      />
    </>
  );
}

export default connect()(Release)
