const mongoose = require('mongoose');
const Car = mongoose.model('Car');
const Driver = mongoose.model('Driver');


exports.addCar = async (req, res, next ) => {
  const reqFrom = req.headers.referer.split('/')[3];
  
  req.body.car_owner = req.user._id;
  //создание автомобиля 
  const car = new Car(req.body);
  await car.save();
  
  const driver = await Driver.findOne({ _id: req.user._id });
  driver.car = car;
  await driver.save();

  if ( reqFrom !== 'add-flight' ) res.send( car );
}

exports.updateCar = async ( req, res ) => {

  console.log(req.body);
  
  
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