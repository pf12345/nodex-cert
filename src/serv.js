'use strict';

const { libs, runtime } = nodex;
const { http } = libs;
const { logic } = runtime;

exports.init = async function (args) {
  const app = http.webapp(args);

  app.route(router => {
    router.post('/id_card', http.handler(logic.idCard));
    router.post('/phone_three', http.handler(logic.phoneThree));
    router.post('/bank_two', http.handler(logic.bankTwo));
    router.post('/bank_three', http.handler(logic.bankThree));
    router.post('/bank_four', http.handler(logic.bankFour));
  });

  app.start();
};