// backend/routes/books.js
const express = require('express');
const {
  getAllBooks,
  getAvailableBooks,
  getBookById,
  addBook,
  borrowBook,
  returnBook,
  searchBooks,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with pagination and filtering
// @access  Public (with optional auth for enhanced features)
router.get('/', optionalAuth, getAllBooks);

// @route   GET /api/books/available
// @desc    Get only available books
// @access  Public
router.get('/available', getAvailableBooks);

// @route   GET /api/books/search
// @desc    Search books by title, author, or ISBN
// @access  Public
router.get('/search', searchBooks);

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public (with optional auth for enhanced details)
router.get('/:id', optionalAuth, getBookById);

// @route   POST /api/books
// @desc    Add new book
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, addBook);

// @route   PUT /api/books/:id
// @desc    Update book details
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, updateBook);

// @route   DELETE /api/books/:id
// @desc    Delete book
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, deleteBook);

// @route   PUT /api/books/:id/borrow
// @desc    Borrow a book
// @access  Private (Authenticated users)
router.put('/:id/borrow', authenticateToken, borrowBook);

// @route   PUT /api/books/:id/return
// @desc    Return a book
// @access  Private (Authenticated users)
router.put('/:id/return', authenticateToken, returnBook);

module.exports = router;