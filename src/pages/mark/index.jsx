import React, { Component } from 'react'
import { Card, message } from 'antd';
import router from 'umi/router'
import { connect } from 'dva'
import { findIndex, find, cloneDeep, remove, debounce } from 'lodash'
import Toolbar from './components/FlowToolbar'
import TagList from './components/TagList'
import FaceList from './components/FaceList'
import MarkSvg from '@/components/Mark'
import CONSTANT from '@/utils/constant'
import uuidv1 from 'uuid/v1';

const cardStyle = {
  boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)'
}
const styles = {
  imgStyle: {
    flex: 1,
    margin: '16px 16px 24px 24px',
    ...cardStyle,
  },
  tagList: {
    maxHeight: 300,
    margin: '16px 24px 16px 0',
  },
  faceList: {
    margin: '0 24px 24px 0',
    flex: 1,
  },
}

// 历史动作类型
const hisAction = {
  'REDO': 'RE-DO',
  'UNDO': 'UN-DO',
}

// const testData = {
//   imgid: "label_3_20191031015427_416", // 图片id
//   imgpath: "http://tc.lookdoor.cn:1027/img?imgpath=37489178999891089193748915304899189968919899189923748999304891589113048992304374891130489923048996891989928996374891030489918939891330430089193068911304899230430636930636137537036437037536937037537036836337036137489103048991893989133043008919374891330430089198996383376383833089848946838189628943383371362379374361383376383833089848946838189628943383371367379372891289938918",
//   isclean: 0, // 表示是否清洗，0未清洗，1已清洗
//   islabel: 1, // 是否被标注，1已标注 0未标注
//   labelid: -1, // 对应标签id
//   face:[  // 人脸信息
//     {
//       id: '1',
//       age: 24,  // 年龄 提交时默认为0
//       gender: 0, // 性别 提交时默认为0
//       label: "face", // 人脸框标签
//       landmark: [351,171,392,166,377,193,362,217,392,215], // 标注点坐标，两个为一组
//       box:[323.439752,122.2837181,415.6073398,243.79284858] // 人脸框坐标
//     },
//     {
//       id: '2',
//       age: 24,  // 年龄 提交时默认为0
//       gender: 0, // 性别 提交时默认为0
//       label: "face2", // 人脸框标签
//       landmark: [255,243,294,236,282,264,267,284,296,278], // 标注点坐标，两个为一组
//       box:[233.73935520,195.49730166,317.7753642,305.15522596] // 人脸框坐标
//     }
//   ]
// }

