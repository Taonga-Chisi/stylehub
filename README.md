# StyleHub 💇‍♀️💈

A full-stack hair styling platform with a modern React TypeScript frontend and a Django REST backend.

---

## 📁 Repository Structure

```
STYLEHUB/
├── backend/                  # Django project
│   ├── manage.py
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── stylehub/             # Django settings, urls, wsgi/asgi
└── frontend/                 # React + TypeScript + Vite + Tailwind CSS
    ├── package.json          # Node dependencies and scripts
    ├── vercel.json           # Vercel deployment configuration
    ├── .env.example          # Frontend environment variables template
    └── src/                  # React source code
```

---

## 🚀 Getting Started Locally

### 1. Backend (Django)

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   # On Linux/macOS:
   source stylehub_backend/bin/activate

   # On Windows:
   stylehub_backend\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the development server:
   ```bash
   python manage.py runserver 8000
   ```
   Backend will run at `http://127.0.0.1:8000/`.

---

### 2. Frontend (React + Vite)

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment

### Frontend (Vercel)
- When importing this repository to Vercel, set the **Root Directory** in Project Settings to `frontend`.
- Vercel will automatically detect Vite and use `frontend/vercel.json` for SPA routing and asset caching.

### Backend (Django)
- Can be deployed to services like Render, Railway, Fly.io, or Heroku.
- Remember to set `SECRET_KEY`, `DEBUG=False`, and `ALLOWED_HOSTS` in your production environment variables.
