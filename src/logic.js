'use strict';
const { runtime, libs } = nodex;
const { fmt } = libs;
const { data } = runtime;

exports.idcard = async function({cardno, name}) {
  fmt.required(cardno, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  return await data.idcard({cardno, name});
}

exports.phonethree = async function({cardno, phone, name}) {
  fmt.required(cardno, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  fmt.required(phone, 'string', 2, 64);
  return await data.phonethree({cardno, phone, name});
}

exports.bcheck = async function({accountNo, phone, cardno, name}) {
  fmt.required(accountNo, 'string', 2, 64);
  fmt.required(cardno, 'string', 2, 64);
  fmt.required(name, 'string', 2, 64);
  fmt.required(phone, 'string', 2, 64);
  return await data.bcheck({accountNo, cardno, phone, name});
}