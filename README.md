# CSS Knowledge Hub

- `frontend/` – HTML, CSS, JavaScript (no build step)
- `backend/` – Node.js + Express API with SQLite database (`data.db` is created on first run with sample data)

## Run
```
cd backend
npm install
npm start
```
Open http://localhost:3000

Admin dashboard: click "Admin" in the menu. Default password: `admin123`.
Change it: `ADMIN_PASSWORD=mysecret npm start` (Windows PowerShell: `$env:ADMIN_PASSWORD="mysecret"; npm start`).

## API
- `POST /api/login` · `GET/POST /api/lessons` · `PUT/DELETE /api/lessons/:id`
- `GET/POST /api/questions` · `PUT/DELETE /api/questions/:id`
- `POST /api/scores` (public) · `GET /api/scores` (admin)
Write operations and viewing scores need the admin token.
