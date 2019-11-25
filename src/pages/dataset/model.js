import { getDatasetList, addDataset, upload, imgList, delDataset, delDatasetImg,
   uploadSinglePic, getDatasetFolder } from './service';
import { findIndex } from 'lodash';
import { formatTableData } from '@/utils/utils';

const Model = {
  namespace: 'dataset',
  state: {
    datasetList: {},
    checkLoginNameList: {},
    businessDetail: {},
    datasetImgList: {
      totalnum: 0,
      list: [],
    },
  },
  effects: {
    /**
     * 数据集列表
     */
    *fetch({ payload }, { call, put }) {
      const response = yield call(getDatasetList, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'datasetList',
          payload: response.data ? response.data : {},
        });
      }
      return Promise.resolve(response.data);
    },
    /**
     * 添加数据集
     */
    *add({ payload, callback }, { call, put }) {
      // console.log('2222222222222222222222222222222222222222222222')
      const response = yield call(addDataset, payload);
      return Promise.resolve(response);
    },

    *upload({ payload, callback }, { call, put }) {
      const response = yield call(upload, payload);
      return Promise.resolve(response);
    },
    /**
     * 删除单个数据集
     */
    *delDataset({ payload, callback }, { call, put }) {
      const response = yield call(delDataset, payload);
      return Promise.resolve(response);
    },
    /**
     * 获取单个数据集图片列表
     */
    *getimgList({ payload, callback }, { call, put }) {
      const response = yield call(imgList, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'datasetImgList',
          payload: response.data ? response.data : {
            totalnum: 0,
            list: [],
          },
        });
      }
      return Promise.resolve(response);
    },
    /**
     * 获取单个数据集文件夹列表
     */
    *getDatasetFolder({ payload, callback }, { call, put }) {
      const response = yield call(getDatasetFolder, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'datasetFolderList',
          payload: response.data ? response.data : [],
        });
      }
      return Promise.resolve(response);
    },
      /**
     * 删除数据集图片
     */
    *delDatasetImg({ payload, callback }, { call, put }) {
      // console.log(payload);
      const response = yield call(delDatasetImg, payload);
      return Promise.resolve(response);
    },
    // 数据集添加图片
    *uploadSinglePic({ payload, callback }, { call, put }) {
      // console.log(payload);
      const response = yield call(uploadSinglePic, payload);
      // console.log(response)
      return Promise.resolve(response);
    },
    *resetDataset(_, { put }) {
      yield put({
        type: 'datasetImgList',
        payload: {
          totalnum: 0,
          list: [],
        },
      });
    },
    *resetDatasetFolder(_, { put }) {
      yield put({
        type: 'datasetFolderList',
        payload: {
          totalnum: 0,
          list: [],
        },
      });
    },
  },
  reducers: {
    datasetList(state, action) {
      // console.log('reducers action:', action);
      return {
        ...state,
        datasetList: action.payload,
      };
    },
    datasetImgList(state, action) {
      //  console.log(action)
      return {
        ...state,
        datasetImgList: action.payload,
      };
    },
    datasetFolderList(state, action) {
      // console.log(action)
      return {
        ...state,
        datasetFolderList: action.payload,
      };
    },
    checkLoginNameList(state, action) {
      return {
        ...state,
        checkLoginNameList: action.payload,
      };
    },
  },
};
export default Model;
