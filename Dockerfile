#Build stage
FROM node:22.10.0-alpine3.20 AS build

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

#Production stage
FROM node:22.10.0-alpine3.20 AS production

WORKDIR /app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /app/out ./out

CMD ["node", "out/src/index.js"]