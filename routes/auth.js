const express = require('express')
const Validate = require('../middleware/validation')
const { signUpValidation } = require('../util/validation')
const { loginValidation } = require('../util/validation')

const router = express.Router()

const authController = require('../controllers/auth')

router.put(
	'/signup',
	signUpValidation.checkConfirmPassword,
	signUpValidation.checkEmail,
	signUpValidation.checkName,
	signUpValidation.checkPassword,
	Validate,
	authController.signup
)
router.post('/login', loginValidation.checkEmail, loginValidation.checkPassword, Validate, authController.login)
router.post('/logout', authController.logout)
router.post('/forgot-password', loginValidation.checkEmail, Validate, authController.forgotPassword)
router.post(
	'/reset-password',
	loginValidation.checkPassword,
	Validate,
	authController.resetPassword
)

module.exports = router
