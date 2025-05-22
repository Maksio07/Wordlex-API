const mongoose = require('mongoose')
const Schema = mongoose.Schema
const wordSchema = require('./word')
const languageSchema = require('./languageSchema')

const topicSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	nameInPolish: {
		type: String,
		required: true,
	},
	topicId: {
		type: String,
		required: true,
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	words: [
		{
			type: Object,
			language: wordSchema,
		},
	],
})

module.exports = mongoose.model('Topic', topicSchema)
