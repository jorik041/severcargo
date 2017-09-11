const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const options = {discriminatorKey: 'kind'};

const userSchema = new mongoose.Schema({/* user schema */}, options);
const User = mongoose.model('User', userSchema);

// Schema that inherits from User
// const driverSchema = Event.discriminator('Driver',
//   new mongoose.Schema({/* Schema specific to teacher */}, options));


//const driver = new Teacher({/* you can add everything here! */});
//const student = new Student({/* you can add everything here! */});