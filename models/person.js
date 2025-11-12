const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    party: {
        type: String,
        required: [true, 'Party is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        enum: {
            values: ['Minister', 'Formand', 'Kandidat'],
            message: 'Position must be either "Minister", "Formand" or "Kandidat"'
        }
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'Start date cannot be in the future'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

personSchema.index({ name: 1, party: 1, position: 1 });

const Person = mongoose.model('Person', personSchema);

module.exports = Person;