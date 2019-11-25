import request from '@/utils/request';

// 获取训练项目
export async function getProjectList(param = {}) {
  return request('gettrainproject', {
    method: 'get',
    data: param
  })
}

// 获取数据集
export async function getDataSetList(param = {}) {
  const isOpen = param.isOpen
  delete param.isOpen
  if (isOpen) {
    // 公开数据集
    return request('getopendataset', {
      method: 'get',
      data: param
    })
  }
  // 个人数据集
  return request('getoaldataset', {
    method: 'get',
    data: param
  })
}

// 获取预置算法
export async function getAlgorithm(param = {}) {
  return request('getopenmodel', {
    method: 'get',
    data: param
  })
}

// 获取训练类型配置
export async function getConfig(param = {}) {
  return request('gettrainconfig', {
    method: 'get',
    data: param
  })
}

// 获取运行环境配置
export async function getHardConfig(param = {}) {
  return request('gettrainhardconfig', {
    method: 'get',
    data: param
  })
}

// 运行训练项目
export async function runProject(param = {}) {
  return request('runtrainproject', {
    method: 'post',
    data: param
  })
}

// 查询项目运行状态，需轮询，项目运行成功后，调用接口，更改项目运行状态
export async function queryProjectStatus(param = {}) {
  return request('jupyter/api/namespaces/kubeflow/notebooks', {
    method: 'get',
    data: param,
    urlType: 'k8s'
  })
}

// 创建训练项目
export async function createProject(param = {}) {
  return request('createtrainproject', {
    method: 'post',
    data: param
  })
}

// 删除训练项目
export async function delProject(param = {}) {
  return request('deltrainproject', {
    method: 'post',
    data: param
  })
}

// 停止运行项目
export async function stopProject(param = {}) {
  return request('stoptrainproject', {
    method: 'post',
    data: param
  })
}

// 根据项目Id, 查询项目信息
export async function findProjectById(param = {}) {
  return request('getsingletrainproject', {
    method: 'post',
    data: param
  })
}

// 进入项目
export async function enterProject(param = {}) {
  return request('entertrainproject', {
    method: 'post',
    data: param
  })
}

// 更新训练项目运行状态
export async function updateProjectStatus(param = {}) {
  return request('updatetrainprojectstatus', {
    method: 'post',
    data: param
  })
}

// 删除模型版本
export async function delModelVersion(param = {}) {
  return request('deltrainmodelversion', {
    method: 'post',
    data: param
  })
}


// 获取项目介绍，markdown
export async function getProjectIntr(param = {}) {
  return request('gettrainprojectdesc', {
    method: 'post',
    data: param
  })
}

