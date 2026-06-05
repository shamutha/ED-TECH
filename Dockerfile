FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --production
COPY server ./

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 5002
ENV NODE_ENV=production
CMD ["node", "index.js"]
