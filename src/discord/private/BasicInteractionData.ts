import { CommandPermission, type DiscordManagerWithClient, InteractionFlags } from '../../types/discord.js';
import type DiscordManager from '../DiscordManager.js';

abstract class BasicInteractionData<Manager extends DiscordManager = DiscordManagerWithClient> {
  readonly permission: CommandPermission = CommandPermission.Anyone;
  readonly flags: readonly InteractionFlags[] = [];
  constructor(protected readonly discord: Manager) {}
}

export default BasicInteractionData;
