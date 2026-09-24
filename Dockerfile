# Gestor de Ausencias — imagen multi-etapa. La primera instala dependencias y compila
# la interfaz, la segunda se queda solo con lo que hace falta para servir la aplicación.

FROM node:24-slim AS base
WORKDIR /app

FROM base AS dependencias
COPY package.json package-lock.json* ./
COPY server/package.json ./server/package.json
COPY web/package.json ./web/package.json
RUN npm install

FROM dependencias AS build
COPY . .
RUN npm run build

FROM base AS produccion
ENV NODE_ENV=production
COPY --from=dependencias /app/node_modules ./node_modules
COPY --from=dependencias /app/package.json ./package.json
COPY server/package.json ./server/package.json
COPY server/src ./server/src
COPY server/tsconfig.json ./server/tsconfig.json
COPY --from=build /app/web/dist ./web/dist

EXPOSE 8002
CMD ["npm", "run", "start"]
