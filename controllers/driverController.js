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


exports.updateAccount = async (req, res) => {

    const updates = {
        name: req.body.name,
        surename: req.body.surname,
        phone: req.body.phone,
        city:  req.body.city,
        photo:  req.body.photo
    };
    
    const user = await Driver.findById({ _id : req.user._id });
    const password = req.body['password'];
    let checkPass = true;
    //
    if ( password != '' ) {
        await user.comparePassword(password, function(err, response) {
            
            if (!response) {
                req.flash('error', 'Введенный пароль не верен!');
                res.redirect('back');
                return;
            }
            return;
        });

        if ( req.body['new-password'] == req.body['confirm-password'] ) {
            user.password = req.body['new-password'];
            await user.save();
            updateAcc();
        } else {
            req.flash('error', 'Введенный пароль не совпадает!');
            res.redirect('back');
            return;
        }

    } else {
        updateAcc();
    }

    async function  updateAcc() {  
        const driver = await Driver.findByIdAndUpdate( 
            { _id: req.user._id},
            { $set: updates }, 
            { runValidators: true, context: 'query', upsert: true }
        );
        req.flash('success', 'Профиль обнавлен!');
        res.redirect(`/driver/${driver.slug}`);
        return;
    }
}