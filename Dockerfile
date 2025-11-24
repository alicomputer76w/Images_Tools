FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY web/package.json web/
COPY server/package.json server/
RUN npm i --omit=dev --workspaces=false 

FROM node:20-alpine AS server
WORKDIR /app
COPY . .
RUN npm i --workspaces=false && npm run build -w server
EXPOSE 3001
CMD ["npm","run","start","-w","server"]