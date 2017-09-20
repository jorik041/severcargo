const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const slug = require('limax');
const Number = require('./flightNumber');


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

    departureDate: {
        type: String, 
        trim: true, 
        required: 'Пожалуйста, введите время и дату отправки'
    }, 

    arrivalDate: {
        type: String, 
        trim: true, 
        required: 'Пожалуйста, введите примерную время и дату прибития'
    }, 

    slug: String, 

    halt: [String], 

    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'Driver'
    },
    flight_number: {
        type: String, 
        default: 'SOO1'
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

FreightFlightSchema.virtual('driver', {
    ref: 'Driver', 
    localField: 'author',
    foreignField: '_id'
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

FreightFlightSchema.pre('save', async function(next) {
   
    if( !this.isNew ) {
        next();
        return;
    }
    let flightDirection;
    // если  рейс едет в Уренгой или Сургут, то
    if ( this.to === "Новый Уренгой" || this.to === "Сургут") {
        flightDirection = 'N';
    } else {
        flightDirection = 'S';
    }
    
    const doc = this;

    await Number.findByIdAndUpdate(
        { "_id": "flight_number" }, 
        { "$inc": { "number": 1 } }, 
        
        function(error, counter)   {
        if(error){
             return next(error);
        } else if (!counter ) {//если модели нету, то создать новую 
    
            counter =  new Number({ _id: "flight_number" }, { $inc: { number: 1 } });
            counter.save(() => {
                let num = ("000" + counter.number).substr(-4);
                doc.flight_number = `${ flightDirection }${ num }`;
                next();
            });
          } else {
            let num = ("000" + counter.number).substr(-4);            
            doc.flight_number = `${ flightDirection }${ num }`;
            next();
        }
    });
});

module.exports = mongoose.model('FreightFlight', FreightFlightSchema);