const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const { SECRET_SENDGRID_KEY } = require('../config/index')

const transporter = nodemailer.createTransport(
	sendgridTransport({
		auth: {
			api_key: SECRET_SENDGRID_KEY,
		},
	})
)

exports.sendMessage = async (req, res, next) => {
	const name = req.body.name
	const email = req.body.email
	const subject = req.body.subject
	const message = req.body.message

	try {
		const sendEmail = await transporter.sendMail({
			to: 'mmaksimov20000806@gmail.com',
			from: email,
			subject: subject,
			html: `<div>
            <h1>Wiadomość od ${name}</h1>
            <p>${message}</p>
        </div>`,
		})

		res.status(201).json({
			status: 'success',
			message: 'Wiadomość wysłana',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			data: [],
			message: 'Interval server error.',
		})
	}
}
