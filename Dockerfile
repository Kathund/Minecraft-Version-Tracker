FROM node:24.19.0
ENV RUNNING_IN_DOCKER=true

WORKDIR /app

RUN npm install -g pnpm@11
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENTRYPOINT ["pnpm", "start"]
