# backend-kost-rumah-ku

cara install:

-- Bun runtime
```bash
bun install
```

To run:

```bash
bun run dev:bun
```

-- NodeJs runtime
```bash
npm install
```

To run:

```bash
npm run dev:node

jangan lupa isi .env

-- jangan dulu pakai docker nya!

Docker Build:

```bash
docker build -t backendKostRumahKu .
```

Docker Running:

```bash
docker run -d -p 3000:3000 --env-file .env --name backend-KostRumahKu-container backendKostRumahKu
```