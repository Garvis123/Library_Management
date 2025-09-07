📚 Library Management System

A full-stack Library Management System built using React.js (Vite) for the frontend, Node.js + Express for the backend, and MongoDB as the database.
It supports book management, user authentication (JWT), role-based access (Admin/Member), and responsive UI built with Tailwind CSS.

🚀 Features
Backend

REST API built with Express.

Users can:

Register/Login with JWT authentication.

Roles: Admin (can add books) & Member (can borrow/return books).

Books:

Add new book (Admin only).

Fetch all available books.

Search books by title/author.

Borrow/return book with availability status.

MongoDB with Mongoose models.

API documentation via Postman collection (can be shared).

Frontend

Responsive web application built with React.js + Vite.

Tailwind CSS for modern UI design.

User can:

View all books.

Search books by title/author.

Borrow/return books.

Admin can add books.

Authentication flow:

Login/Register pages.

Role-based UI (Add book button only for Admin).

Context API for auth & global state management.

Mobile-friendly layout.

🛠️ Tech Stack

Frontend: React.js (Vite), React Router, Axios, Tailwind CSS, Context API

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt.js

Database: MongoDB (local or Atlas)