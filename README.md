# Minecraft Version Tracker

A simple discord bot for tracking when Mojang releases new Minecraft Versions.
[Discord Bot Invite](https://discord.com/oauth2/authorize?client_id=1471135878616453183)

## Requirements

- [Node.js](https://nodejs.org/en/download) >= v24.19.0
- [pnpm](https://pnpm.io/installation) >= v11.21.0

## Configuration

Please check out the dedicated [Configuration](/docs/Configuration.md) docs page on this

## Running

1. Clone the repository:

```bash
  git clone https://github.com/Kathund/Minecraft-Version-Tracker.git
  cd Minecraft-Version-Tracker
```

2. Install dependencies:

```bash
  pnpm install --frozen-lockfile
```

3. Create your configuration:

- Copy `config.example.json` to `config.json`
- Edit `config.json` with your settings (see [Configuration](/docs/Configuration.md) for help)

4. Start the bot:

```bash
  pnpm start
```

## Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 20
  - Older versions may also work, but have not been tested.

1. Clone the repository:

```bash
  git clone https://github.com/Kathund/Minecraft-Version-Tracker.git
  cd Minecraft-Version-Tracker
```

2. Create your configuration:

- Copy `config.example.json` to `config.json`
- Edit `config.json` with your settings (see [Configuration](/docs/Configuration.md) for help)

3. Run the container:

```bash
docker container run --restart=unless-stopped -itd -v ./config.json:/app/config.json -v ./data/:/app/data/ --name Minecraft-Version-Tracker ghcr.io/kathund/minecraft-version-tracker:latest
```

Note that the path of the configuration source file must either be relative (with the `./`) or absolute.

4. Stop and remove the container when needed:

```bash
  docker stop Minecraft-Version-Tracker
  docker rm Minecraft-Version-Tracker
```

5. Start it again:

```bash
  docker start Minecraft-Version-Tracker
```

## Support

- If you require support or need help with anything please feel free to reach out via the
  [Discord Server](https://discord.gg/UFqpUxFKxt)
