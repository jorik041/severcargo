const EventEmitter = require('events');
const emitter = new EventEmitter();

const mail = require('./mail');

emitter.on('registered', async (msg) => {
  await mail.send( msg );
});

emitter.on('added-flight', async (msg) => {
  await mail.sendFlight( msg );
});


module.exports = emitter;