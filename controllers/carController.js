const mongoose = require('mongoose');
const Car = mongoose.model('Car');

exports.addCar = async (req, res, next ) => {
  console.log('add');

  const reqFrom = req.headers.referer.split('/')[3];
  
  req.body.car_owner = req.user._id;
  
  const car = new Car(req.body);
  await car.save();
  
  if ( reqFrom !== 'add-flight' ) res.send( car );
}

exports.updateCar = async ( req, res ) => {

  console.log("update");
  
  const car = await Car.findByIdAndUpdate(
    { _id: req.params.id},
    { $set: req.body }, 
    { new: true }
  );
  
  // req.flash('success', 'Дынные изменены!'); 
  res.send(car);
}

exports.deleteCar = async ( req, res ) => {

  console.log(req.params.id);

  const car = await Car.findByIdAndRemove({ _id: req.params.id });

  if ( car != null )  res.sendStatus(200);  
  else res.sendStatus(500);
}