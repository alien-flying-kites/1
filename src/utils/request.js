/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import CONSTANTS from './constant';
import router from 'umi/router';
const reqAddress = require('../../config/requestConfig').default

console.log('reqAddress ==============', reqAddress);

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  203: '用户不存在',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
/**
 * 异常处理程序
 */

const errorHandler = error => {
  console.error(error)
  const { response } = error;

  if (response && response.code) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }

  return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler,
  // 默认错误处理
  // credentials: 'include', // 默认请求是否带上cookie
});

request.host = reqAddress.url;

request.interceptors.request.use((url, options) => {
  let host = reqAddress.url;
  // console.log(`\n------ request start: ${host}${url} ------`)
  if (url !== 'login') {
    const tokenId = localStorage.getItem(CONSTANTS.TRAINING_TOKE);
    options.headers.Authorization = 'Bearer ' + tokenId;
  }
  if (options.method === 'post') {
    options.data = options.data;
    options.params = {}
    delete options.params
  } else {
    options.params = options.data;
    options.data = {}
    delete options.data
  }
  if (options.urlType && options.urlType == 'k8s') {
    host = reqAddress.checkProjectStatus;
  }
  // console.log('request_options: ', options);
  return {
    url: `${host + url}`,
    options: { ...options, interceptors: true },
  };
});

request.interceptors.response.use(async (response, options) => {
  if (response.status !== 200) {
    if (response.status === 401) {
      // 鉴权失败，跳转到登录
      notification.error({
        message: '请重新登录',
        description: '授权失败或者已过期',
      });
      router.replace({
        pathname: '/user/login',
      });
    }
    return { res: -1, status: response.status }
  }
  const data = await response.clone().json();
  // console.info('request_res: ', data);
  return response;
});
export default request;
