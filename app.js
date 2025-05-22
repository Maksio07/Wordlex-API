const path = require('path')
const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const cors = require('cors')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const { PORT, URI, SECRET_ACCESS_TOKEN } = require('./config/index')
const moment = require('moment-timezone')
const compression = require('compression')

const app = express()

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + '-' + file.originalname)
	},
})

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
		cb(null, true)
	} else {
		cb(null, false)
	}
}

app.use(cors())
app.disable('x-powered-by')
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.json())
app.use(compression())

const store = new MongoDBStore({
	uri: URI,
	collection: 'sessions',
})

const utcExpireTime = new Date()
const localExpiryTime = moment(utcExpireTime).tz('Europe/Warsaw').format('ddd, DD MMM YYYY hh:mm:ss A')

app.use(
	session({
		secret: SECRET_ACCESS_TOKEN,
		resave: false,
		saveUninitialized: false,
		store: store,
		expires: localExpiryTime + (2*60*1000),
		unset: 'destroy',
		cookie: { secure: true, maxAge: 2*60*1000},
	})
)

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	next()
})

const authRoutes = require('./routes/auth')
const languageRoutes = require('./routes/languages')
const topicsRoutes = require('./routes/topics')
const wordsRoutes = require('./routes/words')
const contactRoutes = require('./routes/contact')

app.use('/auth', authRoutes)
app.use('/', languageRoutes)
app.use('/users', topicsRoutes)
app.use('/users', wordsRoutes)
app.use('/contact', contactRoutes)

app.use((error, req, res, next) => {
	const status = error.statusCode || 500
	const message = error.message
	const data = error.data
	res.status(status).json({ message: message, data: data })
})

mongoose
	.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(result => {
		app.listen(PORT)
	})
	.catch(err => {
		console.log(err)
	})
