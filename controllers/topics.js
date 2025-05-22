const Word = require('../models/word')
const Topic = require('../models/topic')
const Language = require('../models/languageSchema')
const User = require('../models/user')

exports.putTopic = async (req, res, next) => {
	const topicName = req.body.topicName
	const topicPolishName = req.body.topicPolishName
	const userId = req.body.userId
	const languageId = req.body.languageId
	const topicId = req.body.topicId

	const createdTopic = new Topic({
		name: topicName,
		nameInPolish: topicPolishName,
		creator: userId,
		languageId: languageId,
		topicId: topicId,
	})
	try {
		const languages = await Language.find({ languageId: languageId })

		const userLanguage = languages.find(lang => {
			return lang.creator.toString() === userId
		})

		if (!userLanguage) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Coś poszło nie tak, spróbuj ponownie',
			})
		}

		const existsTopic = userLanguage.topics.find(topic => {
			return topic.name === topicName
		})

		if (existsTopic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Temat o danej nazwie już istnieje, spróbuj inną nazwę.',
			})
		}

		userLanguage.topics.push(createdTopic)
		await userLanguage.save()
		await createdTopic.save()

		res.status(201).json({
			status: 'success',
			data: [topicName, topicPolishName, topicId],
			message: 'Temat został dodany.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.getTopics = async (req, res, next) => {
	const userId = req.params.id
	const languageId = req.params.languageId

	try {
		const language = await Language.find({ languageId: languageId, creator: userId })

		if (!language) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany język nie istnieje.',
			})
		}

		const words = await Word.find({ languageId: languageId })
		const userWords = words.filter(w => {
			return w.creator.toString() === userId
		})

		res.status(201).json({
			status: 'success',
			data: language,
			words: userWords,
			message: 'Dodane przez użytkownika tematy zostały pobrane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.editTopic = async (req, res, next) => {
	const newTopicName = req.body.newTopicName
	const newTopicPolishName = req.body.newTopicPolishName
	const userId = req.body.userId
	const languageId = req.body.languageId
	const topicId = req.body.topicId
	const newTopicId = req.body.newTopicId

	try {
		const languages = await Language.find({ languageId: languageId })

		const language = languages.find(lang => {
			return lang.creator.toString() === userId
		})

		if (!language) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany język nie istnieje.',
			})
		}

		const topicToEdit = await language.topics.find(topic => {
			return topic.topicId === topicId
		})

		if (!topicToEdit) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany temat nie istnieje.',
			})
		}

		const toIndex = language.topics.indexOf(topicToEdit)
		await language.topics.pull(topicToEdit)

		const existsTopic = await language.topics.find(topic => {
			return topic.name === newTopicName
		})

		if (existsTopic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Temat o danej nazwie już istnieje, spróbuj inną nazwę.',
			})
		}

		topicToEdit.name = newTopicName
		topicToEdit.nameInPolish = newTopicPolishName
		topicToEdit.topicId = newTopicId

		const topics = await Topic.find({ creator: userId })
		const topic = topics.find(t => {
			return t.topicId === topicId
		})

		if (!topic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany temat nie istnieje.',
			})
		}

		topic.name = newTopicName
		topic.nameInPolish = newTopicPolishName
		topic.topicId = newTopicId

		await topic.save()
		language.topics.push(topicToEdit)
		const fromIndex = language.topics.indexOf(topicToEdit)
		const element = language.topics.splice(fromIndex, 1)[0]
		language.topics.splice(toIndex, 0, element)
		await language.save()

		res.status(201).json({
			status: 'success',
			data: [newTopicName, newTopicPolishName],
			message: 'Temat został zaktualizowany.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.deleteTopic = async (req, res, next) => {
	const userId = req.body.userId
	const languageId = req.body.languageId
	const topicId = req.body.topicId

	try {
		const languages = await Language.find({ languageId: languageId })

		const language = languages.find(lang => {
			return lang.creator.toString() === userId
		})

		if (!language) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany język nie istnieje.',
			})
		}

		const topicToDelete = await language.topics.find(topic => {
			return topic.topicId === topicId
		})

		if (!topicToDelete) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany temat nie istnieje.',
			})
		}

		const topic = await Topic.find({ creator: userId, topicId: topicId })

		if (!topic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany temat nie istnieje.',
			})
		}

		await Topic.deleteMany({ topicId: topicId, creator: userId.toString() })

		await language.topics.pull(topicToDelete)
		await language.save()

		res.status(201).json({
			status: 'success',
			message: 'Temat został usunięty.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}
