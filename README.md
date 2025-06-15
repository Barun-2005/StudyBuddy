# 📚 Study Buddy

Study Buddy is a full-stack MERN application that helps students find ideal study partners based on interests, ratings, and availability. The platform supports real-time messaging, group chat, peer reviews, and secure authentication.

## 🚀 Live Demo

🌐

## 🛠️ Tech Stack

- ⚛️ React (Vite) + TailwindCSS + Daisy UI (Frontend)
- 🌐 Node.js + Express + MongoDB (Backend)
- 🔐 JWT Authentication
- 🔄 Socket.io for real-time chat and online status
- ☁️ Cloudinary for image uploads
- 🧠 Zustand for global state management

## 📦 Features

- 👥 Student matchmaking based on preferences
- 🔒 Secure login via email & Google OAuth
- 💬 Real-time messaging with online indicators
- 📝 Peer reviews and ratings
- 📅 Study group creation & joining
- 📷 Profile image upload using Cloudinary

## 📁 Folder Structure

server/
├── src/
│ ├── index.js # Express server entry point
│ ├── dist/ # React build output
│ ├── routes/ # All API route files
│ └── lib/ # DB, socket, passport, etc.
├── package.json
├── .env


## ⚙️ Getting Started Locally

1. Clone the repo:
   git clone https://github.com/Barun-2005/StudyBuddy.git
   cd study-buddy/server

2. Install dependencies:
    npm install

3. Set up .env:
    cp .env.example .env

4. Run the server:
    npm start

🌐 Deployment
This app is deployed on Render, with both backend and frontend served together using Express.