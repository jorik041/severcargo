const EventEmitter = require('events');
const emitter = new EventEmitter();

emitter.on('registered', msg => console.log(msg) );

module.exports = emitter;