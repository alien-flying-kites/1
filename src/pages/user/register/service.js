import request from '@/utils/request';

export async function fakeRegister(params) {
  const formData = new FormData();
  formData.append('user', params.count);
  formData.append('pwd', params.password);
  return request('register', {
    method: 'post',
    data: formData,
  });
}
