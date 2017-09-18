const mongoose = require('mongoose');
const promisify = require("es6-promisify");
const Driver = mongoose.model('Driver');


exports.driverPage = async (req, res) => {
    
    
    const driver = await Driver.find().populate('flights reviews');

    res.render('driver', {
        title: 'Водители', 
        driver
    });
}

exports.getDriverBySLug = async (req, res) => {
     
    const driver = await Driver.findOne({ slug: req.params.slug }).populate('flights reviews');

    res.render('driver', {
        title: 'Личный кабинет', 
        driver
    });
}


exports.account = async (req, res) => {

    const driver = await Driver.find();

    res.render('driverAccount', {
        title: 'Водитель', 
        driver
    });
}


   