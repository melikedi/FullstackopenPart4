const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')
const blogExamples = require('../utils/blogs_for_test')
describe('favorite Blog', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.favoriteBlog(blogExamples.emtpyblogList)
    assert.deepStrictEqual(result,{})
  })

  test('when list has only one blog, equals that blog', () => {
    const result = listHelper.favoriteBlog(blogExamples.listWithOneBlog)
    assert.deepStrictEqual(result, {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })

  test('of a bigger list returned blog having max likes', () => {
    const result = listHelper.favoriteBlog(blogExamples.blogs)
    assert.deepStrictEqual(result, {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    })
  })
})
describe('total likes', () => {
  test('of empty list is zero',() => {
    const result = listHelper.totalLikes(blogExamples.emtpyblogList)
    assert.strictEqual(result,0)
  })
  test('when list has only one blog, equals the likes of that',() => {
    const result = listHelper.totalLikes(blogExamples.listWithOneBlog)
    assert.strictEqual(result,5)
  })
  test('of a bigger list is calculated right',() => {
    
    const result = listHelper.totalLikes(blogExamples.blogs)
    assert.strictEqual(result,48)
  })
})
describe('most Likes', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.mostLikes(blogExamples.emtpyblogList)
    assert.deepStrictEqual(result,{})
  })

  test('when list has only one blog, returned that blogs author with likes', () => {
    const result = listHelper.mostLikes(blogExamples.listWithOneBlog)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })
  test('of a bigger list returned author who has the largest amount of likes', () => {
    const result = listHelper.mostLikes(blogExamples.blogs)
    assert.deepStrictEqual(result, {
      author: "Edsger W. Dijkstra",
      likes: 17
    })
  })
})
describe('most Blog', () => {
  test('of empty list is empty object', () => {
    const result = listHelper.mostBlogs(blogExamples.emtpyblogList)
    assert.deepStrictEqual(result,{})
  })

  test('when list has only one blog, returned that blogs author with blog count 1', () => {
    const result = listHelper.mostBlogs(blogExamples.listWithOneBlog)
    assert.deepStrictEqual(result, {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })

  test('of a bigger list returned author who has the largest amount of blogs', () => {
    const result = listHelper.mostBlogs(blogExamples.blogs)
    assert.deepStrictEqual(result, {
      author: "Robert C. Martin",
      blogs: 3
    })
  })
})
test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})