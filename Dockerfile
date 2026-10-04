FROM oven/bun:alpine
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --development
COPY . .
EXPOSE 3000
CMD ["bun", "run", "start"]