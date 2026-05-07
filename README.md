Gov Route Finder

A full-stack government route and directory finder platform built with a Next.js frontend and a Node.js backend.
The project helps users discover, scrape, and manage government department routes, directories, and related information efficiently.

⸻

📁 Project Structure

project-root/
│
├── frontend/              # Next.js frontend application
│
├── gov-route-finder/      # Node.js backend API & scraping services
│
└── .gitignore

⸻

🚀 Tech Stack

Frontend

* Next.js
* React.js
* JavaScript
* CSS

Backend

* Node.js
* Express.js
* Axios

⸻

✨ Features

* Government route discovery
* API-based backend architecture
* Government website scraping support
* Frontend dashboard interface
* Retry and timeout handling
* Modular backend services
* Environment-based configuration

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

Create a .env.local file inside the frontend folder:

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

📡 Backend Responsibilities

The backend handles:

* Government route scraping
* API response handling
* Retry mechanisms
* Timeout management
* Error classification
* Route aggregation services

⸻

📂 Recommended Folder Structure

Frontend

frontend/
│
├── components/
├── pages/
├── public/
├── styles/
└── package.json

Backend

gov-route-finder/
│
├── routes/
├── controllers/
├── services/
├── utils/
├── package.json
└── server.js

⸻

🛠️ Development Commands

Frontend

npm run dev
npm run build
npm run start

Backend

npm run dev
npm start

⸻


