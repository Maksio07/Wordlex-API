const mongoose = require('mongoose')
const Schema = mongoose.Schema
const TopicSchema = require('./topic')

const languageSchema = new Schema({
	name: {
		type: String,
		require: true,
	},
	flag: {
		type: String,
		required: true,
	},
	languageId: {
		type: String,
		required: true,
	},
	topics: [
		{
			type: Object,
			language: TopicSchema,
		},
	],

	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
})

module.exports = mongoose.model('Language', languageSchema)
