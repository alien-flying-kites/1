import { getDatasetListOption } from '@/services/datatask'

const DataTaskModel = {
  namespace: 'datatask',
  state: {
    datasetList: {},
  },
  effects: {
    *getDatasetList({ payload }, { call, put }) {
      console.log('payload-->', payload);
      const response = yield call(getDatasetListOption, payload);
      // console.log(response);
      if (response && response.code === 200) {
        yield put({
          type: 'datasetList',
          payload: response.data ? response.data : {},
        });
      }
      return Promise.resolve(response.data);
    },
  },
  reducers: {
    datasetList(state, action) {
      console.log('reducers action:', action);
      return {
        ...state,
        datasetList: action.payload,
      };
    },
  },
}
export default DataTaskModel;
