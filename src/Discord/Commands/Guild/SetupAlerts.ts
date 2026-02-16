import Command from '../../Private/Commands/Command.js';
import CommandData from '../../Private/Commands/CommandData.js';
import Embed from '../../Private/Templates/Embed.js';
import MinecraftVersionTrackerError from '../../../Private/Error.js';
import { ChannelType, type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { type VersionType, VersionTypeKeys, VersionTypeLabels } from '../../../Mongo/Version/Schema.js';
import type DiscordManager from '../../DiscordManager.js';
import type { Server } from '../../../Mongo/Server/Schema.js';

class SetupAlerts extends Command {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new CommandData()
      .setName('setup-alerts')
      .setDescription('Setup alerts')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
      .addStringOption((option) =>
        option
          .setName('type')
          .setDescription('Type of notification')
          .setRequired(true)
          .addChoices(...Object.entries(VersionTypeLabels).map(([value, name]) => ({ name, value })))
      )
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('the channel to post in (default current)')
          .addChannelTypes(
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
            ChannelType.PublicThread,
            ChannelType.PrivateThread
          )
      )
      .addRoleOption((option) => option.setName('role').setDescription('A role to be mentioned on a new alert'));
  }

  override async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.guild === null || interaction.guild === undefined) {
      throw new MinecraftVersionTrackerError('Please run this in a guild');
    }
    if (interaction.channel === null || interaction.channel === undefined) {
      throw new MinecraftVersionTrackerError('Please run this in a channel');
    }

    const type = (interaction.options.getString('type') ?? 'release') as VersionType;
    const channel = interaction.options.getChannel('channel') ?? interaction.channel;
    const channelData = await interaction.guild.channels.fetch(channel.id);
    if (channelData === null || !channelData.isSendable()) {
      throw new MinecraftVersionTrackerError(`<#${channel.id}> is not sendable or doesn't exist`);
    }
    const msgPermission = await this.discord.utils.checkMessagePermissionsInChannel(channelData);
    if (!msgPermission) {
      throw new MinecraftVersionTrackerError(
        'I cannot send messages in that channel. Please select a different channel'
      );
    }

    const role = interaction.options.getRole('role');
    const existing = await this.discord.Application.mongo.server.getItem(interaction.guild.id);

    const versionData = {} as Pick<Server, VersionType>;
    for (const key of VersionTypeKeys) {
      versionData[key] =
        key === type ? { channel: channel.id, role: role?.id ?? null } : (existing.data?.[key] ?? undefined);
    }

    const save = await this.discord.Application.mongo.server.saveItem({
      id: interaction.guild.id,
      ...versionData
    });
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

export default SetupAlerts;
