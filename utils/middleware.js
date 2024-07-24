const morgan = require('morgan')
const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
morgan.token('data', function (req) {
    return (req.method === 'POST' ? JSON.stringify(req.body) : '')
  })
  // const morganLogger = morgan(':method :url :status :res[content-length] - :response-time ms:')
  const morganLogger = morgan(':method :url :status :res[content-length] - :response-time ms :data',{ skip: (req, res) => process.env.NODE_ENV === 'test' })
  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).send({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')){
      return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if (error.name ===  'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' })
    }
    next(error)
  }
  const userExtractor = async (request, response, next)=>{
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      const decodedToken = jwt.verify(token, process.env.SECRET)
      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
      }
      const user = await User.findById(decodedToken.id)
      request.user = user
    }
    next()
  }
  module.exports = {
    unknownEndpoint,
    errorHandler,
    morganLogger,
    userExtractor
  }