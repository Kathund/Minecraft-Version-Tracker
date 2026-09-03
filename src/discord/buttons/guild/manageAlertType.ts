import DiscordButton from '../../private/buttons/DiscordButton.js';
import DiscordButtonData from '../../private/buttons/DiscordButtonData.js';
import MinecraftVersionTrackerError from '../../../private/error.js';
import { type ButtonInteractionWithGuild, ButtonResponse, InteractionFlags } from '../../../types/discord.js';
import { ChannelSelectMenuBuilder, ChannelType, LabelBuilder, ModalBuilder, RoleSelectMenuBuilder } from 'discord.js';
import { VersionTypes, isVersionType } from '../../../types/requests.js';
import { titleCase } from '../../../utils/stringUtils.js';

class ManageAlertTypeButtons extends DiscordButton {
  override readonly data = new DiscordButtonData(VersionTypes.map((type) => `manage_${type}`));
  override readonly response = ButtonResponse.None;
  override readonly flags: InteractionFlags[] = [InteractionFlags.GuildButton];

  override async execute(interaction: ButtonInteractionWithGuild) {
    const type = interaction.customId.replaceAll('manage_', '');
    if (!isVersionType(type)) throw new MinecraftVersionTrackerError(`${type} is not a valid version type.`);
    const currentGuildConfig = (await this.discord.application.database.getServer(interaction.guildId)) ?? {
      id: interaction.guild.id,
      release: null,
      snapshot: null,
      old_beta: null,
      old_alpha: null
    };
    const typeData = currentGuildConfig[type];

    await interaction.showModal(
      new ModalBuilder()
        .setCustomId(interaction.customId)
        .setTitle(`Managing Alerts for ${titleCase(type)}`)
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('Channel')
            .setDescription(
              'The channel that you want alerts to be posted in. Leaving this blank will disable this alert type'
            )
            .setChannelSelectMenuComponent(
              new ChannelSelectMenuBuilder()
                .setCustomId('channel')
                .setChannelTypes(
                  ChannelType.GuildText,
                  ChannelType.GuildAnnouncement,
                  ChannelType.PublicThread,
                  ChannelType.PrivateThread,
                  ChannelType.AnnouncementThread
                )
                .setDefaultChannels(typeData ? [typeData.channel] : [])
                .setRequired(false)
                .setMaxValues(1)
            )
        )
        .addLabelComponents(
          new LabelBuilder()
            .setLabel('Role')
            .setDescription('The role you want mentioned on a new version of this type')
            .setRoleSelectMenuComponent(
              new RoleSelectMenuBuilder()
                .setCustomId('role')
                .setDefaultRoles(typeData?.role ? [typeData.role] : [])
                .setRequired(false)
                .setMaxValues(1)
            )
        )
    );
  }
}

export default ManageAlertTypeButtons;
