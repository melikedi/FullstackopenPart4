const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
usersRouter.get('/', async(request, response) => {
    const users = await User.find({}).populate("blogs")
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
    // if (request.body.hasOwnProperty('likes') == false) {
    //   blog['likes'] = 0
    // }
    // if (blog['title'] === undefined 
    //     || blog['title'] == '' 
    //     || blog['url'] === undefined
    //     || blog['url'] == '') {
    //  response.status(400).send({ error: "No title or URL defined" })
    // } else {
    //   const savedBlog = await blog.save()
    //   response.status(201).json(savedBlog).end()
    // }
})
module.exports = usersRouter