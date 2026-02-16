import Command from '../../Private/Commands/Command.js';
import CommandData from '../../Private/Commands/CommandData.js';
import MinecraftVersionTrackerError from '../../../Private/Error.js';
import { type AutocompleteInteraction, type ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { MinecraftVersion } from '../../Private/Templates/Components.js';
import { TitleCase } from '../../../Utils/StringUtils.js';
import type DiscordManager from '../../DiscordManager.js';
import type { AutoComplateOption } from '../../../Types/Discord.js';
import type { VersionType, VersionWithDownload } from '../../../Mongo/Version/Schema.js';

class Version extends Command {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new CommandData()
      .setName('version')
      .setDescription('Look up a version and find info on it')
      .addStringOption((option) =>
        option.setName('version').setDescription('The version Id').setRequired(true).setAutocomplete(true)
      );
  }

  override async autocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices: AutoComplateOption[];
    switch (focusedOption.name) {
      case 'version': {
        const versions = await this.discord.Application.mongo.version.getItems();
        if (versions.success && versions.data !== undefined && versions.data.length > 0) {
          const seenTypes: Set<VersionType> = new Set();
          choices = versions.data.reverse().map((version: VersionWithDownload) => {
            const name = seenTypes.has(version.type) ? version.id : `${version.id} (Latest ${TitleCase(version.type)})`;
            seenTypes.add(version.type);
            return { name, value: version.id };
          });
        } else {
          choices = [{ name: 'No versions found' }];
        }
        break;
      }
      default: {
        choices = [{ name: 'Something went wrong' }];
        break;
      }
    }

    await interaction.respond(this.discord.utils.parseAutoComplete(interaction, choices));
  }

  override async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const versionId = interaction.options.getString('version');
    if (versionId === null) throw new MinecraftVersionTrackerError('Missing version id field');
    const versionData = await this.discord.Application.mongo.version.getItem(versionId);
    if (!versionData.success || versionData.data === null) throw new MinecraftVersionTrackerError('Unknown version');
    const articleData = await this.discord.Application.minecraftUtils.getMinecraftArticleData(versionData.data);
    await interaction.followUp({
      components: MinecraftVersion(versionData.data, articleData),
      flags: MessageFlags.IsComponentsV2
    });
  }
}

export default Version;
