const express = require('express')
const router = express.Router()
const words = require('../controllers/words')
const validation = require('../util/validation')

router.get('/:id/languages/:languageId/topics/:topicId', words.getWords)
router.put(`/:id/languages/:languageId/topics/:topicId`, validation.signUpValidation.checkName, words.putNewWord)
router.post('/:id/languages/:languageId/topics/:topicId', validation.signUpValidation.checkName, words.editWord)
router.delete('/:id/languages/:languageId/topics/:topicId', words.deleteWord)
router.get('/:id/languages/:languageId/topics/:topicId/words/:wordId', words.getWord)

module.exports = router
