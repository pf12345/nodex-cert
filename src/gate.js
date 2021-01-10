const { libs } = nodex;
const { http } = libs;

/**
 * 身份证实名认证-身份证二要素认证-身份证一致性校验: 身份证、姓名
 * @param {*} realname 姓名
 * @param {*} idcard 身份证
 */
exports.checkRealnameIdcard = async function(realname, idcard) {
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "zid.market.alicloudapi.com",
    path: `/idcard/VerifyIdcardv2?cardNo=${idcard}&realName=${encodeURI(realname)}`
  })
  if (result.status != 200) {
    return false;
  }
  
  const { data } = result.content || {};
  const { isok, IdCardInfor } = data || {};
  const { area, sex, birthday } = IdCardInfor || {};
  if (!isok) {
    return false;
  }
  return { area, sex, birthday }
}

/**
 * 手机号三要素实名验证: 身份证、手机号、姓名
 * @param {*} realname 姓名
 * @param {*} idcard 身份证
 * @param {*} phone 手机号
 */
exports.checkRealnameIdcardPhone = async function(realname, idcard, phone) {
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "phone3.market.alicloudapi.com",
    path: `/phonethree?phone=${phone}&realname=${encodeURI(realname)}&idcard=${idcard}`
  })
  if (result.status != 200) {
    return false;
  }
  const { data } = result.content || {};
  const { province, city, operator } = data || {};
  return { operator, province, city }
}

/**
 * 银行卡二要素一致性核验
 * @param {*} realname 姓名
 * @param {*} bankNumber 银行卡
 */
exports.checkRealnameBanknumber = async function(realname, bankNumber) {
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "api11.aliyun.venuscn.com",
    path: `/cert/bank-card/2?bank=${bankNumber}&name=${encodeURI(realname)}`,
  })
  const { content } = result || {};
  const { ret, data } = content || {};
  const { code } = data || {};
  return ret == 200 && code == 0
}

/**
 * 银行卡三要素一致性核验 银行卡卡号、姓名、证件号
 * @param {*} realname 姓名
 * @param {*} idcard 证件号
 * @param {*} bankNumber 银行卡卡号
 */
exports.checkRealnameIdcardBanknumber = async function(realname, idcard, bankNumber) {
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "api11.aliyun.venuscn.com",
    path: `/cert/bank-card/3?bank=${bankNumber}&name=${encodeURI(realname)}&number=${idcard}`,
  });
  const { content } = result || {};
  const { ret, data } = content || {};
  const { code } = data || {};
  return ret == 200 && code == 0;
}

/**
 * 银行卡四元素实名认证: 银行卡卡号、银行预留手机号码、身份证号码、姓名
 * @param {*} realname 姓名
 * @param {*} idcard 身份证号码
 * @param {*} bankNumber 银行卡卡号
 * @param {*} phone 银行预留手机号码
 */
exports.checkRealnameIdcardBanknumberPhone = async function(realname, idcard, bankNumber, phone) {
  const result = await http.get({
    headers: {
      Authorization: "APPCODE cf817ace62a34891bce2d711ca27128f"
    },
    hostname: "api11.aliyun.venuscn.com",
    path: `/cert/bank-card/4?bank=${bankNumber}&mobile=${phone}&name=${encodeURI(realname)}&number=${idcard}&type=0`,
  });
  const { content } = result || {};
  const { ret, data } = content || {};
  const { code } = data || {};
  return ret == 200 && code == 0;
}