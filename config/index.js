const dotenv = require('dotenv')
dotenv.config()

const { URI, PORT, SECRET_ACCESS_TOKEN, SECRET_SENDGRID_KEY } = process.env;

module.exports =  { URI, PORT, SECRET_ACCESS_TOKEN, SECRET_SENDGRID_KEY };