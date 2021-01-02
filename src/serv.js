'use strict';

const { libs, runtime } = nodex;
const { http } = libs;
const { logic } = runtime;

exports.init = async function (args) {
  const app = http.webapp(args);

  app.route(router => {
    router.post('/idcard', http.handler(logic.idcard));
    router.post('/phonethree', http.handler(logic.phonethree));
    router.post('/bankTwoCheck', http.handler(logic.bankTwoCheck));
    router.post('/bankThreeCheck', http.handler(logic.bankThreeCheck));
    router.post('/bankFourCheck', http.handler(logic.bankFourCheck));
  });

  app.start();
};