export default class Mark extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loadingData: false,
      face: null,
      selectedFace: null,
      isDrag: false,
    }
  }

  componentDidMount() {
    console.log('-------->', this.props.data)
    this.loadInfo(this.props.data)
    if (this.props.methodCallback) {
      this.props.methodCallback({ setData: this.loadInfo })
    }
    this.addHisActiond = this.addHisActionDeb()
    this.onTagUpdated = debounce(this.onTagUpdate, 200)
    this.onResized = debounce(this.onResize, 200)
  }

  /**
   * 组件卸载时候清空一些全局变量
   */
  componentWillUnmount() {
    console.log('-----mark componentWillUnmount----')
    window.selectFace = null
    window.faceList = {}
    window.DR_FACE = false
    this.histroy = [];
  }

  loadInfo = dataInfo => {
    if (!dataInfo) {
      return
    }
    if (this.state.face) {
      // 说明是还原或者重做的动作。所以需要reset节点
      console.log('--Redo or Undo--')
      window.faceList = {}
      window.DR_FACE = false
      this.setState({ loadingData: true }, () => {
        this.setState({ loadingData: false, face: cloneDeep(dataInfo) })
        setTimeout(() => {
          this.selectFace(window.selectFace || dataInfo.face[0])
        })
      })
      return;
    }
    this.setState({ face: cloneDeep(dataInfo) })
    this.histroy = [{ data: cloneDeep(dataInfo), selected: dataInfo.face[0] }]
    if (dataInfo.face && dataInfo.face.length > 0) {
      // 新数据如果有mark，默认选中第一张人脸
      setTimeout(() => {
        this.selectFace(dataInfo.face[0])
      })
    }
  };

  toAddBorder = () => {
    console.log('this.drawBrush--->', this.drawBrush)
    this.setState({
      isDrag: false,
    }, () => {
      this.zoomDrag()
    })
    if (this.drawBrush) {
      window.selectFace = uuidv1();
      window.DR_FACE = true
      console.log('window.selectFace--', window.selectFace)
      const opts = { face: window.selectFace, ...this.size };
      this.drawBrush(opts)
    }
  };

  /**
   * 初始化标注容器后的回调函数
   * @param size 返回容器的尺寸和缩放倍率相关
   * @param drawBrush 返回容器新增人脸框模式的方法
   * @param setEdit 返回容器编辑模式设置的方法
   * @param removeTag 返回容器中删除某个元素的方法
   * @param zoom 返回d3的zoom方法以及svg
   */
  markCallback = (size, { drawBrush, setEdit, removeTag, addFaceRectObj, addRect, addLandmarks, setDrawModel }, zoom) => {
    console.log('markCallback----', zoom)
    this.drawBrush = drawBrush
    this.setEdit = setEdit
    this.removeTag = removeTag
    this.addFaceRectObj = addFaceRectObj
    this.addRect = addRect
    this.addLandmarks = addLandmarks
    this.setDrawModel = setDrawModel
    this.size = size
    this.zoom = zoom.zoomed
    this.childrenzoomed = zoom.childrenzoomed
    this.svg = zoom.svg
    this.identity = zoom.identity
    this.draged = zoom.draged
    this.pausedraged = zoom.pausedraged
    this.child = zoom.child
  };

  /**
   * 在svg中心上新增一个默认的人脸框
   * @param face
   */
  getDefaultMark = () => {
    console.log('face--->', this.size)
    const ctWidth = this.size.width
    const ctHeight = this.size.height
    const faceHeight = 0.25 * ctHeight
    const faceWidth = 3 / 4 * faceHeight
    const box = [(ctWidth - faceWidth) / 2, (ctHeight - faceHeight) / 2,
      (ctWidth + faceWidth) / 2, (ctHeight + faceHeight) / 2]
    const landmark = [
      ctWidth / 2 - 1 / 6 * faceWidth, ctHeight / 2 - faceHeight / 4,
      ctWidth / 2 + 1 / 6 * faceWidth, ctHeight / 2 - faceHeight / 4,
      ctWidth / 2, ctHeight / 2,
      ctWidth / 2 - 1 / 6 * faceWidth, ctHeight / 2 + faceHeight / 4,
      ctWidth / 2 + 1 / 6 * faceWidth, ctHeight / 2 + faceHeight / 4,
    ]
    return { box, landmark }
  }

  /**
   * 新增一张人脸，从人脸列表处输入新增
   * @param faceLabel
   */
  onAddFace = faceLabel => {
    console.log('******************onAddFace***************', faceLabel)
    let { face } = this.state;
    const newId = uuidv1()
    const newFace = {
      id: newId,
      label: faceLabel,
      ...this.getDefaultMark(),
    }
    console.log('newFace======', newFace, newId)
    this.addFaceRectObj(newId, this.size);
    this.addRect(newFace);
    this.addLandmarks(newFace);
    face.face || (face.face = [])
    face.face.push(newFace)
    this.setState({
      face,
      selectedFace: newId,
    }, () => {
      console.log('face------------------>', face)
      this.selectFace(newFace)
      this.addHisAction({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
    })
    this.setDrawModel(newId, 'MOVE_ALL')
    let afterScale = cloneDeep(newFace)
    afterScale.box = afterScale.box.map((vl) => {
      return vl * this.size.orgScale
    })
    afterScale.landmark = afterScale.landmark.map((vl) => {
      return vl * this.size.orgScale
    })
    this.pubEvent({ action: 'ADD', scope: 'ALL', value: afterScale, face: newId })
  }

  /**
   * 用画的方式新增一张人脸
   * @param face
   */
  onAddFaceFromDraw = (faceInfo, size) => {
    let { face } = this.state;
    face.face || (face.face = [])
    face.face.push(faceInfo)
    this.setState({
      face,
      selectedFace: faceInfo.id,
    }, () => {
      this.selectFace(faceInfo)
      this.addHisAction({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
    })
    let afterScale = cloneDeep(faceInfo)
    afterScale.box = afterScale.box.map((vl) => {
      return vl * this.size.orgScale
    })
    afterScale.landmark = afterScale.landmark.map((vl) => {
      return vl * this.size.orgScale
    })
    this.pubEvent({ action: 'ADD', scope: 'ALL', value: afterScale, face: faceInfo.id })
  }

  /**
   * 选中一张人脸
   * @param faceBean
   */
  selectFace = faceBean => {
    window.selectFace = faceBean.id
    this.setState({
      selectedFace: faceBean.id,
    }, () => {
      setTimeout(() => {
        if (this.setEdit) {
          this.setEdit(faceBean.id, true)
        }
      }, 200)
    })
  }

  addHisActionDeb = () => debounce(this.addHisAction, 200);

  addHisAction = (event, action) => {
    console.log('hisof addHisAction-----', action)
    console.log('hisof histroy-----', this.histroy)
    console.log('hisof event-----', event)
    this.setState({
      isDrag: false,
    }, () => {
      this.zoomDrag()
    })
    this.histroy || (this.histroy = []);
    let hisIndex = findIndex(this.histroy, item => item.histroyPoint);
    if (hisIndex === -1) {
      hisIndex = this.histroy.length - 1;
    }
    if (action === hisAction.REDO) {
      // 重做
      if (this.histroy[hisIndex + 1]) {
        // 存在可重做的点
        this.loadInfo(this.histroy[hisIndex + 1].data)
        this.histroy[hisIndex + 1].histroyPoint = true
        this.histroy[hisIndex].histroyPoint = false
        this.selectFace({ id: this.histroy[hisIndex + 1].selected })
        this.pubEvent({ action: 'SETDATA', scope: 'ALL', value: this.histroy[hisIndex + 1].data })
      }
    } else if (action === hisAction.UNDO) {
      // 撤销
      if (hisIndex === 0) {
        return
      }
      if (this.histroy[hisIndex - 1]) {
        this.loadInfo(this.histroy[hisIndex - 1].data)
        this.histroy[hisIndex - 1].histroyPoint = true
        this.histroy[hisIndex].histroyPoint = false
        this.selectFace({ id: this.histroy[hisIndex - 1].selected })
        this.pubEvent({ action: 'SETDATA', scope: 'ALL', value: this.histroy[hisIndex - 1].data })
      }
    } else {
      // 新增动作
      // 把指针后面的动作全部删除，再新增新的动作
      console.log('****--------------****', hisIndex)
      if (hisIndex >= 0) {
        // remove(this.histroy, (hisItem) => {
        //   return findIndex(this.histroy, it => it.data.id === hisItem.data.id) > hisIndex
        // })
        this.histroy.slice(hisIndex + 1, this.histroy.length - hisIndex -1)
        this.histroy[hisIndex].histroyPoint = false
         console.log(hisIndex, ':hisof after remove his:', this.histroy);
      }
      this.histroy.push(event)
    }
  }

  /**
   * 标注中删除一张人脸
   * @param faceLabel
   */
  removeFace = faceId => {
    this.removeTag(faceId, 'RECT')
    CONSTANT.FACE_TAGS.forEach((item) => {
      this.removeTag(faceId, item);
    })
    // 注： 需要触发Ajax请求去删除人脸
    const { face, selectedFace } = this.state;
    const index = findIndex(face.face, (item) => item.id === faceId)
    if (index !== -1) {
      face.face.splice(index, 1);
      this.addHisAction({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
      let newSelectedFAce = selectedFace;
      this.setState({
        face,
      }, () => {
        if (selectedFace === faceId) {
          // 被删除的正好是已经被选中的
          if (face.face.length > 0) {
            if (index > 0) {
              // 新的被选中的值往前挪一位
              newSelectedFAce = face.face[index - 1].id;
            } else {
              newSelectedFAce = face.face[index].id;
            }
          } else {
            newSelectedFAce = null
          }
           this.selectFace({ id: newSelectedFAce })
        }
      })
      this.pubEvent({ action: 'DELETE', scope: 'ALL', face: faceId })
    }
  }

  /**
   * 修改人脸标签值
   * @param faceId
   * @param newFace
   */
  updateFaceLabel = (faceId, newFace) => {
    console.log('faceId, newFace--', faceId, newFace)
    if (!newFace) {
      return;
    }
    const { face } = this.state;
    const exitIndex = findIndex(face.face, (item) => item.label === newFace);
    if (exitIndex !== -1) {
      console.error('已经存在相同名称人脸')
      return
    }
    const oldIndex = findIndex(face.face, (item) => item.id === faceId);
    // console.log('oldIndex----', oldIndex)
    if (oldIndex !== -1) {
      face.face[oldIndex].label = newFace
      // console.log('face----', face)
      this.addHisAction({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
      this.setState({
        face,
      })
      this.pubEvent({ action: 'UPDATE', scope: 'LABEL', value: newFace, face: faceId })
    }
  }

  removeFaceTag = (faceId, tType) => {
    // console.log('faceId, tagType--->', faceId, tType)
    const { face } = this.state;
    const exitIndex = findIndex(face.face, (item) => item.id === faceId);
    // console.log('exitIndex--->', exitIndex)
    if (exitIndex !== -1) {
      const markIndex = CONSTANT.FACE_TAGS.indexOf(tType)
      face.face[exitIndex].landmark[markIndex * 2] = 0;
      face.face[exitIndex].landmark[markIndex * 2 + 1] = 0;
      this.setState({
        face,
      }, () => {
        this.addHisAction({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
        this.removeTag(faceId, tType)
        this.pubEvent({ action: 'DELETE', scope: 'TAG', value: tType, face: faceId })
      })
    }
  }

  onTagUpdate = e => {
    const { face } = this.state;
    const exitIndex = findIndex(face.face, (item) => item.id === e.face);
    if (exitIndex !== -1) {
      const markIndex = CONSTANT.FACE_TAGS.indexOf(e.pointType)
      face.face[exitIndex].landmark[markIndex * 2] = e.x / this.size.orgScale;
      face.face[exitIndex].landmark[markIndex * 2 + 1] = e.y / this.size.orgScale;
      this.addHisAction({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
      this.setState({
        face,
      })
    }
    this.pubEvent({ action: e.action, scope: 'TAG', value: e, face: e.face })
  }

  /**
   * 人脸框做resize的时候触发
   * @param e
   */
  onResize = e => {
    let { face } = this.state;
    // console.log('onResize---', e) // this.size.orgScale
    if (face) {
      const faceIndex = findIndex(face.face, item => item.id === e.face)
      // console.log('onResize faceIndex:', faceIndex)
      if (faceIndex !== -1) {
        const np = [e.boxPoint[0].x / this.size.orgScale, e.boxPoint[0].y / this.size.orgScale, e.boxPoint[1].x / this.size.orgScale, e.boxPoint[1].y / this.size.orgScale]
        face.face[faceIndex].box = np
        // console.log('onResize face:', face)
        this.addHisAction({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
        this.setState({ face })
      }
    }
    this.pubEvent({ action: 'UPDATE', scope: 'RECT', value: e.boxPoint, face: e.face })
  }

  /**
   * 触发一个新增人脸框的操作
   * @param e
   */
  onAddRect = e => {
    // console.log('onAddRect--->', e)
  }

  /**
   * 人脸整体移动的时候触发
   * @param e
   */
  onFaceMove = e => {
    // console.log('onFaceMove------', e)
    let { face } = this.state;
    const faceIndex = findIndex(face.face, item => item.id === e.face)
    if (faceIndex !== -1) {
      face.face[faceIndex].box = e.box.map((boxItem) => boxItem / this.size.orgScale)
      face.face[faceIndex].landmark = e.landmark.map((lItem) => lItem / this.size.orgScale)
      this.addHisActiond({ data: cloneDeep(face), selected: window.selectFace && cloneDeep(window.selectFace) })
      this.setState({ face })
    }
    this.pubEvent({ action: 'UPDATE', scope: 'ALL', value: e, face: e.face })
  }

  /**
   * 触发事件
   * @param action 触发的动作 ADD,DELETE,UPDATE
   * @param scope 触发的范围 ALL, RECT, TAG, LABEL
   * @param value
   * @param face
   */
  pubEvent = ({ action, scope, value, face}) => {
    if (this.props.onUpdate) {
      this.props.onUpdate({ action, scope, value, face, size: this.size })
    }
  }

   /**
   * 还原
   */
  save = () => {
    this.setState({
      isDrag: false,
    }, () => {
      this.zoomDrag()
    })
    // console.log('保存')
  }

  /**
   * 缩小
   */
  zoomIn = () => {
    this.setState({
      isDrag: false,
    })
    // console.log('缩小')
    this.zoom.scaleBy(this.svg, 0.9)
    // const tran = d3.zoomTransform(svg.node());
  }

   /**
   * 放大
   */
  zoomOut = () => {
    this.setState({
      isDrag: false,
    }, () => {
      this.zoomDrag()
    })
    // console.log('放大')
    this.zoom.scaleBy(this.svg, 1.1)
    // const tran = d3.zoomTransform(svg.node());
  }

  /**
   * 还原
   */
  reset = () => {
    this.setState({
      isDrag: false,
    }, () => {
      this.zoomDrag()
    })
    // console.log('还原')
    this.svg.call(this.zoom.transform, this.identity)
    this.child.call(this.childrenzoomed.transform, this.identity)
  }

  drag = () => {
    const { isDrag } = this.state
    this.setState({
      isDrag: true,
    }, () => {
      this.zoomDrag()
    })
    // console.log('拖动', this.draged)
  }

  zoomDrag = () => {
    const { isDrag } = this.state
    console.log('=====isDrag=====', isDrag)
    if (isDrag) {
      this.svg.call(this.draged)
    // 禁止掉鼠标滚轮事件
    .on('wheel.zoom', null)
    .on('wheelDelta', null)
    // 禁止双击放大事件
    .on('dblclick.zoom', null)
    } else {
      // message.error('不可拖动')
      this.svg.call(this.pausedraged)
      .on('mousedown.zoom', null)
      .on('touchstart.zoom', null)
      .on('touchmove.zoom', null)
      .on('dblclick.zoom', null)
      .on('wheel.zoom', null)
      .on('touchend.zoom', null);
    }
  }

  render() {
    const edit = true
    const { face, selectedFace, loadingData, isDrag } = this.state;
    const { saveOnSwitch, setSaveOnSwitch } = this.props;
    if (!this.state.face) {
      return (
        <div style={{ height: 'calc( 100vh - 113px )', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
          无图片信息
        </div>
      )
    }
    let selectedFaceObj = {}
    if (face.face && face.face.length > 0) {
      selectedFaceObj = find(face.face, (item) => item.id === selectedFace)
    }
    // console.log('isDrag===', isDrag)
    return (
      <div style={{ height: this.props.height || 'calc( 100vh - 113px )', background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
        <Toolbar toAddBorder={this.toAddBorder}
                 save={() => {
                   this.props.save();
                   this.histroy = [
                     { data: cloneDeep(face) },
                   ];
                 }}
                 saveOnSwitch={saveOnSwitch}
                 setSaveOnSwitch={setSaveOnSwitch}
                 handleCliclPre={this.props.handleCliclPre}
                 handleCliclNext={this.props.handleCliclNext}
                 addHisAction={this.addHisAction}
                 zoomIn={this.zoomIn}
                 zoomOut={this.zoomOut}
                 reset={this.reset}
                 drag={this.drag}
        />
        <div style={{ flex: 1, display: 'flex' }}>
          <Card style={styles.imgStyle} bordered={false} bodyStyle={{ width: '100%', height: '100%', padding: 0 }}>
            {loadingData ? null : <MarkSvg data={face} initCallback={this.markCallback} edit={edit} onTagUpdate={this.onTagUpdated} onResize={this.onResized} onFaceMove={this.onFaceMove} onAddRect={this.onAddRect} onAddFace={this.onAddFaceFromDraw} isDrag={isDrag}/>}
          </Card>
          <div style={{ width: 280, minWidth: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TagList faceInfo={selectedFaceObj} style={styles.tagList} setDrawModel={this.setDrawModel} removeTag={this.removeFaceTag} selected={0}/>
            <FaceList style={styles.faceList}
                      data={face}
                      selected={selectedFace}
                      onAdd={this.onAddFace}
                      onSelect={this.selectFace}
                      onRemove={this.removeFace}
                      onUpdate={this.updateFaceLabel}
                      toAddBorder={this.toAddBorder}
                      height = {this.props.faceHeight}
            />
          </div>
        </div>
      </div>
    );
  }
}
