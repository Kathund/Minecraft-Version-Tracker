# Kathund Project Template

**For other templates, do check out the
[other branches of this repository](https://github.com/Kathund/Project-Template/branches/all)**

<!-- prettier-ignore -->
> [!WARNING]
> I do not recommend people to use this as it's setup in the ways I like to create stuff. Things may or may
> not work and there is nothing to "run" here

## Usage

To get started, [Use this template](https://github.com/new?template_name=Project-Template&template_owner=Kathund).

This project uses [Bun](https://bun.sh) as it's run time. If you would prefer to use [node.js](https://nodejs.org) with
[pnpm](https://pnpm.io/) consider checking out the other branches of this repository.

### Running

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

## Discord.js

This branch provides an template for discord bot's built using discord.js

### Commands and Button Groups

Commands and buttons are grouped into three types

#### General

These commands/buttons can be run by anyone and don't require any permission checks. If it's a command it will be loaded

#### Guild

These commands/buttons can be run inside a guiild. If it's not inside a guild it will throw and error and not reach the
execute stage

There are no permission checks on it so anyone can execute these

The commands require the application to be installed to the guild for them to load

#### Admin

These commands/buttons can be ran anywhere but require the application to be installed to the user and not the guild

When running these commands/buttons it checks that the user either owns the application or that the user is in the Team
that owns the application

### Commands and Buttons Responses

When running a command there can be two types of responses. When clicking a button theres also a third response type

#### Public

This is your standed response. Everyone can see it and interact with it

#### Ephemeral

This is your hidden response. Only the person who interacted with it can view the response

#### Update

<!-- prettier-ignore -->
> [!WARNING]
> This is button only and will not work for commands

This is used to update the original reponse instead of replying to the interaction
