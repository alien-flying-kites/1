import { List, Checkbox } from 'antd'
import { connect } from 'dva'
import styles from '@/pages/training/style.less'

const DatasetList = props => {
	const {
		datasetList,
		loading,
		pageSize,
		changePage,
		changePageSize,
		selectItem,
		selectedArr,
		getFirstChar,
		colorRandom,
		tabIndex,
	} = props;
	let key = 'opendatasetid', nameKey = 'opendatasetname'
	if (tabIndex != 'open') {
		key = 'oaldatasetid'
		nameKey = 'oaldatasetname'
	}
	return (
		<List
			loading={loading}
			dataSource={datasetList.data}
			pagination={{
				showSizeChanger: true,
				showQuickJumper: true,
				pageSize: pageSize,
				pageSizeOptions: ['10', '20'],
				total: datasetList.totalCount,
				showTotal: () => `Total: ${datasetList.totalCount}`,
				onChange: (page) => changePage(page),
				onShowSizeChange: (current, size) => changePageSize(current, size)
			}}
			renderItem={(item, i) => (
				<List.Item key={item[key]}>
					<Checkbox 
						onChange={() => selectItem(item, tabIndex, key)} 
						checked={Boolean(selectedArr.some(v => v[key] == item[key]))} />
					<div 
						className={styles.itemIcon} 
						style={{ background: colorRandom(i) }}>
						{getFirstChar(item[nameKey])}
					</div>
					<List.Item.Meta
						title={item[nameKey]}
						description={item.desc}
					/>
				</List.Item>
			)}
		>
		</List>
	);
}

function mapStateToProps(state) {
	const { training, loading } = state
	const { datasetList } = training
	return {
		loading: loading.effects['training/fetchDataset'],
		datasetList,
	}
}
export default connect(mapStateToProps)(DatasetList)