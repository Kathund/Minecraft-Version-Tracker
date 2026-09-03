# Minecraft Version Tracker

A simple discord bot for tracking when Mojang releases new Minecraft Versions.
[Discord Bot Invite](https://discord.com/oauth2/authorize?client_id=1471135878616453183)

## Requirements

- [Node.js](https://nodejs.org/en/download) >= v24.19.0
- [pnpm](https://pnpm.io/installation) >= v11.21.0

## Configuration

Please check out the dedicated [Configuration](/docs/Configuration.md) docs page on this

## Running

Once you have your repository setup run the following command to install the required packages

```bash
pnpm install --frozen-lockfile
```

While the packages are installing please setup a configuration

- Copy `config.example.json` to `config.json`
- Edit `config.json` with your settings (see [Configuration](/docs/Configuration.md) for help)

Once the packages are installed you can run the following command to run the project

```bash
pnpm start
```

Once you have created something you can check and confirm that everything parses the formatting, linting and building
checks with the following command

```bash
pnpm check
```

## Support

- If you require support or need help with anything please feel free to reach out via the
  [Discord Server](https://discord.gg/UFqpUxFKxt)
