import Command from '../../Private/Commands/Command.js';
import CommandData from '../../Private/Commands/CommandData.js';
import { CommandResponse } from '../../../Types/Discord.js';
import type DiscordManager from '../../DiscordManager.js';
import type { ChatInputCommandInteraction } from 'discord.js';

class Admin extends Command {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new CommandData().setName('admin').setDescription('admin');
    this.response = CommandResponse.Ephemeral;
  }

  override async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.followUp({
      content:
        // eslint-disable-next-line @stylistic/max-len
        'This command can be run any where with only user install. It also requires you to be the owner or in the team with the bot'
    });
  }
}

export default Admin;
