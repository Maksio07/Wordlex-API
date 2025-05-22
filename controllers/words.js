const path = require('path')
const Topic = require('../models/topic')
const Language = require('../models/languageSchema')
const User = require('../models/user')
const Word = require('../models/word')
const word = require('../models/word')
const topic = require('../models/topic')

exports.putNewWord = async (req, res, next) => {
	const name = req.body.name
	const nameInPolish = req.body.nameInPolish
	const example = req.body.example
	// const imgURL = req.file.path.replace(/\\/g, '/')
	const imgURL = req.body.imgURL
	const userId = req.body.userId
	const topicId = req.body.topicId
	const languageId = req.body.languageId

	const newWord = new Word({
		name,
		nameInPolish,
		example,
		imgURL,
		creator: userId,
		languageId: languageId,
		topicId: topicId
	})

	try {
		const topics = await Topic.find({ topicId: topicId })
		const userTopic = topics.find(t => {
			return t.creator.toString() === userId
		})
		if (!userTopic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Coś poszło nie tak, spróbuj ponownie',
			})
		}

		userTopic.words.push(newWord)
		await userTopic.save()
		await newWord.save()

		res.status(201).json({
			status: 'success',
			data: [name, nameInPolish, example, imgURL],
			message: 'Słowo zostało dodane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.getWords = async (req, res, next) => {
	const userId = req.params.id
	const topicId = req.params.topicId
	const languageId = req.params.languageId

	try {
		const languages = await Language.find({ languageId: languageId })

		const language = languages.find(lang => {
			return lang.creator.toString() === userId
		})

		const langName = language.name

		const topics = await Topic.find({ topicId: topicId })

		const topic = topics.find(t => {
			return t.creator.toString() === userId
		})

		if (!topic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany temat nie istnieje.',
			})
		}

		res.status(201).json({
			status: 'success',
			data: topic,
			langName,
			message: 'Dodane przez użytkownika słowa zostały pobrane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.deleteWord = async (req, res, next) => {
	const wordId = req.body.wordId
	const userId = req.body.userId
	const topicId = req.body.topicId

	try {
		const wordToDelete = await Word.findById(wordId)

		if (!wordToDelete) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dane słowo nie istnieje.',
			})
		}

		const topics = await Topic.find({ topicId: topicId })

		const topic = topics.find(t => {
			return t.creator.toString() === userId
		})

		if (!topic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany temat nie istnieje.',
			})
		}

		const word = topic.words.find(w => {
			return w._id.toString() === wordToDelete._id.toString()
		})

		await topic.words.pull(word)
		await topic.save()
		wordToDelete && (await Word.deleteOne(word._id))

		res.status(201).json({
			status: 'success',
			message: 'Słowo usunięte pomyślnie.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.editWord = async (req, res, next) => {
	const userId = req.body.userId
	const topicId = req.body.topicId
	const wordId = req.body.wordId
	const newWordName = req.body.newName
	const newWordNameInPolish = req.body.newNameInPolish
	const newWordExample = req.body.newExample
	const newWordImgURL = req.body.newImgURL

	try {
		const topics = await Topic.find({ topicId: topicId })

		const topic = topics.find(t => {
			return t.creator.toString() === userId
		})

		if (!topic) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dany temat nie istnieje.',
			})
		}

		const wordToEdit = topic.words.find(word => {
			return word._id.toString() === wordId
		})

		if (!wordToEdit) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dane słowo nie istnieje.',
			})
		}

		const toIndex = topic.words.indexOf(wordToEdit)
		await topic.words.pull(wordToEdit)

		wordToEdit.name = newWordName
		wordToEdit.nameInPolish = newWordNameInPolish
		wordToEdit.example = newWordExample
		wordToEdit.imgURL = newWordImgURL

		const word = await Word.findById(wordId)

		if (!word) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dane słowo nie istnieje.',
			})
		}

		word.name = newWordName
		word.nameInPolish = newWordNameInPolish
		word.example = newWordExample
		word.imgURL = newWordImgURL

		await word.save()
		topic.words.push(wordToEdit)
		const fromIndex = topic.words.indexOf(wordToEdit)
		const element = topic.words.splice(fromIndex, 1)[0]
		topic.words.splice(toIndex, 0, element)
		await topic.save()

		res.status(201).json({
			status: 'success',
			data: [newWordName, newWordNameInPolish, newWordExample, newWordImgURL],
			message: 'Słowo zostało zaktualizowane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}

exports.getWord = async (req, res, next) => {
	const wordId = req.params.wordId
	const topicId = req.params.topicId

	try {
		const word = await Word.findById(wordId)

		if (!word) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Dane słowo nie istnieje.',
			})
		}

		const words = await Word.find({topicId: topicId})

		if(!words) {
			return res.status(401).json({
				status: 'failed',
				data: [],
				message: 'Coś poszo nie tak, spróbuj ponownie.',
			})
		}

		const userWords = words.filter(w => {
			return w.creator = word.creator
		})

		res.status(201).json({
			status: 'success',
			word,
			userWords,
			message: 'Słowo zostało pobrane.',
		})
	} catch (err) {
		res.status(500).json({
			status: 'error',
			code: 500,
			message: 'Interval Server Error',
		})
	}
}
