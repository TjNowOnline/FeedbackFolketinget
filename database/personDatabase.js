const Person = require('../models/person');

// Get all persons
const getAllPersons = async () => {
    try {
        return await Person.find().sort({ createdAt: -1 });
    } catch (error) {
        throw new Error(`Error fetching persons: ${error.message}`);
    }
};

// Get a single person by ID
const getPersonById = async (id) => {
    try {
        const person = await Person.findById(id);
        if (!person) {
            throw new Error('Person not found');
        }
        return person;
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new Error('Invalid person ID format');
        }
        throw error;
    }
};

// Create a new person
const createPerson = async (personData) => {
    try {
        // Check if person with same name and position already exists
        const existingPerson = await Person.findOne({
            name: { $regex: new RegExp(`^${personData.name}$`, 'i') },
            position: personData.position
        });

        if (existingPerson) {
            throw new Error(`A ${personData.position.toLowerCase()} with that name already exists`);
        }

        const person = new Person({
            name: personData.name,
            party: personData.party,
            position: personData.position,
            startDate: new Date(personData.startDate)
        });

        return await person.save();
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            throw new Error(messages.join(', '));
        }
        throw error;
    }
};

// Update an existing person
const updatePerson = async (id, updateData) => {
    try {
        const person = await Person.findById(id);
        if (!person) {
            throw new Error('Person not found');
        }

        // Check if another person with the same name and position exists
        if (updateData.name && updateData.position) {
            const existingPerson = await Person.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                position: updateData.position
            });

            if (existingPerson) {
                throw new Error(`A ${updateData.position.toLowerCase()} with that name already exists`);
            }
        }

        // Update fields if they are provided
        if (updateData.name) person.name = updateData.name;
        if (updateData.party) person.party = updateData.party;
        if (updateData.position) person.position = updateData.position;
        if (updateData.startDate) person.startDate = new Date(updateData.startDate);

        return await person.save();
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new Error('Invalid person ID format');
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            throw new Error(messages.join(', '));
        }
        throw error;
    }
};

// Delete a person
const deletePerson = async (id) => {
    try {
        const person = await Person.findByIdAndDelete(id);
        if (!person) {
            throw new Error('Person not found');
        }
        return person;
    } catch (error) {
        if (error.kind === 'ObjectId') {
            throw new Error('Invalid person ID format');
        }
        throw error;
    }
};

// Get persons by position
const getPersonsByPosition = async (position) => {
    try {
        const validPositions = ['Minister', 'Formand', 'Kandidat'];
        if (!validPositions.includes(position)) {
            throw new Error(`Invalid position. Must be one of: ${validPositions.join(', ')}`);
        }
        return await Person.find({ position }).sort({ startDate: -1 });
    } catch (error) {
        throw new Error(`Error fetching persons by position: ${error.message}`);
    }
};

// Get persons by party
const getPersonsByParty = async (party) => {
    try {
        const persons = await Person.find({ 
            party: { $regex: new RegExp(party, 'i') } 
        }).sort({ position: 1, startDate: -1 });

        if (persons.length === 0) {
            throw new Error('No persons found for the specified party');
        }

        return persons;
    } catch (error) {
        throw new Error(`Error fetching persons by party: ${error.message}`);
    }
};

module.exports = {
    getAllPersons,
    getPersonById,
    createPerson,
    updatePerson,
    deletePerson,
    getPersonsByPosition,
    getPersonsByParty
};