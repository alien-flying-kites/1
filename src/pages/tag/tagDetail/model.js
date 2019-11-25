import { getlabelTaskimg, getsinglelabeltask, getlabeltaskid,
   dellabeltaskid, addlabeltaskid, updatelabeltaskid, updatelabeltaskimgid,
   combinelabeltaskimgid, cleanlabeltaskimg, updatelabeltaskimg } from './service';

const Model = {
  namespace: 'tagDetail',
  state: {
    taskImgList: {},
    markModel: false,
  },
  effects: {
    // 数据标注详情列表
    *getTaskimgList({ payload }, { call, put }) {
      const response = yield call(getlabelTaskimg, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'taskImgList',
          payload: response.data ? response.data : {},
        });
      }
      return Promise.resolve(response.data);
    },
    // 单个标注任务信息
    *getSingleTask({ payload }, { call, put }) {
      const response = yield call(getsinglelabeltask, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'singleTask',
          payload: response.data ? response.data : {},
        });
      }
      return Promise.resolve(response.data);
    },
    // 数据标注标签列表全部
    *getAllLabelList({ payload }, { call, put }) {
      console.log(payload)
      const response = yield call(getlabeltaskid, payload);
      // console.log(response)
      if (response && response.code === 200) {
        yield put({
          type: 'alllabelList',
          payload: response.data ? response.data : {},
        });
      }
      return Promise.resolve(response);
    },
     // 数据标注标签列表
    *getLabelList({ payload }, { call, put }) {
      // console.log(payload)
     const response = yield call(getlabeltaskid, payload);
      // console.log(response)
     if (response && response.code === 200) {
       yield put({
         type: 'labelList',
         payload: response.data ? response.data : {},
       });
     }
     return Promise.resolve(response);
    },
    // 数据标注标签列表-右侧
    *getRightLabelList({ payload }, { call, put }) {
      // console.log(payload)
      const response = yield call(getlabelTaskimg, payload);
      // console.log(response)
      if (response && response.code === 200) {
        yield put({
          type: 'righLlabelList',
          payload: response.data ? response.data : {},
        });
      }
      return Promise.resolve(response);
    },
    // 删除数据标注标签
    *deleteLabel({ payload }, { call, _ }) {
      const response = yield call(dellabeltaskid, payload);
      return Promise.resolve(response);
    },
    // 添加数据标注标签
    *addLabel({ payload }, { call, _ }) {
      const response = yield call(addlabeltaskid, payload);
     return Promise.resolve(response);
    },
     // 编辑修改数据标注标签
    *updateLabel({ payload }, { call, _ }) {
      const response = yield call(updatelabeltaskid, payload);
     return Promise.resolve(response);
    },
    // 图片人脸重新分类
    *updateLabelTaskid({ payload }, { call, _ }) {
      const response = yield call(updatelabeltaskimgid, payload);
      return Promise.resolve(response);
    },
    // 图片人脸合并
    *combineLabelTaskid({ payload }, { call, _ }) {
      // console.log(payload)
      const response = yield call(combinelabeltaskimgid, payload);
      // console.log(response)
      return Promise.resolve(response);
    },
    // 图片人脸清洗
    *cleanLabelTaskid({ payload }, { call, _ }) {
      // console.log(payload)
      const response = yield call(cleanlabeltaskimg, payload);
      // console.log(response)
      return Promise.resolve(response);
    },
    *save({ payload }, { call, put }) {
      const response = yield call(updatelabeltaskimg, payload);
      return Promise.resolve(response);
     },
    *setModel({ payload }, { put }) {
      yield put({
        type: 'setMarkModel',
        payload,
      });
    },
    *resettaskImgList(_, { put }) {
      yield put({
        type: 'taskImgList',
        payload: {
          totalnum: 0,
          list: [],
        },
      });
    },
  },
  reducers: {
    taskImgList(state, action) {
      return {
        ...state,
        taskImgList: action.payload,
      };
    },
    righLlabelList(state, action) {
      return {
        ...state,
        righLlabelList: action.payload,
      };
    },
    singleTask(state, action) {
      return {
        ...state,
        singleTask: action.payload,
      };
    },
    labelList(state, action) {
      // console.log(action)
      return {
        ...state,
        labelList: action.payload,
      };
    },
    alllabelList(state, action) {
      // console.log(action)
      return {
        ...state,
        alllabelList: action.payload,
      };
    },
    setMarkModel(state, action) {
      return {
        ...state,
        markModel: action.payload,
      };
    },
  },
}
export default Model;
