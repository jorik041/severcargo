const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const passportLocalMongoose = require('passport-local-mongoose');
const bcrypt = require('bcryptjs');
const slug = require('limax');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const driverSchema = new Schema ({
    account: String,

    name: {
        type: String, 
        trim: true,
        required: 'Введите имя'
    }, 

    surename: {
        type: String, 
        trim: true
    },

    city: {
        type: String, 
        trim: true
    },

    photo: String,

    phone: {
        type: String,
        trim: true,
        unique: 'Такой номер телефона уже существует',
        validate:{
            validator: value => {
                validator.isMobilePhone(value, 'ru-RU');
            },
            msg: 'Номер телефона введен неверно' 
        },
        required: 'Пожалуйста, введте номер телефона'
    },

    slug: String, 

    salt: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    resetPasswordExpires: Date
}, { 
    toJSON: { virtuals: true },  
    toObject: { virtuals: true }
});

driverSchema.virtual('flights', {
    ref: 'FreightFlight', 
    localField: '_id',
    foreignField: 'author'
});

driverSchema.virtual('cars', {
    ref: 'Car', 
    localField: '_id',
    foreignField: 'car_owner'
});

driverSchema.virtual('reviews', {
    ref: 'Review', 
    localField: '_id',
    foreignField: 'driver'
});

driverSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        next();
        return;
    }

    // password changed so we need to hash it (generate a salt)
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err); 
            // override the cleartext password with the hashed one
            user.salt = salt;
            user.password = hash;
            next();
        });
    });
});

driverSchema.methods.comparePassword = function(password, cb) {
    var user = this;
    
    bcrypt.compare(password, user.password, function(err, res) {
        console.log(`результат сравнения ${res}`);
        
        if (err) return cb(err);
        cb(null, res);
    });
}

driverSchema.pre('save', async function(next) {
    if(!this.isModified('name') ) {
        next();
        return;
    }
    
    this.slug = slug(this.name);
    //создадим уникальный slug 
    const slugRegEx = new RegExp(`^(${ this.slug })((-[0-9]*$)?)$`, 'i');
    const driverWidthSlug  = await this.constructor.find({ slug: slugRegEx });

    if(driverWidthSlug.length){
        this.slug = `${this.slug}-${driverWidthSlug.length + 1}`;
    }

    next();
});


driverSchema.plugin(passportLocalMongoose, { usernameField: 'phone' });
driverSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Driver', driverSchema);