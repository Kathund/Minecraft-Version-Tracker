import DiscordButton from '../private/buttons/DiscordButton.js';
import DiscordButtonData from '../private/buttons/DiscordButtonData.js';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { ButtonResponse } from '../../types/discord.js';
import { InformationComponents } from '../private/ComponentHelper.js';

class ViewInformationButton extends DiscordButton {
  override readonly data = new DiscordButtonData('viewInformation');
  override response: ButtonResponse = ButtonResponse.None;

  override async execute(interaction: ButtonInteraction) {
    const ownerId = this.getOwnerId(interaction);
    if (ownerId === interaction.user.id) {
      await interaction.update({
        components: await InformationComponents(this.discord, ownerId),
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    } else {
      await interaction.reply({
        components: await InformationComponents(this.discord, interaction.user.id),
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] }
      });
    }
  }
}

export default ViewInformationButton;
