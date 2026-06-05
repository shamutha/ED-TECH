# ---- Build stage: produce the static Vite bundle ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Vite inlines VITE_* vars at build time, so they must be present here (build args).
ARG VITE_RAZORPAY_KEY_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
# VITE_BACKEND_URL is intentionally left unset → the app uses same-origin (relative)
# requests, which nginx (below) proxies to the server container.
RUN npm run build

# ---- Serve stage: nginx serves the bundle and proxies the API ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
