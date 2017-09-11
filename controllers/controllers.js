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

exports.registerPage = (req, res) => {
    res.render('register', { title: 'Регистрация' });
}

exports.validateRegister = (req, res, next) => {

    req.sanitizeBody('name');
    req.checkBody('name', 'Вы должны указать имя').notEmpty();
    req.checkBody('phone', 'Вы должны указать номер телефона').isMobilePhone('ru-RU');
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
        
    const [ driver, sender ] = await Promise.all([ 
        Driver.findOne({ phone: req.body.phone }),
        Sender.findOne({ phone: req.body.phone })
    ]);

    let user = driver || sender;   

    if (user) {
        req.flash('error', 'Пользователя с таким номером телефона уже существует!');
        return res.redirect('back');
    }

    const password = generatePass();
    req.body.password = password;
    //добавление в БД
    if (req.body.account ==='sender') {
        req.session.role = 'sender';

        Sender.create(req.body);
        // const sender = new Sender({ name: req.body.name, phone: req.body.phone, password: req.body.password });
        // const register = promisify(Sender.register, Sender);
        // await register(sender, req.body.password);
        next();

    } else if ( req.body.account === 'driver' ) {
        req.session.role = 'driver';
        await Driver.create(req.body);
        next();
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
            console.log( response.body );
            
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