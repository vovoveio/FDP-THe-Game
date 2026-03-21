FROM nginx:alpine

# Copia o seu arquivo do jogo (agora na raiz) para a pasta do servidor
COPY index.html /usr/share/nginx/html/index.html
COPY script.js /usr/share/nginx/html/script.js
COPY style.css /usr/share/nginx/html/style.css

# Expõe a porta padrão do servidor
EXPOSE 80