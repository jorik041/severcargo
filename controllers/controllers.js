const mongoose = require('mongoose');
const request = require('request');
const generator = require('generate-password');
const promisify = require('es6-promisify');
const md5 = require('md5');
const validator = require('validator');
const Driver = mongoose.model('Driver');
const Sender = mongoose.model('Sender');
const freightFlight = mongoose.model('FreightFlight');
const jimp = require('jimp');
const uuid = require('uuid');
const multer = require('multer');
const emitter = require('../handlers/events');

exports.registerPage = (req, res) => {
    res.render('register', { title: 'Регистрация' });
}

exports.validateRegister = (req, res, next) => {
    //console.log(req.body);
    req.sanitizeBody('phone');
    req.checkBody('name', 'Вы должны указать имя').notEmpty();
    req.checkBody('account', 'Укажите тип пользователя!').notEmpty();
    req.checkBody('phone', 'Введите номер телефона').notEmpty();    
   // if ( req.body.phone ) req.checkBody('phone', 'Вы ввели неправильный номер телефона').isMobilePhone('ru-RU');
    //passwords
    //req.checkBody('password', 'Пароль введен неверно!').notEmpty();
    //req.checkBody('password-confirm', 'Подтвержденный пароль не может быть пустым!').notEmpty();
    //req.checkBody('password-confirm', 'Подтвержденный пароль не совпадает!').notEmpty();

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {
            body: req.body,
            flashes: req.flash()
        });
        return; // stop the fn from running
    }
    next(); // there were no errors!
}

//генерация пароля для подтверждения
function generatePass () {
    return generator.generate({
        length: 6,
        uppercase: true,
        numbers: true
    });
}

exports.register = async (req, res, next) => { 

    const password = generatePass();
    req.body.password = password;
    //добавление в БД    
    if (req.body.account === 'sender') {
        let user = await Driver.findOne({ phone: req.body.phone });
        
        if ( user ) {
            req.flash('error', 'Пользователь с таким номером телефона уже зарегистрирован');
            return res.redirect('back');  
        }
        
        Sender.create(req.body)
        .then( res => next() )
        .catch( err => {  
            req.flash('error', err.errors.phone.message );
            return res.redirect('back'); 
        });
        
        req.session.role = 'sender';
    } else if ( req.body.account === 'driver' ) {
        let user = await Sender.findOne({ phone: req.body.phone });
        if ( user) {
            req.flash('error', 'Пользователь с таким номером телефона уже зарегистрирован');
            return res.redirect('back');  
        }

        req.session.role = 'driver';

        Driver.create(req.body)
            .then( res => next() )
            .catch( err => {  
                req.flash('error', err.errors.phone.message );
                return res.redirect('back'); 
            });

    }
}

exports.sendsPassword = (req, res, next) => {
    //проверка если в req.body.password есть пароль установленее ранее то в password запишим его
    //если же там нет значения сгенерируем пароль снова
    //так как sendsPassword используется в "/forgot" и там нету req.body.password
    const password = req.body.password || generatePass();

    console.log(password);
    
    //натсройки для отправки смс
    const msg = Buffer.from(password, 'utf-8').toString();
    const to = req.body.phone;
    const user = 'baytzam@gmail.com';
    const pass = '8bf2bf2ac229632f82ba37826f2e2daf';
    //запрос к smsaero API для отправки сообщения пользователю 
    const requestPromis = promisify(request.post);
    requestPromis(`https://gate.smsaero.ru/send/?user=${user}&password=${pass}&to=${to}&text=${encodeURIComponent(msg)}&from=news`)
        .then((response) => {
            //console.log( response.body );
            
            if (response.body.match( ' reject') ) {
                req.flash('error', 'Ошибка! На введенный номер телефона невозможно отправить сообщение');
                res.redirect('back');
            } else {
                req.session.name = req.body.name;
                req.session.phone = req.body.phone;
                req.session.pass = password;
                
                next();
            }
        })
        .catch(err => {
            req.flash('error', 'На сервере произошла ошибка попробуйте снова!');
            res.redirect('back');
            console.error(err);
        });
}

exports.confirmPage = (req, res) => {
    res.render('confirm', { title: 'Подтверждение пароля'});    
}

exports.confirmPass = (req, res, next) => {
    req.checkBody('password', 'Введите пароль!').notEmpty();
    if (req.session.pass === req.body.password) {
        //объект в который будут складываться поля вновь зрагеистрировавщшегося поль-ля и отправляться на почту
        const whoRegistered = {};

        whoRegistered.account = req.session.role;
        whoRegistered.name = req.session.name;
        whoRegistered.phone = req.session.phone;
        whoRegistered.subject = 'Зарегистрировался пользователь';
        //сбросить пароль сохраненный в сессии
        req.session.pass = null;
        emitter.emit( 'registered', whoRegistered );
        next();
    } else {
        req.flash('error', 'Ошибка! Пароль введен неверно, попробуйте снова!');
        res.redirect('back');
    }
}


//загрузка изображения

const multerOptions = {
    storage: multer.memoryStorage(), 
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto) {
            next(null, true);
        } else {
            next({ message: 'Вы не можете загрузить файл с таким расширением'}, false);
        }
    }
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
    if(!req.file) {
        next();
        return;
    }

    const extention = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extention}`;

    const photo = await jimp.read(req.file.buffer);
    await photo.resize(256, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    next();
}

exports.validateAccount = ( req, res, next ) => {

    req.checkBody('name', 'Пожалуйста, введите име').notEmpty();
    req.checkBody('phone', 'Пожалуйста, введите номер вашего телефона').notEmpty(); 

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('driverAccount', {
            body: req.body,
            flashes: req.flash()
        });
        return; // stop the fn from running
    }
    next(); // there were no errors!
}

exports.contacts = (req, res) => {
    res.render('contacts', { title: 'Контакты' });
}

exports.getTopDrivers = async (req, res) => {
    const drivers = await Driver.getTopDrivers();
    //res.json(drivers);
    res.render('topDrivers', { drivers, title: 'Топ' });
}

exports.about = (req, res) => {
    res.render('about', { title: 'О проекте' })
}

exports.issues = (req, res) => {
    res.render('issues', { title: 'Часто задаваемые вопросы'})
}