# Image du frontend INVODIS — Angular compilé ici en configuration production, servi par nginx.
# L'adresse de l'API (src/environments/environment.prod.ts) est figée au moment du build.

# ---------- 1. Compilation ----------
FROM node:22-alpine AS build
WORKDIR /app

# @parcel/watcher@2.0.4 (via nx / @angular-eslint) n'a pas de binaire précompilé pour Alpine :
# node-gyp le compile, il faut Python et un compilateur (étape de build seulement, absents de l'image finale)
RUN apk add --no-cache python3 make g++

# .npmrc contient legacy-peer-deps=true
COPY package.json package-lock.json .npmrc ./
RUN npm ci --no-audit --no-fund

COPY . .
# Tas Node limité (Mo) : le script build-prod demande 8000, plus que la VM Docker (~7,6 Go)
# ou un runner GitHub Actions de dépôt privé (7-8 Go). Ajustable : --build-arg NODE_HEAP_MB=...
ARG NODE_HEAP_MB=4096
RUN node --max_old_space_size=${NODE_HEAP_MB} ./node_modules/@angular/cli/bin/ng build --configuration production

# ---------- 2. Service ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/skote /usr/share/nginx/html
EXPOSE 80
