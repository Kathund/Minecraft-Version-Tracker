import Command from '../../Private/Commands/Command.js';
import CommandData from '../../Private/Commands/CommandData.js';
import type DiscordManager from '../../DiscordManager.js';
import type { ChatInputCommandInteraction } from 'discord.js';

class General extends Command {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new CommandData().setName('general').setDescription('general');
  }

  override async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.followUp({
      content: 'This command can be run any where with any install method. There is no permission checks on it'
    });
  }
}

export default General;
