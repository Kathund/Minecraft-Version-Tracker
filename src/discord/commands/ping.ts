import DiscordCommand from '../private/commands/DiscordCommand.ts';
import DiscordCommandDataBuilder from '../private/commands/DiscordCommandDataBuilder.ts';
import EmbedHelper from '../private/EmbedHelper.ts';
import type { ChatInputCommandInteraction } from 'discord.js';

class PingCommand extends DiscordCommand {
  override readonly data = new DiscordCommandDataBuilder()
    .setName('ping')
    .setDescription('Show the latency of the bot.');

  override async execute(interaction: ChatInputCommandInteraction) {
    const clientLatency = Date.now() - interaction.createdTimestamp;
    const apiLatency = interaction.client.ws.ping;

    await interaction.followUp({
      embeds: [
        new EmbedHelper()
          .setTitle('🏓 Pong!')
          .setDescription(`Client Latency: \`${clientLatency}ms\`\nAPI Latency: \`${apiLatency}ms\``)
      ]
    });
  }
}

export default PingCommand;
