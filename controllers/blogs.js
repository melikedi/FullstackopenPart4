const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async(request, response) => {
    const blogs = await Blog.find({}).populate("user")
    response.json(blogs)
})
blogsRouter.post('/', async(request, response, next) => {
    
    const blog = new Blog(request.body)
    const user = request.user
   
    if (user) {
      const userToUpdate = await User.findById(user.id)
      if (request.body.hasOwnProperty('likes') == false) {
        blog['likes'] = 0
      }
      blog.user = user._id
      const savedBlog = await blog.save()
      userToUpdate.blogs = userToUpdate.blogs.concat(savedBlog.id)
      await userToUpdate.save()
      response.status(201).json(savedBlog).end()
    } else {
      return response.status(401).json({ error: 'token invalid' })
    }

   
})
blogsRouter.delete('/', async(request, response) => {
  const user = request.user
  const userToUpdate = await User.findById(user.id)
  if (user) {
    await Blog.deleteMany({ 'user': user.id })
    response.status(204).end()
    userToUpdate.blogs = []
    await userToUpdate.save()
  } else {
    return response.status(401).json({ error: 'token invalid' })
  }

  
})

blogsRouter.delete('/:id', async(request, response) => {
  const id = request.params.id
  const blogToDelete = await Blog.findById(id)
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
   }
  if (!blogToDelete) {
    response.status(401).json({ error: 'blog not found' })
  }
  if((!blogToDelete.user) || blogToDelete.user.toString()===user.id.toString()) {
    await Blog.deleteOne(blogToDelete)
    user.blogs = user.blogs.filter(item => item !== Blog)
    await user.save()
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'a blog can be deleted only by the user who added it' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const user = request.user
  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const blogToUpdate = await Blog.findById(id)
  if (!blogToUpdate) {
    response.status(401).json({ error: 'blog not found' })
  } else {
    const body = request.body
    const blog = {
      title: body.title,
      url: body.url,
      author: body.author,
      likes: body.likes,
      user:user.id.toString()
    }
    const updatedBlog = await Blog.findOneAndUpdate( {_id : id}, blog, { new: true })

    response.status(201).json(updatedBlog).end()
  } 


})
module.exports = blogsRouter