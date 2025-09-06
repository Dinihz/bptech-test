FROM node:20.19.5 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20.19.5-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD [ "node", "dist/main" ]
