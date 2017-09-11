const mongoose = require('mongoose');
const Review = mongoose.model('Review');

exports.addReview = async ( req, res ) => {
  req.body.author = req.user._id;
  req.body.driver = req.params.id;

  const review = new Review(req.body);
  
  console.log(review);
  
  await review.save();
  req.flash("success", "Отзыв сохранен!");
  res.redirect('back');
}
