const express = require('express');
const { body } = require('express-validator/check');
const User = require('../models/user');
const router = express.Router();
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');
const Filter = require("bad-words")
const filter = new Filter()

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom((value, { req }) => {
        if (filter.isProfane(value)) {
          return Promise.reject('Profanity is not allowed');
        }
        return User.findOne({ email: value }).then(user => {
          if (user) {
            console.log(1231231231232)
            console.log(user)
            return Promise.reject('Email already exists');
          }
          return true;
        });
      })
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .trim()
      .custom((value, { req }) => {
        if (value.toLowerCase().includes('password')) {
          return Promise.reject(`Thats not a valid password`);
        }

        return true;
      }),
  ],
  authController.signup,
);

router.post('/login', authController.login);

const statusController = require('../controllers/status');

router.get('/status', isAuth, statusController.getStatus);
router.patch(
  '/status',
  isAuth,
  [body('status').trim()],
  statusController.updateStatus,
);
module.exports = router;
