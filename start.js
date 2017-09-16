
const mongoose = require('mongoose');


require('dotenv').config({ path: ' variables.env ' });


mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connect(process.env.DATABASE, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true
});
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

//import our model
require('./models/freightFlight');
require('./models/car');
require('./models/driver');
require('./models/sender');
require('./models/reviews');


//Start our app
const app = require('./app');

//listen for requests
app.set('port', process.env.PORT || 4000);
const server = app.listen(app.get('port'), () => {
    console.log(`Server runing PORT ${server.address().port}`);
});