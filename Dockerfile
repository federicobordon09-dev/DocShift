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

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar TODAS las dependencias (dev + prod) necesarias para build
RUN npm install

# Copiar todo el código
COPY . .

# Build de Next.js
RUN npm run build

# (Opcional) eliminar devDependencies para producción
# RUN npm prune --production

# Exponer el puerto que usará Render
EXPOSE 10000

# Comando para iniciar la app
CMD ["npm", "start"]
