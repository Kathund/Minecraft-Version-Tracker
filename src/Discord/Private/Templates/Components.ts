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
import type { VersionWithDownload } from '../../../Mongo/Version/Schema.js';

// eslint-disable-next-line import/prefer-default-export
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
        .setButtonAccessory(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel('Article')
            .setURL(articleData.data?.article ?? 'https://kathund.dev')
            .setDisabled(articleData.data?.article === null || articleData.data?.article === undefined)
        )
    )
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('## Downloads'))
    .addSectionComponents(
      new SectionBuilder()
        .setButtonAccessory(
          new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Download').setURL(version.client.url)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('### Client'),
          new TextDisplayBuilder().setContent(`**Size:** ${FormatSize(version.client.size)} (${version.client.size})`),
          new TextDisplayBuilder().setContent(`**SHA1:** \`${version.client.sha1}\``)
        )
    );

  if (version.server) {
    container.addSectionComponents(
      new SectionBuilder()
        .setButtonAccessory(
          new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Download').setURL(version.server.url)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('### Server'),
          new TextDisplayBuilder().setContent(`**Size:** ${FormatSize(version.server.size)} (${version.server.size})`),
          new TextDisplayBuilder().setContent(`**SHA1:** \`${version.server.sha1}\``)
        )
    );
  }

  return [
    ...(articleData.generated
      ? [
          new TextDisplayBuilder().setContent(
            "⚠️ **Warning!** The **Article**, **Source** and **Wiki** URLs have been generated as they aren't confirmed yet. Please report any mistakes"
          )
        ]
      : []),
    container,
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Source')
        .setURL(`https://mcsrc.dev/1/${version.id.replaceAll(' ', '_')}/net/minecraft/client/main/Main`)
        .setDisabled(releaseTime <= 1765888949),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Wiki')
        .setURL(articleData.data?.wiki ?? 'https://kathund.dev')
        .setDisabled(articleData.data === null)
    )
  ];
}
