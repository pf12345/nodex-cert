'use strict';

const { libs, runtime } = nodex;
const { http } = libs;
const { logic } = runtime;

exports.init = async function (args) {
  const app = http.webapp(args);

  app.route(router => {
    router.post('/idcard', http.handler(logic.idcard));
    router.post('/phonethree', http.handler(logic.phonethree));
    router.post('/bcheck', http.handler(logic.bcheck));
  });

  app.start();
};
