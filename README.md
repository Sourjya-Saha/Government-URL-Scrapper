# Gov Route Finder Frontend & Node Backend

---
# 📁 Project Structure
```bash
project-root/
│
├── frontend/              # Next.js frontend application
│
├── gov-route-finder/      # Node.js backend API & scraping services
│
└── .gitignore

⸻

⚙️ Installation

1️⃣ Clone the Repository

git clone <your-repository-url>
cd <project-folder>

⸻

🖥️ Frontend Setup

Navigate to the frontend folder:

cd frontend

Install dependencies:

npm install

Create a .env file inside the frontend folder:

NEXT_PUBLIC_NODE_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000

Run the frontend development server:

npm run dev

Frontend will run on:

http://localhost:3000

⸻

🔧 Backend Setup

Navigate to backend folder:

cd gov-route-finder

Install dependencies:

npm install

Create a .env file inside the gov-route-finder folder:

PORT=5000
HOST=0.0.0.0
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
CORS_ORIGIN=*

Run the backend server:

npm start

or for development mode:

npm run dev

Backend will run on:

http://localhost:5000

⸻

🛠️ Development Commands

Frontend

npm run dev

Backend

npm start

⸻