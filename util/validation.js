const { check } = require('express-validator')

exports.signUpValidation = {
	checkEmail: check('email')
		.isEmail()
		.withMessage('Podany email nie odpowiada formatowi tekst@tekst.domena.')
		.normalizeEmail(),
	checkName: check('name')
		.not()
		.isEmpty()
		.isLength({ min: 8 })
		.withMessage('Uzupełnij pole z imieniem.')
		.trim()
		.escape(),
	checkPassword: check('password')
		.notEmpty()
		.isLength({ min: 8 })
		.withMessage(
			'Hasło powinno zawierać przynajmniej jedną dużą literę, znak specjalny, cyfrę oraz conajmniej 8 znaków.'
		),
	checkConfirmPassword: check('confirmPassword')
		.notEmpty()
		.isLength({ min: 8 })
		.equals()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords have to match!')
			}
		})
		.withMessage('Hasła powinny być takie same.'),
}

exports.loginValidation = {
	checkEmail: check('email')
		.isEmail()
		.withMessage('Podany email nie odpowiada formatowi tekst@tekst.domena.')
		.normalizeEmail(),
	checkPassword: check('password')
		.notEmpty()
		.isLength({ min: 8 })
		.withMessage(
			'Hasło powinno zawierać przynajmniej jedną dużą literę, znak specjalny, cyfrę oraz conajmniej 8 znaków.'
		),
}
