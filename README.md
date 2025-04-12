# 🖌 Sketch (Excalidraw Clone)

A **real-time collaborative whiteboard** built with **Next.js, WebSockets, and Prisma**. This project allows multiple users to draw and interact on a shared canvas in real time, making it perfect for brainstorming, sketching, and online collaboration.

![Project Demo](https://res.cloudinary.com/dbghbvuhb/video/upload/v1744347121/sxafl0jua3fscb70f81b.mp4)

## 🚀 Features

- 🎨 **Real-time drawing** with WebSockets
- 👥 **Collaborative rooms** for multiple users
- 🔐 **Authentication** (Sign In / Sign Up)
- 🖥 **Responsive UI** built with Tailwind CSS
- 💾 **Database integration** using Prisma and PostgreSQL
- 📂 **Modular TurboRepo architecture**

---

## 📂 Project Structure

```
└── 0x4nud3p-excalidraw-clone.git/
    ├── apps/
    │   ├── web/               # Next.js frontend
    │   └── ws-backend/        # WebSocket backend
    ├── packages/
    │   ├── db/                # Prisma database schema
    │   ├── eslint-config/     # Shared ESLint config
    │   ├── typescript-config/ # Shared TypeScript config
    │   └── ui/                # Reusable UI components
    ├── turbo.json             # TurboRepo configuration
    └── README.md              # Project documentation
```

---

## 🏗 Tech Stack

### **Frontend (Web App)**
- **Next.js** - Server-side rendering & static site generation
- **React** - Component-based UI
- **Tailwind CSS** - Modern utility-first styling
- **TypeScript** - Strongly typed JavaScript
- **WebSockets** - Real-time collaboration

### **Backend (WebSocket Server)**
- **Node.js** - JavaScript runtime
- **Express.js** - Lightweight server framework
- **WebSockets (ws)** - Live communication between users

### **Database & Auth**
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Scalable relational database
- **better-auth** - Authentication

---

## 🔧 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/0x4nud33p/sketch.git
cd sketch
```

### 2️⃣ Install Dependencies
```sh
pnpm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the **root directory** and add the following:
```
# apps/web
NEXT_WS_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# apps/ws-backend
PORT=

# packages/db
DATABASE_URL=

```

### 4️⃣ Run Database Migrations
```sh
pnpm db:migrate
```

### 5️⃣ Start Development Server
#### Start the **frontend** (Next.js web app):
```sh
pnpm dev:web
```
#### Start the **backend** (WebSocket server):
```sh
pnpm dev:ws
```

The app should now be running at `http://localhost:3000` 🎉

---

## 📜 API Routes

### **Auth Routes**
| Method | Endpoint            | Description      |
|--------|---------------------|-----------------|
| `POST` | `/api/auth/signin`  | Log in a user   |

### **Canvas & Collaboration**
| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| `GET`  | `/api/drawings`        | Fetch all drawings |
| `POST` | `/api/drawings`        | Save a new drawing |
| `GET`  | `/api/rooms`           | Get available rooms |
| `POST` | `/api/rooms`           | Create a new room |

---

## 🛠 Future Enhancements
- 🏷 **User roles & permissions**
- 🗃 **Cloud storage for drawings**
- 🎥 **Live voice/video collaboration**

---

## 👥 Contributing
Pull requests are welcome! If you'd like to contribute:
1. Fork the repo
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes & commit (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Submit a pull request

---

## 📜 License
This project is **open-source** and licensed under the **MIT License**.

---

🚀 **Made with ❤️ by [Anudeep Avula](https://github.com/0x4nud33p)**
