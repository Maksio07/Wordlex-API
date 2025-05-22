const bcrypt = require('bcryptjs')
const Language = require('../models/languageSchema')
const User = require('../models/user')

exports.putLanguage = async (req, res, next) => {
	const languageName = req.body.name
	const flag = req.body.flag
	const userId = req.body.userId
	const languageId = req.body.languageId

	const choosenLanguage = new Language({
		name: languageName,
		flag: flag,
		creator: userId,
		languageId: languageId,
	})

	try {
		const user = await User.findById(userId)
		let duplicateLanguage = false

		if (!user)
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Użytkownik nie istnieje.',
			})

		user.languages.forEach(lang => {
			if (lang.name === languageName) {
				duplicateLanguage = true
				return res.status(401).json({
					status: 'failed',
					message: 'Ten język już jest dodany, spróbuj inny.',
				})
			}
		})

		if (duplicateLanguage === false) {
			user.languages.push(choosenLanguage)
			await user.save()
			await choosenLanguage.save()
			res.status(201).json({
				status: 'success',
				data: [languageName, flag, userId, languageId],
				message: 'Język został dodany.',
			})
		}
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.getLanguage = async (req, res, next) => {
	const userId = req.params.id

	try {
		const user = await User.findById(userId)
		if (!user) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Użytkownik nie istnieje.',
			})
		}

		res.status(201).json({
			status: 'success',
			data: user.languages,
			userName: user.name,
			message: 'Dodane przez użytkownika języki zostały pobrane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.deleteLanguage = async (req, res, next) => {
	const userId = req.body.userId
	const languageId = req.body.languageId

	try {
		const user = await User.findById(userId)

		if (!user) {
			return res.status(401).json({
				status: 'failed',
				message: 'Użytkownik nie istnieje.',
			})
		}

		const userLanguage = user.languages.find(lang => {
			return lang.languageId === languageId
		})

		if (!userLanguage) {
			return res.status(401).json({
				status: 'failed',
				message: 'Coś poszło nie tak.',
			})
		}

		const response = await user.languages.pull(userLanguage)

		const language = await Language.find({ languageId })

		if (!language) {
			return res.status(401).json({
				status: 'failed',
				message: 'Coś poszło nie tak.',
			})
		}

		const deleteLang = language.find(lang => {
			return lang.creator.toString() === userId
		})

		deleteLang && (await Language.deleteMany({ languageId: languageId, creator: deleteLang.creator.toString() }))
		await user.save()

		res.status(201).json({
			status: 'success',
			message: 'Język usunięto.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.userProfile = async (req, res, next) => {
	const userId = req.params.id

	try {
		const user = await User.findById(userId)

		if (!user) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Użytkownik nie istnieje.',
			})
		}

		res.status(201).json({
			status: 'success',
			data: { name: user.name, email: user.email, password: user.password },
			message: 'Dane użytkownika pobrane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.updateUserProfile = async (req, res, next) => {
	const userId = req.body.userId
	const newName = req.body.newName
	const newEmail = req.body.newEmail
	const newPassword = req.body.newPassword

	try {
		const user = await User.findById(userId)

		if (!user) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Użytkownik nie istnieje.',
			})
		}

		if (user.password === newPassword) {
			user.password = newPassword
		} else {
			const hashedPassword = await bcrypt.hash(newPassword, 12)
			user.password = hashedPassword
		}

		user.name = newName
		user.email = newEmail

		await user.save()

		res.status(201).json({
			status: 'success',
			message: 'Dane użytkownika zaktualizowane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}
