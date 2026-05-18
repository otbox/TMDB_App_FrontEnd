# Stage 1: build
FROM node:alpine AS builder
RUN corepack enable
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Fix for React Router — serve index.html for all routes
RUN sed -i 's|try_files $uri $uri/ =404;|try_files $uri $uri/ /index.html;|' \
    /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
