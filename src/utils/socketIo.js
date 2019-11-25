import io from 'socket.io-client'
import CONSTANTS from './constant';
// import request from '@/utils/request'
const reqAddress = require('../../config/requestConfig').default

const Socket = io(reqAddress.url)
const username = localStorage.getItem(CONSTANTS.TRAINING_USERNAME)

Socket.on('connect', () => {
  console.log('socket connected')
})
Socket.on('connect_response', data => {
  console.log(data)
})
Socket.emit('sio_login', username)
// Socket.on('msg', data => {
//   console.log(data)
// })
// export function getSocketMsg() {
//   Socket.on('msg', data => {
//     console.log(data)
//   })
// }

export default Socket;
