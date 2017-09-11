const express = require('express');
const router = express.Router();
const controllers = require('../controllers/controllers');

const authController = require('../controllers/authController');
const driverController = require('../controllers/driverController');
const senderController = require('../controllers/senderController');

const carController = require('../controllers/carController');
const freightFlightController = require('../controllers/freightFlightController');
const reviewController = require('../controllers/reviewController');

const { catchErrors } = require('../handlers/errorHandlers');


router.get( '/', (req, res) => {
    res.redirect('/register');
} );
//get a curent driver page
router.get( '/driver/:slug', catchErrors(driverController.getDriverBySLug) );
//get a  driver page
router.get( '/driver', authController.isLoggedIn,  catchErrors(driverController.driverPage) );
//get a signup page
router.get( '/register', controllers.registerPage );
//add new account
router.post( '/register', 
    controllers.validateRegister,   // 1. Валидация данных введеных пользователем
    controllers.register,           // 2. Регистрация пользователя          
    controllers.sendsPassword,      // 3. Отправка пароля
    ((req, res) => res.redirect('/register/confirm'))
);

//get a confirm page
router.get( '/register/confirm', controllers.confirmPage );
// confirm pass
router.post( '/register/confirm', 
    controllers.confirmPass, //подтверждение пароля
    authController.login     // авторизация пользователя
);

router.get('/login', authController.loginPage);
router.post('/login', catchErrors(authController.signin));
router.get('/logout', authController.logout);
//роутер на страницу профиля
router.get('/account/driver', authController.isLoggedIn, catchErrors(driverController.account));
//обновления профиля
router.post('/account/driver', 
    controllers.upload, 
    catchErrors(controllers.resize), 
    catchErrors(driverController.updateAccount)
);

router.get('/forgot', authController.forgotPage );
router.post('/account/forgot', 
    catchErrors(authController.forgot),
    catchErrors(authController.reset),
    controllers.sendsPassword,
    ((req, res) => res.redirect('/reset'))
);
router.get('/reset', authController.resetPage);
router.post('/reset', 
    controllers.confirmPass, 
    catchErrors(authController.update) 
);

//рейсы
router.get('/add-flight', catchErrors(freightFlightController.flightPage));
router.post('/add-flight', catchErrors(freightFlightController.addFlight));
//редактирование рейса
router.get('/flight/edit/:slug', catchErrors(freightFlightController.editFlight) );
router.post('/add-flight/:slug', catchErrors(freightFlightController.updateFlight) );
//подробнее о рейсе
router.get('/search/flight-card/:slug', catchErrors(freightFlightController.flightCardPage));
//страница с рейсами
router.get('/search', 
    authController.isLoggedIn, 
    catchErrors(freightFlightController.getFlightFreight)
);

//добавление автомобиля вместе с новым рейсом
router.post( '/add-car', 
    controllers.upload, 
    catchErrors(controllers.resize), 
    catchErrors(carController.addCar) );

//обновление данный о машине
router.post( '/add-car/:id',
    controllers.upload, 
    catchErrors(controllers.resize), 
    catchErrors(carController.updateCar) 
);

//удаление автомобиля из БД
router.delete( '/delete-car/:id', carController.deleteCar );

//добавление отзывов
router.post('/reviews/:id', 
    authController.isLoggedIn,
    catchErrors(reviewController.addReview)
)

//ОТПРАВИТЕЛЬ и его настройки 

//get a curent  sender page
router.get( '/sender/:slug', catchErrors(senderController.getSenderBySlug) );

//изменение дааных отправителя
router.get('/account/sender', authController.isLoggedIn, catchErrors(senderController.account));
//обновить данные об отправителе
router.post('/account/sender', 
    controllers.upload, 
    catchErrors(controllers.resize), 
    catchErrors(authController.updateAccount)
);


module.exports = router;