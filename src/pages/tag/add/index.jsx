import React, { Component } from 'react';
import { Form, Select, Input, Radio, Upload, Icon, message, Card, Button } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { connect } from 'dva';
import router from 'umi/router';
import styles from './style.less';
import CONSTANTS from '../../../utils/constant';
import landmarkimg from '../../../assets/landmark.png';
import lfacerecogntionimg from '../../../assets/facerecogntion.png';

const { Option } = Select;

@connect(({ datatask, tag, loading }) => ({
  datatask,
  tag,
  loading: loading.effects['datatask/getDatasetList'],
}))

class AddTag extends Component {
  state = {
    datasetOption: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'datatask/getDatasetList',
    }).then(res => {
      if (res && res.list && res.list.length > 0) {
        const itemOption = []
        res.list.map(item => {
          itemOption.push({
            value: item.datasetid,
            label: item.datasetname,
          })
        })
        this.setState({
          datasetOption: itemOption,
        })
      }
    });
  }

  tagNameInput = getFieldDecorator => {
    return (
      <Form.Item label="名称">
        {getFieldDecorator('taskname', {
          rules: [
            {
              required: true,
              message: '请填写数据标注名称!',
            },
            { pattern: /^[^\s]*$/, message: '禁止输入空格' },
          ],
        })(
          <Input
            maxLength={20}
            placeholder="请输入数据标注名称"
          />,
        )}
      </Form.Item>
    );
  };

  datasetSelect = getFieldDecorator => {
    const { datasetOption } = this.state
    const { loading } = this.props
    const options = datasetOption.map(item => (
      <Option key={item.value} value={item.value}>
        {item.label}
      </Option>
    ));
    // console.log(datasetOption)
    const defaultValue = datasetOption && datasetOption.length > 0 ? datasetOption[0].value : null
    // console.log(defaultValue)
    return (
      <Form.Item label="数据集">
        {getFieldDecorator('datasetid', {
          initialValue: defaultValue,
          rules: [
            {
              required: true,
              message: '请选择数据标注名称!',
            },
            { pattern: /^[^\s]*$/, message: '禁止输入空格' },
          ],
        })(
          <Select
          onSelect={this.handleChange}
          placeholder="请选择数据集"
          loading={loading}
          // defaultValue={defaultValue}
          style={{ width: 'calc(100% - 72px)', marginRight: 8 }}>
              {options}
              {/* <Option value="0">表一</Option>
              <Option value="1">表二</Option> */}
            </Select>,
        )}
        <Button type="primary" onClick={() => { router.push('/dataset/operation/add') }}>新增</Button>
      </Form.Item>
    );
  };

  sceneSelect = getFieldDecorator => {
    return (
      <Form.Item label={<FormattedMessage id="add-dataset.scene" />}>
        {getFieldDecorator('scene', {
          rules: [
            {
              required: true,
              message: '请选择场景!',
            },
          ],
        })(
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="0">人脸</Radio.Button>
          </Radio.Group>,
        )}
      </Form.Item>
    );
  };

  labeltypeSelect = getFieldDecorator => {
    return (
      <Form.Item label="标注类型">
        {getFieldDecorator('labelType', {
          rules: [
            {
              required: true,
              message: '请选择场景!',
            },
          ],
        })(
          <Radio.Group buttonStyle="solid" className={styles.radioGroupBox}>
            <Radio.Button value="landmark" className={styles.radioBox}>
              <span>
                <p>人脸检测</p>
                <p style={{ fontSize: '12px' }}>识别图片中是否包含人像特征</p>
                <img alt="example" src={landmarkimg}></img>
              </span>
            </Radio.Button>
            <Radio.Button value="facerecogntion" className={styles.radioBox}>
              <span>
                <p>人脸识别</p>
                <p style={{ fontSize: '12px' }}>识别出图片中的人像并进行分类</p>
                <img alt="example" src={lfacerecogntionimg}></img>
              </span>
            </Radio.Button>
            {/* <Radio.Button value="1">人脸识别</Radio.Button> */}
          </Radio.Group>,
        )}
      </Form.Item>
    );
  };

  descInput = getFieldDecorator => {
    return (
      <Form.Item label={<FormattedMessage id="add-dataset.desc" />}>
        {getFieldDecorator('desc', {
          rules: [
            {
              required: false,
            },
            { pattern: /^[^\s]*$/, message: '禁止输入空格' },
          ],
        })(
          <Input
            maxLength={50}
            placeholder={formatMessage({
              id: 'add-dataset.please-enter-the-desc',
            })}
          />,
        )}
      </Form.Item>
    );
  };

  handleAdd = () => {
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, fieldsValue) => {
      console.log('err, fieldsValue---->', err, fieldsValue);
      if (err) return;
      this.todoAdd(fieldsValue);
    });
  };

  todoAdd = fieldsValue => {
    const { dispatch } = this.props;
    const params = fieldsValue;
    console.log(params)
    dispatch({
      type: 'tag/addTagLabel',
      payload: params,
    }).then(res => {
      console.log(res)
      if (res && res.code === 200) {
        message.success('添加成功');
        // router.push('/tag');
        setTimeout(() => {
          router.push('/tag');
        }, 500)
      } else {
        message.error('操作失败');
      }
    });
  };

  goToList = () => {
    router.push('/tag');
  }

  render() {
    const {
      form: { getFieldDecorator },
      oasMerchantAddOrUpdate,
    } = this.props;
    const formItemLayouts = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
        md: { span: 4 },
        xl: { span: 3 }, // >= 1200px
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        md: { span: 18 },
        xl: { span: 17 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
        md: { span: 18, offset: 4 },
        xl: { span: 17, offset: 3 },
      },
    }
    return (
      <div className={styles.filterCardList}>
        <PageHeaderWrapper>
          <Card bordered={false} className={styles.contentBox}>
            <Form {...formItemLayouts} className={styles.form}>
              {this.tagNameInput(getFieldDecorator)}
              {this.datasetSelect(getFieldDecorator)}
              {this.sceneSelect(getFieldDecorator)}
              {this.labeltypeSelect(getFieldDecorator)}
              {this.descInput(getFieldDecorator)}
              <Form.Item {...tailFormItemLayout}>
                <Button onClick={this.goToList} >
                  取消
                </Button>
                <Button onClick={this.handleAdd} style={{ marginLeft: 16 }} type="primary" htmlType="submit">
                  新增
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </PageHeaderWrapper>
      </div>
    );
  }
}

const WarpForm = Form.create({
  onValuesChange({ dispatch }) {
    // 表单项变化时请求数据
    // 模拟查询表单生效
  },
})(AddTag);
export default WarpForm;
