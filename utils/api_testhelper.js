const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const initialBlogs= [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7
      },
      {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5
      },
      {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12
      },
      {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10
      },
      {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0
      },
      {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2
      },
      {
          title: "npm test",
          author: "Melike",
          url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
          likes: 12
        }  
]

const blogsInDb = async () => {
    const blogs = await Blog.find({}).populate('user')
    return blogs.map(blog => blog.toJSON())
  }
const getRootUserAuthorization = async () => {
    const user = await User.findOne({username:"root"})
    const userForToken = {
      username : user.username,
      id:user._id
  }
  const token = jwt.sign(userForToken, process.env.SECRET)
  return 'Bearer ' + token
}
module.exports = {
    initialBlogs,
    blogsInDb,
    getRootUserAuthorization

}