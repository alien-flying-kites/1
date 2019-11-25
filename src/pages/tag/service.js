import request from '@/utils/request';

/**
 * 获取数据标注列表
 * @param data
 * @returns {Promise<void>}
 */
export async function getTagList(params) {
  const param = {
    pageindex: params.pageNo - 1,
    limit: params.pageSize,
  }
  if (params.name) {
    param.name = params.name
  }
  if (params.labeltype) {
    param.labeltype = params.labeltype
  }
  // console.log(param)
  return request('getlabeltask', {
    data: param,
  });
}
/**
 * 新增数据集列表
 * @param data
 * @returns {Promise<void>}
 */
export async function addTag(params) {
  // console.log(params);
  const formData = new FormData();
  formData.append('datasetid', params.datasetid);
  formData.append('scene', params.scene);
  formData.append('desc', params.desc);
  formData.append('labeltype', params.labelType);
  formData.append('taskname', params.taskname);
  return request('createlabeltask', {
    method: 'post',
    data: formData,
  });
}
/**
 * 删除单个数据集图片
 * @param data
 * @returns {Promise<void>}
 */
export async function deleteTag(params) {
  // console.log(params);
  return request('dellabeltask', {
    method: 'post',
    data: params,
  });
}
/**
 * 自动标注
 * @param data
 * @returns {Promise<void>}
 */
export async function autoLabelTask(params) {
  // console.log(params);
  return request('autolabeltask', {
    method: 'post',
    data: params,
  });
}
/**
 * 暂停标注
 * @param data
 * @returns {Promise<void>}
 */
export async function pauseautolabeltask(params) {
  // console.log(params);
  return request('pauseautolabeltask', {
    method: 'post',
    data: params,
  });
}
/**
 * 生成训练数据
 * @param data
 * @returns {Promise<void>}
 */
export async function genlabelrec(params) {
  // console.log(params);
  return request('genlabelrec', {
    method: 'post',
    data: params,
  });
}
