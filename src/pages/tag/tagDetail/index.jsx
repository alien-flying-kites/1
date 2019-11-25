import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Tabs, Button, Breadcrumb, Card, Icon } from 'antd';
import { connect } from 'dva';
import styles from './style.less';
import router from 'umi/router';
import CONSTANTS from '../../../utils/constant';
import withRouter from 'umi/withRouter';

const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}

@connect(({ tagDetail, loading }) => ({
  tagDetail,
  loading: loading.effects['tagDetail/getSingleTask'],
}))

class TagDetailHomePage extends Component {
  static defaultProps = {
    className: '',
    defaultActiveKey: '',
    onTabChange: () => {},
    onSubmit: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      tabIndex: '',
      isFolder: false,
      tasktname: '123',
    };
  }

  componentWillMount () {
    console.log('****------componentWillMount--------***')
    const { dispatch, location } = this.props;
    console.log('****------componentWillMount--------***', location)
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
    let wihtTab = false;
    if (location.pathname.indexOf('/tag/tagDetail/detailPage/') !== -1) {
      wihtTab = true
    }
    dispatch({
      type: 'tagDetail/setModel',
      payload: wihtTab,
    });
  }

  componentDidMount () {
    const isfolder = localStorage.getItem(CONSTANTS.TRAINING_ISFOLDER)
    const itemtaskname = localStorage.getItem(CONSTANTS.TRAINING_TASKNAME)
    console.log(isfolder)
    if (isfolder === 'false') {
      this.setState({
        isFolder: false,
        tasktname: itemtaskname,
      })
    } else {
      this.setState({
        isFolder: true,
        tasktname: itemtaskname,
      })
    }
  }


  handleSubmit = () => {
  };

/**
 *  handleTabChange = key => {
    const { match, oasMerchantAddOrUpdate } = this.props;
    const url = match.url === '/' ? '' : match.url;
    console.log('key----->', key);
    switch (key) {
      case 'marked':
        router.push(`${url}/markedPage`);
        break;

      case 'unmarked':
        router.push(`${url}/markedPage`);
        break;

      case 'washed':
        router.push(`${url}/markedPage`);
        break;

      default:
        break;
    }
  };
 */

  onSwitch = type => {
    const { isFolder, tabIndex } = this.state
    console.log('isFolder =======', isFolder)
    this.setState(
      {
        tabIndex: type,
      },
      () => {
        const { onTabChange, match } = this.props;
        if (onTabChange) {
          onTabChange(type);
          console.log(type)
          const url = match.url === '/' ? '' : match.url;
          // switch (type) {
          //   case 'marked':
          //     router.push(`${url}/markedPage`);
          //     break;
          //   case 'unmarked':
          //     router.push(`${url}/unmarkedPage`);
          //     break;
          //   case 'washed':
          //     router.push(`${url}/washedPage`);
          //     break;
          //   default:
          //     break;
          // }
          if (type === 'marked') {
            if (isFolder) {
              router.push('/tag/tagDetail/markedFolderPage');
            } else {
              router.push(`${url}/markedPage`);
            }
          }
          if (type === 'unmarked') {
            router.push(`${url}/unmarkedPage`);
          }
          if (type === 'washed') {
            router.push(`${url}/washedPage`);
          }
        }
      },
    );
  };

  getTabKey = () => {
    const { match, location } = this.props;
    const url = match.path === '/' ? '' : match.path;
    const tabKey = location.pathname.replace(`${url}/`, '');

    if (tabKey && tabKey !== '/') {
      return tabKey;
    }

    return 'articles';
  };

  goToList = () => {
    router.push('/tag');
  }

  goback = () => {
    const { dispatch, history } = this.props;
    dispatch({
      type: 'tagDetail/setModel',
      payload: false,
    });
    history.goBack()
  }

  renderMarkPage = (children) => {
    return (
      <div style={{ background: '#FFFFFF' }}>
        <Button type="link" onClick={this.goback}>
          <Icon type="left" />
          返回
        </Button>
        {children}
      </div>
    )
  }

  render() {
    // const tabList = [
    //   {
    //     key: 'marked',
    //     tab: '已标注',
    //   },
    //   {
    //     key: 'unmarked',
    //     tab: '未标注',
    //   },
    //   {
    //     key: 'washed',
    //     tab: '以清洗',
    //   },
    // ];
    const {
      tagDetail: { singleTask, markModel },
      loading,
      children,
    } = this.props;
    const { tasktname } = this.state
    const markedText = '已标注'
    const unmarkedText = '未标注'
    const washedText = '已清洗'
    // console.log(singleTask)
    let markedNum = 0
    let unmarkedNum = 0
    let washedNum = 0
    if (singleTask && singleTask !== 'undefined') {
      markedNum = singleTask.islabel
      unmarkedNum = singleTask.imgnumber - singleTask.islabel - singleTask.isclean
      washedNum = singleTask.isclean
    }
    if (markModel) {
      return this.renderMarkPage(children)
    }
    return (
      <PageHeaderWrapper>
        {/* <div className={styles.contentWarp}> */}
          <Card bordered={false} style={{ background: '#fff', margin: '24px' }}>
            <div className={styles.tableList}>
              <Tabs defaultActiveKey="marked" onChange={this.onSwitch} loading={loading}>
                <TabPane tab={markedText + markedNum} key="marked">
                </TabPane>
                <TabPane tab={unmarkedText + unmarkedNum} key="unmarked" >
                </TabPane>
                <TabPane tab={washedText + washedNum} key="washed">
                </TabPane>
              </Tabs>
              <>
              {children}
              </>
            </div>
          </Card>
        {/* </div> */}
      </PageHeaderWrapper>
    );
  }
}

export default withRouter(TagDetailHomePage);
