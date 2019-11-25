import request from '@/utils/request';
import CONSTANTS from '../../../utils/constant';

/**
 * 获取数据标注列表
 * @param data
 * @returns {Promise<void>}
 */
export async function getlabelTaskimg(params) {
  // console.log(params)
  return request('getlabeltaskimg', {
    data: params,
  });
}
/**
 * 获取数据标注列表
 * @param data
 * @returns {Promise<void>}
 */
export async function getsinglelabeltask(params) {
  // console.log(params)
  return request('getsinglelabeltask', {
    data: params,
  });
}
/**
 * 获取标签列表
 * @param data
 * @returns {Promise<void>}
 */
export async function getlabeltaskid(params) {
  // console.log(params)
  return request('getlabeltaskid', {
      data: params,
  });
}
/**
 * 删除人脸标签
 * @param data
 * @returns {Promise<void>}
 */
export async function dellabeltaskid(params) {
  // console.log(params)
  return request('dellabeltaskid', {
      data: params,
      method: 'post',
  });
}
/**
 * 添加人脸标签
 * @param data
 * @returns {Promise<void>}
 */
export async function addlabeltaskid(params) {
  // console.log(params)
  return request('addlabeltaskid', {
      data: params,
      method: 'post',
  });
}
/**
 * 编辑标签
 * @param data
 * @returns {Promise<void>}
 */
export async function updatelabeltaskid(params) {
  // console.log(params)
  return request('updatelabeltaskid', {
      data: params,
      method: 'post',
  });
}
/**
 * 人脸图片重新分类
 * @param data
 * @returns {Promise<void>}
 */
export async function updatelabeltaskimgid(params) {
  // console.log(params)
  return request('updatelabeltaskimgid', {
      data: params,
      method: 'post',
  });
}
/**
 * 人脸图片合并
 * @param data
 * @returns {Promise<void>}
 */
export async function combinelabeltaskimgid(params) {
  // console.log(params)
  return request('combinelabeltaskimgid', {
      data: params,
      method: 'post',
  });
}
/**
 * 人脸图片清洗
 * @param data
 * @returns {Promise<void>}
 */
export async function cleanlabeltaskimg(params) {
  // console.log(params)
  return request('cleanlabeltaskimg', {
      data: params,
      method: 'post',
  });
}
/**
 *  保存手动矫正数据
 */
export async function updatelabeltaskimg(params) {
  // console.log(params)
  const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
  const formData = new FormData()
    formData.append('taskid', itemtaskid)
    formData.append('imgid', params.imgid)
    formData.append('labelid', params.labelid)
    formData.append('face', `${JSON.stringify(params.face)}`)
    // console.log(formData.get('taskid'))
    // console.log(formData.get('imgid'))
    // console.log(formData.get('face'))
  return request('updatelabeltaskimg', {
      data: formData,
      method: 'post',
  });
}
