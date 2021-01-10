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

exports.addUser = async function ({ id, name, idCard, phone, bankNumber, address, sex, birthday }) {
  const sql = `
        insert into t_user
            (c_id, c_name, c_phone, c_id_card, c_bank_number, c_address, c_sex, c_birthday, c_gmt_create, c_gmt_update)
        values
            ('${id}', '${name}', '${phone}', '${idCard}', '${bankNumber}', '${address}', '${sex}', '${birthday}', '${Date.now()}', '${Date.now()}')`;

  const results = await db.query(sql);

  return results.affectedRows > 0;
}

exports.updateUser = async function ({ id, name, idCard, phone, bankNumber, address, sex, birthday }) {
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