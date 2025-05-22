const express = require('express')
const router = express.Router()
const {signUpValidation} = require('../util/validation')
const Validate = require('../middleware/validation')

const contact = require('../controllers/contact')

router.post('/', signUpValidation.checkEmail, Validate, contact.sendMessage)

module.exports = router