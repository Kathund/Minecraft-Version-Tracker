import DiscordCommand from '../private/commands/DiscordCommand.js';
import DiscordCommandData from '../private/commands/DiscordCommandData.js';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { InformationComponents } from '../private/ComponentHelper.js';

class InformationCommand extends DiscordCommand {
  override readonly data = new DiscordCommandData()
    .setName('information')
    .setDescription('Shows information about the bot.');

  override async execute(interaction: ChatInputCommandInteraction) {
    await interaction.followUp({
      components: await InformationComponents(this.discord, interaction.user.id),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });
  }
}

export default InformationCommand;
