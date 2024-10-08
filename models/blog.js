const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {type:String, required:[true, 'Title required']},
    author: {type:String, required:[true, 'Author required']},
    url: String,
    likes: Number,
    comments:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Comment'
    }],
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    }
  },{ collection: 'blogs' })

  blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })
module.exports = mongoose.model('Blog', blogSchema)