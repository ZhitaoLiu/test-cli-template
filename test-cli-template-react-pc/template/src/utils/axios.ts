import axios from 'axios';
import { notification } from 'antd';

const codeMessage: Record<number, string> = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

interface IResData {
  success: boolean;
  errorCode: number;
  errorMessage: string;
  obj: any;
}

const baseURL = process.env.NODE_ENV === 'development' ? '/api' : '/';

const instance = axios.create({
  baseURL,
  timeout: 100000,
  withCredentials: true,
});

// 添加请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 添加响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 接口正常情况 - 统一处理响应结果
    const res: IResData = response.data;
    if (res.success) {
      return res.obj;
    }
    // 接口异常情况 - 处理接口层面错误
    const errorText = res.errorMessage || '后台异常';
    const err = new Error(errorText);
    err.name = String(res.errorCode);
    return Promise.reject(err);
  },
  (error) => {
    // 处理 http 层面的错误
    const { response = {} } = error;
    const errorText = codeMessage[response.status] || response['statusText'] || '请求异常';
    const err = new Error(errorText);
    err.name = response.status;
    return Promise.reject(err);
  },
);

// 拦截响应（统一处理异常信息，并抛出错误由调用方处理）
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 全局统一错误提示
    notification.error({
      message: error.message
    });
    return Promise.reject(error);
  },
);

export default instance;
