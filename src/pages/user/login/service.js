import request from '@/utils/request';
import CONSTANTS from '../../../utils/constant';

// export async function fakeAccountLogin(params) {
//   return request('/api/login/account', {
//     method: 'POST',
//     data: params,
//   });
// }
// export async function getFakeCaptcha(mobile) {
//   return request(`/api/login/captcha?mobile=${mobile}`);
// }
//  登录接口
export async function login(params) {
  localStorage.setItem(CONSTANTS.TRAINING_USERNAME, params.userName);
  const formData = new FormData();
  formData.append('user', params.userName);
  formData.append('pwd', params.password);
  return request('login', {
    method: 'post',
    data: formData,
  });
}
