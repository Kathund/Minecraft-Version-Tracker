import MinecraftVersionTrackerError from '../../Private/Error.js';
import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
  type SendableChannels,
  Team
} from 'discord.js';
import { ErrorEmbed } from './Embed.js';
import type DiscordManager from '../DiscordManager.js';

class DiscordUtils {
  private discord: DiscordManager;
  constructor(discord: DiscordManager) {
    this.discord = discord;
  }

  async getOwners(): Promise<string[]> {
    if (!this.discord.client?.application) return [];
    const app = await this.discord.client.application.fetch();
    if (app.owner instanceof Team) return app.owner.members.map((member) => member.id);
    return app.owner?.id ? [app.owner.id] : [];
  }

  async checkMessagePermissionsInChannel(channel: SendableChannels): Promise<boolean> {
    try {
      await channel.sendTyping();
      return true;
    } catch (error: any) {
      if (error?.code === 50001) return false;
      throw error;
    }
  }

  private getErrorEmbed(error: Error | MinecraftVersionTrackerError): ErrorEmbed {
    const errorStack = error instanceof Error ? (error.stack ?? error.message) : String(error ?? 'Unknown');
    return new ErrorEmbed().setDescription(`\`\`\`${errorStack}\`\`\``);
  }

  private async logError(error: Error | MinecraftVersionTrackerError): Promise<void> {
    if (error instanceof MinecraftVersionTrackerError) return;
    if (!this.discord.client?.application) return;

    try {
      const channel = await this.discord.client.channels.fetch(process.env.DISCORD_LOGS_CHANNEL);
      if (!channel || !channel.isSendable()) return;

      const hasPermission = await this.checkMessagePermissionsInChannel(channel);
      if (!hasPermission) return;

      const owners = await this.getOwners();
      await channel.send({ content: owners.map((id) => `<@${id}>`).join(' '), embeds: [this.getErrorEmbed(error)] });
    } catch (e) {
      console.error(e);
    }
  }

  async handleError(
    error: Error | MinecraftVersionTrackerError,
    interaction: ChatInputCommandInteraction | ButtonInteraction | AutocompleteInteraction | null = null
  ): Promise<void> {
    console.error(error);
    await this.logError(error);

    if (!interaction || interaction.isAutocomplete()) return;

    const embed = new ErrorEmbed();
    if (error instanceof MinecraftVersionTrackerError) {
      embed.setDescription(`\`\`\`${error.message}\`\`\``);
    } else {
      embed.setDescription('This error has been reported to the owner. Please try again later.');
    }

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }

      if (!(error instanceof MinecraftVersionTrackerError)) {
        await interaction.followUp({ embeds: [this.getErrorEmbed(error)], flags: MessageFlags.Ephemeral });
      }
    } catch (e) {
      console.error(e);
    }
  }
}

export default DiscordUtils;
