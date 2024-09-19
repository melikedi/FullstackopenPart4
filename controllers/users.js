const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

usersRouter.get('/', async(request, response) => {
    const users = await User.find({}).populate("blogs")
    // const users = await User.find({})
    response.json(users)
})
usersRouter.post('/', async(request, response, next) => {
    const {username, name, password } = request.body
    
    if (username === undefined || username.length<3) {
        response.status(400).send({ error: "User name with at least 3 characters long should be defined." })
    }
    if (password === undefined || password.length<3) {
        response.status(400).send({ error: "Password with at least 3 characters long should be defined." })
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password,saltRounds)
    const user = new User({
        name : name,
        username: username,
        passwordHash: passwordHash
    })
    const savedUser = await user.save()
    response.status(201).json(savedUser).end()
})
usersRouter.delete('/:id', async(request, response) => {
    const id = request.params.id
    const userToDelete = await User.findById(id)
    
    if (!userToDelete) {
      response.status(401).json({ error: 'user not found' })
    }
    await Blog.deleteMany({ 'user': id })
    await User.deleteOne(userToDelete)
    
    response.status(204).end()
  })
module.exports = usersRouter