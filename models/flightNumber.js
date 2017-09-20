const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const flightNumSchema = new Schema ({
  "_id": { "type": String, "required": true },
  
  number: {
    type: Number, 
    default: 0
  },
  
  author: {
    type: mongoose.Schema.ObjectId, 
    ref: 'FreightFlight'
  }

});

function autopopulate(next) {
  this.populate('author');
  next();
}

flightNumSchema.pre('find', autopopulate);
flightNumSchema.pre('findOne ', autopopulate);

const flightNum = mongoose.model('flightNum', flightNumSchema);

module.exports = flightNum;
  