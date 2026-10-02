#!/bin/bash
# INI KHSUSUS YANG PAKAI LINUX / MACOS, JIKA PAKAI WINDOWS BISA LANGSUNG PAKAI DOCKER COMPOSE
set -e

IMAGE_NAME="backendKostRumahKu"
CONTAINER_NAME="backend-KostRumahKu-container"
PORT="3000"

echo "==> Building Docker image: $IMAGE_NAME..."
docker build -t $IMAGE_NAME .

if [ "$(docker ps -a -q -f name=$CONTAINER_NAME)" ]; then
    docker rm -f $CONTAINER_NAME
fi

docker run -d \
  -p $PORT:$PORT \
  --env-file .env \
  --name $CONTAINER_NAME \
  $IMAGE_NAME

echo "==> Backend Berhasil dijalankan! Container berjalan di port $PORT."