FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_MODE=real
ARG NEXT_PUBLIC_API_URL=http://localhost:5064/api
ENV NEXT_PUBLIC_API_MODE=${NEXT_PUBLIC_API_MODE}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
