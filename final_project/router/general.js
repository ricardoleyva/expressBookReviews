const express = require("express");
const axios = require("axios").default;
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({ username: username, password: password });
      return res.status(200).json({
        message: "Customer successfully registered. Now you can login",
      });
    } else {
      return res.status(404).json({ message: "Customer already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register customer." });
});

const getBooks = new Promise((resolve, reject) => {
  const booksLength = Object.keys(books).length;
  if (booksLength > 0) {
    resolve(JSON.stringify(books, null, 4));
  } else {
    reject("Books DB empty");
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const result = await getBooks;
    return res.send(result);
  } catch (err) {
    res.status(404).send("Error getting books list: " + err);
  }
});

// Create new promise function to solve Get Books By ISBN
const getBooksByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    // Only resolve if ISBN is within range or of DB
    if (isbn > 0 && isbn <= 10) {
      resolve(books[isbn]);
    } else {
      reject("Please type in a valid ISBN");
    }
  });
};

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  // Calling Promise to handdle the user request using ISBN as parameter
  const isbn = req.params.isbn;
  getBooksByISBN(isbn)
    .then((data) => {
      return res.send(data);
    })
    .catch((e) => {
      return res.status(404).send(e);
    });
});

// Create new promise function to solve Get book details By author
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    // Get array from books values
    const booksArray = Object.values(books);
    // Only resolve if author exists in DB
    const authorExists = booksArray.find((i) => i.author === author);
    if (authorExists) {
      let booksByAuthorArray = [];
      // Push to new array only values that match with author
      booksArray.forEach((book) => {
        if (book.author === author) booksByAuthorArray.push(book);
      });
      // Give result shape of an object with request title as property
      const booksByAuthor = { booksByAuthor: booksByAuthorArray };
      resolve(booksByAuthor);
    } else {
      reject("Author not in DB");
    }
  });
};

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  getBooksByAuthor(author)
    .then((data) => {
      return res.send(data);
    })
    .catch((e) => {
      return res.status(404).send(e);
    });
});

// Create new promise function to solve Get book details By title
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    // Get array from books values
    const booksArray = Object.values(books);
    // Only resolve if title exists in DB
    const titleExists = booksArray.find((i) => i.title === title);
    if (titleExists) {
      let booksByTitleArray = [];
      // Push to new array only values that match with title
      booksArray.forEach((book) => {
        if (book.title === title) booksByTitleArray.push(book);
      });
      // Give result shape of an object with request title as property
      const booksByTitle = { booksByTitle: booksByTitleArray };
      resolve(booksByTitle);
    } else {
      reject("Title not in DB");
    }
  });
};

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title)
    .then((data) => {
      return res.send(data);
    })
    .catch((e) => {
      return res.status(404).send(e);
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn].reviews);
});

module.exports.general = public_users;
