const Person = require('../models/person');
const { validationResult } = require('express-validator');
//Get all persons
exports.getAllPersons = async (req, res) => {
    try {
        const persons = await Person.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: persons.length,
            data: persons
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};
//Get single person
exports.getPerson = async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        
        if (!person) {
            return res.status(404).json({
                success: false,
                error: 'No person found with that ID'
            });
        }
        
        res.status(200).json({
            success: true,
            data: person
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};
//Create new person
exports.createPerson = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name, party, position, startDate } = req.body;
        
        // Check if person with same name and position already exists
        const existingPerson = await Person.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            position: position
        });

        if (existingPerson) {
            return res.status(400).json({
                success: false,
                error: `A ${position.toLowerCase()} with that name already exists`
            });
        }

        const person = await Person.create({
            name,
            party,
            position,
            startDate: new Date(startDate)
        });

        res.status(201).json({
            success: true,
            data: person
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};
//Update person
exports.updatePerson = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name, party, position, startDate } = req.body;
        
        let person = await Person.findById(req.params.id);
        
        if (!person) {
            return res.status(404).json({
                success: false,
                error: 'No person found with that ID'
            });
        }

        const existingPerson = await Person.findOne({
            _id: { $ne: req.params.id },
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            position: position
        });

        if (existingPerson) {
            return res.status(400).json({
                success: false,
                error: `A ${position.toLowerCase()} with that name already exists`
            });
        }

        person.name = name || person.name;
        person.party = party || person.party;
        person.position = position || person.position;
        person.startDate = startDate ? new Date(startDate) : person.startDate;
        
        await person.save();
        
        res.status(200).json({
            success: true,
            data: person
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};
//Delete person
exports.deletePerson = async (req, res) => {
    try {
        const person = await Person.findById(req.params.id);
        
        if (!person) {
            return res.status(404).json({
                success: false,
                error: 'No person found with that ID'
            });
        }
        
        await person.remove();
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};
//Get person by position
exports.getPersonsByPosition = async (req, res) => {
    try {
        const { position } = req.params;
        const validPositions = ['Minister', 'Formand', 'Kandidat'];
        
        if (!validPositions.includes(position)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid position. Must be one of: ' + validPositions.join(', ')
            });
        }
        
        const persons = await Person.find({ position })
            .sort({ startDate: -1 });
            
        res.status(200).json({
            success: true,
            count: persons.length,
            data: persons
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};
//Get person by party
exports.getPersonsByParty = async (req, res) => {
    try {
        const { party } = req.params;
        
        const persons = await Person.find({ 
            party: { $regex: new RegExp(party, 'i') } 
        }).sort({ position: 1, startDate: -1 });
            
        if (persons.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No persons found for the specified party'
            });
        }
        
        res.status(200).json({
            success: true,
            count: persons.length,
            data: persons
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};