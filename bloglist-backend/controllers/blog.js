const Router = require("express").Router();
const jwt = require("jsonwebtoken");

const Blog = require("../models/blog");
const User = require("../models/user");

// const getTokenFrom = (request) => {
//   const authorization = request.get("authorization");
//   if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
//     return authorization.substring(7);
//   }
//   return null;
// };

Router.get("/", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

Router.get("/:id", (request, response) => {
  Blog.findById(request.params.id)
    .then((blog) => {
      if (blog) {
        response.json(blog);
        response.status(200).end();
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

Router.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);
  console.log(request.user);
  const blog = new Blog({
    title,
    author,
    url,
    likes,
    date: new Date(),
    user: user._id,
  });

  if (typeof blog.likes === "undefined" || blog.likes === null) {
    blog.likes = 0;
  }
  if (
    typeof blog.title === "undefined" ||
    blog.title === null ||
    typeof blog.url === "undefined" ||
    blog.url === null
  ) {
    response.status(400).end();
  } else {
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    response.status(201).json(savedBlog);
  }
});

Router.delete("/:id", async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const id = request.params.id;

  const blog = await Blog.findById(id);
  if (blog.user.toString() === decodedToken.id.toString()) {
    Blog.findByIdAndRemove(id).then((result) => {
      response.status(204).end();
    });
  } else {
    response.status(400).end();
  }
});

Router.put("/:id", (request, response, next) => {
  const body = request.body;
  const blog = {
    likes: body.likes,
  };
  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then((updatedBlog) => {
      response.json(updatedBlog);
    })
    .catch((error) => next(error));
});


Router.put("/:id/comments", async (request, response,next) => {
  const body = request.body;
  const comment = body.comment;

  try {
    const blog = await Blog.findById(request.params.id);
    
    blog.comments = blog.comments.concat(comment);
    const savedBlog = await blog.save();
    response.status(201).json(savedBlog);
  } catch (error) {
    next(error)
  }
});

module.exports = Router;
