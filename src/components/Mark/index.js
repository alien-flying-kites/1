import { Icon, Tooltip, Spin, Menu } from 'antd';
import react, { useState, useEffect } from 'react';
import CONSTANT from '@/utils/constant'
import { findIndex } from 'lodash'
import Rectangle from './Rectangle'
import * as d3 from 'd3';

const r = new Uint16Array(257);
const g = new Uint16Array(257);
const b = new Uint16Array(257);

const loadImg = imgPath => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = imgPath
    img.onload = () => {
      resolve(img)
    }
  })
}

const Mark = props => {
  // 放大倍率属性
  const [scale, setScale] = useState(1)
  const [loading, setLoading] = useState(true)
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const [contextmenu, setContextmenu] = useState({ top: 0, left: 0, show: false, removeType: null })
  // data 人脸数据， edit 是否编辑模式
  const { data, onTagUpdate, onResize, onFaceMove, onAddFace, isDrag } = props;

  let svg,
    g,
    ctScale,
    faceArray={}, // 用来存储人脸 Rectangle 对象实例
    zoom = d3.zoom().scaleExtent([0.1, 10]),
    globSize;

  useEffect(() => {
    loadImg(data.imgpath).then(img => {
      setLoading(false);
      setImgSize({ width: img.width, height: img.height })
      initSvg({ width: img.width, height: img.height })
    })
    console.log('useEffect-------', isDrag)
    // initSvg()
  }, [])

  // 获取外层容器大小
  const ctSize = () => {
    const dom = document.getElementById('svgWrapper')
    return {
      height: dom.offsetHeight,
      width: dom.offsetWidth,
    }
  }
  // 根据外层容器大小，比例，设置缩放值
  const getScale = ({ width, height }) => {
    const wSize = ctSize()
    const bl = wSize.width / wSize.height;
    const svgBl = width / height;
    if (bl < svgBl) {
      // 外层容器的宽高比小与目标比例，以宽度为基准算出比例
      return wSize.width / width;
    }
    return wSize.height / height;
  }

  const namePrefix = 'face'; // 自动生成的名字默认前缀

  const getNewName = () => {
    let tempNewName = '';
    for (let i = 1; i < 100; i++) {
      const faceIndex = findIndex(data.face, (item) => item.label === `${namePrefix}${i}`)
      if (faceIndex === -1) {
        tempNewName = `${namePrefix}${i}`
        break;
      }
    }
    return tempNewName
  }

  const onAddRect = e => {
    // console.log('onAddRect--->', e)
    const newFace = {
      id: e.face,
      label: getNewName(),
      box: [Number(e.x) / globSize.orgScale, Number(e.y) / globSize.orgScale, (Number(e.x) + Number(e.width)) / globSize.orgScale, (Number(e.y) + Number(e.height)) / globSize.orgScale],
      landmark: [
        (Number(e.x) + Number(e.width) / 4) / globSize.orgScale, (Number(e.y) + Number(e.height) / 4) / globSize.orgScale,
        (Number(e.x) + Number(e.width) / 4 * 3) / globSize.orgScale, (Number(e.y) + Number(e.height) / 4) / globSize.orgScale,
        (Number(e.x) + Number(e.width) / 2) / globSize.orgScale, (Number(e.y) + Number(e.height) / 2) / globSize.orgScale,
        (Number(e.x) + Number(e.width) / 4) / globSize.orgScale, (Number(e.y) + Number(e.height) / 4 * 3) / globSize.orgScale,
        (Number(e.x) + Number(e.width) / 4 * 3) / globSize.orgScale, (Number(e.y) + Number(e.height) / 4 * 3) / globSize.orgScale,
      ],
    }
    // console.log('newFace======', newFace)
    addLandmarks(newFace)
    if (onAddFace) {
      onAddFace(newFace, globSize)
    }
  }

  const onRectResize = e =>{
    // console.log('onRectResize--->', e)
    onResize(e)
  }
  /**
   * 人脸组件整体被移动的时候
   * @param e
   */
  const onAllMove = e => {
    // console.log('onAllMove--->', e)
    onFaceMove(e)
  }


  /**
   * 新增一个方框。一般用于画面初始化
   * @param width
   * @param height
   * @param orgScale
   * @param faceInfo
   * @param fill
   */
  const createRect = ({ orgScale, faceInfo, stroke = 'green' }, faceRect) => {
    // const faceRect = new Rectangle(svg, { edit: false, face: faceInfo.label })
    // console.log('faceRect---', faceRect)
    const x = faceInfo.box[0] * orgScale;
    const y = faceInfo.box[1] * orgScale;
    const rectWidth = (faceInfo.box[2] - faceInfo.box[0]) * orgScale;
    const rectHeight = (faceInfo.box[3] - faceInfo.box[1]) * orgScale;
    faceRect.addRect({ x, y, width: rectWidth, height: rectHeight })
    faceRect.setEdit(false)
  }
  /**
   * 人脸点改变的时候发出的事件
   * @type {Event}
   */
  const onTagPoinUpdate = e => {
    // console.log('onTagPoinUpdate-----', e)
    onTagUpdate(e)
  }

  /**
   * 初始化一个画框的动作
   * @param width
   * @param height
   */
  const drawBrush = ({ width, height, face }) => {
    const orgScale = getScale({ width, height });
    faceArray[face] = new Rectangle(svg, { face, edit: true, onTagPoinUpdate, onAllMove, onResize: onRectResize, onAddRect }, { width, height, orgScale })
  }

  /**
   * 新增一个画布的对象
   * @param face: face.id
   */
  const addFaceRectObj = (face, size = {})  => {
    // console.log('新增一个画布的对象', face, size)
    // const orgScale = getScale({ width, height });
    faceArray[face] = new Rectangle(svg, { edit: false, face, onTagPoinUpdate, onAllMove, onResize: onRectResize, onAddRect }, size)
  }

  /**
   * 新增一个人脸框
   * @param faceInfo
   */
  const addRect = faceInfo => {
    const opt = { ...globSize, faceInfo }
    // console.log('faceArray 是个啥---', faceArray)
    // console.log('faceInfo---', faceInfo)
    // console.log('新增一个人脸框', opt, faceArray[faceInfo.id])
    createRect(opt, faceArray[faceInfo.id])
  }
  const addLandmarks = faceInfo => {
    // console.log('faceArray[faceInfo.id]---', faceArray[faceInfo.id]);
    if (faceInfo.landmark && faceInfo.landmark.length > 0) {
      for (let i = 0; i < faceInfo.landmark.length / 2; i++) {
        faceArray[faceInfo.id].addPoint({ x: faceInfo.landmark[i * 2] * globSize.orgScale, y: faceInfo.landmark[i * 2 + 1] * globSize.orgScale, pointType: CONSTANT.FACE_TAGS[i] }, true)
      }
    }
  }
  const setDrawModel = (face, model) => {
    // console.log('face, model 是什么内容', face, model)
    faceArray[face].setDrawModel(model)
  }
  /**
   * 元素点击右键触发动作
   * @param top
   * @param left
   * @param removeType
   */
  const onContextmenu = (top, left, removeType) => {
    setContextmenu({ top, left, removeType, show: true })
  }

  const initData = size => {
    globSize = size
    // console.log(size)
    if (props.data.face && props.data.face.length > 0) {
      props.data.face.forEach(item => {
        const opt = { ...size, faceInfo: item }
        const faceRect = new Rectangle(svg, { edit: false, face: item.id, onTagPoinUpdate, onAllMove, onResize: onRectResize, onAddRect }, size)
        faceArray[item.id] = faceRect;
        // console.log('初始化react 框', opt, faceRect)
        createRect(opt, faceRect)
        addLandmarks(item)
        // if (item.landmark && item.landmark.length > 0) {
        //   for (let i = 0; i < item.landmark.length / 2; i++) {
        //     faceRect.addPoint({ x: item.landmark[i * 2] * size.orgScale, y: item.landmark[i * 2 + 1] * size.orgScale, pointType: CONSTANT.FACE_TAGS[i] })
        //   }
        // }
      })
    }
  }

  /**
   * 设置某个已存在的人脸框为编辑模式
   * @param face
   * @param edit
   */
  const setEdit = (face, faceEdit) => {
    if (!faceArray[face]) {
      console.error('人脸信息不存在:', face)
      return;
    }
    for (let p in faceArray) {
      faceArray[p].setEdit(false, p);
    }
    faceArray[face].setEdit(faceEdit, face)
  }
  /**
   * 删除人脸上的某个特征值
   * @param face
   * @param type 'RECT'，'EYE_LEFT', 'EYE_RIGHT', 'NOSE', 'MOUTH_LEFT', 'MOUTH_RIGHT'
   */
  const removeTag = (face, type) => {
    if (!faceArray[face]) {
      console.error('人脸信息不存在:', face)
      return;
    }
    faceArray[face].removeTag(type)
  }

  const setData = (idata) => {
    // console.log('setData---', idata)
  }

  // 初始化svg容器
  const initSvg = ({ width, height }) => {
    svg = d3.select('#svgViewMark');
    let zoomtran
    let tran
    // console.log('svg------------>', svg.empty())
    if (svg.empty()) {
      console.error('画布已经被销毁')
      return
    }
    const child = svg.select('g');
    const zoomed = d3.zoom()
    .scaleExtent([1 / 4, 8])
    // .translateExtent([[-width, -Infinity], [2 * width, Infinity]])
    .on('zoom', () => {
      // console.log('zoomtran---------', d3.event.translate)
      zoomtran = d3.zoomTransform(svg.node())
      // console.log('-----', zoomtran)
      // svg.attr('transform', d3.zoomTransform(svg.node()))
      svg.attr('transform', `translate(${0}, ${0}), scale(${zoomtran.k})`)
    })
    const identity = d3.zoomIdentity
    const draged = d3.zoom()
    .on('zoom', () => {
      tran = d3.zoomTransform(svg.node())
      // console.log(tran)
      // svg.attr('transform', d3.zoomTransform(svg.node()))
      // if (!zoomtran) {
      //   svg.attr('transform', `translate(${tran.x}, ${tran.y}), scale(${1})`)
      // } else {
      //   const k = zoomtran.k
      //   svg.attr('transform', `translate(${tran.x}, ${tran.y})`)
      // }
      child.attr('transform', `translate(${tran.x}, ${tran.y})`)
    })
    .on('end', () => {
      console.log('zoom 结束啦')
    })
    const childrenzoomed = d3.zoom()
    .scaleExtent([1 / 4, 8])
    .on('zoom', () => {
      zoomtran = d3.zoomTransform(svg.node())
      child.attr('transform', `translate(${0}, ${0}), scale(${zoomtran.k})`)
    })
    const pausedraged = d3.zoom()
      .on('zoom', () => {
        // console.log('zoomtran---------', zoomtran)
        if (!zoomtran && !tran) {
          svg.attr('transform', `translate(${0}, ${0}), scale(${1})`)
        } else if (!zoomtran && tran) {
          svg.attr('transform', `translate(${tran.x}, ${tran.y}), scale(${1})`)
        } else if (zoomtran && !tran) {
          svg.attr('transform', `translate(${0}, ${0}), scale(${zoomtran.k})`)
        } else {
          svg.attr('transform', `translate(${tran.x}, ${tran.y}), scale(${zoomtran.k})`)
        }
      })
      .on('end', () => {
        console.log('pausedraged 结束啦')
      })
    // console.log('props.isDrag----', props.isDrag)
    // if (props.isDrag) {
    //   svg.call(drag)
    // }
    const orgScale = getScale({ width, height });
    ctScale = orgScale;
    // console.log('orgScale 倍数---', orgScale)
    const w = width * orgScale;
    const h = height * orgScale;
    g = svg.attr('width', w).attr('height', h)
    .style('outline', '1px solid #999')
    .select('g')
    .append('g')
    g.append('image')
      .attr('width', w)
      .attr('height', h)
      .attr('href', data.imgpath);
    props.initCallback && props.initCallback({ width, height, orgScale }, { drawBrush, setEdit, removeTag, addFaceRectObj, addRect, addLandmarks, setDrawModel, setData }, {zoomed, svg, identity, draged, pausedraged, child, childrenzoomed})
    if (props.data) {
      initData({ width, height, orgScale })
    }
  }

  let svgProps = {};
  if (loading) {
    svgProps.display = 'none'
  }

  return (
    <div id="svgWrapper" style={{ width: '100%', height: '100%', background: '#f0f2f5', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <svg id="svgViewMark" {...svgProps} style={{border: '1px solde red'}}>
        <g></g>
      </svg>
      {loading ? <Spin size="large"/> : null }
    </div>
  )
}
export default Mark;
