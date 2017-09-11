const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const slug = require('limax');


const FreightFlightSchema = new Schema ({
    from: {
        type: String, 
        trim: true, 
        required: 'Пожалуйста, введите место отправки'
    },

    to: {
        type: String, 
        trim: true, 
        required: 'Пожалуйста, введите место прибытия'
    },

    date: {
        type: String, 
        trim: true, 
        required: 'Пожалуйста, введите время и дату отправки'
    }, 

    slug: String, 

    halt: [String], 

    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Driver'
    },

    car: {
        type: mongoose.Schema.ObjectId,
        ref: 'Car'
    }
    
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, 
    toJSON: { virtuals: true },  
    toObject: { virtuals: true }
});

FreightFlightSchema.virtual('fromto')
.get( function() {
    return this.from + ' ' + this.to;
});

FreightFlightSchema.virtual('cars', {
    ref: 'Car', 
    localField: 'author',
    foreignField: 'car_owner'
});

FreightFlightSchema.pre('save', async function(next) {
    if(!this.isModified('from') && !this.isModified('to')) {
        next();
        return;
    }
    
    this.slug = slug(this.fromto);
    //создадим уникальный slug 
    const slugRegEx = new RegExp(`^(${ this.slug })((-[0-9]*$)?)$`, 'i');
    const flightsWidthSlug  = await this.constructor.find({ slug: slugRegEx });

    if(flightsWidthSlug.length){
        this.slug = `${this.slug}-${flightsWidthSlug.length + 1}`;
    }

    next();
});


module.exports = mongoose.model('FreightFlight', FreightFlightSchema);