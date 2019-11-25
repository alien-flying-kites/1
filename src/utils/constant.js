const constant = {
  PAGE_SIZE: 15, // 设备分页拉取数据量
  TRAINING_TOKE: 'training_token',
  TRAINING_USERNAME: 'training_username',
  OSA_USER_ID: 'oasUserId',
  AMAP_KEY: '3bd6ced065e50e1e77d3ff803ac16118',
  // begin DICTION_* 数据字典类型
  DICTION_BUSINESS_TYPE: 'businessType', // 商户类型
  DICTION_BUSINESS_STATUS: 'businessStatus', // 商户状态
  // end DICTION_* 数据字典类型
  MD5_SALT: '1asd019jy', // MD5的附加加密串码
  // begin 给 API 调用
  BASE_URI_OF_WEB: '/oas-cloud/platform/uos/um/web',
  BASE_URI_OF_DC: '/oas-cloud/platform/uos/dc/da/web',
  // end 给 API 调用
  OSA_USER_USERTYPE: 'oasUserType',
  OSA_USER_NAME: 'oasUserName',
  TEMP_INFO_FOR_BUSINESS: 'TEMP_INFO_FOR_BUSINESS', // 暂存商户新增的key
  DARK_CARD_BACKGROUND: '#1F263E',
  TRAINING_DATASETID: 'training_datasetid', // 数据集id
  TRAINING_TASKID: 'training_taskid', // 标注任务id
  TRAINING_ISFOLDER: 'training_isfolder', // 是否是文件夹分类
  TRAINING_DATASETNAME: 'training_datasetname', // 数据集名称
  TRAINING_FOLDERNAME: 'training_foldername', // 文件夹名称
  TRAINING_UUID: 'training_uuid', // 上传文件唯一id
  TRAINING_FOLDERNUM: 'training_foldernum', // 数据集文件夹数量
  TRAINING_FOLDERID: 'training_folderid', // 数据集文件夹id
  TRAINING_TASKNAME: 'training_taskname', // 数据标注名称
  FACE_TAGS: ['EYE_LEFT', 'EYE_RIGHT', 'NOSE', 'MOUTH_LEFT', 'MOUTH_RIGHT'],
  AUTOSAVE: 'auto_save',
};
module.exports = constant;
