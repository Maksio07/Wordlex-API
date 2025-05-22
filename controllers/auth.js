const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const jwt = require('jsonwebtoken')
const { SECRET_ACCESS_TOKEN, PORT, SECRET_SENDGRID_KEY } = require('../config/index')
const User = require('../models/user')


const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: SECRET_SENDGRID_KEY,
		},
	})
)

exports.signup = async (req, res, next) => {
	const name = req.body.name
	const email = req.body.email
	const password = req.body.password

	try {
		const hashedPassword = await bcrypt.hash(password, 12)
		const user = new User({
			name,
			email,
			password: hashedPassword,
		})

		const existingUser = await User.findOne({ email })

		if (existingUser)
			return res.status(400).json({
				status: 'failed',
				data: [],
				message: 'Użytkownik z podanym e-mailem już istnieje.',
			})

		const result = await user.save()
		const sendEmail = await transporter.sendMail({
			to: email,
			from: 'mmaks080602@wp.pl',
			subject: 'Rejestracja powiodła się!',
			html: `<div>
				<h1>Witamy na naszym portalu!</h1>
				<p>Życzymy miłej i przyjemnej nauki!</p>
			</div>`,
		})

		res.status(201).json({
			status: 'success',
			message: 'Dziękujemy za rejestrację. Twoje konto zostało utworzone pomyślnie.',
			data: [name, email, password],
			userId: result._id,
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			data: [],
			message: 'Interval server error.',
		})
	}

	res.end()
}

exports.login = async (req, res, next) => {
	const email = req.body.email
	const password = req.body.password
	
	try {
		const user = await User.findOne({ email })

		if (!user)
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Podany email nie istnieje.',
			})

		const userName = user.name
		const session = (req.session.user = { username: userName, userID: user._id.toString() })

		const passwordsMatch = await bcrypt.compare(password, user.password)

		if (!passwordsMatch)
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Niepoprawne hasło, spróbuj ponownie.',
			})

		let options = {
			maxAge: 60000,
			httpOnly: true,
			secure: true,
		}

		req.session.isLoggedIn = true

		const token = user.generateAccessJWT()
		res.cookie('SessionID', token, options)

		res.status(201).json({
			status: 'success',
			data: [email, password, token, session],
			message: 'Jesteś zalogowany.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			data: [],
			message: 'Interval Server Error',
		})
	}
}

exports.logout = async (req, res, next) => {
	try {
		const response = await req.session.destroy(err => {
			if (err) {
				return res.status(401).json({
					status: 'failed',
					message: 'Coś poszło nie tak, spróbuj ponownie.',
				})
			}
		})

		req.session = null
		req.session.isLoggedIn = false

		res.status(201).json({
			status: 'success',
			message: 'Jesteś pomyślnie wylogowany /-a.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.forgotPassword = async (req, res, next) => {
	const email = req.body.email

	try {
		const user = await User.findOne({ email })

		if (!user) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Podany email nie istnieje.',
			})
		}

		const token = jwt.sign({ email }, SECRET_ACCESS_TOKEN, { expiresIn: 60 * 3 })
		const resetLink = `http://localhost:5173/auth/reset-password/${token}`

		const sendEmail = await transporter.sendMail({
			to: email,
			from: 'mmaks080602@wp.pl',
			subject: 'Reset Hasła',
			html: `<p>Otrzymaliśmy prośbę o zmianę hasła do portalu Wordlex.</p>
						<p>Aby zmienić hasło, kliknij link poniżej:
						<a href=${resetLink}>Zresetuj hasło</a>
					 </p>
						`,
		})

		res.status(201).json({
			status: 'success',
			message: 'Email z linkiem wysłano.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.resetPassword = async (req, res, next) => {
	const token = req.body.token.token
	const newPassword = req.body.newPassword

	try {
		const { email } = jwt.verify(token, SECRET_ACCESS_TOKEN)
		const user = await User.findOne({
			email,
		})

		if (!user) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Podany email nie isnieje.',
			})
		}

		const hashedPassword = await bcrypt.hash(newPassword, 12)
		user.password = hashedPassword
		await user.save()
		res.status(201).json({
			status: 'success',
			message: 'Hasło zmienione pomyślnie.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}
