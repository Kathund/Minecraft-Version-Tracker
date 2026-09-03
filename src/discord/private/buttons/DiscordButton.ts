import BasicInteractionData from '../BasicInteractionData.js';
import { ButtonResponse, type DiscordManagerWithClient } from '../../../types/discord.js';
import type DiscordButtonData from './DiscordButtonData.js';
import type DiscordManager from '../../DiscordManager.js';
import type { ButtonInteraction } from 'discord.js';

abstract class DiscordButton<
  Manager extends DiscordManager = DiscordManagerWithClient
> extends BasicInteractionData<Manager> {
  abstract readonly data: DiscordButtonData;
  readonly response: ButtonResponse = ButtonResponse.Ephemeral;

  protected getOwnerId(interaction: ButtonInteraction): string | undefined {
    const [id, userId] = interaction.customId.split(':');
    if (!id) return undefined;
    if (!this.data.ids.includes(id)) return undefined;
    return userId;
  }

  abstract execute(interaction: ButtonInteraction): Promise<void>;
}

export default DiscordButton;
