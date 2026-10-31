const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/stats/summary', studentController.getStats);

// CRUD Endpoints
router.post('/', studentController.createStudent);            // CREATE
router.get('/', studentController.getAllStudents);            // READ ALL
router.get('/:student_id', studentController.getStudentById);  // READ ONE
router.put('/:student_id', studentController.updateStudent);   // UPDATE
router.delete('/:student_id', studentController.deleteStudent);// DELETE

module.exports = router;
