# 🎵 Pulse Play - Modern Music Streaming Platform

[![Database](https://img.shields.io/badge/Database-MySQL-blue.svg)](https://www.mysql.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](https://nodejs.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A full-stack music streaming application built for COE 418 - Database Systems course at Lebanese American University

## 🌟 Features

### Database
- **10+ Normalized Tables** (3NF)
- **5+ Complex Queries** (JOINs, nested, aggregates, set operations)
- **5 Stored Procedures** with ACID transactions
- **7 Triggers** for automatic updates
- **4 Views** for complex data retrieval
- **Advanced Indexing** for performance

### Backend
- RESTful API with Express.js
- JWT Authentication
- Password Hashing (bcrypt)
- Connection Pooling
- Comprehensive Error Handling

### Frontend
- Modern React 18 Application
- Beautiful Purple/Pink Gradient Theme
- Smooth Animations & Transitions
- Fully Responsive Design
- Intuitive User Experience

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MySQL (v8.0+)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pulse-play
```

2. **Setup Database**
```bash
mysql -u root -p < database_schema.sql
```

3. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm start
```

4. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

5. **Open your browser**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
pulse-play/
├── database_schema.sql          # Complete MySQL schema
├── backend/
│   ├── server.js               # Express server & API routes
│   ├── package.json            # Backend dependencies
│   └── .env.example           # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   ├── App.css            # Styles & animations
│   │   └── main.jsx           # React entry point
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
├── IMPLEMENTATION_GUIDE.md     # Detailed setup guide
└── README.md                   # This file
```

## 🎯 Key Highlights

### Complex Queries Implemented

1. **Multi-table JOIN** - User listening history with full details
2. **Multi-table JOIN** - Playlist contents with song/artist info
3. **Nested Query** - Users above average activity
4. **Aggregate + GROUP BY** - Genre statistics
5. **Set Operation (UNION)** - Followed artists' content

### Stored Procedures

1. `add_song_to_playlist` - Add song with automatic position management
2. `remove_song_from_playlist` - Remove song and reorder playlist
3. `record_song_play` - Track play with conditional play count update
4. `update_user_subscription` - Subscription management with transaction
5. `get_user_recommendations` - Personalized song recommendations

### Triggers

1. Update album track count on song insert
2. Update album track count on song delete
3. Update song likes count on favorite add
4. Update song likes count on favorite remove
5. Update artist followers on follow
6. Update artist followers on unfollow
7. Auto-expire subscriptions

## 📊 Database Schema

### Core Tables
- `users` - User accounts and profiles
- `artists` - Music artists
- `albums` - Music albums
- `songs` - Individual tracks
- `playlists` - User-created playlists
- `subscriptions` - User subscription plans
- `listening_history` - Play tracking

### Relationship Tables
- `playlist_songs` - Playlist contents
- `user_favorites` - Liked songs
- `user_following_artists` - Artist follows

## 🎨 UI/UX Features

- **Modern Design System** - Custom color palette & typography
- **Gradient Theme** - Purple/pink gradients throughout
- **Smooth Animations** - Pulse effects, transitions, hover states
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Loading States** - Skeleton loaders for better UX
- **Empty States** - Helpful messages when no content

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention with parameterized queries
- CORS protection
- Environment variable configuration

## 📈 Performance

- Database connection pooling
- Optimized queries with proper indexes
- Pagination for large datasets
- Efficient React rendering

## 🧪 Testing

See `IMPLEMENTATION_GUIDE.md` for detailed testing instructions including:
- API endpoint testing with curl
- Database query verification
- Stored procedure testing
- Trigger validation

## 📚 Documentation

- `IMPLEMENTATION_GUIDE.md` - Complete setup and deployment guide
- Inline code comments
- API endpoint documentation
- Database schema documentation

## 👥 Course Information

- **Course:** COE 418 - Database Systems
- **Instructor:** Helen Saad
- **Institution:** Lebanese American University
- **Semester:** Fall 2025

## 🏆 Project Requirements

This project fulfills all requirements including:

✅ ER Diagram (provided)  
✅ Relational Schema (normalized to 3NF)  
✅ MySQL Implementation  
✅ 5+ Complex Queries  
✅ Stored Procedures with Transactions  
✅ Triggers  
✅ Views  
✅ Backend API  
✅ Frontend Application  
✅ Technical Report (see documentation)  
✅ Presentation-ready

### Bonus Features (Extra Credit)
✅ Advanced indexing strategies  
✅ Multiple stored procedures  
✅ Comprehensive trigger system  
✅ Multiple views  
✅ Exceptional UI/UX design  
✅ Responsive design  
✅ Additional features beyond requirements

## 🎯 Learning Outcomes

This project demonstrates:
- Database design and normalization
- Complex SQL query writing
- Stored procedures and triggers
- Full-stack web development
- RESTful API design
- Modern frontend development
- Authentication and authorization
- Software engineering best practices

## 📝 License

This project is created for educational purposes as part of COE 418 coursework.

## 🙏 Acknowledgments

- Lebanese American University
- COE 418 Course Material
- MySQL Documentation
- React Documentation
- Express.js Documentation

---

**Developed with ❤️ for COE 418 - Database Systems**

For detailed setup instructions, please refer to `IMPLEMENTATION_GUIDE.md`
