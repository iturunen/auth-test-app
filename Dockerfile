FROM node:17.9.1

WORKDIR /app
COPY ./ ./
RUN npm ci
ENV HTTP_PORT 3000
EXPOSE 3000

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/app.ts"]