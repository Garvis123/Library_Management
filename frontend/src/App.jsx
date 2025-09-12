"use client"

import { createContext, useContext, useReducer, useEffect, useState } from "react"

// Auth Context and Provider
const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload, error: null }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case "LOGOUT":
      return { ...initialState, isLoading: false, token: null }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    default:
      return state
  }
}

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Simulate checking for existing auth
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", payload: false })
    }, 1000)
  }, [])

  const login = async (email, password) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const userData = {
        user: {
          id: "1",
          name: email === "admin@library.com" ? "Admin User" : "John Doe",
          email,
          role: email === "admin@library.com" ? "Admin" : "Member",
          borrowedBooks: [],
        },
        token: "sample_jwt_token",
      }

      if (email === "test@test.com" && password === "password") {
        dispatch({ type: "LOGIN_SUCCESS", payload: userData })
        return { success: true }
      } else if (email === "admin@library.com" && password === "admin123") {
        dispatch({ type: "LOGIN_SUCCESS", payload: userData })
        return { success: true }
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newUser = {
        user: {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          role: "Member",
          borrowedBooks: [],
        },
        token: "sample_jwt_token",
      }

      dispatch({ type: "LOGIN_SUCCESS", payload: newUser })
      return { success: true }
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    dispatch({ type: "LOGOUT" })
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        isAdmin: () => state.user?.role === "Admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Sample books data
const SAMPLE_BOOKS = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    genre: "Classic Literature",
    isAvailable: true,
    availableCopies: 3,
    totalCopies: 5,
  },
  {
    id: "2",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    genre: "Classic Literature",
    isAvailable: true,
    availableCopies: 2,
    totalCopies: 3,
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    genre: "Dystopian Fiction",
    isAvailable: false,
    availableCopies: 0,
    totalCopies: 2,
  },
  {
    id: "4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0-14-143951-8",
    genre: "Romance",
    isAvailable: true,
    availableCopies: 4,
    totalCopies: 4,
  },
]

// Components
const LoadingSpinner = ({ size = "medium" }) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`animate-spin rounded-full border-2 border-blue-100 border-t-blue-600 ${sizeClasses[size]}`}
      ></div>
    </div>
  )
}

