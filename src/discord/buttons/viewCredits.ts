import DiscordButton from '../private/buttons/DiscordButton.js';
import DiscordButtonData from '../private/buttons/DiscordButtonData.js';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { ButtonResponse } from '../../types/discord.js';
import { CreditsComponents } from '../private/ComponentHelper.js';

class ViewCreditsButton extends DiscordButton {
  override readonly data = new DiscordButtonData('viewCredits');
  override response: ButtonResponse = ButtonResponse.None;

  override async execute(interaction: ButtonInteraction) {
    const ownerId = this.getOwnerId(interaction);
    if (ownerId === interaction.user.id) {
      await interaction.update({
        components: CreditsComponents(this.discord, ownerId),
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    } else {
      await interaction.followUp({
        components: CreditsComponents(this.discord, interaction.user.id),
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    }
  }
}

export default ViewCreditsButton;
