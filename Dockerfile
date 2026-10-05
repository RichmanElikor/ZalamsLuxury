# First Stage 
FROM node:20-alpine AS build 
WORKDIR /app 
COPY package*.json ./
RUN npm install --registry https://registry.npmmirror.com
COPY . .

# Second Stage 
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=build /app/src ./src
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
EXPOSE 3000
CMD ["src/server.js"]

