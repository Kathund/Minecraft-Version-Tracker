import BasicInteractionData from '../BasicInteractionData.js';
import {
  type AutocompleteOption,
  BasicInteractionResponse,
  type DiscordManagerWithClient
} from '../../../types/discord.js';
import type DiscordCommandData from './DiscordCommandData.js';
import type DiscordManager from '../../DiscordManager.js';
import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';

abstract class DiscordCommand<
  Manager extends DiscordManager = DiscordManagerWithClient
> extends BasicInteractionData<Manager> {
  abstract readonly data: DiscordCommandData;
  readonly response: BasicInteractionResponse = BasicInteractionResponse.Public;

  // eslint-disable-next-line require-await
  async autocomplete(interaction: AutocompleteInteraction): Promise<AutocompleteOption[]> {
    return [];
  }

  abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export default DiscordCommand;
