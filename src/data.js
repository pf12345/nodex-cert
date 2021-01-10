'use strict';

const { libs } = nodex;
const { http, mysql } = libs;

exports.init = async function (args) {
  await mysql.init(args.mysql);
};

exports.getByNameIdcard = async function (name, idCard) {
  const sql = `
        select
            c_id as id,
            c_name as name,
            c_phone as phone,
            c_id_card as idcard,
            c_bank_number as bankNumber,
            c_address as address,
            c_sex as sex,
            c_birthday as birthday,
            c_gmt_create as gmtCreate,
            c_gmt_update as gmtUpdate
        from
            t_user
        where
            c_name = '${name}' and c_id_card = '${idCard}'`;

  const results = await db.query(sql);

  return results.length > 0 ? results[0] : null;
}

exports.addUser = async function({id, name, idCard, phone, bankNumber, address, sex, birthday}) {
  const sql = `
        insert into t_user
            (c_id, c_name, c_phone, c_id_card, c_bank_number, c_address, c_sex, c_birthday, c_gmt_create, c_gmt_update)
        values
            ('${id}', '${name}', '${phone}', '${idCard}', '${bankNumber}', '${address}', '${sex}', '${birthday}', '${Date.now()}', '${Date.now()}')`;

  const results = await db.query(sql);

  return results.affectedRows > 0;
}

exports.updateUser = async function({id, name, idCard, phone, bankNumber, address, sex, birthday}) {
  const sql = `
        update 
            t_user
        set
            c_name = '${name}',
            c_phone = '${phone}',
            c_id_card = '${idCard}',
            c_bank_number = '${bankNumber}',
            c_address = '${address}',
            c_sex = '${sex}',
            c_birthday = '${birthday}',
            c_gmt_update = '${Date.now()}'
        where
            c_id = '${id}'`;

    const results = await db.query(sql);

    return results.affectedRows > 0;
}

/**
 * 身份证实名认证-身份证二要素认证-身份证一致性校验: 身份证、姓名
 * @param {*} param0 
 */
exports.idCard = async function ({ cardno, name }) {
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
exports.phoneThree = async function ({ cardno, phone, name }) {
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
exports.bankTwo = async function ({ accountNo, name }) {
  const checkData = async function (type) {
    const listResult = await sdk.dss.list({
      appid: appId,
      query: {
        accountNo,
        name,
        dataType: `${SERVICE_NAME}-${type}`
      }
    })
    const { data: list } = listResult || {};
    if (list && list.length) {
      return { accountNo, name };
    }
    return false;
  }
  const bankTwo = await checkData('bankTwoCheck');
  if (bankTwo) {
    return bankTwo;
  }
  const bankThree = await checkData('bankThreeCheck');
  if (bankThree) {
    return bankThree;
  }
  const bankFoure = await checkData('bankFourCheck');
  if (bankFoure) {
    return bankFoure;
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
  if (ret == 200 && code == 0) {
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
exports.bankThree = async function ({ accountNo, cardno, name }) {
  const checkData = async function (type) {
    const listResult = await sdk.dss.list({
      appid: appId,
      query: {
        accountNo,
        name,
        cardno,
        dataType: `${SERVICE_NAME}-${type}`
      }
    })
    const { data: list } = listResult || {};
    if (list && list.length) {
      return { accountNo, name, cardno };
    }
    return false;
  }
  const bankThree = checkData('bankThreeCheck');
  if (bankThree) {
    return bankThree;
  }
  const bankFoure = checkData('bankFourCheck');
  if (bankFoure) {
    return bankFoure;
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
  if (ret == 200 && code == 0) {
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
exports.bankFour = async function ({ accountNo, phone, cardno, name }) {
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
  if (ret == 200 && code == 0) {
    await sdk.dss.add({
      accountNo, name, cardno, phone,
      appid: appId,
      dataType: `${SERVICE_NAME}-bankFourCheck`
    });
  }

  return { accountNo, name, cardno, phone }
}