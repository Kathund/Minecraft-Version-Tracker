import DiscordCommand from '../private/commands/DiscordCommand.ts';
import DiscordCommandDataBuilder from '../private/commands/DiscordCommandDataBuilder.ts';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { InformationComponents } from '../private/ComponentHelper.ts';

class InformationCommand extends DiscordCommand {
  override readonly data = new DiscordCommandDataBuilder()
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
