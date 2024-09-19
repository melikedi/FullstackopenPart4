const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
blogsRouter.get('/', async(request, response) => {
    const blogs = await Blog.find({}).populate("comments").populate("user")
    response.json(blogs)
})

blogsRouter.post('/:id/comments', async (req, res) => {
  const { content } = req.body;
  const blogId = req.params.id;

  // Create a new comment
  const comment = new Comment({
    content,
    blog: blogId // Link comment to the blog
  });
  // Save the comment
  const savedComment = await comment.save();

  // Add the comment's ObjectId to the blog's comments array
  const blog = await Blog.findById(blogId);
  blog.comments = blog.comments.concat(savedComment._id);
  
  // Save the updated blog
  await blog.save();

  res.status(201).json(savedComment);
});

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
    const result = await Blog.deleteOne({ _id: blogToDelete.id })
    const resultComments = await Comment.deleteMany({ blog: blogToDelete.id })
    console.log("resultComments",resultComments)
    user.blogs = user.blogs.filter(item => item.id !== blogToDelete.id)
    const savedUser = await user.save()
    console.log("savedUser",savedUser)
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
      likes: body.likes
    }
    const updatedBlog = await Blog.findOneAndUpdate( {_id : id}, blog, { new: true })

    response.status(201).json(updatedBlog).end()
  } 


})
module.exports = blogsRouter