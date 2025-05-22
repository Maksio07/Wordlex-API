const express = require('express')
const router = express.Router()
const topics = require('../controllers/topics')
const validation = require('../util/validation')

router.get('/:id/languages/:languageId', topics.getTopics)
router.put(`/:id/languages/:languageId`, validation.signUpValidation.checkName, topics.putTopic)
router.post('/:id/languages/:languageId', validation.signUpValidation.checkName, topics.editTopic)
router.delete('/:id/languages/:languageId', topics.deleteTopic)

module.exports = router
