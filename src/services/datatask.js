import request from '@/utils/request';

/**
 * 获取数据集列表
 * @param data
 * @returns {Promise<void>}
 */
export async function getDatasetListOption() {
  return request('getdatasets', {
  });
}
