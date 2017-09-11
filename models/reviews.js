const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;


const reviewSchema = new Schema ({

  created: {
    type: Date, 
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId, 
    ref: 'Sender', 
    required: 'Вы должны ввести автора'
  },
  driver: {
    type: mongoose.Schema.ObjectId, 
    ref: 'Driver', 
    required: 'Вы должены ввести водителя!'    
  }, 
  text: {
    type: String, 
    required: 'Вы должны ввести текст отзыва!'
  }, 
  rating: {
    type: Number,
    min: 1, 
    max: 5 
   }

});

function autopopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne ', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);