import DiscordCommand from '../../private/commands/DiscordCommand.ts';
import DiscordCommandDataBuilder from '../../private/commands/DiscordCommandDataBuilder.ts';
import {
  BasicInteractionResponse,
  type ChatInputCommandInteractionWithGuild,
  InteractionFlags
} from '../../../types/discord.ts';
import { ManageAlertsEmbed } from '../../private/EmbedHelper.ts';
import { ManageReleaseTypeButtonRow } from '../../private/ComponentHelper.ts';
import { PermissionFlagsBits } from 'discord.js';

class ManageAlertsCommand extends DiscordCommand {
  override readonly data = new DiscordCommandDataBuilder()
    .setName('manage-alerts')
    .setDescription('Manage new version alerts')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
  override response: BasicInteractionResponse = BasicInteractionResponse.Ephemeral;
  override readonly flags: InteractionFlags[] = [InteractionFlags.GuildCommand];

  override async execute(interaction: ChatInputCommandInteractionWithGuild) {
    const currentGuildConfig = (await this.discord.application.database.getServer(interaction.guildId)) ?? {
      id: interaction.guild.id,
      release: null,
      snapshot: null,
      old_beta: null,
      old_alpha: null
    };
    await interaction.followUp({
      embeds: [new ManageAlertsEmbed(currentGuildConfig)],
      components: [ManageReleaseTypeButtonRow()]
    });
  }
}

export default ManageAlertsCommand;
