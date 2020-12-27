'use strict';

const { libs } = nodex;
const { http } = libs;
const sdk = require("./sdk");
const SERVICE_NAME = 'nodex-cert';
let appId = '';

exports.init = async function (args) {
  const { appid, appSecret } = args;
  appId = appid;
  sdk.init({
    appid,
    appSecret
  })
};

/**
 * 身份证实名认证-身份证二要素认证-身份证一致性校验: 身份证、姓名
 * @param {*} param0 
 */
exports.idcard = async function ({ cardno, name }) {
  const listResult = await sdk.dss.list({
    appid: appId,
    query: {
      cardno,
      dataType: `${SERVICE_NAME}-idcard`
    }
  })
  const { data: list } = listResult || {};
  if (list && list.length) {
    const { cardno, name, sex, address, birthday } = list[0];
    return { cardno, name, sex, address, birthday };
  }
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "zid.market.alicloudapi.com",
    path: `/idcard/VerifyIdcardv2?cardNo=${cardno}&realName=${encodeURI(name)}`
  })
  if (result.status != 200) {
    return result;
  }
  const { data } = result.content || {};
  const { isok, IdCardInfor } = data || {};
  const { area, sex, birthday } = IdCardInfor || {};
  if (!isok) {
    return false;
  }
  await sdk.dss.add({
    name,
    cardno,
    address: area,
    sex,
    birthday,
    appid: appId,
    dataType: `${SERVICE_NAME}-idcard`
  });
  return { name, cardno, address: area, sex, birthday }
}

/**
 * 手机号三要素实名验证: 身份证、手机号、姓名
 * @param {*} param0 
 */
exports.phonethree = async function ({ cardno, phone, name }) {
  const listResult = await sdk.dss.list({
    appid: appId,
    query: {
      cardno,
      phone,
      name,
      dataType: `${SERVICE_NAME}-phonethree`
    }
  })
  const { data: list } = listResult || {};
  if (list && list.length) {
    const { appid, dataType, ...ret } = list[0];
    return { ...ret };
  }
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "phone3.market.alicloudapi.com",
    path: `/phonethree?phone=${phone}&realname=${encodeURI(name)}&idcard=${cardno}`
  })
  if (result.status != 200) {
    return result;
  }
  const { data } = result.content || {};
  const { province, city, operator } = data || {};
  await sdk.dss.add({
    name,
    cardno,
    phone,
    province, city, operator,
    appid: appId,
    dataType: `${SERVICE_NAME}-phonethree`
  });
  return { name, cardno, phone, province, city, operator }
}

/**
 * 银行卡二三四元素实名认证: 银行卡卡号、银行预留手机号码、身份证号码、持卡人姓名
 * @param {*} param0 
 */
exports.bcheck = async function({accountNo, phone, cardno, name}) {
  const listResult = await sdk.dss.list({
    appid: appId,
    query: {
      accountNo,
      phone,
      cardno,
      name,
      dataType: `${SERVICE_NAME}-bcheck`
    }
  })
  const { data: list } = listResult || {};
  if (list && list.length) {
    const { appid, dataType, ...ret } = list[0];
    return { ...ret };
  }
  console.log({
    accountNo,
    bankPreMobile: phone,
    idCardCode: cardno,
    name
  })
  const result = await http.post({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "zbv2.market.alicloudapi.com",
    path: `/v2/bcheck`,
  }, {
    accountNo,
    bankPreMobile: phone,
    idCardCode: cardno,
    name
  })
  console.log('result', result);
  const { 
    respCode, 
    respMsg, 
    detailCode, // 细分应答码 0，认证成功，1，信息有误 2，卡状态异常 3，发卡行不支持此交易，请联系发卡行 4,银联不支持该银行 5,无效卡 6，受限制的卡，7，姓名格式有误 8，身份证号码格式有误，9，手机号码格式有误 10，银行卡格式有误，11，密码错误次数超限，12，验证要素格式有误 ，100，其他原因不通过
    bancardInfor
  } = result;
  if(respCode === 'T' && detailCode == '0') {
    return respMsg;
  }
  const { bankName, type, cardname, Icon } = bancardInfor || {}; // bankName:银行名称，type:卡类型,cardname:卡名称，tel：银行电话，Icon：银行logo
  const logo = `http://bkaear.market.alicloudapi.com/banklogo/${Icon}`;
  await sdk.dss.add({
    accountNo, name, cardno, phone, bankName, type, cardname, logo,
    appid: appId,
    dataType: `${SERVICE_NAME}-bcheck`
  });
  return { accountNo, name, cardno, phone, bankName, type, cardname, logo }
}