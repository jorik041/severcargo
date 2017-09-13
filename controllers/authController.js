const passport = require('passport');
const mongoose = require('mongoose');
const Driver = mongoose.model('Driver');
const Sender = mongoose.model('Sender');
const promisify = require('es6-promisify')

exports.loginPage = (req, res) => {
    res.render('login', {
        title: 'Войти'
    });
}

exports.login = (req, res, next) => {
    console.log(req.session.role);
    if ( req.session.role == "driver" ) {

        passport.authenticate('local-driver', {
                
            failureRedirect: '/login',
            failureFlash: { type: 'error', message: 'Не смогли зарегистрироваться или войти!' },
            successRedirect: '/driver',
            successFlash: 'Добро пожаловать!'
        })(req, res, next);

        } else if ( req.session.role == "sender" ) {

        passport.authenticate('local-sender', {
            failureRedirect: '/login',
            failureFlash: { type: 'error', message: 'Не смогли зарегистрироваться или войти!' },
            successRedirect: '/search',
            successFlash: 'Добро пожаловать!'
        })(req, res, next);
    }
}

exports.signin = async (req, res, next) => {

    const [ driver, sender ] = await Promise.all([ 
        Driver.findOne({ phone: req.body.phone }),
        Sender.findOne({ phone: req.body.phone })
    ]);

    let user = driver || sender;   

    if (!user) {
        req.flash('error', 'Пользователя с таким номером телефона не существует!');
        return res.redirect('back');
    }
    
    if (driver) {

        passport.authenticate('local-driver', {
            failureRedirect: '/login',
            failureFlash: true,
            successRedirect: '/search',
            successFlash: 'Добро пожаловать!'
        })(req, res, next);
    } else if (sender) {

        passport.authenticate('local-sender', {
            failureRedirect: '/login',
            failureFlash: true,
            successRedirect: '/search',
            successFlash: 'Добро пожаловать!'
        })(req, res, next);
    }

}//signin

exports.logout = (req, res) => {
    req.session.destroy();
    req.logout();
    //req.flash('success', 'Вы вышли из системы!👋');
    res.redirect('/login');
    
};

exports.isLoggedIn = (req, res, next) => {
    //проверка авторизован ли пользователь
    if (req.isAuthenticated()) {
        next(); // carry on! They are logged in!
        return;
    }
    req.flash('error', 'Для просмотра рейсов вам необходимо зарегестрироваться или авторизоваться');
    res.redirect('/login');
};

exports.forgotPage = (req, res) => {
    res.render('forgot', {
        title: 'Восстановление пароля'
    });
}

exports.forgot =  async (req, res, next) => {
    
    let [ driver, sender ] = await Promise.all([ 
        Driver.findOne({ phone: req.body.phone }),
        Sender.findOne({ phone: req.body.phone })
    ]);

    if (!driver && !sender) {
        req.flash('error', 'Пользователя с таким номером телефона не существует!');
        return res.redirect('back');
    } 
    const user = driver || sender;
    
    user.resetPasswordExpires = Date.now() + 3600000; // время для ввода нового отправленного пароля
    await user.save();
    console.log(user.resetPasswordExpires);
    next();
}

exports.reset = async (req, res, next) => {
    // let user;
    console.log('reset');
    
    const [ driver, sender ] = await Promise.all([ 
        Driver.findOne({ resetPasswordExpires: { $gt: Date.now() } }),
        Sender.findOne({ resetPasswordExpires: { $gt: Date.now() } })
    ]);
    
    const user = driver || sender;

    if (!user) {
        req.flash('error', 'Введеный пароль не верный либо время действия пароля истекло!');
        return res.redirect('back');
    }
    next();
}

exports.resetPage = (req, res) => {
    res.render('reset', {
        title: 'Новый пароль'
    });
}

exports.update = async (req, res) => {
    const [ driver, sender ] = await Promise.all([ 
        Driver.findOne({ resetPasswordExpires: { $gt: Date.now() } }),
        Sender.findOne({ resetPasswordExpires: { $gt: Date.now() } })
    ]);
    
    const user = driver || sender;

    if (!user) {
        req.flash('error', 'Введеный пароль не верный либо время действия пароля истекло!');
        return res.redirect('back');
    }

    // const setPassword = promisify(user.setPassword, user);
    // await setPassword(req.body.password);

    user.password = req.body.password;
    
    user.resetPasswordExpires = undefined;
    const userUpdated = await user.save();
    await req.login(userUpdated);
    req.flash('success', '💃 Отлично! Пароль изменен');
    res.redirect('/search');
}

exports.updateAccount = async (req, res) => {

    const updates = {
        name:  req.body.name,
        surename: req.body.surname,
        phone: req.body.phone,
        city:  req.body.city,
        photo:  req.body.photo || 'sender-ava.svg'
    };

    console.log(req.body.photo);
    
    
    const [ driver, sender ] = await Promise.all([ 
        Driver.findById({ _id : req.user._id  }),
        Sender.findById({ _id : req.user._id  })
    ]);

    const user = driver || sender;    

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

    // try {
        async function  updateAcc() {  

            const userId = { _id: req.user._id};
            const setUpdates = { $set: updates };
            const additionalParams = { runValidators: true, context: 'query', upsert: true };

            if ( user.account == 'driver') {

                await Driver.findByIdAndUpdate( userId, setUpdates, additionalParams );
            } else {

                await Sender.findByIdAndUpdate( userId, setUpdates, additionalParams );
            }
        

            req.flash('success', 'Профиль обнавлен!');
            res.redirect(`/${user.account}/${user.slug}`);
            return;
        }        
}