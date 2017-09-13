const mongoose = require('mongoose');
const promisify = require("es6-promisify");
const FreightFlight = mongoose.model('FreightFlight');
const Car = mongoose.model('Car');


exports.getFlightFreight = async(req, res, next) => {
  
  const flights = await FreightFlight.find()
    .populate({
      path: 'author',
      populate: { path: 'car' }
    })
    .sort({
      created_at: -1
    });

  res.render('search', {
    title: 'Добавить рейс',
    flights
  });
}

exports.flightPage = async(req, res) => {
  const car = await Car.findOne({ car_owner: req.user._id });
  res.render('addFlight', {
    title: 'Добавить рейс',
    car
  });
}
//добавление рейса в БД
exports.addFlight = async(req, res) => {
  req.body.author = req.user._id;

  const flights = new FreightFlight(req.body);
  await flights.save();

  res.redirect('/search');
}

exports.flightCardPage = async(req, res) => {

  const flight = await FreightFlight.findOne({
      slug: req.params.slug
    }).populate({
      path: 'author',
      populate: { path: 'car reviews' }
    });

  if (!flight) return next();

  res.render('flight-card', {
    title: 'Подробнее о рейсе',
    flight
  });
}

const confirmOwner = (flight, user) => {
  
  if (!flight.author.equals(user._id)) {
    throw Error('Вы должны добавить рейс, перед тем как редактировать его')
  }
}

exports.editFlight = async(req, res) => {
  //найти рейс по id
  const flight = await FreightFlight.findOne({
    slug: req.params.slug
  });   
  //подтвердить что рейс может этот редктировать текущий пользователь
  confirmOwner(flight, req.user);
  res.render('editFlight', { title:'Редактировать рейс', flight });
}

exports.updateFlight = async(req, res) => {
  const flight = await FreightFlight.findOneAndUpdate(
    { slug: req.params.slug }, 
    req.body,
    { new: true, runValidators: true}
  ).exec();

  req.flash('saccess', 'Данные обновленны');
  res.redirect(`/search/flight-card/${ flight.slug }`);
}