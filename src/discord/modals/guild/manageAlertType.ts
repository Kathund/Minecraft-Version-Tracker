import DiscordModal from '../../private/modals/DiscordModal.js';
import DiscordModalData from '../../private/modals/DiscordModalData.js';
import MinecraftVersionTrackerError from '../../../private/error.js';
import {
  BasicInteractionResponse,
  InteractionFlags,
  type ModalMessageModalSubmitInteractionWithGuild
} from '../../../types/discord.js';
import { ChannelType } from 'discord.js';
import { ManageAlertsEmbed } from '../../private/EmbedHelper.js';
import { ManageReleaseTypeButtonRow } from '../../private/ComponentHelper.js';
import { VersionTypes, isVersionType } from '../../../types/requests.js';

class ManageAlertTypeModals extends DiscordModal {
  override readonly data = new DiscordModalData(VersionTypes.map((type) => `manage_${type}`));
  override readonly response = BasicInteractionResponse.None;
  override readonly flags: InteractionFlags[] = [InteractionFlags.GuildModal];

  override async execute(interaction: ModalMessageModalSubmitInteractionWithGuild) {
    const type = interaction.customId.replaceAll('manage_', '');
    if (!isVersionType(type)) throw new MinecraftVersionTrackerError(`${type} is not a valid version type.`);
    const currentGuildConfig = (await this.discord.application.database.getServer(interaction.guildId)) ?? {
      id: interaction.guild.id,
      release: null,
      snapshot: null,
      old_beta: null,
      old_alpha: null
    };

    const channel = interaction.fields.getSelectedChannels('channel', false, [
      ChannelType.GuildText,
      ChannelType.GuildAnnouncement,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.AnnouncementThread
    ]);
    const firstChannel = channel?.first() ?? undefined;
    if (firstChannel) {
      const role = interaction.fields.getSelectedRoles('role', false);
      const firstRole = role?.first() ?? undefined;
      currentGuildConfig[type] = { channel: firstChannel.id, role: firstRole?.id };
    } else {
      currentGuildConfig[type] = null;
    }

    await this.discord.application.database.updateServer(currentGuildConfig);
    await interaction.update({
      embeds: [new ManageAlertsEmbed(currentGuildConfig)],
      components: [ManageReleaseTypeButtonRow()]
    });
  }
}

export default ManageAlertTypeModals;
