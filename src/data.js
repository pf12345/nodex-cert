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
 * 银行卡二要素一致性核验
 * @param {*} param0 
 */
exports.bankTwoCheck = async function({accountNo, name}) {
  const listResult = await sdk.dss.list({
    appid: appId,
    query: {
      accountNo,
      name,
      dataType: `${SERVICE_NAME}-bankTwoCheck`
    }
  })
  const { data: list } = listResult || {};
  if (list && list.length) {
    return { accountNo, name };
  }
  const fourResult = await sdk.dss.list({
    appid: appId,
    query: {
      accountNo,
      name,
      dataType: `${SERVICE_NAME}-bankFourCheck`
    }
  })
  const { data: fourList } = fourResult || {};
  if (fourList && fourList.length) {
    return { accountNo, name };
  }
  const threeResult = await sdk.dss.list({
    appid: appId,
    query: {
      accountNo,
      name,
      dataType: `${SERVICE_NAME}-bankThreeCheck`
    }
  })
  const { data: threeList } = threeResult || {};
  if (threeList && threeList.length) {
    return { accountNo, name };
  }
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "api11.aliyun.venuscn.com",
    path: `/cert/bank-card/2?bank=${accountNo}&name=${encodeURI(name)}`,
  })
  const { content } = result || {};
  const { ret, data } = content || {};
  const { code } = data || {};
  if(ret == 200 && code == 0) {
    await sdk.dss.add({
      accountNo, name,
      appid: appId,
      dataType: `${SERVICE_NAME}-bankTwoCheck`
    });
  }
 
  return { accountNo, name }
}

/**
 * 银行卡三要素一致性核验 银行卡卡号、姓名、证件号
 * @param {*} param0 
 */
exports.bankThreeCheck = async function({accountNo, cardno, name}) {
  const fourResult = await sdk.dss.list({
    appid: appId,
    query: {
      accountNo,
      name,
      cardno,
      dataType: `${SERVICE_NAME}-bankFourCheck`
    }
  })
  const { data: fourList } = fourResult || {};
  if (fourList && fourList.length) {
    return { accountNo, name, cardno };
  }
  const listResult = await sdk.dss.list({
    appid: appId,
    query: {
      accountNo,
      name,
      cardno,
      dataType: `${SERVICE_NAME}-bankThreeCheck`
    }
  })
  const { data: list } = listResult || {};
  if (list && list.length) {
    return { accountNo, name, cardno };
  }
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "api11.aliyun.venuscn.com",
    path: `/cert/bank-card/3?bank=${accountNo}&name=${encodeURI(name)}&number=${cardno}`,
  })
  const { content } = result || {};
  const { ret, data } = content || {};
  const { code } = data || {};
  if(ret == 200 && code == 0) {
    await sdk.dss.add({
      accountNo, name,
      appid: appId,
      dataType: `${SERVICE_NAME}-bankThreeCheck`
    });
  }
 
  return { accountNo, name, cardno }
}


/**
 * 银行卡四元素实名认证: 银行卡卡号、银行预留手机号码、身份证号码、持卡人姓名
 * @param {*} param0 
 */
exports.bankFourCheck = async function({accountNo, phone, cardno, name}) {
  const listResult = await sdk.dss.list({
    appid: appId,
    query: {
      accountNo,
      phone,
      cardno,
      name,
      dataType: `${SERVICE_NAME}-bankFourCheck`
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
    hostname: "api11.aliyun.venuscn.com",
    path: `/cert/bank-card/4?bank=${accountNo}&mobile=${phone}&name=${encodeURI(name)}&number=${cardno}&type=0`,
  })
  const { content } = result || {};
  const { 
    ret, 
    data
  } = content || {};
  const { code } = data || {};
  if(ret == 200 && code == 0) {
    await sdk.dss.add({
      accountNo, name, cardno, phone,
      appid: appId,
      dataType: `${SERVICE_NAME}-bankFourCheck`
    });
  }
 
  return { accountNo, name, cardno, phone }
}