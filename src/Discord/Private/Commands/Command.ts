import {
  ApplicationIntegrationType,
  type AutocompleteInteraction,
  type ChatInputCommandInteraction,
  InteractionContextType
} from 'discord.js';
import { CommandResponse, CommandType } from '../../../Types/Discord.js';
import type CommandData from './CommandData.js';
import type DiscordManager from '../../DiscordManager.js';

class Command {
  protected readonly discord: DiscordManager;
  data!: CommandData;
  type: CommandType;
  response: CommandResponse;
  constructor(discord: DiscordManager) {
    this.discord = discord;
    this.type = CommandType.General;
    this.response = CommandResponse.Public;
  }

  setType(type: CommandType): this {
    if (type === CommandType.General) {
      this.data.setContexts(
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
      );
      this.data.setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall);
    } else if (type === CommandType.Guild) {
      this.data.setContexts(InteractionContextType.Guild);
      this.data.setIntegrationTypes(ApplicationIntegrationType.GuildInstall);
    } else if (type === CommandType.Admin) {
      this.data.setContexts(
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel
      );
      this.data.setIntegrationTypes(ApplicationIntegrationType.UserInstall);
    }
    this.type = type;
    return this;
  }

  execute(interaction: ChatInputCommandInteraction): Promise<void> | void {
    throw new Error('Execute Method not implemented!');
  }

  autocomplete(interaction: AutocompleteInteraction): Promise<void> | void {
    throw new Error('Execute Method not implemented!');
  }
}

export default Command;
