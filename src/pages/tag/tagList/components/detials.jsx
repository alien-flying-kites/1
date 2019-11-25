import {
  Button,
  Card,
  Table,
  Tag,
  Drawer,
  Tabs,
  Divider,
  Descriptions,
  Badge,
  Typography,
} from 'antd';
import React, { Component, Fragment } from 'react';
import router from 'umi/router';
import styles from '../../addOrUpdate/serviceConfig/style.less';
import { connect } from 'dva';

const { Paragraph } = Typography;
const { TabPane } = Tabs;

const testData = {
  id: 'fake-list-0',
  title: '人脸识别服务',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png',
  status: 'active',
  version: 'v1.2.6',
  hasNewVersion: true,
  expiryDate: '2023-05-26',
  updatedAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).getTime(),
  createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).getTime(),
};
@connect(({ oasMerchant, loading }) => ({
  oasMerchant,
  loading: loading.models.oasMerchant,
}))
class Detials extends Component {
  /* componentDidMount() {
    const { dispatch } = this.props;
    const { page } = this.state;
    dispatch({
      type: 'oasMerchant/detail',
      payload: {
      },
    });
  } */

  goEditBasci = () => {
    router.push('/userType/merchant/addOrUpdate/add');
  };

  goEditApp = () => {
    router.push('/userType/merchant/addOrUpdate/applicationsConfig');
  };

  // eslint-disable-next-line class-methods-use-this
  serviceCard(item) {
    return (
      <Card hoverable className={styles.card}>
        <Card.Meta
          avatar={<img alt="" className={styles.cardAvatar} src={item.avatar} />}
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{item.title}</span>
              {item.status === 'active' ? (
                <Button size="small" type="danger">
                  停用
                </Button>
              ) : (
                <Button size="small" type="primary">
                  启用
                </Button>
              )}
            </div>
          }
          description={
            <Paragraph
              className={styles.item}
              ellipsis={{
                rows: 3,
              }}
            >
              <div>
                <div style={{ display: 'flex', marginBottom: 8 }}>
                  <span style={{ marginRight: 8 }}>版本:</span>{' '}
                  <span style={{ marginRight: 8 }}>{item.version}</span> <Badge count="更新" />
                </div>
                <div style={{ display: 'flex' }}>
                  <span style={{ marginRight: 8 }}>状态:</span>
                  {item.status === 'active' ? (
                    <span style={{ color: '#52c41a' }}>启用</span>
                  ) : (
                    <span style={{ color: 'red' }}>停用</span>
                  )}
                </div>
              </div>
            </Paragraph>
          }
        />
        <Divider style={{ marginTop: 0 }} />
        <div style={{ fontSize: '12px' }}>
          <span style={{ color: '#747474', marginRight: 8 }}>有效期至: </span>
          <span style={{ color: '#333333', fontFamily: 'PingFangSC-Semibold' }}>
            {item.expiryDate}
          </span>
        </div>
      </Card>
    );
  }

  // eslint-disable-next-line react/sort-comp,class-methods-use-this
  get renderDetial() {
    const { data } = this.props;
    if (!data.businessId) {
      return null
    }
    return (
      <Descriptions column={1} layout="layout">
        <Descriptions.Item label="账户类型">{ data.businessTypeName }</Descriptions.Item>
        <Descriptions.Item label="有效期">{ data.startAt.format('YYYY/MM/DD') } -- { data.endAt.format('YYYY/MM/DD') }</Descriptions.Item>
        <Descriptions.Item label="商户（开发者）名称">{ data.businessName }</Descriptions.Item>
        <Descriptions.Item label="合同（开发者）ID">无</Descriptions.Item>
        <Descriptions.Item label="联系人">{ data.contactName || '无' }</Descriptions.Item>
        <Descriptions.Item label="账号">{ data.merchantLoginName }</Descriptions.Item>
        <Descriptions.Item label="联系电话">{ data.mobile || '无' }</Descriptions.Item>
        <Descriptions.Item label="Email">{ data.email || '无' }</Descriptions.Item>
        <Descriptions.Item label="描述">{ data.remark || '无' }</Descriptions.Item>
        {
          /**
           <Descriptions.Item label="合同">
           OpenAILab合同.doc
           <Button type="primary" ghost size="small" style={{ marginLeft: 16 }}>
           下载
           </Button>
           </Descriptions.Item>
           **/
        }
      </Descriptions>
    );
  }

  get serviceCards() {
    return this.serviceCard(testData);
  }

  // eslint-disable-next-line class-methods-use-this
  get getAppConfig() {
    return (
      <Descriptions column={1} layout="layout">
        <Descriptions.Item label="应用类型">类型1</Descriptions.Item>
        <Descriptions.Item label="时间范围">2019-07-01 / 2023-05-26</Descriptions.Item>
        <Descriptions.Item label="描述">无</Descriptions.Item>
      </Descriptions>
    );
  }

  render() {
    // eslint-disable-next-line prefer-const
    let { onClose, visible, data } = this.props;
    // eslint-disable-next-line no-unused-expressions
    data || (data = []);
    return (
      <Drawer title="商户详情" width={480} onClose={onClose} visible={visible}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="商户详情" key="1">
            {this.renderDetial}
            <Button type="primary" onClick={this.goEditBasci}>
              编辑
            </Button>
          </TabPane>
          {
            /**
          <TabPane tab="授权管理" key="2">
            {this.serviceCards}
          </TabPane>

             <TabPane tab="应用配置管理" key="3">
             {this.getAppConfig}
             <Button type="primary" onClick={this.goEditApp}>
             编辑
             </Button>
             </TabPane>
             */
          }
        </Tabs>
      </Drawer>
    );
  }
}

export default Detials;
