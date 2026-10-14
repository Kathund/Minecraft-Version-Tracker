import DiscordCommand from '../private/commands/DiscordCommand.ts';
import DiscordCommandDataBuilder from '../private/commands/DiscordCommandDataBuilder.ts';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { CreditsComponents } from '../private/ComponentHelper.ts';

class CreditsCommand extends DiscordCommand {
  override readonly data = new DiscordCommandDataBuilder()
    .setName('credits')
    .setDescription('Shows the credits of the people who make this possible');

  override async execute(interaction: ChatInputCommandInteraction) {
    await interaction.followUp({
      components: CreditsComponents(this.discord, interaction.user.id),
      flags: MessageFlags.IsComponentsV2,
      allowedMentions: { parse: [] }
    });
  }
}

export default CreditsCommand;
