# Worklex

Proyecto SENA para implementar una herramienta que permita trabajar con diccionarios digitales por temáticas.

---

## 📋 Requisitos

Tener instalado:

* Docker
* Docker Compose

---

## ⚙️ Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone https://github.com/senaworklex/worklex.git
cd worklex
```

---

### 2. Crear el archivo de entorno

```bash
cp .env.example .env
```

---

### 3. Levantar todo el stack WorkLex

Un solo comando levanta los 12 contenedores del stack (proxy, backend,
frontend, worker, persistencia, cache, vault, media, auth, firewall,
monitor y logs):

```bash
docker compose up --build -d
```

> La red `worklex_network` y los volúmenes se crean automáticamente.

---

## 🌐 Acceso a los servicios

| Servicio              | Contenedor              | URL / Puerto                  |
| --------------------- | ----------------------- | ----------------------------- |
| Proxy (Nginx)         | `worklex_proxy`         | http://localhost (80 / 443)   |
| Backend (Django)      | `worklex_backend`       | http://localhost:8000         |
| Frontend (React+Vite) | `worklex_frontend`      | http://localhost:3000         |
| PostgreSQL            | `worklex_persistencia`  | localhost:5432                |
| Redis                 | `worklex_cache`         | localhost:6379                |
| Vault                 | `worklex_vault`         | http://localhost:8200         |
| MinIO (S3)            | `worklex_media`         | http://localhost:9001 (UI)    |
| Keycloak (auth)       | `worklex_auth`          | http://localhost:8080         |
| Firewall (WAF)        | `worklex_firewall`      | http://localhost:8081         |
| Grafana               | `worklex_monitor`       | http://localhost:3001         |
| Prometheus            | `worklex_prometheus`    | http://localhost:9090         |
| Loki (logs)           | `worklex_logs`          | http://localhost:3100         |

---

## 🛑 Si algo falla

```bash
docker compose down
docker system prune -f
docker compose up --build
```
