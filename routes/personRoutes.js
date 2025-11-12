const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
const { check } = require('express-validator');

const personValidation = [
    check('name', 'Name is required').not().isEmpty(),
    check('position', 'Position is required').isIn(['Minister', 'Formand', 'Kandidat']),
    check('party', 'Party is required').not().isEmpty(),
    check('startDate', 'Start date is required and must be a valid date').isISO8601().toDate()
];

router.get('/', personController.getAllPersons);

router.get('/position/:position', personController.getPersonsByPosition);

router.get('/party/:party', personController.getPersonsByParty);

router.get('/:id', personController.getPerson);

router.post('/', personValidation, personController.createPerson);

router.put('/:id', personValidation, personController.updatePerson);

router.delete('/:id', personController.deletePerson);

module.exports = router;