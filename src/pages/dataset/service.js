import request from '@/utils/request';

/**
 * 获取数据集列表
 * @param data
 * @returns {Promise<void>}
 */
export async function getDatasetList(params) {
  // console.log('params---', params)
  const param = {
    pageindex: params.pageNo - 1,
    limit: params.pageSize,
  }
  if (params.name) {
    param.name = params.name
  }
  // console.log(param)
  return request('getdatasets', {
    data: param,
  });
}

/**
 * 新增数据集列表
 * @param data
 * @returns {Promise<void>}
 */
export async function addDataset(params) {
  // console.log(params);
  // const formData = new FormData();
  // formData.append('task_id', params.task_id);
  // formData.append('isoriginal', 1);
  // formData.append('scene', params.scene);
  // formData.append('filename', params.upload[0].name);
  // formData.append('user', params.user);
  // formData.append('token', params.token);
  // formData.append('batchname', params.datasetname);
  return request('file/merge', {
    method: 'post',
    data: params,
  });
}

/**
 * 上传文件
 * @param data
 * @returns {Promise<void>}
 */
export async function upload(params) {
  // console.log(params);
  return request('file/upload', {
    method: 'post',
    data: params,
  });
}

/**
 * 数据集图片列表
 * @param data
 * @returns {Promise<void>}
 */
export async function imgList(params) {
  // console.log(params);
  return request('getdatasetimg', {
    method: 'get',
    data: params,
  });
}
/**
 * 数据集文件列表
 * @param data
 * @returns {Promise<void>}
 */
export async function getDatasetFolder(params) {
  // console.log(params);
  return request('getdatasetfloder', {
    method: 'get',
    data: params,
  });
}
/**
 * 删除单个数据集
 * @param data
 * @returns {Promise<void>}
 */
export async function delDataset(params) {
  // console.log(params);
  return request('deldataset', {
    method: 'post',
    data: params,
  });
}
/**
 * 删除单个数据集图片
 * @param data
 * @returns {Promise<void>}
 */
export async function delDatasetImg(params) {
  // console.log(params);
  return request('deldatasetimg', {
    method: 'post',
    data: params,
  });
}
/**
 * 上传单个数据集图片
 * @param data
 * @returns {Promise<void>}
 */
export async function uploadSinglePic(params) {
  const formData = new FormData();
  formData.append('task_id', params.task_id);
  formData.append('filename', params.filename);
  formData.append('user', params.user);
  formData.append('token', params.token);
  formData.append('datasetid', params.datasetid);
  if (params.floderid) {
    formData.append('floderid', params.floderid);
  }
  return request('file/single', {
    method: 'post',
    data: formData,
  });
}
