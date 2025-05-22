const express = require('express')
const router = express.Router()

const languages = require('../controllers/languages')

router.get('/users/:id', languages.getLanguage)
router.put('/users/:id', languages.putLanguage)
router.delete('/users/:id', languages.deleteLanguage)
router.get('/users/:id/profile', languages.userProfile)
router.post('/users/:id/profile', languages.updateUserProfile)

module.exports = router
