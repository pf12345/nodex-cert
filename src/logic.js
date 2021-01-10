'use strict';
const { runtime, libs } = nodex;
const { fmt, flakes } = libs;
const { data } = runtime;
const flake = flakes.create();
const gate = require('./gate');

/**
 * 身份证实名认证-身份证二要素认证-身份证一致性校验: 身份证、姓名
 * @param {*} param0 
 */
exports.realnameIdcard = async function({name, idCard}) {
  fmt.required(idCard, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  const userInfo = await data.getByNameIdcard(name, idCard);
  if(userInfo) {
    return true
  }
  const remoteData = await gate.checkRealnameIdcard(name, idCard);
  if(remoteData) {
    const id = flake.get();
    const { sex, birthday } = remoteData || {};
    await data.addUser({id, name, idCard, phone: '', bankNumber: '', address: '', sex, birthday});
    return true;
  }
  return false
}

/**
 * 手机号三要素实名验证: 身份证、手机号、姓名
 * @param {*} param0 
 */
exports.realnameIdcardPhone = async function({name, idCard, phone}) {
  fmt.required(idCard, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  fmt.required(phone, 'string', 2, 64);
  const userInfo = await data.getByNameIdcard(name, idCard);
  if(userInfo && userInfo.phone === phone) {
    return true;
  }
  const remoteData = await gate.checkRealnameIdcardPhone(name, idCard, phone);
  if(remoteData) {
    if(userInfo) {
      await data.updateUser({...userInfo, phone});
    } else {
      const id = flake.get();
      await data.addUser({id, name, idCard, phone, bankNumber: '', address: '', sex: '', birthday: ''})
    }
    return true;
  }
  return false;
}

/**
 * 银行卡二要素一致性核验 银行卡号、姓名
 * @param {*} param0 
 */
exports.realnameBanknumber = async function({name, bankNumber}) {
  fmt.required(bankNumber, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  const userInfo = await data.getByNameBankNumber(name, bankNumber);
  if(userInfo) {
    return true
  }
  return await gate.checkRealnameBanknumber(name, bankNumber);
}

/**
 * 银行卡三要素一致性核验 银行卡卡号、姓名、身份证
 * @param {*} param0 
 */
exports.realnameBanknumberPhone = async function({name, idCard, bankNumber}) {
  fmt.required(name, 'string', 2, 64);
  fmt.required(idCard, 'string', 2, 64);
  fmt.required(bankNumber, 'string', 2, 64);
  const userInfo = await data.getByNameIdcard(name, idCard);
  if(userInfo && userInfo.bankNumber === bankNumber) {
    return true
  }
  const remoteData = await gate.checkRealnameIdcardBanknumber(name, idCard, phone);
  if(remoteData) {
    if(userInfo) {
      await data.updateUser({...userInfo, bankNumber});
    } else {
      const id = flake.get();
      await data.addUser({id, name, idCard, phone: '', bankNumber, address: '', sex: '', birthday: ''})
    }
    return true;
  }
  return false;
}

/**
 * 银行卡四元素实名认证: 银行卡卡号、银行预留手机号码、身份证号码、持卡人姓名
 * @param {*} param0 
 */
exports.realnameIdcardBanknumberPhone = async function({name, idCard, bankNumber, phone}) {
  fmt.required(name, 'string', 2, 64);
  fmt.required(idCard, 'string', 2, 64);
  fmt.required(bankNumber, 'string', 2, 64);
  fmt.required(phone, 'string', 2, 64);
  const userInfo = await data.getByNameIdcard(name, idCard);
  if(userInfo && userInfo.bankNumber === bankNumber && userInfo.phone === phone) {
    return true
  }
  const remoteData = await gate.checkRealnameIdcardBanknumberPhone(name, idCard, bankNumber, phone);
  if(remoteData) {
    if(userInfo) {
      await data.updateUser({...userInfo, bankNumber, phone});
    } else {
      const id = flake.get();
      await data.addUser({id, name, idCard, phone, bankNumber, address: '', sex: '', birthday: ''})
    }
    return true;
  }
  return false;
}
