import { 
  getProjectList,
  getDataSetList,
  getAlgorithm,
  getConfig,
  getHardConfig,
  createProject,
  delProject,
  stopProject,
  runProject,
  enterProject,
  queryProjectStatus,
  updateProjectStatus,
  findProjectById,
  delModelVersion,
  getProjectIntr,
} from './service'
import { message } from 'antd'

const TrainingModel = {
  namespace: 'training',
  state: {
    projectList: { data: [], totalCount: 0 },
    datasetList: { data: [], totalCount: 0 },
    algorithmList: { data: [], totalCount: 0 },
    envOption: [],
    frameOption: [],
    missionOption: [],
    hardConfig: []
  },
  effects: {
    *fetch({ payload: params }, { call, put }) {
      const { code, msg, data } = yield call(getProjectList, params)
      if (code != 200) {
        message.error('查询项目列表失败')
        if (msg) message.error(msg)
        return
      }
      const { totalnum, list } = data
      yield put({
        type: 'save',
        payload: {
          data: list,
          totalCount: parseInt(totalnum, 10)
        },
      });
    },
    *fetchDataset({ payload: params }, { call, put }) {
      const { code, msg, data } = yield call(getDataSetList, params)
      if (code != 200) {
        message.error('查询数据集列表失败')
        if (msg) message.error(msg)
        return
      }
      const { totalnum, list } = data
      yield put({
        type: 'saveDataset',
        payload: {
          data: list,
          totalCount: parseInt(totalnum, 10),
        },
      });
    },
    *fetchAlgorithm({ payload: params }, { call, put }) {
      const { code, msg, data } = yield call(getAlgorithm, params)
      if (code != 200) {
        message.error('查询算法列表失败')
        if (msg) message.error(msg)
        return
      }
      const { totalnum, list } = data
      yield put({
        type: 'saveAlgorithm',
        payload: {
          data: list,
          totalCount: parseInt(totalnum, 10)
        },
      });
    },
    *fetchConfig({ payload: params }, { call, put }) {
      const { code, msg, data } = yield call(getConfig, params)
      if (code != 200) {
        message.error('查询选项配置失败')
        if (msg) message.error(msg)
        return
      }
      const { env, frame, mission } = data
      yield put({
        type: 'saveConfig',
        payload: { env, frame, mission }
      });
    },
    *fetchHardConfig({}, { call, put }) {
      const { code, msg, data } = yield call(getHardConfig)
      if (code != 200) {
        message.error('查询运行配置失败')
        if (msg) message.error(msg)
        return
      }
      yield put({
        type: 'saveHardConfig',
        payload: data
      });
    },
    *createProject({ payload: params }, { call }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(createProject, formData)
    },
    *delProject({ payload: params }, { call }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(delProject, formData)
    },
    *stopProject({ payload: params }, { call }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(stopProject, formData)
    },
    *runProject({ payload: params }, { call, put }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(runProject, formData)
    },
    *queryProjectStatus({}, { call, put }) {
      return yield call(queryProjectStatus)
    },
    *enterProject({ payload: params }, { call, put }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(enterProject, formData)
    },
    *findProjectById({ payload: params }, { call, put }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(findProjectById, formData)
    },
    *updateProjectStatus({ payload: params }, { call, put }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(updateProjectStatus, formData)
    },
    *delModelVersion({ payload: params }, { call, put }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(delModelVersion, formData)
    },
    *getProjectIntr({ payload: params }, { call, put }) {
      const formData = new FormData()
      for (let [key, value] of Object.entries(params)) {
        formData.append(`${key}`, value)
      }
      return yield call(getProjectIntr, formData)
    },
  },
  reducers: {
    save(state, { payload: { data, totalCount } }) {
      state.projectList = { data, totalCount }
      return { ...state }
    },
    saveDataset(state, { payload: { data, totalCount } }) {
      state.datasetList = { data, totalCount }
      return { ...state }
    },
    saveAlgorithm(state, { payload: { data, totalCount } }) {
      state.algorithmList = { data, totalCount }
      return { ...state }
    },
    saveConfig(state, { payload: { env, frame, mission } }) {
      state.envOption = env || []
      state.frameOption = frame || []
      state.missionOption = mission || []
      return {...state}
    },
    saveHardConfig(state, { payload: data }) {
      state.hardConfig = data || []
      return {...state}
    }
  },
};
export default TrainingModel;
