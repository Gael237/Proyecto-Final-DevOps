#!/bin/bash

# Actualizar e instalar Node.js y git
sudo yum update -y
sudo yum install -y git

# Instalar Node.js (versión LTS usando nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install --lts

# Clonar tu repo de backend
cd /home/ec2-user
git clone https://github.com/Gael237/Pagina-web-.git
cd tu-repo-backend

# Instalar dependencias
npm install

# Exportar la variable de conexión (puedes remplazarla por la real o inyectarla en .env)
export MONGO_URI="mongodb+srv://Gael:Ju18VBlmBKqfW9An@clases.gpowic1.mongodb.net/hypekicks?retryWrites=true&w=majority"

# Ejecutar el servidor en background
nohup node index.js > server.log 2>&1 &