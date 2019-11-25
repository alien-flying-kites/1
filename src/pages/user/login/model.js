import { routerRedux } from 'dva/router';
// import { fakeAccountLogin, getFakeCaptcha } from './service';
import { getPageQuery } from './utils/utils';
import CONSTANTS from '../../../utils/constant';
import { login } from './service';
import { message } from 'antd';
// import router from 'umi/router';

const Model = {
  namespace: 'userLogin',
  state: {},
  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      if (response.code != 200) {
        let msg = response.msg || '账号或密码错误'
        message.error(msg)
        return;
      }
      // Login successfully
      if (response && response.code === 200) {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        localStorage.setItem(CONSTANTS.TRAINING_TOKE, response.data.token);
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          }
        }
        yield put(routerRedux.replace('/'));
      }
      return Promise.resolve(response)
    },
    // 手机号登陆
    // *getCaptcha({ payload }, { call }) {
    //   yield call(getFakeCaptcha, payload);
    // },
  },
};
export default Model;
