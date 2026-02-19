# Minecraft Version Tracker

A simple discord bot for tracking when Mojang releases new Minecraft Versions. [`Discord Bot Invite`]

## Requirements

- [`Bun`]: For running code (`1.3.8`)
- [`MongoDB`]: For Persistent data ([`Atlas`])

## Environment Variables

This project uses `.env` to handle environment variables. The following are all the options it looks for

### DISCORD_TOKEN

This is password/key to the discord bot. This can be fetched by creating an application on the [`Discord Developer
Portal`]

### DISCORD_LOGS_CHANNEL

This is a discord channel Id. If something goes wrong and theres an error it gets set there while also showing up in the
console

### MONGO_URL

This is the database for your project. This handles tracking for the versions and all there relevant information

### CHECK_FOR_NEW_VERSIONS_DELAY

This is the delay (in minutes) for how often it should check for a new version. This is **optional** and by default is 3
minutes

## Running

Once you have your repository setup run the following command to install the required packages

```bash
bun install
```

Once the packages are installed you can run the following command to run the project

```bash
bun start
```

Once you have created something you can check and confirm that everything parses the formatting, linting and building
checks with the following command

```bash
bun check
```

## Support

- If you require support or need help with anything please feel free to reach out via the [`Discord Server`]

<!-- LINKS -->

[`discord bot invite`]: https://discord.com/oauth2/authorize?client_id=1471135878616453183
[`bun`]: https://bun.sh
[`mongodb`]: https://www.mongodb.com
[`atlas`]: https://www.mongodb.com/cloud/atlas/register
[`Discord Developer Portal`]: https://discord.com/developers/applications
[`discord server`]: https://discord.gg/UFqpUxFKxt
