/**
 * add by jianbing Fang
 * 封装SVG上画框组件
 * return {
 *     setEdit( boolean ) , 设置该框为编辑模式
 *     addRect({ x, y, width, height }) , 外部新增一个框
 *     addPoint() , 外部往里新增或更新一个点
 *     setDrawModel(model), 设置画笔的类型
 * }
 */
import * as d3 from 'd3';
import CONSTANT from '@/utils/constant'

window.faceList = {};

const Rectangle = function(svg, opts = {}, size = {}) {
  let self = this, rectData = [], isDown = false, m1, m2, isDrag = false, editMode=true, drawModel = 'RECT', red='rgb(24, 144, 255)';
  self.faceTags = {};
  console.log('size-------', size)
  editMode = opts.edit
  console.log('opts----', opts)
  svg.on('mousedown', function() {
    m1 = d3.mouse(this);
    console.log('m1---又是个啥', m1)
    const dm = window.faceList[window.selectFace || opts.face];
    console.log(opts.face, '--mousedown---', dm, window.selectFace)
    // if (!dm || dm === 'none') {
    //   return
    // }
    if (!dm && window.DR_FACE) {
      if (!isDown && !isDrag) {
        self.rectData = [{ x: m1[0], y: m1[1] }, { x: m1[0], y: m1[1] }];
        addElements()
        updateRect();
        isDrag = false;
      } else {
        isDrag = true;
      }
      isDown = !isDown;
    } else if (!dm.drawModel||dm.drawModel === 'none') {
      return
    } else {
     // 画点
      addOrUpdateTagPoint({ x: m1[0], y: m1[1], pointType: dm.drawModel, faceId: window.selectFace })
    }
  })
    .on('mouseup', () => {
      isDown = false
      isDrag = true
      if (window.DR_FACE) {
        console.log(' ---end Draw face---')
        const restRect = {
          x: self.rectangleElement.attr('x'),
          y: self.rectangleElement.attr('y'),
          width: self.rectangleElement.attr('width'),
          height: self.rectangleElement.attr('height'),
          face: window.selectFace,
        }
        console.log('xxxxxx框的位置信息', restRect)
        opts.onAddRect(restRect)
        window.DR_FACE = false
      }
    })
    .on('mousemove', function() {
      m2 = d3.mouse(this);
      if (isDown && !isDrag) {
        // console.log('m2---是个啥', m2)
        self.rectData[1] = { x: m2[0], y: m2[1] };
        updateRect();
      }
    });

  function selectCircle(point) {
    return d3.select(`circle[data-face="${opts.face}"][data-point="${point}"]`)
  }

  function selectCircleByType(tagType, faceId) {
    return d3.select(`circle[data-face="${faceId || opts.face}"][data-point-tag="${tagType}"]`)
  }

  function updateRect(noEvent) {
    // console.log('noEvent---updateRect react移动了--', noEvent)
    const rectWid = self.rectData[1].x - self.rectData[0].x
    const rectHeig = self.rectData[1].y - self.rectData[0].y
    // console.log('rect 的 宽 高', rectWid, rectHeig)
    if (self.rectData[0].x <= 0) {
      self.rectData[0].x = 0
      self.rectData[1].x = 0 + rectWid
    }
    if (self.rectData[0].y <= 0) {
      self.rectData[0].y = 0
      self.rectData[1].y = 0 + rectHeig
    }
    if (self.rectData[1].x >= size.width * size.orgScale) {
      self.rectData[1].x = size.width * size.orgScale
      self.rectData[0].x = size.width * size.orgScale - rectWid
    }
    if (self.rectData[1].y >= size.height * size.orgScale) {
      self.rectData[1].y = size.height * size.orgScale
      self.rectData[0].y = size.height * size.orgScale - rectHeig
    }
    // console.log('rect 的 坐标', self.rectData)
    self.rectangleElement.attr('x', self.rectData[1].x - self.rectData[0].x > 0 ? self.rectData[0].x : self.rectData[1].x)
      .attr('y', self.rectData[1].y - self.rectData[0].y > 0 ? self.rectData[0].y : self.rectData[1].y)
      .attr('width', Math.abs(self.rectData[1].x - self.rectData[0].x))
      .attr('height', Math.abs(self.rectData[1].y - self.rectData[0].y))

    self.pointElement1.data(self.rectData);
    self.pointElement1.attr('cx', self.rectData[0].x).attr('cy', self.rectData[0].y);
    self.pointElement2.data(self.rectData);
    self.pointElement2.attr('cx', self.rectData[1].x).attr('cy', self.rectData[1].y);
    self.pointElement3.data(self.rectData);
    self.pointElement3.attr('cx', self.rectData[1].x).attr('cy', self.rectData[0].y);
    self.pointElement4.data(self.rectData);
    self.pointElement4.attr('cx', self.rectData[0].x).attr('cy', self.rectData[1].y);
    if (opts.onResize && !noEvent) {
      // 框框有发生变化时候执行回调函数
      opts.onResize({ boxPoint: self.rectData, face: opts.face })
    }
  }
  // 人脸框的拖动监听
  function dragRect() {
    // dragRect() {
    if (!editMode && drawModel !== 'MOVE_ALL') {
      return
    }
    let e = d3.event;
    console.log(e)
    for (let i = 0; i < self.rectData.length; i++) {
      self.rectangleElement
      .attr('x', self.rectData[i].x += e.dx )
      .attr('y', self.rectData[i].y += e.dy );
    }
    self.rectangleElement.style('cursor', 'move');
    updateRect(drawModel === 'MOVE_ALL');
    if (drawModel === 'MOVE_ALL') {
      // 同时要拖动人脸特征值的点
      // const rectWidth = self.rectangleElement.attr('width')
      // const rectHeight = self.rectangleElement.attr('height')
      // console.log('同时要拖动人脸特征值的点', e)
      const newTags = batchDragTagPoint({ dx: e.dx, dy: e.dy})
      // console.log('newTags---->', newTags)
      if (opts.onAllMove) {
        opts.onAllMove({ face: opts.face,
          landmark: newTags,
          // box: boxArr,
          box: [Number(self.rectangleElement.attr('x')), Number(self.rectangleElement.attr('y')),
            Number(self.rectangleElement.attr('x')) + Number(self.rectangleElement.attr('width')), Number(self.rectangleElement.attr('y')) + Number(self.rectangleElement.attr('height'))],
        })
      }
      // console.log('opts.onAllMove', opts.onAllMove)
    }
  }

  const dragR = d3.drag().on('drag', dragRect).on('end', function() {
    if (drawModel === 'MOVE_ALL') {
      setDrawModel('none')
    }
  });

  const dragC1 = d3.drag().on('drag', dragPoint1);
  const dragC2 = d3.drag().on('drag', dragPoint2);
  const dragC3 = d3.drag().on('drag', dragPoint3);
  const dragC4 = d3.drag().on('drag', dragPoint4);
  const dragFaceTag = d3.drag().on('drag', dragPointTag);

  // 增加框和四个角拖拽点的点元素
  function addElements(optData, faceId) {
    if (!window.faceList[faceId || opts.face]) {
      window.faceList[faceId || opts.face] = {}
    }
    self.rectangleElement = svg.select('g').append('rect').attr('stroke', editMode ? red : 'green').attr('stroke-width', '2px').attr('fill', 'none').attr('data-face', opts.face);
    // 左上角
    self.pointElement1 = svg.select('g').append('circle').attr('cursor', 'nwse-resize').attr('fill', red).attr('r', 3).attr('data-face', opts.face).attr('data-point', 0);
    // 右下角
    self.pointElement2 = svg.select('g').append('circle').attr('cursor', 'nwse-resize').attr('fill', red).attr('r', 3).attr('data-face', opts.face).attr('data-point', 1);
    // 右上角
    self.pointElement3 = svg.select('g').append('circle').attr('cursor', 'nesw-resize').attr('fill', red).attr('r', 3).attr('data-face', opts.face).attr('data-point', 2);
    // 左下角
    self.pointElement4 = svg.select('g').append('circle').attr('cursor', 'nesw-resize').attr('fill', red).attr('r', 3).attr('data-face', opts.face).attr('data-point', 3);
    if (optData) {
      updateRect(true)
    }
    self.rectangleElement.call(dragR).on('contextmenu', function() {
      console.log('----contextmenu------')
      // opts.onContextmenu(d3.event.clientY, d3.event.clientX, 'RECT')
    })
    self.pointElement1.call(dragC1)
    self.pointElement2.call(dragC2)
    self.pointElement3.call(dragC3)
    self.pointElement4.call(dragC4)
    window.faceList[faceId || opts.face].rect = self.rectangleElement;
    window.faceList[faceId || opts.face].point = [
      self.pointElement1, self.pointElement2, self.pointElement3, self.pointElement4
    ]
    window.faceList[faceId || opts.face].tag = []
  }

  /**
   * 批量拖动特征值的点，并且返回新的特征值
   * @param dx
   * @param dy
   * @returns {Array}
   */
  function batchDragTagPoint({dx, dy}) {
    console.log('画点', window.faceList)
    let resultPoints = [];
    CONSTANT.FACE_TAGS.forEach((tg, index) => {
      // console.log('FACE_TAGS', tg, index)
      if (window.faceList[opts.face] && window.faceList[opts.face].tag) {
        const nx = Number(window.faceList[opts.face].tag[tg].attr('cx')) + dx
        const ny = Number(window.faceList[opts.face].tag[tg].attr('cy')) + dy
        // console.log('框的位置', nx, ny)
        window.faceList[opts.face].tag[tg].attr('cx', nx).attr('cy', ny)
        resultPoints[index * 2] = nx;
        resultPoints[index * 2 + 1] = ny;
      }
    })
    console.log(resultPoints)
    if (resultPoints[0] <= 0) {
      resultPoints[0] = 0
    }
    if (resultPoints[1] <= 0) {
      resultPoints[1] = 0
    }
    return resultPoints
  }

  function addOrUpdateTagPoint({ x, y, pointType, faceId }, noPubEvent) {
    if (!faceId && !opts.face) {
      console.error('face参数未找到')
      return
    }
    const fb = window.faceList[faceId || opts.face]
    if (fb.tag[pointType]) {
      // 已经存在这个点，就更新
      fb.tag[pointType].attr('cx', x).attr('cy', y)
      if (opts.onTagPoinUpdate) {
        // 触发人脸特征点变更的回调函数
        opts.onTagPoinUpdate({ face: faceId || opts.face, x, y, pointType, action: 'UPDATE' })
      }
    } else {
      // 不存在就新增
      window.faceList[faceId || opts.face].tag[pointType] = svg.select('g').append('circle').attr('cursor', 'grab').attr('fill', (window.selectFace === faceId) ? red : 'green').attr('r', 3).attr('data-face', faceId || opts.face).attr('data-point-tag', pointType).attr('cx', x).attr('cy', y).call(dragFaceTag);
      if (noPubEvent) {
        return;
      }
      if (opts.onTagPoinUpdate) {
        // 触发人脸特征点变更的回调函数
        opts.onTagPoinUpdate({ face: faceId || opts.face, x, y, pointType, action: 'ADD' })
      }
    }
  }

  function dragPoint1() {
    let e = d3.event;
    let dx = self.pointElement1.attr('cx')
    if (dx <= 0) {
      dx = 0
      // return
    }
    let dy = self.pointElement1.attr('cy')
    if (dy <= 0) {
      dy = 0
      // return
    }
    self.pointElement1
      .attr('cx', function(d) { return d.x += e.dx })
      .attr('cy', function(d) { return d.y += e.dy });
    updateRect();
  }

  function dragPoint2() {
    let e = d3.event;
    let dx = self.pointElement2.attr('cx')
    if (dx >= size.width * size.orgScale) {
      dx = size.width * size.orgScale
      // return
    }
    let dy = self.pointElement2.attr('cy')
    if (dy >= size.height * size.orgScale) {
      dx = size.height * size.orgScale
      // return
    }
    self.pointElement2
      .attr('cx', self.rectData[1].x += e.dx)
      .attr('cy', self.rectData[1].y += e.dy);
    updateRect();
  }

  function dragPoint3() {
    let e = d3.event;
    let dx = self.pointElement3.attr('cx')
    if (dx >= size.width * size.orgScale) {
      dx = size.width * size.orgScale
      // return
    }
    let dy = self.pointElement3.attr('cy')
    if (dy <= 0) {
      dx = 0
      // return
    }
    self.pointElement3
      .attr('cx', self.rectData[1].x += e.dx)
      .attr('cy', self.rectData[0].y += e.dy);
    updateRect();
  }

  function dragPoint4() {
    let e = d3.event;
    let dx = self.pointElement4.attr('cx')
    console.log('第4个点x 坐标', dx)
    if (dx <= 0) {
      dx = 0
      // return
    }
    let dy = self.pointElement4.attr('cy')
    if (dy >= size.height * size.orgScale) {
      dx = size.height * size.orgScale
      // return
    }
    self.pointElement4
      .attr('cx', self.rectData[0].x += e.dx)
      .attr('cy', self.rectData[1].y += e.dy);
    updateRect();
  }
  // 人脸标签点的事件监听
  function dragPointTag() {
    console.log('人脸标签点 ----', d3.event)
    if (d3.event.x <= 0) {
      d3.event.x = 0
    }
    if (d3.event.x >= size.width * size.orgScale) {
      d3.event.x = size.width * size.orgScale
    }
    if (d3.event.y <= 0) {
      d3.event.y = 0
    }
    if (d3.event.y >= size.height * size.orgScale) {
      d3.event.y = size.height * size.orgScale
    }
    const dm = window.faceList[window.selectFace || opts.face].drawModel;
    console.log('drawModel--->', dm)
    if (!editMode || dm === 'MOVE_ALL') {
      // 非编辑模式或者全局拖动模式下，不让拖动人脸标签点
      return
    }
    addOrUpdateTagPoint({ x: d3.event.x, y: d3.event.y, pointType: d3.select(this).attr('data-point-tag'), faceId: window.selectFace })
  }
  // 设置人脸框上四个点是否显示
  function setRectPointMode(display) {
    for (let i = 0; i < 4; i++) {
      selectCircle(i).style('display', display ? 'block' : 'none')
    }
  }
  // 设置人脸标签点的编辑属性
  function setFaceTagPointMode(edit,faceId) {
    if (!window.faceList || !window.faceList[faceId || opts.face]) {
      return
    }
    // console.log('------>faceid----', window.faceList, faceId, opts.face)
    for (let p in window.faceList[faceId || opts.face].tag) {
      window.faceList[faceId || opts.face].tag[p].attr('stroke', edit ? red : 'green').attr('fill', edit ? red : 'green').attr('cursor', edit ? 'grab' : 'auto');
    }

  }
  // 设置人脸框的编辑模式
  function setFaceRectMode(edit) {
    self.rectangleElement.attr('stroke', edit ? red : 'green')
  }
  // 设置编辑模式
  function setEdit(edit = true, faceId) {
    editMode = edit
    isDrag = true
    // 设置框的编辑样式
    setRectPointMode(edit)
    // 设置人脸标签的编辑样式
    setFaceTagPointMode(edit, faceId)
    // 设置人脸框的编辑模式
    setFaceRectMode(edit)
  }
  // 外部直接新增一个框
  function addRect({ x, y, width, height }) {
    console.log('外部直接新增一个框',  x, y, width, height)
    self.rectData = [{ x, y }, { x: x + width, y: y + height }];
    addElements(true)
  }
  // 设置为全局拖动模式，框和脸同时被拖动。 此时周围的四个点不被拖动
  function dragAllModel() {
    self.rectangleElement.attr('fill', 'rgba(0,0,0,0.3)')
    setRectPointMode(false)
  }
  // 设置画笔模式 drawModel: moveAll, rect, eye_left, eye_right, nose', mouth_left, mouth_right
  function setDrawModel(dModel, faceId) {
    console.log('dModel--', dModel)
    drawModel = dModel
    window.faceList[faceId || opts.face].drawModel = dModel
    console.log('drawModel---', drawModel)
    if (dModel === 'MOVE_ALL') {
      // 设置为全局拖动模式
      dragAllModel()
      return
    }
    // 设置为正常的模式
    self.rectangleElement.attr('fill', 'none')
    setRectPointMode(true)
  }

  /**
   * 删除人脸框
   */
  function delRect() {
    self.rectangleElement.remove()
    self.pointElement1.remove()
    self.pointElement2.remove()
    self.pointElement3.remove()
    self.pointElement4.remove()
  }

  /**
   * 删除元素
   * @param type 'RECT'，'EYE_LEFT', 'EYE_RIGHT', 'NOSE', 'MOUTH_LEFT', 'MOUTH_RIGHT'
   */
  function removeTag(type, faceId) {
    if (type === 'RECT') {
      delRect()
    } else {
      　if (window.faceList[faceId || opts.face].tag[type]) {
         window.faceList[faceId || opts.face].tag[type].remove();
         delete window.faceList[faceId || opts.face].tag[type]
         if (opts.onTagPoinUpdate) {
           // 触发人脸特征点变更的回调函数
           opts.onTagPoinUpdate({ face: faceId || opts.face, pointType: type, action: 'DELETE' })
         }
       }
    }
  }
  return {
    setEdit, // 设置编辑模式
    addRect,
    addPoint: addOrUpdateTagPoint,
    setDrawModel, // 设置画的模式
    removeTag, // 删除标签
  }
}
export default Rectangle;
