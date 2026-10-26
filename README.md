# Platito

Red social de reseñas de platos de restaurantes: los usuarios publican un plato que probaron, lo puntúan y la comunidad reacciona y comenta.

Trabajo Práctico N.º 2 — Programación IV (UTN Avellaneda).

## Estructura

| Carpeta     | Tecnología          |
|-------------|---------------------|
| `frontend/` | Angular 22          |
| `backend/`  | NestJS 12 + MongoDB |

## Cómo levantarlo

Requisitos: Node.js y MongoDB corriendo en `localhost:27017`.

**Backend** (http://localhost:3000/api)

```bash
cd backend
npm install
cp .env.example .env   # completar JWT_SECRET y las claves de Cloudinary
npm run start:dev
```

**Frontend** (http://localhost:4200)

```bash
cd frontend
npm install
npm start
```
