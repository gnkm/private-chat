# Private Chat — 本番用イメージ（podman compose up --build -d）

FROM node:22-alpine AS builder

ENV CI=true

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/server apps/server
COPY apps/web apps/web

RUN pnpm build
RUN pnpm --filter @private-chat/server deploy --prod /out/server

FROM node:22-alpine AS runner

RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder --chown=app:app /out/server/dist /app/apps/server/dist
COPY --from=builder --chown=app:app /out/server/package.json /app/apps/server/package.json
COPY --from=builder --chown=app:app /out/server/node_modules /app/apps/server/node_modules
COPY --from=builder --chown=app:app /app/apps/web/dist /app/apps/web/dist

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/server/dist/start.js"]
