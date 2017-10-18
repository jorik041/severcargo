const nodemailer = require('nodemailer');
const pug = require('pug');
//const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport( {
  service: process.env.MAIL_HOST,
  auth: {
         user: process.env.MAIL_USER,
         pass: process.env.MAIL_PASS
     }
});

exports.send = async (options) => {

  const mailOptions = {
    from: `СЕВЕПКАРГО <noreply@severcargo.ru>`,
    to: 'cargosever@gmail.com',
    subject: options.subject,
    html: `<h1> На сайте СЕВЕРКАРГО зарегистрировался новый пользователь:</h1>
           <p> Имя: ${options.name} </p>
           <p> Тип аккаунта: ${options.account} </p>
           <p> Телефон: ${options.phone} </p>
    `
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};

exports.sendFlight = async (options) => {
  
    const mailOptions = {
      from: `СЕВЕПКАРГО <noreply@severcargo.ru>`,
      to: 'cargosever@gmail.com',
      subject: 'Новый рейс',
      html: `<h1> На сайте СЕВЕРКАРГО обавили новый рейс:</h1>
             <p> Откуда: ${options.from} </p>
             <p> Куда: ${options.to} </p>
             <p> Когда: ${options.departureDate } </p>
             <p> Дата прибытия: ${options.arrivalDate } </p>
             <p> Номер рейса: ${options.flight_number } </p>
      `
    };
    const sendMail = promisify(transport.sendMail, transport);
    return sendMail(mailOptions);
  };

// const generateHTML = (filename, options = {}) => {
//   const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
//   const inlined = juice(html);
//   return inlined;
// };

// exports.send = async (options) => {
//   const html = generateHTML(options.filename, options);
//   const text = htmlToText.fromString(html);

//   const mailOptions = {
//     from: `Wes Bos <noreply@wesbos.com>`,
//     to: options.user.email,
//     subject: options.subject,
//     html,
//     text
//   };
//   const sendMail = promisify(transport.sendMail, transport);
//   return sendMail(mailOptions);
// };
