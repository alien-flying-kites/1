import { Button, Icon, Tabs, Typography, Row, Col } from 'antd'
import { connect } from 'dva'
import styles from '@/pages/training/style.less'
import VersionIntroduce from './VersionIntroduce'
import Dataset from './Dataset'
import Release from './Release'
const { TabPane } = Tabs
const { Title } = Typography

const ProjectDetail = props => {
  const { 
    switchTab,
    delProject,
    modifyProject,
    project,
    enter,
    run,
    stop,
  } = props
  const projectInfo = project || JSON.parse(localStorage.getItem('proDetail'))
  const { projectname, projectid, missionname, scene, status, version, datasets, env, isopen, updatetime } = projectInfo
  return (
    <div className={styles.detailContainer}>
     <section className={styles.detailHeader}>
      <Title level={2}>{projectname}</Title>
      <p>{scene?'音频':'图像'}类型模型：{missionname}</p>
      <Row className={styles.bottom}>
        <Col span={12}>
          <span>
            <Icon type="link" /> {env}
          </span>
          <span>
            <Icon type={isopen?"eye":"eye-invisible"} /> {isopen?'公开':'个人'}
          </span>
          <span>{updatetime}</span>
        </Col>
        <Col span={12} className={styles.bottomRight}>
          {/* <Button type="link" onClick={() => delProject()}>删除</Button>
          <Button type="link" onClick={() => modifyProject()}>修改</Button>
          <Button type="link" onClick={() => modifyProject()}>设为公开</Button> */}
        </Col>
      </Row>
     </section>
     <div className={styles.rightBtnBox}>
      {(status < 2 || status == 3 || status == 5) ? 
        <Button type="primary" onClick={() => run()}>运行</Button> : null
      }
      {status == 2 ? 
        <>
          <Button type="primary" onClick={() => enter(projectid)}>进入</Button>
          <Button type="dash" onClick={() => stop(projectid)}>停止</Button>
        </>
        : null
      }
     </div>
     <Tabs onChange={key => switchTab(key, projectid)} type="card">
      <TabPane tab="版本介绍" key="1">
        <VersionIntroduce {...props} />
      </TabPane>
      <TabPane tab="数据集" key="2">
        <Dataset {...props} datasets={datasets}/>
      </TabPane>
      <TabPane tab="发布服务" key="3">
        <Release {...props} project={projectInfo}/>
      </TabPane>
    </Tabs>
    </div>
  );
}

export default connect()(ProjectDetail)
