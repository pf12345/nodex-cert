'use strict';

const { libs, runtime } = nodex;
const { http } = libs;
const { logic } = runtime;

exports.init = async function (args) {
  const app = http.webapp(args);

  app.route(router => {
    router.post('/cert_realname_idcard', http.handler(logic.realnameIdcard));
    router.post('/cert_realname_idcard_phone', http.handler(logic.realnameIdcardPhone));
    router.post('/cert_realname_banknumber', http.handler(logic.realnameBanknumber));
    router.post('/cert_realname_idcard_banknumber', http.handler(logic.realnameIdcardBanknumber));
    router.post('/cert_realname_idcard_banknumber_phone', http.handler(logic.realnameIdcardBanknumberPhone));
  });

  app.start();
};