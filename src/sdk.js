'use strict';

var axios = require('axios');
var md5 = require('js-md5');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var md5__default = /*#__PURE__*/_interopDefaultLegacy(md5);

let options = {
  appSecret: '',
  appid: '',
  baseURL: ''
};
function init(config) {
  options = { ...options,
    ...config
  };
}
function getOptions() {
  return options;
}

/**
 * 对http请求数据签名，内部采用MD5算法生成签名指纹。
 * @param {object} data 用于签名的http请求数据。
 * @param {string} secret 用于签名的密钥。
 * @returns {string} 签名指纹
 */

function sign(data, secret) {
  const str = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join("&");
  return md5__default(str + secret);
}

const baseConfig = {
  baseURL: 'http://www.plaifox.com:58080',
  method: "post",
  timeout: 10000,
  responseType: 'json'
}; // 请求结果拦截器

axios__default.interceptors.response.use(function (response) {
  if (response.status === 200 && response.data && response.data.result === 'ok') {
    return response.data;
  }

  return Promise.reject({
    data: response.data || null,
    result: 'error',
    errorMsg: '请求失败'
  });
}, function (error) {
  return Promise.reject({
    data: null,
    result: 'error',
    errorMsg: error.message || ''
  });
});
/**
 *
 * @param path [libary]/add_data, example: dss/add_data
 * @param params
 */

const request = (path, params) => {
  if (!path) {
    throw Error('[request]: 无效请求路径');
  }

  const url = path;
  const options = getOptions();
  const {
    appid,
    appSecret,
    baseURL
  } = options;
  const data = { ...params
  };

  const _sign = sign(data, appSecret);

  if (baseURL) {
    baseConfig.baseURL = baseURL;
  }

  return axios__default({ ...baseConfig,
    headers: {
      appid,
      sign: _sign,
      appSecret
    },
    url,
    data
  });
};

function list(params) {
  const {
    appid
  } = getOptions();
  return request('/dss/list', {
    appid: params.appid || appid,
    ...params
  });
}
function add(params) {
  const {
    appid
  } = getOptions();
  return request('/dss/add', {
    appid: params.appid || appid,
    ...params
  });
}
function set(params) {
  const {
    appid
  } = getOptions();
  const {
    id,
    data
  } = params;
  return request('/dss/set', {
    appid: params.appid || appid,
    id,
    ...data
  });
}
function del(params) {
  const {
    appid
  } = getOptions();
  return request('/dss/del', {
    appid: params.appid || appid,
    ...params
  });
}
function get(params) {
  const {
    appid
  } = getOptions();
  return request('/dss/get', {
    appid: params.appid || appid,
    ...params
  });
}

var dss = /*#__PURE__*/Object.freeze({
  __proto__: null,
  list: list,
  add: add,
  set: set,
  del: del,
  get: get
});

var index = {
  init,
  request,
  dss
};

module.exports = index;
