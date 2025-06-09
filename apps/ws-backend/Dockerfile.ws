FROM node:20-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install

WORKDIR /app/apps/ws-backend

EXPOSE 4000

CMD ["pnpm", "start"]