const Header = () => {
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-balance">Library Management System</span>
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-600 hidden sm:flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2 rounded-full shadow-sm">
              <span className="text-gray-500">Welcome back,</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{user?.name}</span>
                {isAdmin() && (
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700">
                    Administrator
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-600 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <svg className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

const BookCard = ({ book, onBorrow, onReturn, onDelete, userBorrowedBooks = [] }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { isAdmin } = useAuth()

  const isUserBorrowed = userBorrowedBooks.some((borrowed) => borrowed.bookId === book.id)
  const canBorrow = book.isAvailable && !isUserBorrowed
  const canReturn = isUserBorrowed
  const canDelete = isAdmin() && book.isAvailable // Simplified condition for testing

  const handleBorrow = async () => {
    setIsLoading(true)
    await onBorrow(book.id)
    setIsLoading(false)
  }

  const handleReturn = async () => {
    setIsLoading(true)
    await onReturn(book.id)
    setIsLoading(false)
  }
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      setIsLoading(true)
      await onDelete(book.id)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 group hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30">
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-3 text-balance group-hover:text-blue-700 transition-colors duration-200 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-gray-600 mb-2 font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {book.author}
          </p>
          <p className="text-sm text-gray-500 mb-4 font-mono bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-lg inline-block border border-gray-200/50 group-hover:border-gray-200 transition-colors duration-300">
            <span className="text-gray-400 mr-1">ISBN:</span>
            {book.isbn}
          </p>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 shadow-sm">
            {book.genre}
          </span>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-xs font-bold shadow-sm transform transition-all duration-300 ${
            book.isAvailable
              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 group-hover:from-green-100 group-hover:to-emerald-100 group-hover:shadow"
              : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200 group-hover:from-red-100 group-hover:to-rose-100 group-hover:shadow"
          }`}
        >
          {book.isAvailable ? "Available" : "Unavailable"}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg border border-blue-100 group-hover:shadow-md transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-indigo-500/0 group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="text-sm text-blue-600 font-medium flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="font-bold text-blue-700">{book.availableCopies}</span>
            <span className="text-blue-500">of</span>
            <span className="font-bold text-blue-700">{book.totalCopies}</span>
            <span className="text-blue-500">available</span>
          </span>
        </div>
      </div>

      <div className="flex space-x-3">
        {canBorrow && (
          <button
            onClick={handleBorrow}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Borrow
              </>
            )}
          </button>
        )}

        {canReturn && (
          <button
            onClick={handleReturn}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
                Return
              </>
            )}
          </button>
        )}

        {!canBorrow && !canReturn && !canDelete && (
          <div className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 px-4 py-3 rounded-lg text-sm font-semibold text-center border border-gray-200">
            {isUserBorrowed ? "Currently Borrowed" : "Not Available"}
          </div>
        )}

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Delete
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

const SearchBar = ({ searchTerm, onSearch, onClear }) => {
  return (
    <div className="relative mb-10 max-w-4xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <svg 
              className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-12 py-5 rounded-2xl bg-transparent placeholder-gray-400 focus:placeholder-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all duration-300"
            placeholder="Search books by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-5 flex items-center group/clear"
            >
              <div className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-300">
                <svg
                  className="h-5 w-5 text-gray-400 group-hover/clear:text-gray-600 group-hover/clear:rotate-90 transition-all duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const AddBookForm = ({ onAddBook, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    description: "",
    publishedYear: "",
    totalCopies: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    await onAddBook(formData)
    setIsSubmitting(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalCopies" ? Number.parseInt(value) || 1 : value,
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Add New Book</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Author *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">ISBN *</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Genre</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Published Year</label>
            <input
              type="number"
              name="publishedYear"
              value={formData.publishedYear}
              onChange={handleChange}
              min="1000"
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Total Copies</label>
            <input
              type="number"
              name="totalCopies"
              value={formData.totalCopies}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm hover:shadow-md"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <LoadingSpinner size="small" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Book
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const Dashboard = () => {
  const { isAdmin } = useAuth()
  const [books, setBooks] = useState(SAMPLE_BOOKS)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [userBorrowedBooks, setUserBorrowedBooks] = useState([])
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.includes(searchTerm),
  )

  const handleBorrowBook = async (bookId) => {
    const book = books.find((b) => b.id === bookId)
    if (!book || !book.isAvailable) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update book availability
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1, isAvailable: b.availableCopies > 1 } : b,
      ),
    )

    // Add to user's borrowed books
    setUserBorrowedBooks((prev) => [
      ...prev,
      {
        bookId,
        title: book.title,
        borrowedAt: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    ])

    showNotification(`Successfully borrowed "${book.title}"`)
  }

  const handleReturnBook = async (bookId) => {
    const book = books.find((b) => b.id === bookId)
    if (!book) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update book availability
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, availableCopies: b.availableCopies + 1, isAvailable: true } : b)),
    )

    // Remove from user's borrowed books
    setUserBorrowedBooks((prev) => prev.filter((b) => b.bookId !== bookId))

    showNotification(`Successfully returned "${book.title}"`)
  }

  const handleAddBook = async (bookData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newBook = {
      ...bookData,
      id: Date.now().toString(),
      availableCopies: bookData.totalCopies,
      isAvailable: true,
    }

    setBooks((prev) => [newBook, ...prev])
    setShowAddForm(false)
    showNotification(`Successfully added "${bookData.title}"`)
  }

  const handleDeleteBook = async (bookId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const bookToDelete = books.find(b => b.id === bookId)
      if (!bookToDelete) return

      setBooks(prev => prev.filter(b => b.id !== bookId))
      showNotification(`Successfully deleted "${bookToDelete.title}"`)
    } catch {
      showNotification("Error deleting book", "error")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 bg-fixed">
      <Header />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
        {notification && (
          <div
            className={`mb-8 p-5 rounded-xl border-l-4 shadow-lg transform transition-all duration-500 animate-slideInDown ${
              notification.type === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-400 hover:from-green-100 hover:to-emerald-100"
                : "bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-400 hover:from-red-100 hover:to-rose-100"
            } mx-4 sm:mx-0 hover:shadow-xl relative overflow-hidden cursor-pointer group`}
            onClick={() => setNotification(null)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="flex items-center gap-3 relative">
              {notification.type === "success" ? (
                <div className="rounded-full bg-green-100 p-2 group-hover:scale-110 transform transition-transform duration-300">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
              ) : (
                <div className="rounded-full bg-red-100 p-2 group-hover:scale-110 transform transition-transform duration-300">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              )}
              <span className="font-semibold group-hover:translate-x-1 transform transition-transform duration-300">{notification.message}</span>
              <button 
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors duration-300"
                onClick={(e) => { e.stopPropagation(); setNotification(null); }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="px-4 py-8 sm:px-0">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6 bg-white/50 p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-white/60">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {isAdmin() ? "Library Management Dashboard" : "Book Catalog"}
                  </h1>
                  <p className="text-gray-600 text-lg mt-2">
                    {isAdmin() ? "Manage your library's book collection" : "Discover and borrow books from our collection"}
                  </p>
                </div>
              </div>
            </div>

            {isAdmin() && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl gap-2 hover:scale-105 transform"
              >
                {showAddForm ? (
                  <>
                    <svg className="w-4 h-4 rotate-0 hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Book
                  </>
                )}
              </button>
            )}
          </div>

          {showAddForm && isAdmin() && (
            <div className="mb-12">
              <AddBookForm onAddBook={handleAddBook} onCancel={() => setShowAddForm(false)} />
            </div>
          )}

          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} onClear={() => setSearchTerm("")} />

          {userBorrowedBooks.length > 0 && (
            <div className="mb-12 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl p-8 border border-blue-200/50 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-900">Your Borrowed Books</h3>
                  <p className="text-blue-600 mt-1">Keep track of your reading journey</p>
                </div>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md">
                  {userBorrowedBooks.length} Books
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBorrowedBooks.map((book) => (
                  <div
                    key={book.bookId}
                    className="bg-white rounded-xl p-6 shadow-md border border-blue-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <h4 className="font-bold text-gray-900 mb-4 text-balance group-hover:text-blue-700 transition-colors duration-300">{book.title}</h4>
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-3 rounded-lg border border-yellow-200/50 group-hover:border-yellow-300 transition-colors duration-300 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-amber-800 font-medium">
                          Due: {book.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBorrow={handleBorrowBook}
                  onReturn={handleReturnBook}
                  onDelete={handleDeleteBook}
                  userBorrowedBooks={userBorrowedBooks}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 px-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-8 transform hover:rotate-12 transition-transform duration-300 group">
                    <svg className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">No books found</h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">Try adjusting your search terms or browse our complete collection to find what you're looking for</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-300"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await login(formData.email, formData.password)
    setIsLoading(false)
    if (!result.success) {
      setError(result.error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3 text-balance">Library Management</h2>
          <p className="text-gray-600 text-lg">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg font-medium">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? <LoadingSpinner size="small" /> : "Sign In"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-500 text-sm font-semibold transition-colors duration-200 hover:underline"
              >
                Don't have an account? Register here
              </button>
            </div>

            <div className="mt-10 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-700 font-bold mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Demo Accounts:
              </p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-bold text-gray-800">Member:</span> test@test.com / password
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-bold text-gray-800">Admin:</span> admin@library.com / admin123
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }
    const result = await register(formData)
    setIsLoading(false)
    if (!result.success) {
      setError(result.error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3 text-balance">Library Management</h2>
          <p className="text-gray-600 text-lg">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg font-medium">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md text-lg"
                  placeholder="Confirm your password"
                />
                {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                  <p className="mt-3 text-sm text-red-600 font-medium">Passwords do not match</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || formData.password !== formData.confirmPassword}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? <LoadingSpinner size="small" /> : "Register"}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-500 text-sm font-semibold transition-colors duration-200 hover:underline"
              >
                Already have an account? Sign in here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Main App Component
const App = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const [currentView, setCurrentView] = useState("login")

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-8 shadow-xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <LoadingSpinner size="large" />
        <p className="text-gray-600 text-xl mt-6 font-semibold text-balance text-center">
          Loading Library Management System...
        </p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Dashboard />
  }

  return (
    <>
      {currentView === "login" ? (
        <Login onSwitchToRegister={() => setCurrentView("register")} />
      ) : (
        <Register onSwitchToLogin={() => setCurrentView("login")} />
      )}
    </>
  )
}

// Root component with AuthProvider
const LibraryManagementApp = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

export default LibraryManagementApp
