const validationResult = require('express-validator').validationResult

const Validate = (res, req, next) => {
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        let error = {}
        errors.array().map(err => error[err.param] = err.msg)
        return res.status(422).json({ error });
    }
    next()
}

module.exports = Validate