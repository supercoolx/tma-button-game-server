const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authentication');

const {
  login,
  logout,
} = require('../controllers/authController');

router.post('/login', login);
router.delete('/logout', authenticateUser, logout);

module.exports = router;
