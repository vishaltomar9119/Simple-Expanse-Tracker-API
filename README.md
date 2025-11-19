```markdown
# Simple Expanse Tracker API

> Minimal RESTful backend for tracking expenses, categories and users.

This repository provides a small API for recording and querying expenses. The README has been extended to show how to containerize the app with Docker, run multiple replicas, and put an Nginx reverse proxy / load balancer in front of them. It also lists all main technologies used.

Quick summary
- API: CRUD for expenses, categories, users
- Auth: JWT-based authentication
- Persistence: MongoDB
- Extras (added here): Docker, docker-compose, Nginx reverse-proxy/load-balancer, notes about scaling and health checks

Tech stack / Tools used
- Node.js (Express)
- MongoDB (Mongoose)
- JSON Web Tokens (JWT) for authentication
- dotenv for configuration
- Docker — containerize the application
- docker-compose — run multi-container setups and scale replicas
- Nginx — reverse proxy and simple load balancer
- (Optional) HAProxy, Traefik, or cloud load balancers for production-grade LB
- Git / GitHub

Prerequisites
- Node.js (v14+)
- npm or yarn
- Docker & docker-compose (if you use the containerization instructions)
- MongoDB (local, Docker, or hosted)

Environment variables
Create a .env file in the project root with at least:
PORT=3000
MONGO_URI=mongodb://mongo:27017/expense-tracker
JWT_SECRET=your_jwt_secret
NODE_ENV=production

Run locally (non-Docker)
1. Install dependencies:
   npm install
2. Start:
   npm run dev
3. Use Postman / curl to call endpoints (see API Overview).

Containerization and Load Balancing (Docker + Nginx)
Below are example files and instructions to run the app in Docker, scale multiple app replicas, and put Nginx in front as a reverse proxy / load balancer.

Example Dockerfile (app container)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "src/server.js"]
```

Example docker-compose.yml
```yaml
version: "3.8"

services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongo-data:/data/db

  app:
    build: .
    env_file:
      - .env
    depends_on:
      - mongo
    networks:
      - frontend
    # NOTE: We'll scale this service when starting docker-compose (see commands)

  nginx:
    image: nginx:stable-alpine
    ports:
      - "80:80"
    volumes:
      - ./deploy/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
    networks:
      - frontend

volumes:
  mongo-data:

networks:
  frontend:
```

Example Nginx configuration (simple reverse proxy + upstream)
Place this as deploy/nginx/nginx.conf in the repo (path referenced above).
```nginx
# deploy/nginx/nginx.conf
events {}
http {
  upstream expanse_app {
    # app containers will be reachable by service name "app" and different ports
    # When using docker-compose scale, Docker's internal DNS will round-robin
    # multiple containers behind the same service name. We'll proxy to the service name and port.
    server app:3000;
  }

  server {
    listen 80;
    server_name _;

    location / {
      proxy_pass http://expanse_app;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

How to run the stack (development/demo)
1. Build and start services (single app replica):
   docker-compose up --build
2. Scale the app to multiple instances to simulate multiple replicas:
   docker-compose up --build --scale app=3
   - In this setup Docker's internal routing + Nginx will balance requests across the app containers.
3. Access the API through http://localhost (Nginx listens on port 80)
4. To stop:
   docker-compose down -v

Notes about load balancing
- The above Nginx config is a simple reverse proxy. For more advanced load balancing features (sticky sessions, health checks, circuit breaking), consider:
  - Using Nginx plus or HAProxy for active health checks and richer LB strategies.
  - Using a cloud-managed load balancer (AWS ALB, GCP LB) in production.
  - Deploying to Kubernetes and using an Ingress + Horizontal Pod Autoscaler (recommended for production scale).
- Docker Swarm or Kubernetes provide better native service discovery and load balancing for many replicas.
- Ensure your app is stateless (store sessions in DB/Redis) if you scale horizontally.

Health checks and readiness
- Expose a simple health endpoint, e.g., GET /health or GET /api/health that returns 200 when app is ready.
- Configure Nginx or your orchestrator to use that for deciding healthy backends (NGINX OSS needs extra tooling for active health checks; orchestration platforms handle it better).

Suggested project files to add (I can add these for you if you want)
- Dockerfile (root)
- docker-compose.yml (root)
- deploy/nginx/nginx.conf
- .env.example with docker suitable defaults

API overview (short)
All endpoints that require authentication expect a Bearer token:
Authorization: Bearer <token>

Auth
- POST /api/auth/register
- POST /api/auth/login

Expenses
- GET /api/expenses
- GET /api/expenses/:id
- POST /api/expenses
- PUT /api/expenses/:id
- DELETE /api/expenses/:id

Categories
- GET /api/categories
- POST /api/categories
- PUT /api/categories/:id
- DELETE /api/categories/:id

Reporting
- GET /api/reports/monthly?year=YYYY&month=MM
- GET /api/reports/categories?from=YYYY-MM-DD&to=YYYY-MM-DD

Security and production notes
- Use strong JWT_SECRET and store it securely (e.g., secrets manager, environment variables in hosting platform).
- Use HTTPS in production (TLS termination at Nginx, cloud LB, or ingress).
- Add rate limiting, request size limits, and input validation.
- Add CI to build and test container images automatically.

Contributing
Contributions welcome. If you'd like, I can add the Dockerfile, docker-compose.yml, and example nginx.conf directly to this repository in a branch and open a PR — tell me the branch name and whether you want the images pushed to a registry.

License
MIT — see LICENSE file.

Acknowledgements
- Built as a simple example to demonstrate a small API and how to run it with Docker and Nginx.

```
