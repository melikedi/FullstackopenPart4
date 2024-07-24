const lodash = require("lodash"); 
const dummy = (blogs) => {
    return 1
  }
const totalLikes = (blogs) => {
    return blogs.reduce((sum,obj)=>{ return sum + obj["likes"]}, 0);
} 
const favoriteBlog = (blogs) => {
    var maxLikes = blogs.reduce((max, obj) => { return max >= obj["likes"] ? max : obj["likes"] }, 0)
    var blogWithMaxLikes = blogs.find(b=>b.likes == maxLikes)
    return blogWithMaxLikes === undefined ? {} : {
      title: blogWithMaxLikes.title,
      author: blogWithMaxLikes.author,
      likes: blogWithMaxLikes.likes
    }
}
const mostBlogs = (blogs) => {
  let groupedData = lodash(blogs)
    .groupBy('author')
    .map(function(items, author) {
      return {
        author: author,
        blogs: items.length
      };
    }).value()
  let result = lodash.maxBy(groupedData, function (o) { return o.blogs; });
  return result === undefined ? {} : result
}
const mostLikes = (blogs) => {
  let groupedData = lodash(blogs)
    .groupBy('author')
    .map(function(items, author) {
      return {
        author: author,
        likes: lodash(items).sumBy('likes')
      };
    }).value()
  let result = lodash.maxBy(groupedData, function (o) { return o.likes; });
  return result === undefined ? {} : result
}
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }