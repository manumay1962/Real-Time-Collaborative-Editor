FROM node:20-alpine as frontend-builder

COPY ./Frontend /app

WORKDIR /app

RUN npm install

RUN npm run build

# Build th backend

FROM node:20-alpine

COPY ./backend /app

WORKDIR /app

RUN npm install

COPY --from=frontend-builder /app/dist /app/public

EXPOSE 3000

CMD ["node", "server.js"]
