// backend/controllers/bookController.js
const Book = require('../models/Book');
const User = require('../models/User');

// Get all books with pagination and filtering
const getAllBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const genre = req.query.genre || '';
    const availability = req.query.availability || '';

    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by genre
    if (genre) {
      query.genre = { $regex: genre, $options: 'i' };
    }

    // Filter by availability
    if (availability === 'available') {
      query.isAvailable = true;
    } else if (availability === 'unavailable') {
      query.isAvailable = false;
    }

    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        books,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: skip + books.length < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books'
    });
  }
};

// Get available books only
const getAvailableBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    let query = { isAvailable: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        books,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get available books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available books'
    });
  }
};

// Get single book by ID
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id)
      .populate('addedBy', 'name email')
      .populate('currentBorrowers.userId', 'name email');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { book }
    });

  } catch (error) {
    console.error('Get book by ID error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching book'
    });
  }
};

// Add new book (Admin only)
const addBook = async (req, res) => {
  try {
    const { title, author, isbn, genre, description, publishedYear, totalCopies } = req.body;

    // Validation
    if (!title || !author || !isbn) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and ISBN are required'
      });
    }

    // Check if book with ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      genre: genre ? genre.trim() : 'General',
      description: description ? description.trim() : '',
      publishedYear: publishedYear || null,
      totalCopies: totalCopies || 1,
      availableCopies: totalCopies || 1,
      addedBy: req.user._id
    };

    const book = await Book.create(bookData);

    const populatedBook = await Book.findById(book._id).populate('addedBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: { book: populatedBook }
    });

  } catch (error) {
    console.error('Add book error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding book'
    });
  }
};

// Borrow a book
const borrowBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userName = req.user.name;

    // Find book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book is available
    if (!book.isAvailable || book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can borrow more books
    if (!user.canBorrowBooks()) {
      return res.status(400).json({
        success: false,
        message: `Maximum borrowing limit reached. ${user.role === 'Admin' ? 'Admins' : 'Members'} can borrow up to ${user.role === 'Admin' ? 10 : 5} books.`
      });
    }

    // Check if user already borrowed this book
    const alreadyBorrowed = user.borrowedBooks.some(
      borrowed => borrowed.bookId.toString() === id
    );

    if (alreadyBorrowed) {
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book'
      });
    }

    // Borrow the book
    await book.borrowBook(userId, userName);

    // Update user's borrowed books
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    user.borrowedBooks.push({
      bookId: book._id,
      borrowedAt: new Date(),
      dueDate
    });
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Book borrowed successfully',
      data: {
        book: {
          id: book._id,
          title: book.title,
          author: book.author,
          dueDate
        }
      }
    });

  } catch (error) {
    console.error('Borrow book error:', error);
    
    if (error.message.includes('No copies available')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error borrowing book'
    });
  }
};

// Return a book
const returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find book
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has borrowed this book
    const borrowedBookIndex = user.borrowedBooks.findIndex(
      borrowed => borrowed.bookId.toString() === id
    );

    if (borrowedBookIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You have not borrowed this book'
      });
    }

    // Return the book
    await book.returnBook(userId);

    // Remove from user's borrowed books
    user.borrowedBooks.splice(borrowedBookIndex, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Book returned successfully',
      data: {
        book: {
          id: book._id,
          title: book.title,
          author: book.author,
          availableCopies: book.availableCopies
        }
      }
    });

  } catch (error) {
    console.error('Return book error:', error);
    
    if (error.message.includes('not borrowed by this user')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error returning book'
    });
  }
};

// Search books
const searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const books = await Book.searchBooks(q.trim())
      .populate('addedBy', 'name')
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        books,
        count: books.length
      }
    });

  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching books'
    });
  }
};

// Update book (Admin only)
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.currentBorrowers;
    delete updates.borrowHistory;
    delete updates.addedBy;

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Update book
    Object.assign(book, updates);
    await book.save();

    const updatedBook = await Book.findById(id).populate('addedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: { book: updatedBook }
    });

  } catch (error) {
    console.error('Update book error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating book'
    });
  }
};

// Delete book (Admin only)
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book is currently borrowed
    if (book.currentBorrowers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book that is currently borrowed'
      });
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book'
    });
  }
};

module.exports = {
  getAllBooks,
  getAvailableBooks,
  getBookById,
  addBook,
  borrowBook,
  returnBook,
  searchBooks,
  updateBook,
  deleteBook
};