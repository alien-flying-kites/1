import React, { Component, Fragment } from 'react';
import { Card, Row, Col, Checkbox, Button, Select, Radio, List, Modal, message, Form, Result } from 'antd';
import router from 'umi/router';
import Swiper from 'swiper/js/swiper'
import 'swiper/css/swiper.min.css'
import { connect } from 'dva';
import CONSTANTS from '../../../../utils/constant';
import { findIndex, find, throttle, cloneDeep } from 'lodash'
import styles from './style.less';
import Mark from '../../../mark'
import { relative } from 'path';
import md5 from 'md5'

const { Option } = Select;
const { confirm } = Modal;
const FormItem = Form.Item;

@connect(({ tagDetail, tag, loading }) => ({
  tagDetail,
  tag,
  loading: loading.effects['tagDetail/getTaskimgList'],
}))

class DetailPage extends Component {
  state = {
    data: null,
    currentImgid: '', // 当前图片id
    currentImgdata: {}, // 当前图片原始数据
    updateImgdata: {}, // 当前图片更新后的数据
    currentpageIndex: null,
    activeIndex: 1,
    loadingMarkInfo: true, // 获取图片的标注信息中
    // modalVisible: false,
    dataArr: [], // slide列表数组
    maxPageIndex: null, // 当前数组最大页码
    minPageIndex: null, // 当前数组最小页面
    totalNum: null, // 总个数
    loadingDataArr: false,
    initialData: '', // 当前图片信息md5之后
  }

  componentWillMount() {
    const param = this.props.location
    if (!param.params) {
      return
    }
    const md5Data = md5(JSON.stringify(param.params.face))
    console.log('------md5-----', md5Data)
    const data = cloneDeep(param.params)
    this.setState({
      data: param.params,
      currentImgdata: param.params,
      updateImgdata: data,
      currentImgid: param.params.imgid,
      currentpageIndex: param.params.currentPage - 1,
      maxPageIndex: param.params.currentPage - 1,
      minPageIndex: param.params.currentPage - 1,
      activeIndex: param.params.index,
      loadingMarkInfo: false,
      saveOnSwitch: true,
      initialData: md5Data,
    }, () => {
      this.slideInit()
    })
  }

