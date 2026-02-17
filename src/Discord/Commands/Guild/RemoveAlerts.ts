import Command from '../../Private/Commands/Command.js';
import CommandData from '../../Private/Commands/CommandData.js';
import Embed from '../../Private/Templates/Embed.js';
import MinecraftVersionTrackerError from '../../../Private/Error.js';
import { type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { type VersionType, VersionTypeKeys, VersionTypeLabels } from '../../../Mongo/Version/Schema.js';
import type DiscordManager from '../../DiscordManager.js';
import type { Server } from '../../../Mongo/Server/Schema.js';

class RemoveAlerts extends Command {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new CommandData()
      .setName('remove-alerts')
      .setDescription('Remove alerts')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('Type of notification')
          .setRequired(true)
          .addChoices(...Object.entries(VersionTypeLabels).map(([value, name]) => ({ name, value })))
      );
  }

  override async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.guild === null || interaction.guild === undefined) {
      throw new MinecraftVersionTrackerError('Please run this in a guild');
    }

    const type = (interaction.options.getString('type') ?? 'release') as VersionType;

    const existing = await this.discord.Application.mongo.server.getItem(interaction.guild.id);

    const versionData = {} as Pick<Server, VersionType>;
    for (const key of VersionTypeKeys) {
      versionData[key] = key === type ? undefined : (existing.data?.[key] ?? undefined);
    }

    const save = await this.discord.Application.mongo.server.saveItem({ id: interaction.guild.id, ...versionData });
    if (save.success === false || save.data === null) {
      throw new MinecraftVersionTrackerError('Something went wrong while saving your server data');
    }

    const data = save.data;

    await interaction.followUp({
      embeds: [
        new Embed().setTitle('Alerts Changed').addFields(
          ...VersionTypeKeys.map((key) => ({
            name: VersionTypeLabels[key],
            value: `**Channel:** ${data[key]?.channel ? `<#${data[key].channel}>` : '-'}\n**Role:** ${
              data[key]?.role ? `<@&${data[key].role}>` : '-'
            }`
          }))
        )
      ]
    });
  }
}

export default RemoveAlerts;
