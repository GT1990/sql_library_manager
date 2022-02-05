var express = require("express");
var router = express.Router();

const Book = require("../models").Book;
const { Sequelize } = require("../models");
const Op = Sequelize.Op;

/* Async handler function wrapper for routes */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

/**
 * GET: /home
 * Redirects to /books
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // const books = await Book.findAll();
    res.redirect("/books");
  })
);

/**
 * GET: /books
 * Shows the full list of books
 */
router.get(
  "/books",
  asyncHandler(async (req, res) => {
    const pageLimit = 9;
    const allBooks = await Book.findAll({
      order: [["createdAt", "DESC"]],
    });
    const pages = Math.ceil(allBooks.length / pageLimit);
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }
    const books = allBooks.slice((page - 1) * pageLimit, pageLimit * page);
    res.render("index", { title: "Books", books, pages, page });
  })
);

/**
 * POST: /books
 * Shows a filtered list of books based on search
 */
router.post(
  "/books",
  asyncHandler(async (req, res) => {
    const { search } = req.body;
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            author: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            genre: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            year: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      },
      order: [["createdAt", "DESC"]],
    });
    res.render("index", { title: "Books", books });
  })
);

/**
 * GET: /books/new
 * Shows the create new book form
 */
router.get(
  "/books/new",
  asyncHandler(async (req, res) => {
    res.render("new-book.pug", { title: "New Book" });
  })
);

/**
 * POST: /books/new
 * Posts a new book to the database
 */
router.post(
  "/books/new",
  asyncHandler(async (req, res) => {
    let book;
    try {
      book = await Book.create(req.body);
      res.redirect(`/books/${book.id}`);
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        console.log("errors: ", error);
        res.render("new-book", {
          title: "Create New Book",
          book,
          errors: error.errors,
        });
      } else {
        throw error;
      }
    }
  })
);

/**
 * GET: /books/:id
 * Shows book detail form
 */
router.get(
  "/books/:id",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    res.render("book-details", { title: "Book Details", book });
  })
);

/**
 * GET: /books/:id/edit
 * Shows edit book form
 */
router.get(
  "/books/:id/edit",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    res.render("update-book", { title: "Edit Book", book });
  })
);

/**
 * POST /books/:id
 * Updates book info in the database
 */
router.post(
  "/books/:id",
  asyncHandler(async (req, res) => {
    let book;
    try {
      const book = await Book.findByPk(req.params.id);
      if (book) {
        await book.update(req.body);
        res.redirect(`/books/${book.id}`);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        book = await Book.build(req.body);
        book.id = req.params.id;
        res.render("update-book", {
          title: "Retry Updating Book",
          book,
          errors: error.errors,
        });
      }
    }
  })
);

/**
 * POST: /books/:id/delete
 * Deletes a book from the database
 */
router.post(
  "/books/:id/delete",
  asyncHandler(async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      await book.destroy();
      res.redirect("/books");
    } else {
      res.sendStatus(404);
    }
  })
);

// 404 Error Handler
router.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});
// Global Error Handler
router.use((err, req, res, next) => {
  if (err.status === 404) {
    res.status(err.status);
    console.error(`${err.status}: ${err.message}`);
    res.render("page-not-found", { title: "Page Not Found", err });
  } else {
    err.status = err.status || 500;
    res.status(err.status);
    err.message =
      err.message || "Something went wrong with the Server. Please try again!";
    console.error(`${err.status}: ${err.message}`);
    res.render("error", { title: "Error Page", err });
  }
});

module.exports = router;