  componentDidMount () {
    const param = this.props.location
    if (!param.params) {
      return
    }
    // console.log(this.props.location.params.index)
    const self = this
    const swiperOption = new Swiper('.swiper-container', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      activeIndex: self.props.location.params.index,
      initialSlide: self.props.location.params.index,
      // activeIndex: 0,
      // initialSlide: 0,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: '.swiper-button-next',
        preEl: '.swiper-button-prev',
      },
    })
    this.mySwiper = swiperOption
    // console.log(this.state.activeIndex)
    setTimeout(() => {
      this.mySwiper.slideToLoop(this.state.activeIndex, 500, false);
    }, 500)
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {
      return false
    };
    const { dispatch } = this.props
    dispatch({
      type: 'tagDetail/resettaskImgList',
    })
  }

  /**
   *  获取slide图片-调取接口
   */
  slideInit = () => {
    const { data, currentpageIndex } = this.state
    const { dispatch } = this.props
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const params = {
      limit: data.limit,
      pageindex: currentpageIndex,
      taskid: itemtaskid,
      islabel: data.islabel,
      isclean: data.isclean,
    }
    console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: params,
    }).then(res => {
      this.setState({
        dataArr: res.list,
        totalNum: res.totalnum,
        loadingDataArr: true,
      })
    });
  }

  /**
   * slide 切换
   */
  onSwitch = (record, index) => {
    console.log(record, index)
    const { saveOnSwitch } = this.state
    console.log('---------setSaveOnSwitch---------', saveOnSwitch)
    const isUpdate = this.compareIsUpdate()
    // console.log('------isUpdate-----', isUpdate)
    if (saveOnSwitch && !isUpdate) {
      this.save()
    }
    this.setState({
      loadingMarkInfo: true,
    }, () => {
      this.setState({
        currentImgdata: record,
        updateImgdata: record,
        currentImgid: record.imgid,
        activeIndex: index,
        loadingMarkInfo: false,
      })
    })
  }

  /**
   * 清洗
   */
  handleClean = item => {
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const self = this;
    confirm({
      title: '确定清洗图片?',
      content: `图片id: ${item.imgid}`,
      cancelText: '取消',
      okText: '确认',
      onOk() {
        const params = {
          taskid: itemtaskid,
          isclean: 1,
          cleanids: item.imgid,
        }
        console.log(params)
        const formData = new FormData()
        formData.append('taskid', params.taskid)
        formData.append('isclean', params.isclean)
        formData.append('cleanids', params.cleanids)
        dispatch({
          type: 'tagDetail/cleanLabelTaskid',
          payload: formData,
        }).then(res => {
          // console.log(res)
          if (res && res.code === 200) {
            self.getSingletask()
            self.slideInit()
          }
        })
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  getSingletask = () => {
    const { dispatch } = this.props;
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const params = {
      taskid: itemtaskid,
    }
    dispatch({
      type: 'tagDetail/getSingleTask',
      payload: {
        ...params,
      },
    });
  }

  /**
   * 调取图片列表接口
   */
  getImgList = (item, direction) => {
    console.log('----页码---->', item)
    const { dispatch } = this.props
    const { data } = this.state
    const itemtaskid = localStorage.getItem(CONSTANTS.TRAINING_TASKID)
    const params = {
      limit: data.limit,
      pageindex: item,
      taskid: itemtaskid,
      islabel: data.islabel,
      isclean: data.isclean,
    }
    console.log(params)
    dispatch({
      type: 'tagDetail/getTaskimgList',
      payload: params,
    }).then(res => {
      console.log(res)
      if (direction === 'next') {
        const newArr = this.state.dataArr.concat(res.list)
        this.setState({
          dataArr: newArr,
        })
      }
      if (direction === 'pre') {
        const newArr = res.list.concat(this.state.dataArr)
        this.setState({
          dataArr: newArr,
        })
      }
    })
  }

  /**
   * slide滑动 向前
   */
  handleSlidePre = () => {
    const { tagDetail: { taskImgList } } = this.props
    const { minPageIndex, activeIndex, data } = this.state
    if (minPageIndex - 1 < 0) {
      return message.error('已没有更多数据')
    }
    this.getImgList(minPageIndex - 1, 'pre')
    setTimeout(() => {
      this.setState({
        minPageIndex: minPageIndex - 1,
        loadingMarkInfo: true,
        loadingDataArr: true,
      })
      // console.log(taskImgList)
      if (taskImgList) {
        const { dataArr } = this.state
        const count = activeIndex + data.limit - 1
        // console.log(count)
        // this.mySwiper.initialSlide = count - 1
        this.mySwiper.slideToLoop(count, 1000, false);
        this.setState({
          currentImgid: dataArr[count].imgid,
          currentImgdata: dataArr[count],
          updateImgdata: dataArr[count],
          activeIndex: count,
          loadingMarkInfo: false,
          loadingDataArr: true,
        })
      }
    }, 1000)
  }

  /**
   * slide滑动 向后
   */
  handleSlideNext = () => {
    const { tagDetail: { taskImgList } } = this.props
    const { maxPageIndex, data, totalNum } = this.state
    const totalPageNum = Math.ceil(totalNum / data.limit)
    if (maxPageIndex + 1 > totalPageNum - 1) {
      return message.error('已没有更多数据')
    }
    // console.log('----maxPageIndex----', maxPageIndex)
    this.getImgList(maxPageIndex + 1, 'next')
    setTimeout(() => {
      this.setState({
        maxPageIndex: maxPageIndex + 1,
        loadingMarkInfo: true,
        loadingDataArr: true,
      })
      if (taskImgList) {
        const { dataArr } = this.state
        // console.log(dataArr)
         const startindex = (dataArr.length) - (data.limit)
        // this.mySwiper.initialSlide = 0
        this.mySwiper.slideToLoop(startindex, 1000, false);
        this.setState({
          currentImgid: dataArr[startindex].imgid,
          currentImgdata: dataArr[startindex],
          updateImgdata: dataArr[startindex],
          activeIndex: startindex,
          loadingMarkInfo: false,
          loadingDataArr: true,
        })
      }
    }, 1000)
  }

  /**
   * 点击按钮向前-上一张
   */
  handleCliclPre = () => {
    const { saveOnSwitch } = this.state
    // console.log(this.mySwiper)
    this.mySwiper.slidePrev()
    const { tagDetail: { taskImgList }, loading } = this.props
    const { activeIndex, dataArr } = this.state
    // console.log(activeIndex)
    let datalist = []
    if (taskImgList && taskImgList.list) {
      datalist = taskImgList.list
    }
    // currentImgdata
    if (activeIndex - 1 < 0) {
      console.log('要翻上一页了')
      const isUpdate = this.compareIsUpdate()
      // console.log('------isUpdate-----', isUpdate)
      if (saveOnSwitch && !isUpdate) {
        this.save()
      }
      this.handleSlidePre()
      return
    }
    const isUpdate = this.compareIsUpdate()
    // console.log('------isUpdate-----', isUpdate)
    if (saveOnSwitch && !isUpdate) {
      this.save()
    }
    this.setState({
      loadingMarkInfo: true,
    }, () => {
      this.setState({
        currentImgdata: dataArr[activeIndex - 1],
        updateImgdata: dataArr[activeIndex - 1],
        activeIndex: activeIndex - 1,
        currentImgid: dataArr[activeIndex - 1].imgid,
        loadingMarkInfo: false,
      })
    })
  }

  /**
   * 点击按钮向后-下一张
   */
  handleCliclNext = () => {
    this.mySwiper.slideNext()
    const { tagDetail: { taskImgList }, loading } = this.props
    const { activeIndex, dataArr, saveOnSwitch } = this.state
    // console.log(activeIndex, dataArr)
    if (activeIndex + 1 > dataArr.length - 1) {
      console.log('要翻下一页了')
      const isUpdate = this.compareIsUpdate()
      // console.log('------isUpdate-----', isUpdate)
      if (saveOnSwitch && !isUpdate) {
        this.save()
      }
      this.handleSlideNext()
      return
    }
    const isUpdate = this.compareIsUpdate()
    // console.log('------isUpdate-----', isUpdate)
    if (saveOnSwitch && !isUpdate) {
      this.save()
    }
    this.setState({
      loadingMarkInfo: true,
    }, () => {
      this.setState({
        currentImgdata: dataArr[activeIndex + 1],
        updateImgdata: dataArr[activeIndex + 1],
        activeIndex: activeIndex + 1,
        currentImgid: dataArr[activeIndex + 1].imgid,
        loadingMarkInfo: false,
      })
    })
  }

  /**
   * 获取更细信息
   */
  onUpdate = e => {
    console.log('onUpdate---', e)
    const { updateImgdata } = this.state
    // console.log(updateImgdata)
    if (e.action === 'DELETE') {
      const exitIndex = findIndex(updateImgdata.face, (item) => item.id === e.face);
      // console.log('exitIndex--->', exitIndex)
      if (e.scope === 'TAG') {
        if (exitIndex !== -1) {
          const markIndex = CONSTANTS.FACE_TAGS.indexOf(e.value)
          // console.log('markIndex=======>', markIndex)
          updateImgdata.face[exitIndex].landmark[markIndex * 2] = 0;
          updateImgdata.face[exitIndex].landmark[markIndex * 2 + 1] = 0;
          this.setState({
            updateImgdata,
          })
        }
      }
      if (e.scope === 'ALL') {
        if (exitIndex !== -1) {
          updateImgdata.face.splice(exitIndex, 1);
          this.setState({
            updateImgdata,
          })
        }
      }
    }
    if (e.action === 'ADD') {
      if (e.scope === 'ALL') {
        const newface = cloneDeep(e.value)
        newface.gender = 0
        newface.age = 0
        newface.id = e.value.id
        newface.label = e.value.label
        const newlanmark = []
        e.value.landmark.map(item => {
          newlanmark.push(item / (e.size.orgScale))
        })
        newface.landmark = newlanmark
        const newbox = []
        e.value.box.map(item => {
          newbox.push(Number(item) / (e.size.orgScale))
        })
        newface.box = newbox
        // console.log('-----newface----', newface)
        updateImgdata.face.push(newface)
        this.setState({
          updateImgdata,
        })
      }
      if (e.scope === 'TAG') {
        const exitIndex = findIndex(updateImgdata.face, (item) => item.id === e.face);
        // console.log('exitIndex--->', exitIndex)
        if (exitIndex !== -1) {
          const markIndex = CONSTANTS.FACE_TAGS.indexOf(e.value.pointType)
          // console.log('markIndex=======>', markIndex)
          updateImgdata.face[exitIndex].landmark[markIndex * 2] = (e.value.x) / (e.size.orgScale);
          updateImgdata.face[exitIndex].landmark[markIndex * 2 + 1] = (e.value.y) / (e.size.orgScale);
          this.setState({
            updateImgdata,
          })
        }
        this.setState({
          updateImgdata,
        })
      }
    }
    if (e.action === 'UPDATE') {
      if (e.scope === 'LABEL') {
        const exitIndex = findIndex(updateImgdata.face, (item) => item.id === e.face);
        if (exitIndex !== -1) {
          updateImgdata.face[exitIndex].label = e.value
        }
      }
      if (e.scope === 'RECT') {
        const exitIndex = findIndex(updateImgdata.face, (item) => item.id === e.face);
        // console.log('exitIndex--->', exitIndex)
        if (exitIndex !== -1) {
          const newArr = []
          newArr[0] = (e.value[0].x) / (e.size.orgScale)
          newArr[1] = (e.value[0].y) / (e.size.orgScale)
          newArr[2] = (e.value[1].x) / (e.size.orgScale)
          newArr[3] = (e.value[1].y) / (e.size.orgScale)
          // console.log('------>', newArr)
          updateImgdata.face[exitIndex].box = newArr;
          this.setState({
            updateImgdata,
          })
        }
      }
      if (e.scope === 'TAG') {
        // console.log('222222222222222222222222222222')
        const exitIndex = findIndex(updateImgdata.face, (item) => item.id === e.face);
        // console.log('exitIndex--->', exitIndex)
        if (exitIndex !== -1) {
          const markIndex = CONSTANTS.FACE_TAGS.indexOf(e.value.pointType)
          // console.log('markIndex=======>', markIndex)
          updateImgdata.face[exitIndex].landmark[markIndex * 2] = (e.value.x) / (e.size.orgScale);
          updateImgdata.face[exitIndex].landmark[markIndex * 2 + 1] = (e.value.y) / (e.size.orgScale);
          this.setState({
            updateImgdata,
          })
        }
      }
      if (e.scope === 'ALL') {
        const exitIndex = findIndex(updateImgdata.face, (item) => item.id === e.face);
        if (exitIndex !== -1) {
          const newface = cloneDeep(e.value)
          newface.gender = 0
          newface.age = 0
          newface.id = e.value.face
          newface.label = updateImgdata.face[exitIndex].label
          const newlanmark = []
          e.value.landmark.map(item => {
            newlanmark.push(item / (e.size.orgScale))
          })
          newface.landmark = newlanmark
          const newbox = []
          e.value.box.map(item => {
            newbox.push(Number(item) / (e.size.orgScale))
          })
          newface.box = newbox
          delete newface.face
          // console.log('-----newface----', newface)
          updateImgdata.face[exitIndex] = newface
          this.setState({
            updateImgdata,
          })
        }
      }
    }
    if (e.action === 'SETDATA') {
      // 直接替换全局的数据
      console.log('---- to set data -----')
      this.setState({
        updateImgdata: e.value,
      })
    }
  }

  setSaveOnSwitch = (flag, e) => {
    console.log('---------------->', flag)
    this.setState({
      saveOnSwitch: flag,
    })
  }

  /**
   * updateImgdata 当前图片更新后的数据
   * dataArr 当前slide列表数组
   * currentImgdata 当前图片的原始数据
   */
  compareIsUpdate = () => {
    const { initialData, currentImgdata } = this.state
    console.log('md5-----', initialData)
    const currentMd5 = md5(JSON.stringify(currentImgdata.face))
    return currentMd5 === initialData
  }

  save = () => {
    // console.log('123')
    // console.log(e)
    const { dispatch } = this.props
    const { updateImgdata, dataArr } = this.state
    console.log('保存数据', updateImgdata)
    dispatch({
      type: 'tagDetail/save',
      payload: {
        ...updateImgdata,
      },
    }).then(res => {
      if (res && res.code === 200) {
        const exitIndex = findIndex(dataArr, (item) => item.imgid === updateImgdata.imgid);
        console.log(exitIndex)
        dataArr[exitIndex] = updateImgdata
        this.setState({
          dataArr,
        })
        // message.success('保存成功!')
        // this.slideInit()
      }
    });
  }

  renderLoading = () => {
    return <div> loading </div>
  }

  renderNullImg = () => {
    return (
      <Result
        status="404"
        title="404"
        subTitle="图片信息未找到."
        style={{ height: 'calc( 100vh - 144px )' }}
      />
    )
  }

  /**
   * 面板初始化完毕后的返回方法
   **/
  methodCallback = (markMethods) => {
    console.log('methodCallback---->', markMethods)
    this.markMethods = markMethods
  }

  render() {
    const { data, currentImgid, currentImgdata, loadingMarkInfo, dataArr, loadingDataArr } = this.state
    if (!data) {
      return this.renderNullImg()
    }
    const { tagDetail: { taskImgList }, loading } = this.props
    let datalist = []
    if (taskImgList && taskImgList.list) {
      datalist = taskImgList.list
    }
    console.log('=======================dataArr =========', dataArr)
    const slide = dataArr.map((item, index) => (
      <div className="swiper-slide" key={item.imgid} data-id={index} style={{ width: 70, height: 50, overflow: 'hidden' }}
       >
         <div className={currentImgid === item.imgid ?
           styles.slideimgBoxFocus : styles.slideimgBox}>
             {/* <span className={styles.cleanBtn} onClick={() => this.handleClean(item)}>x</span> */}
            <img alt="face" src={item.imgpath}
            className={styles.slideimg} onClick={ () => this.onSwitch(item, index)}/>
         </div>
        {/* {this.state.currentImgid === item.imgid ?
         <div className={styles.triangleTop}></div> : null} */}
      </div>
    ));
    return (
      <Fragment>
        <div style={{ height: 50, width: '100%', position: 'relative' }}>
          <div className="swiper-container" style={{ width: '80%', marginLeft: '10%' }}>
            <div className="swiper-wrapper">
              {loadingDataArr ? slide : null}
            </div>
          </div>
          {/* <div className="swiper-button-prev"></div>
          <div className="swiper-button-next"></div> */}
          <div className={styles.slidepre}>
            <Button type="dashed" icon="left" onClick={throttle(this.handleCliclPre, 300)}></Button>
          </div>
          <div className={styles.slideNext}>
            <Button type="dashed" icon="right" onClick={throttle(this.handleCliclNext, 300)}></Button>
          </div>
        </div>
        <div className={styles.imgInfo}>
          {/* <MarkDetail data={currentImgdata}></MarkDetail> */}
          {/* <img alt="face" src={currentImgdata.imgpath}/> */}
          {loadingMarkInfo ? this.renderLoading() : <Mark data={currentImgdata} methodCallback={this.methodCallback} onUpdate={throttle(this.onUpdate, 200)} height="calc( 100vh - 186px )" faceHeight="calc( 100vh - 609px )" save={this.save} setSaveOnSwitch={this.setSaveOnSwitch} saveOnSwitch={this.state.saveOnSwitch} handleCliclPre={throttle(this.handleCliclPre, 300)}
          handleCliclNext={throttle(this.handleCliclNext, 300)}/>}
        </div>
      </Fragment>
    )
  }
}

const WarpForm = Form.create({
  })(DetailPage);
  export default WarpForm;
