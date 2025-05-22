const mongoose = require('mongoose')
const Schema = mongoose.Schema
const LanguageSchema = require('./languageSchema')
const jwt = require('jsonwebtoken')
const { SECRET_ACCESS_TOKEN } = require('../config/index')

const userSchema = new Schema({
	name: {
		type: String,
		require: true,
	},
	email: {
		type: String,
		require: true,
	},
	password: {
		type: String,
		require: true,
	},
	languages: [{
		type: Object,
		language: LanguageSchema
	}],
})

userSchema.methods.generateAccessJWT = function () {
	let payload = {
		id: this._id,
		email: this.email,
	}

	return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
		expiresIn: '1h',
	})
}

module.exports = mongoose.model('User', userSchema)
