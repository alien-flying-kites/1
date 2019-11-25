import { Form, Card, List, Input, Checkbox, Col, Pagination } from 'antd';
import React, { Component } from 'react';
import styles from './style.less';
import noData from '../../../../assets/noPic.jpg';

class CheckImgForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: {
        pageindex: 1,
        limit: 20,
      },
      currentPage: 1,
    };
  }

  /**
   * 监听多选框的变化
   */
  onChange = checkedValues => {
    // console.log(checkedValues)
    this.props.updateCheck(checkedValues)
    // this.setState({ selectCheck1: checkedValues })
  }

   /**
   * 图片列表分页改变页码-左侧
   */
  handleStandardTableChange = (page, pageSize) => {
    this.props.handleTableChange(page, pageSize)
     this.setState({
      page: {
        pageindex: page,
        limit: pageSize,
      },
    });
  };

   /**
   * 分页改变每页条数-左侧
   */
  showSizeChanger = (current, size) => {
    this.props.showRightSizeChanger(current, size)
    this.setState({
      page: {
        limit: size,
        pageindex: current,
      },
    })
  }

  render() {
    const { page, currentPage } = this.state;
    return (
      <div style={{ border: '1px solid  #e8e8e8', padding: '16px 0' }} className={styles.checkboxWarp}>
        <Checkbox.Group onChange={this.onChange} style={{ width: '100%' }}>
          <List
            dataSource={this.props.data}
            renderItem={item => {
              if (item && item.imgid) {
                return (
                  <Col xxl={6} xl={6} lg={8} md={8} sm={12} style={{ background: '#f4f4f4' }} className={styles.cardCol}>
                    <List.Item key={item.imgid} className={styles.imgListItem}>
                      <div className={styles.checkboxItem}>
                        <Checkbox value={item} className={styles.checkbox} ></Checkbox>
                      </div>
                      <Card className={styles.imgBox} bordered={false}>
                        <img alt="example" src={item.imgpath} />
                      </Card>
                    </List.Item>
                  </Col>
                );
              }
              return (
                <div></div>
              )
            }}
          />
        </Checkbox.Group>
        {this.props.totalNum > 0 ?
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Pagination
            size="small"
            showTotal={(total, range) => `${range[0]}-${range[1]}，共${total}条`}
            total={this.props.totalNum}
            pageSize={page.limit}
            defaultCurrent={currentPage}
            current={page.pageindex}
            showSizeChanger
            onChange={this.handleStandardTableChange}
            onShowSizeChange={this.showSizeChanger}
          />
        </div> : <div className={styles.nodataWarp}><img alt="nodata" src={noData}></img></div>
        }
      </div>
    )
  }
}

export default Form.create()(CheckImgForm);
