# Usamos Node 22 slim como base
FROM node:22-slim

# Instalamos dependencias del sistema y LibreOffice
RUN apt-get update && apt-get install -y \
    libreoffice \
    libreoffice-writer \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Creamos el directorio de la app
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias de Node
RUN npm install

# Copiamos todo el código de la app
COPY . .

# Ejecutamos build si lo necesitas (por ejemplo Next.js)
RUN npm run build

# Exponemos el puerto que usará Render
EXPOSE 10000

# Comando para iniciar tu app
CMD ["npm", "start"]
