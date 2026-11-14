FROM node:22-bookworm-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/.next ./.next

RUN npm install --omit=dev && npm cache clean --force

USER root
EXPOSE 3000
CMD ["sh", "-c", "chown -R node:node /data/covers && exec su node -s /bin/sh -c 'npm run start'"]
