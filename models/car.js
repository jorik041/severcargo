const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const carSchema = new Schema ({
    model: {
        type: String, 
        require: true
    }, 

    type: {
        type: String, 
        require: true
    },

    number: {
        type: String, 
        require: true
    },

    photo: [String], 

    car_owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'Driver'
    }
});

module.exports = mongoose.model('Car', carSchema);