import DiscordCommand from '../private/commands/DiscordCommand.js';
import DiscordCommandData from '../private/commands/DiscordCommandData.js';
import MinecraftVersionTrackerError from '../../private/error.js';
import { type AutocompleteInteraction, type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { MinecraftVersion } from '../private/ComponentHelper.js';
import { titleCase } from '../../utils/stringUtils.js';
import type { AutocompleteOption } from '../../types/discord.js';
import type { VersionType } from '../../types/requests.js';
import type { VersionsEntry } from '../../types/database.js';

class VersionCommand extends DiscordCommand {
  override readonly data = new DiscordCommandData()
    .setName('version')
    .setDescription('Look up a version and find info on it')
    .addStringOption((option) =>
      option.setName('version').setDescription('The version Id').setRequired(true).setAutocomplete(true)
    );

  override async autocomplete(interaction: AutocompleteInteraction): Promise<AutocompleteOption[]> {
    const latestVersions: Record<VersionType, VersionsEntry['id'] | undefined> = {
      release: await this.discord.application.database.getLatestVersionIdByType('release'),
      snapshot: await this.discord.application.database.getLatestVersionIdByType('snapshot'),
      old_beta: await this.discord.application.database.getLatestVersionIdByType('old_beta'),
      old_alpha: await this.discord.application.database.getLatestVersionIdByType('old_alpha')
    };
    const focusedOption = interaction.options.getFocused(true);
    const versions = this.discord.application.database.getVersions(focusedOption.value.toLowerCase(), 25);
    return versions.map((version) => {
      const name =
        latestVersions[version.type] === version.id ? `${version.id} (Latest ${titleCase(version.type)})` : version.id;
      return { name, value: version.id };
    }) satisfies AutocompleteOption[];
  }

  override async execute(interaction: ChatInputCommandInteraction) {
    const versionId = interaction.options.getString('version', true);
    const version = await this.discord.application.database.getVersion(versionId);
    if (!version) {
      throw new MinecraftVersionTrackerError(
        `Could not find version "${versionId}" and it's data. Does this version exist?`
      );
    }

    const articleData = await this.discord.application.getMinecraftArticleData(version);
    await interaction.followUp({
      components: MinecraftVersion(version, articleData),
      flags: MessageFlags.IsComponentsV2
    });
  }
}

export default VersionCommand;
