import DiscordCommand from '../private/commands/DiscordCommand.js';
import DiscordCommandData from '../private/commands/DiscordCommandData.js';
import EmbedHelper from '../private/EmbedHelper.js';
import type { ChatInputCommandInteraction } from 'discord.js';

class UptimeCommand extends DiscordCommand {
  override readonly data = new DiscordCommandData().setName('uptime').setDescription('Shows the uptime of the bot.');

  override async execute(interaction: ChatInputCommandInteraction) {
    const timestamp = Math.floor((Date.now() - interaction.client.uptime) / 1000);
    await interaction.followUp({
      embeds: [
        new EmbedHelper().setTitle('🕐 Uptime!').setDescription(`Online since <t:${timestamp}:F> (<t:${timestamp}:R>)`)
      ]
    });
  }
}

export default UptimeCommand;
