# backend-kost-rumah-ku

cara install:

```bash
bun install
```

To run:

```bash
bun run dev
```

jangan lupa isi .env

-- ini minimalis readme untuk sementara

Docker Build:

```bash
docker build -t backendKostRumahKu .
```

Docker Running:

```bash
docker run -d -p 3000:3000 --env-file .env --name backend-KostRumahKu-container backendKostRumahKu
```