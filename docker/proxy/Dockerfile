FROM node:20

EXPOSE 8000

WORKDIR /var/proxy

COPY build/package.json ./package.json
COPY build/package-lock.json ./package-lock.json
COPY build/dist ./dist
COPY build/.env ./.env

RUN npm ci --omit=dev

CMD ["node", "dist/src/main.js"]