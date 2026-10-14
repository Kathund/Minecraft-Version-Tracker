FROM node:24.19.0

ENV NODE_ENV=production
ENV RUNNING_IN_DOCKER=true

ARG GIT_COMMIT=unknown
ENV GIT_COMMIT=$GIT_COMMIT
ENV GIT_DIRTY=false

WORKDIR /app

RUN npm install -g pnpm@11
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENTRYPOINT ["pnpm", "start"]
