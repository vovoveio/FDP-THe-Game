FROM nginx:alpine

# Copia o seu arquivo do jogo (agora na raiz) para a pasta do servidor
COPY index.html /usr/share/nginx/html/index.html

# Expõe a porta padrão do servidor
EXPOSE 80