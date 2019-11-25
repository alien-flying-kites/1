import { fakeRegister } from './service';
import { routerRedux } from 'dva/router';

const Model = {
  namespace: 'userRegister',
  state: {
    status: undefined,
  },
  effects: {
    *submit({ payload }, { call, put }) {
      const response = yield call(fakeRegister, payload);
      yield put({
        type: 'registerHandle',
        payload: response,
      });
      // if (response && response.code === 200) {
      //   yield put(routerRedux.replace('/user/login'));
      // }
    },
  },
  reducers: {
    registerHandle(state, { payload }) {
      return { ...state, status: payload.code };
    },
  },
};
export default Model;
