const Webuploader = require('./webuploader.min')
const reqAddress = require('../../config/requestConfig').default

const getUploadObj = ()=>{
  let uid = Webuploader.Base.guid()
  const uploaderObj = Webuploader.create({
    server: `${reqAddress.url}file/upload`,
    chunked: true,
    chunkSize: 1024 * 1024 * 5,
    chunkRetry: 3,
    threads: 1,
    duplicate: true,
    formData: { // 上传分片的http请求中一同携带的数据
      task_id: uid,
    },
  })
  return { uid, uploaderObj }
}

export { getUploadObj }

