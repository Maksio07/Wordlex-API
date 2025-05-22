const mongoose = require('mongoose')
const Schema = mongoose.Schema

const wordSchema = new Schema({
	name: {
		type: String,
		require: true,
	},
	nameInPolish: {
		type: String,
		required: true,
	},
	languageId: {
		type: String,
		required: true,
	},
	topicId: {
		type: String,
		required: true,
	},
	example: {
		type: String,
	},
	imgURL: {
		type: String,
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
})

module.exports = mongoose.model('Word', wordSchema)
