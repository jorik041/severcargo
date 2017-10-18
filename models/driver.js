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

	photo: {
		type: String,
		default: 'driver-ava.svg'
	},

	phone: {
		type: String,
		trim: true,
		unique: 'Пользователь с такми номером телефона уже зарегистрирован',
		validate:{
			validator: value => {
				validator.isMobilePhone(value, 'ru-RU');
			},
			msg: 'Номер телефона введен неверно' 
		},
		required: 'Пожалуйста, введте номер телефона'
	},

	slug: String, 

	quantity_flights: {
		type: Number,
		default: 0
	},

	salt: {
		type: String,
		required: true
	},

	password: {
		type: String,
		required: true
	},

	car: {
		type: mongoose.Schema.ObjectId,
		ref: 'Car'
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

driverSchema.statics.getTopDrivers = function () {
	return this.aggregate([
		{
			$lookup: {
				from: 'reviews', 
				localField: '_id', 
				foreignField: 'driver', 
				as: 'reviews' 
			}
    },
    {
			$lookup: {
				from: 'cars', 
				localField: '_id', 
				foreignField: 'car_owner', 
				as: 'car' 
			}
		}, { 
      $match: {
        'reviews.0': { $exists: true }
      } 
    }, {
      $project: {
        photo: '$$ROOT.photo',
        name: '$$ROOT.name',
        quantity_flights: '$$ROOT.quantity_flights',
        car: '$$ROOT.car',
        reviews: '$$ROOT.reviews',
        slug: '$$ROOT.slug',
        averageRating: { $avg: '$reviews.rating'}
      }
    }, {
      $sort: { quantity_flights: -1 }
    }
	]);
}

function autopopulate(next) {
	this.populate('car');
	next();
}

driverSchema.pre('find', autopopulate);
driverSchema.pre('findOne', autopopulate);

driverSchema.plugin(passportLocalMongoose, { usernameField: 'phone' });
driverSchema.plugin(beautifyUnique);

module.exports = mongoose.model('Driver', driverSchema);