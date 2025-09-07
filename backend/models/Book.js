// backend/models/Book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    match: [
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/,
      'Please enter a valid ISBN'
    ]
  },
  genre: {
    type: String,
    trim: true,
    maxlength: [50, 'Genre cannot exceed 50 characters'],
    default: 'General'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future']
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies is required'],
    min: [1, 'At least 1 copy is required'],
    default: 1
  },
  availableCopies: {
    type: Number,
    required: [true, 'Available copies is required'],
    min: [0, 'Available copies cannot be negative'],
    default: function() {
      return this.totalCopies;
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  borrowHistory: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    borrowedAt: {
      type: Date,
      default: Date.now
    },
    returnedAt: {
      type: Date
    },
    dueDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['borrowed', 'returned', 'overdue'],
      default: 'borrowed'
    }
  }],
  currentBorrowers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    borrowedAt: {
      type: Date,
      default: Date.now
    },
    dueDate: Date
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });
bookSchema.index({ isbn: 1 });
bookSchema.index({ isAvailable: 1 });
bookSchema.index({ genre: 1 });

// Update availability status based on available copies
bookSchema.pre('save', function(next) {
  this.isAvailable = this.availableCopies > 0;
  next();
});

// Method to borrow a book
bookSchema.methods.borrowBook = function(userId, userName) {
  if (this.availableCopies <= 0) {
    throw new Error('No copies available for borrowing');
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

  // Add to current borrowers
  this.currentBorrowers.push({
    userId,
    userName,
    borrowedAt: new Date(),
    dueDate
  });

  // Add to borrow history
  this.borrowHistory.push({
    userId,
    userName,
    borrowedAt: new Date(),
    dueDate,
    status: 'borrowed'
  });

  // Decrease available copies
  this.availableCopies -= 1;
  this.isAvailable = this.availableCopies > 0;

  return this.save();
};

// Method to return a book
bookSchema.methods.returnBook = function(userId) {
  const borrowerIndex = this.currentBorrowers.findIndex(
    borrower => borrower.userId.toString() === userId.toString()
  );

  if (borrowerIndex === -1) {
    throw new Error('Book is not borrowed by this user');
  }

  // Remove from current borrowers
  this.currentBorrowers.splice(borrowerIndex, 1);

  // Update borrow history
  const historyEntry = this.borrowHistory.find(
    entry => entry.userId.toString() === userId.toString() && 
    entry.status === 'borrowed'
  );

  if (historyEntry) {
    historyEntry.returnedAt = new Date();
    historyEntry.status = 'returned';
  }

  // Increase available copies
  this.availableCopies += 1;
  this.isAvailable = true;

  return this.save();
};

// Static method for search
bookSchema.statics.searchBooks = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { author: { $regex: query, $options: 'i' } },
      { genre: { $regex: query, $options: 'i' } },
      { isbn: { $regex: query, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
};

// Virtual for book summary
bookSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    title: this.title,
    author: this.author,
    isbn: this.isbn,
    isAvailable: this.isAvailable,
    availableCopies: this.availableCopies,
    totalCopies: this.totalCopies
  };
});

// Ensure virtual fields are serialized
bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);