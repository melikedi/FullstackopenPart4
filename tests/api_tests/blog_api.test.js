const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcryptjs')
const Blog = require('../../models/blog')
const User = require('../../models/user')
const helper = require('../../utils/api_testhelper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')
const api = supertest(app)

describe('user & blog tests when there is initially some blogs saved and root user created', () => {
  beforeEach(async() => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash, name: 'root' })
    savedUser = await user.save()

    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map(blog=> {
      blog.user = savedUser._id
      return new Blog(blog)
    })
    const promiseArray = blogObjects.map(blog=> {
        blog.save()
    })
    await Promise.all(promiseArray)
    const blogsAtStart= await helper.blogsInDb()
    savedUser.blogs = blogsAtStart.map(b=>b.id.toString())
    await savedUser.save()
  })
  describe('users',()=>{
    describe('Invalid users are not cretated and returned proper response',()=>{
      test('Username must be defined and at least three characters long', async()=>{
          const user =   {
              "username": "",
              "name": "testname",
              "password": "testpassword"
          }
          await api
          .post('/api/users')
          .send(user)
          .expect(400)
      })
      test('Password must be defined and at least three characters long', async()=>{
          const user =   {
              "username": "testusername",
              "name": "testname",
              "password": ""
          }
          await api
          .post('/api/users')
          .send(user)
          .expect(400)
      })
      test('Username must be unique', async()=>{
          const user =   {
              "username": "root",
              "name": "testname",
              "password": "testpassword"
          }
          await api
          .post('/api/users')
          .send(user)
          .expect(400)
      })
  })
  })
  describe('blogs',()=>{
    test('the correct amount of blog posts returned in the JSON format', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
        .expect(function(res) {
          assert.equal(res.body.length,helper.initialBlogs.length);
        })
    })
    test('unique identifier property of the blog posts is named id', async() => {
      const response = await api.get('/api/blogs')
      response.body.forEach(function(blog) {
          assert.equal(blog.hasOwnProperty('id'),true)
      });
    })
    describe('addition of a new blog', () => {
      test('adding a blog fails if a token is not provided ', async () => {
        const newBlog = {
            "title": "New Blog Test",
            "author": "New Blog Test Author",
            "url": "http://newblogtest.com",
            "likes": 12
        }
        await api
          .post('/api/blogs')
          .send(newBlog)
          .expect(401)
      })
      test('a valid blog can be added ', async () => {
        const authorization = await helper.getRootUserAuthorization()

        const newBlog = {
            title: "New Blog Test",
            author: "New Blog Test Author",
            url: "http://newblogtest.com",
            likes: 12
        }
        await api
          .post('/api/blogs')
          .set('Authorization', authorization)
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        assert(blogsAtEnd.some(b => b.title === newBlog.title && b.author === newBlog.author && b.url === newBlog.url && b.likes == newBlog.likes),true)
      })
      test('set likes property to 0 as default ', async () => {
        const authorization = await helper.getRootUserAuthorization()
        const newBlog = {
            title: "New Blog Test",
            author: "New Blog Test Author",
            url: "http://newblogtest.com",
        }
        await api
          .post('/api/blogs')
          .set('Authorization', authorization)
          .send(newBlog)
          .expect(201)
          .expect('Content-Type', /application\/json/)
      
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        assert(blogsAtEnd.some(b => b.title === newBlog.title && b.author === newBlog.author && b.url === newBlog.url && b.likes == 0),true)
      })
      test('if title or url is empty return 400 Bad Request', async () => {
        const authorization = await helper.getRootUserAuthorization()
        const newBlog = {
            author: "New Blog Test Author",
        }
        await api
          .post('/api/blogs')
          .set('Authorization', authorization)
          .send(newBlog)
          .expect(400)
      })
    })
    describe('updating of a blog', () => {
      test('updating a blog fails if a token is not provided ', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]
        await api
          .put(`/api/blogs/${blogToUpdate.id}`)
          .send(blogToUpdate)
          .expect(401)
      })
      test('succeed with status code 204 if valid', async () => {
        const authorization = await helper.getRootUserAuthorization()
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]
        blogToUpdate["likes"] = 45
        await api
          .put(`/api/blogs/${blogToUpdate.id}`)
          .set('Authorization', authorization)
          .send(blogToUpdate)
          .expect(201)
          .expect(function(res) {
            assert.equal(res.body["likes"],45);
          })
      })
    })

    describe('deletion of a blog', () => {
      test('deletion of a blog fails if a token is not provided', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .expect(401)
      })
      test('when blog deleted user blogs updated accordingly', async () => {
        const authorization = await helper.getRootUserAuthorization()
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
   
        const userid = blogToDelete.user.id
        
        const userBeforeDelete = await User.findById(userid).populate("blogs")
        const userBeforeDeleteBlogsCount = userBeforeDelete.blogs.length
        // console.log("userBeforeDeleteBlogsCount:",userBeforeDeleteBlogsCount)
        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('Authorization', authorization)
          .expect(204)
        
        const userAfterDelete = await User.findById(userid).populate('blogs')
        const userAfterDeleteBlogsCount = userAfterDelete.blogs.length
        // console.log("userAfterDeleteBlogsCount:",userAfterDeleteBlogsCount)
        const userBlogIds = userAfterDelete.blogs.map(r => r.toString())
        
        assert.strictEqual(userAfterDeleteBlogsCount, userBeforeDeleteBlogsCount - 1)
        assert(!userBlogIds.includes(blogToDelete.id))
      })
      test('succeed with status code 204 if id is valid', async () => {
        const authorization = await helper.getRootUserAuthorization()
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
        await api
          .delete(`/api/blogs/${blogToDelete.id}`)
          .set('Authorization', authorization)
          .expect(204)
        const blogsAtEnd = await helper.blogsInDb()
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
        const ids = blogsAtEnd.map(r => r.id)
        assert(!ids.includes(blogToDelete.id))
      })
    })
  })

  
})

after(async () => {
    await mongoose.connection.close()
})

