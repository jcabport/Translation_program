const express = require('express');
const router = express.Router();
const {
  updateNameMapping,
  deleteNameMapping,
} = require('../controllers/nameController');

// Name mapping routes
router.route('/:id')
  .put(updateNameMapping)
  .delete(deleteNameMapping);

module.exports = router;
