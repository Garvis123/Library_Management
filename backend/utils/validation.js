// backend/utils/validation.js

// Email validation regex
const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// ISBN validation regex (ISBN-10 and ISBN-13)
const isbnRegex = /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/;

// Validation functions
const validation = {
  // Email validation
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    return emailRegex.test(email.trim().toLowerCase());
  },

  // Password validation
  isValidPassword: (password) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6;
  },

  // Strong password validation (optional - for enhanced security)
  isStrongPassword: (password) => {
    if (!password || typeof password !== 'string') return false;
    
    // At least 8 characters, one uppercase, one lowercase, one number
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  },

  // Name validation
  isValidName: (name) => {
    if (!name || typeof name !== 'string') return false;
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50;
  },

  // ISBN validation
  isValidISBN: (isbn) => {
    if (!isbn || typeof isbn !== 'string') return false;
    return isbnRegex.test(isbn.trim());
  },

  // Book title validation
  isValidTitle: (title) => {
    if (!title || typeof title !== 'string') return false;
    const trimmedTitle = title.trim();
    return trimmedTitle.length >= 1 && trimmedTitle.length <= 200;
  },

  // Author name validation
  isValidAuthor: (author) => {
    if (!author || typeof author !== 'string') return false;
    const trimmedAuthor = author.trim();
    return trimmedAuthor.length >= 2 && trimmedAuthor.length <= 100;
  },

  // Genre validation
  isValidGenre: (genre) => {
    if (!genre) return true; // Genre is optional
    if (typeof genre !== 'string') return false;
    const trimmedGenre = genre.trim();
    return trimmedGenre.length <= 50;
  },

  // Published year validation
  isValidPublishedYear: (year) => {
    if (!year) return true; // Year is optional
    const currentYear = new Date().getFullYear();
    const numericYear = parseInt(year);
    return numericYear >= 1000 && numericYear <= currentYear;
  },

  // Number of copies validation
  isValidCopies: (copies) => {
    const numericCopies = parseInt(copies);
    return numericCopies >= 1 && numericCopies <= 1000; // Reasonable limits
  },

  // Description validation
  isValidDescription: (description) => {
    if (!description) return true; // Description is optional
    if (typeof description !== 'string') return false;
    return description.trim().length <= 1000;
  },

  // User role validation
  isValidRole: (role) => {
    const validRoles = ['Admin', 'Member'];
    return validRoles.includes(role);
  },

  // MongoDB ObjectId validation
  isValidObjectId: (id) => {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  // Pagination parameters validation
  isValidPaginationParams: (page, limit) => {
    const numericPage = parseInt(page);
    const numericLimit = parseInt(limit);
    
    const isValidPage = numericPage >= 1 && numericPage <= 1000;
    const isValidLimit = numericLimit >= 1 && numericLimit <= 100;
    
    return { isValidPage, isValidLimit };
  },

  // Search query validation
  isValidSearchQuery: (query) => {
    if (!query || typeof query !== 'string') return false;
    const trimmedQuery = query.trim();
    return trimmedQuery.length >= 1 && trimmedQuery.length <= 100;
  }
};

// Validation middleware generators
const validationMiddleware = {
  // Validate user registration data
  validateRegistration: (req, res, next) => {
    const { name, email, password, role } = req.body;
    const errors = [];

    if (!validation.isValidName(name)) {
      errors.push('Name must be between 2 and 50 characters');
    }

    if (!validation.isValidEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    if (!validation.isValidPassword(password)) {
      errors.push('Password must be at least 6 characters long');
    }

    if (role && !validation.isValidRole(role)) {
      errors.push('Invalid user role specified');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  },

  // Validate user login data
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!validation.isValidEmail(email)) {
      errors.push('Please provide a valid email address');
    }

    if (!password || password.length === 0) {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  },

  // Validate book creation data
  validateBookCreation: (req, res, next) => {
    const { title, author, isbn, genre, description, publishedYear, totalCopies } = req.body;
    const errors = [];

    if (!validation.isValidTitle(title)) {
      errors.push('Title is required and must be between 1 and 200 characters');
    }

    if (!validation.isValidAuthor(author)) {
      errors.push('Author name is required and must be between 2 and 100 characters');
    }

    if (!validation.isValidISBN(isbn)) {
      errors.push('Please provide a valid ISBN');
    }

    if (!validation.isValidGenre(genre)) {
      errors.push('Genre must be 50 characters or less');
    }

    if (!validation.isValidDescription(description)) {
      errors.push('Description must be 1000 characters or less');
    }

    if (publishedYear && !validation.isValidPublishedYear(publishedYear)) {
      errors.push('Published year must be valid and not in the future');
    }

    if (!validation.isValidCopies(totalCopies)) {
      errors.push('Total copies must be between 1 and 1000');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  },

  // Validate MongoDB ObjectId parameter
  validateObjectId: (paramName = 'id') => {
    return (req, res, next) => {
      const id = req.params[paramName];
      
      if (!validation.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format`
        });
      }

      next();
    };
  },

  // Validate search query parameters
  validateSearchQuery: (req, res, next) => {
    const { q } = req.query;
    
    if (q && !validation.isValidSearchQuery(q)) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be between 1 and 100 characters'
      });
    }

    next();
  },

  // Validate pagination parameters
  validatePagination: (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;
    const { isValidPage, isValidLimit } = validation.isValidPaginationParams(page, limit);
    
    const errors = [];
    
    if (!isValidPage) {
      errors.push('Page number must be between 1 and 1000');
    }
    
    if (!isValidLimit) {
      errors.push('Limit must be between 1 and 100');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
        errors
      });
    }

    next();
  }
};

// Sanitization functions
const sanitization = {
  // Sanitize string input (trim and basic cleaning)
  sanitizeString: (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
  },

  // Sanitize email
  sanitizeEmail: (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.trim().toLowerCase();
  },

  // Sanitize ISBN (remove spaces and dashes)
  sanitizeISBN: (isbn) => {
    if (!isbn || typeof isbn !== 'string') return '';
    return isbn.replace(/[-\s]/g, '');
  },

  // Sanitize user input object
  sanitizeUserInput: (userData) => {
    return {
      name: sanitization.sanitizeString(userData.name),
      email: sanitization.sanitizeEmail(userData.email),
      password: userData.password // Don't sanitize password
    };
  },

  // Sanitize book input object
  sanitizeBookInput: (bookData) => {
    return {
      title: sanitization.sanitizeString(bookData.title),
      author: sanitization.sanitizeString(bookData.author),
      isbn: sanitization.sanitizeISBN(bookData.isbn),
      genre: sanitization.sanitizeString(bookData.genre),
      description: sanitization.sanitizeString(bookData.description),
      publishedYear: bookData.publishedYear,
      totalCopies: parseInt(bookData.totalCopies) || 1
    };
  }
};

module.exports = {
  validation,
  validationMiddleware,
  sanitization
};