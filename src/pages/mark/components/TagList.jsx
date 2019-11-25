import React from 'react';
import { Card, Tag, Input, Tooltip, Icon, Badge } from 'antd';
import CONSTANT from '@/utils/constant'
const actColor = '#2db7f5';

const TagList = (props) => {
  const { faceInfo, removeTag, setDrawModel } = props;
  let leftEyeStyle = {
    borderStyle: 'dashed',
  },
    rightEyeStyle = {
      borderStyle: 'dashed',
    },
    noseStyle = { height: 22, borderStyle: 'dashed', },
    leftMoseStyle = { borderStyle: 'dashed' },
    rightMoseStyle = { borderStyle: 'dashed' } ;
    let leftEyeProps = {}, rightEyeProps = {}, noseProps = {}, leftMoseProps = {}, rightMoseProps = {};

    if (faceInfo && faceInfo.landmark && faceInfo.landmark.length>0) {
      if (faceInfo.landmark[0] || faceInfo.landmark[1]) {
        // 存在第一个点
        delete leftEyeStyle.borderStyle
        leftEyeProps.closable = true
      }
      if (faceInfo.landmark[2] || faceInfo.landmark[3]) {
        // 存在第二个点
        delete rightEyeStyle.borderStyle
        rightEyeProps.closable = true
      }
      if (faceInfo.landmark[4] || faceInfo.landmark[5]) {
        // 存在第三个点
        delete noseStyle.borderStyle
        noseProps.closable = true
      }
      if (faceInfo.landmark[6] || faceInfo.landmark[7]) {
        // 存在第四个点
        delete leftMoseStyle.borderStyle
        leftMoseProps.closable = true
      }
      if (faceInfo.landmark[8] || faceInfo.landmark[9]) {
        // 存在第四个点
        delete rightMoseStyle.borderStyle
        rightMoseProps.closable = true
      }
    }
  return (
    <Card title="脸部标签" style={props.style} bodyStyle={{ height: 195, padding: 12 }}>
      <div style={{ background: 'url(/photo-face-detection.png)', width: '100%', height: '100%', backgroundSize: '100% auto', backgroundRepeat: 'no-repeat', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <Tag onClick={() => {
            if (!leftEyeProps.closable) {
              setDrawModel(faceInfo.id, CONSTANT.FACE_TAGS[0])
            }
          }} onClose={(e) => { e.preventDefault(); removeTag(faceInfo.id, CONSTANT.FACE_TAGS[0]) }} {...leftEyeProps} style={leftEyeStyle}>左眼</Tag>
          <Tag onClick={() => {
            if (!rightEyeProps.closable) {
              setDrawModel(faceInfo.id, CONSTANT.FACE_TAGS[1])
            }
          }} onClose={(e) => { e.preventDefault(); removeTag(faceInfo.id, CONSTANT.FACE_TAGS[1]) }} {...rightEyeProps} style={rightEyeStyle}>右眼</Tag>
        </div>
        <div style={{
          height: 57,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Tag onClick={() => {
            if (!noseProps.closable) {
              setDrawModel(faceInfo.id, CONSTANT.FACE_TAGS[2])
            }
          }} onClose={(e) => { e.preventDefault(); removeTag(faceInfo.id, CONSTANT.FACE_TAGS[2]) }} {...noseProps} style={noseStyle}>鼻尖</Tag>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
        }}>
          <Tag onClick={() => {
            if (!leftMoseProps.closable) {
              setDrawModel(faceInfo.id, CONSTANT.FACE_TAGS[3])
            }
          }} onClose={(e) => { e.preventDefault(); removeTag(faceInfo.id, CONSTANT.FACE_TAGS[3]) }} {...leftMoseProps} style={leftMoseStyle}>嘴巴左侧</Tag>
          <Tag onClick={() => {
            if (!rightMoseProps.closable) {
              setDrawModel(faceInfo.id, CONSTANT.FACE_TAGS[4])
            }
          }} onClose={(e) => { e.preventDefault(); removeTag(faceInfo.id, CONSTANT.FACE_TAGS[4]) }} {...rightMoseProps} style={rightMoseStyle}>嘴巴右侧</Tag>
        </div>
      </div>
    </Card>
  )
}
export default TagList;
