import { connect } from 'dva'
import { List } from 'antd'
import styles from '@/pages/training/style.less'

const colorRandom = (i) => {
  let colorArr = [
    'rgba(132, 212, 125, 0.8)',
    'rgba(252, 92, 2, 0.8)',
    'rgba(196, 54, 73, 0.8)',
    'rgba(33, 60, 116, 0.8)',
    'rgba(87, 161, 81, 0.8)',
    'rgba(145, 193, 88, 0.8)',
    'rgba(125, 179, 32, 0.8)',
    'rgba(96, 178, 254, 0.8)',
    'rgba(4, 201, 164, 0.8)',
    'rgba(158, 153, 184, 0.8)',
  ];
  return colorArr[parseInt(i%10) - 1]
}

const getFirstChar = (str) => {
  if (str && str.length > 0) {
    return str[0];
  }
  return '集'
}

const Dataset = props => {
  const { datasets } = props
  return (
    <List
			dataSource={datasets}
			pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        defaultPageSize: 10,
				pageSizeOptions: ['10', '20'],
				total: datasets.length,
				showTotal: () => `Total: ${datasets.length}`
			}}
			renderItem={(item, i) => (
				<List.Item key={i}>
					<div 
						className={styles.itemIcon} 
						style={{ background: colorRandom(i) }}>
						{getFirstChar(item.datasetname)}
					</div>
					<List.Item.Meta
						title={item.datasetname}
						description={item.desc}
					/>
				</List.Item>
			)}
		>
		</List>
  );
}

export default Dataset
