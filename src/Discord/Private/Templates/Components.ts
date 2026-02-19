import {
  ActionRowBuilder,
  type BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  type MessageActionRowComponentBuilder,
  SectionBuilder,
  TextDisplayBuilder
} from 'discord.js';
import { FormatSize } from '../../../Utils/MathUtils.js';
import type { MinecraftArticleDataResponse } from '../../../Types/Minecraft.js';
import type { Version, VersionDownload, VersionWithDownload } from '../../../Mongo/Version/Schema.js';

export function NewMinecraftVersion(version: Version, role: string): TextDisplayBuilder {
  return new TextDisplayBuilder().setContent(`New **${version.type}!** ${role}`.trim());
}

export function MinecraftVersionMissingArticleData(): TextDisplayBuilder {
  return new TextDisplayBuilder().setContent(
    "⚠️ **Warning!** The **Article**, **Source** and **Wiki** URLs have been generated as they aren't confirmed yet. Please report any mistakes"
  );
}

export function MinecraftVersionArticleButton(articleData: MinecraftArticleDataResponse): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel('Article')
    .setURL(articleData.data?.article ?? 'https://kathund.dev')
    .setDisabled(articleData.data?.article === null || articleData.data?.article === undefined);
}

export function MinecraftVersionDownload(type: string, download: VersionDownload): SectionBuilder {
  return new SectionBuilder()
    .setButtonAccessory(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Download').setURL(download.url))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ${type}`),
      new TextDisplayBuilder().setContent(`**Size:** ${FormatSize(download.size)} (${download.size})`),
      new TextDisplayBuilder().setContent(`**SHA1:** \`${download.sha1}\``)
    );
}

export function MinecraftVersionSourceButton(articleData: MinecraftArticleDataResponse): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel('Source')
    .setURL(articleData.data?.source ?? 'https://kathund.dev')
    .setDisabled(articleData.data?.article === null || articleData.data?.article === undefined);
}

export function MinecraftVersionWikiButton(articleData: MinecraftArticleDataResponse): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel('Wiki')
    .setURL(articleData.data?.wiki ?? 'https://kathund.dev')
    .setDisabled(articleData.data === null);
}

export function MinecraftVersion(
  version: VersionWithDownload,
  articleData: MinecraftArticleDataResponse
): NonNullable<BaseMessageOptions['components']> {
  const releaseTime = Math.floor(new Date(version.releaseTime).getTime() / 1000);

  const container = new ContainerBuilder()
    .setAccentColor(16711680)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`# ${version.id}`),
          new TextDisplayBuilder().setContent(`**Release Time:** <t:${releaseTime}> (<t:${releaseTime}:R>)`)
        )
        .setButtonAccessory(MinecraftVersionArticleButton(articleData))
    )
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Downloads'))
    .addSectionComponents(MinecraftVersionDownload('Client', version.client));

  if (version.server) {
    container.addSectionComponents(MinecraftVersionDownload('Server', version.server));
  }

  return [
    ...(articleData.generated ? [MinecraftVersionMissingArticleData()] : []),
    container,
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      MinecraftVersionSourceButton(articleData),
      MinecraftVersionWikiButton(articleData)
    )
  ];
}
