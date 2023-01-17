const mongoose = require('mongoose')

mongoose.set('strictQuery', false);

// const CommentSchema = new mongoose.Schema({ text: String });

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  comments: [String],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Blog', blogSchema)
