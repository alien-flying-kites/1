import { getTagList, addTag, deleteTag, autoLabelTask, pauseautolabeltask, genlabelrec } from './service';
// import { } from 'lodash';
// import { formatTableData } from '@/utils/utils';

const Model = {
  namespace: 'tag',
  state: {
    tagList: {},
  },
  effects: {
      /**
     * 数据集列表
     */
    *getTagList({ payload }, { call, put }) {
      const response = yield call(getTagList, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'tagList',
          payload: response.data ? response.data : {},
        });
      }
      return Promise.resolve(response.data);
    },
     // 添加数据标注任务
    *addTagLabel({ payload }, { call, put }) {
      const response = yield call(addTag, payload);
      return Promise.resolve(response);
    },
    // 删除数据标注任务
    *delTag({ payload }, { call, put }) {
      const response = yield call(deleteTag, payload);
      return Promise.resolve(response);
    },
     // 自动标注
    *autoLabel({ payload }, { call, put }) {
      const response = yield call(autoLabelTask, payload);
      return Promise.resolve(response);
    },
    // 暂停标注
    *pauseLabel({ payload }, { call, put }) {
      const response = yield call(pauseautolabeltask, payload);
      return Promise.resolve(response);
    },
    // 生成训练数据
    *startrec({ payload }, { call, put }) {
      const response = yield call(genlabelrec, payload);
      return Promise.resolve(response);
    },
      // 图片人脸清洗
    *autoLabeling({ payload }, { _, put }) {
      yield put({
        type: 'tasklabeling',
        payload: payload || {},
      });
      // console.log(payload)
      // const response = yield call(cleanlabeltaskimg, payload);
      // console.log(response)
      // return Promise.resolve(response);
    },
  },
  reducers: {
    tagList(state, action) {
      return {
        ...state,
        tagList: action.payload,
      };
    },
    tasklabeling(state, action) {
      return {
        ...state,
        tasklabeling: action.payload,
      };
    },
  },
}
export default Model;
