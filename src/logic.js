'use strict';
const { runtime, libs } = nodex;
const { fmt } = libs;
const { data } = runtime;

/**
 * 身份证实名认证-身份证二要素认证-身份证一致性校验: 身份证、姓名
 * @param {*} param0 
 */
exports.idCard = async function({cardno, name}) {
  fmt.required(cardno, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  return await data.idCard({cardno, name});
}

/**
 * 手机号三要素实名验证: 身份证、手机号、姓名
 * @param {*} param0 
 */
exports.phoneThree = async function({cardno, phone, name}) {
  fmt.required(cardno, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  fmt.required(phone, 'string', 2, 64);
  return await data.phoneThree({cardno, phone, name});
}

/**
 * 银行卡二要素一致性核验 银行卡号、姓名
 * @param {*} param0 
 */
exports.bankTwo = async function({accountNo, name}) {
  fmt.required(accountNo, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  return await data.bankTwo({accountNo, name});
}

/**
 * 银行卡三要素一致性核验 银行卡卡号、姓名、证件号
 * @param {*} param0 
 */
exports.bankThree = async function({accountNo, cardno, name}) {
  fmt.required(accountNo, 'string', 2, 64);
  fmt.required(cardno, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  return await data.bankThree({accountNo, cardno, name});
}

/**
 * 银行卡四元素实名认证: 银行卡卡号、银行预留手机号码、身份证号码、持卡人姓名
 * @param {*} param0 
 */
exports.bankFour = async function({accountNo, phone, cardno, name}) {
  fmt.required(accountNo, 'string', 2, 64);
  fmt.required(cardno, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  fmt.required(phone, 'string', 2, 64);
  return await data.bankFour({accountNo, cardno, phone, name});
}
