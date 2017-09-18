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

    flight_number: {
        type: String,
        default: 'S0001'
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
    if(!this.isModified('flight_number') ) {
        next();
        return;
    }

    let test = 'S-001',
        pieces = test.split('-'),
        prefix = pieces[0],
        lastNum = pieces[1];
    
    lastNum = parseInt(lastNum, 10);
    // lastNum = +lastNum is also a valid option.
    function incrementFlightNum () {
        let num = lastNum++;
    
        return num = `S${("000" + num).substr(-4)}`;
    }
    this.flight_number = incrementFlightNum();

    next();
});


module.exports = mongoose.model('FreightFlight', FreightFlightSchema);