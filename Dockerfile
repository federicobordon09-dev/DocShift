# Base ligera de Node
FROM node:22-slim

# Instalar LibreOffice y dependencias mínimas
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libreoffice \
      libreoffice-writer \
      fonts-dejavu-core \
      curl \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Directorio de la app
WORKDIR /app

# Copiar y instalar dependencias
COPY package*.json ./
RUN npm install --production

# Copiar todo el código
COPY . .

# Build de Next.js
RUN npm run build

# Puerto que usará Render
EXPOSE 10000

# Comando para iniciar la app
CMD ["npm", "start"]
