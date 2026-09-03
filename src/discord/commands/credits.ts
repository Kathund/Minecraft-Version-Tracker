import DiscordCommand from '../private/commands/DiscordCommand.js';
import DiscordCommandData from '../private/commands/DiscordCommandData.js';
import { type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { CreditsComponents } from '../private/ComponentHelper.js';

class CreditsCommand extends DiscordCommand {
  override readonly data = new DiscordCommandData()
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
