# 💬 Real-Time Chat Application
A modern, real-time chat application built with Spring Boot and React. Join rooms, send instant messages, and chat with friends in real-time using WebSockets.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-yellow)
___
# ✨ Features
- Real-time messaging with WebSockets
- Multiple chat rooms support
- Message history persistence
- Typing indicators when users are typing
- Online users list
- Modern UI with dark/light mode
- Responsive design for all devices
___
# 🏗️ Tech Stack
**Backend:**
- Java 17 + Spring Boot 3
- Spring WebSocket + STOMP
- Spring Data MongoDB
- MongoDB

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- SockJS + StompJS
- React Router
___
# 🚀 Quick Start
Prerequisites
- Java 17+
- Node.js 16+
- MongoDB

**Backend Setup**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```
___
# 📁 Project Structure
```bash
chat-app/
├── backend/                 # Spring Boot Application
│   ├── src/main/java/
│   │   ├── controller/     # REST & WebSocket endpoints
│   │   ├── model/          # Room, Message, User models
│   │   ├── repository/     # MongoDB repositories
│   │   └── config/         # WebSocket & CORS config
│   └── application.yml     # Configuration
│
└── frontend/              # React Application
    ├── src/
    │   ├── components/     # React components
    │   ├── context/        # Global state (ChatContext)
    │   ├── services/       # API calls (RoomService)
    │   └── config/         # Configuration & helpers
    └── vite.config.js
```
___
# 🌐 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/rooms` | Create new room |
| GET | `/api/v1/rooms/{id}` | Join existing room |
| GET | `/api/v1/rooms/{id}/messages` | Get message history |


**WebSocket**
- Connect: /chat
- Send: /app/sendMessage/{roomId}
- Subscribe: /topic/room/{roomId}
___
# 🎨 UI Components
**JoinCreateChat.jsx** - Room entry screen
- Clean, minimalistic design
- Smooth animations
- Input validation
  
**ChatPage.jsx** - Main chat interface
- Real-time message display
- Message bubbles with timestamps
- Online users sidebar
- Typing indicators
___
# 🧪 Testing the App
1. Start MongoDB locally
2. Run the Spring Boot backend
3. Start the React frontend
4. Open two browser windows
5. Join the same room with different usernames
6. Start chatting in real-time!
___
# 🤝 Contributing
1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request
___
# 🙏 Acknowledgments
- Spring Boot team for the amazing framework
- React team for the UI library
- MongoDB for the database
- All open-source libraries used in this project

Made with ❤️ by Bibek Kumar Tamang
