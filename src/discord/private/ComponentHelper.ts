import config from '../../../config.json' with { type: 'json' };
import {
  ActionRowBuilder,
  type BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  type HexColorString,
  type MessageActionRowComponentBuilder,
  type RGBTuple,
  SectionBuilder,
  TextDisplayBuilder
} from 'discord.js';
import { CommonDevs, getParsedMiscCredits } from '../../private/constants.ts';
import { ConfigDiscordEmbedsColors } from '../../types/config.ts';
import { DevTypes, type MaintainerDevData } from '../../types/application.ts';
import { type MojangPistonArtifact, type VersionType, VersionTypes } from '../../types/requests.ts';
import { convertDevDataToName, hexToRgb } from '../../utils/miscUtils.ts';
import { formatInformation } from '../../utils/discordUtils.ts';
import { formatSize, titleCase } from '../../utils/stringUtils.ts';
import type { DiscordManagerWithClient } from '../../types/discord.ts';
import type { MinecraftArticleDataResponse } from '../../types/misc.ts';
import type { VersionsEntry } from '../../types/database.ts';

export class PatchedContainerBuilder extends ContainerBuilder {
  constructor() {
    super();
    this.setAccentColor('Pink');
  }

  override setAccentColor(color?: ConfigDiscordEmbedsColors | HexColorString | RGBTuple | number): this {
    if (ConfigDiscordEmbedsColors.safeParse(color).success) {
      return super.setAccentColor(
        hexToRgb(config.discord.embeds.colors[color as ConfigDiscordEmbedsColors] as HexColorString)
      );
    }
    if (typeof color === 'string') {
      return super.setAccentColor(hexToRgb(color as HexColorString));
    }
    return super.setAccentColor(color);
  }
}

export function NewMinecraftVersion(version: VersionsEntry, role: string): TextDisplayBuilder {
  return new TextDisplayBuilder().setContent(`New **${version.type}!** ${role}`.trim());
}

export function MinecraftVersionMissingArticleData(): TextDisplayBuilder {
  return new TextDisplayBuilder().setContent(
    "-# ⚠️ **Warning!** The **Article**, **Source** and **Wiki** URLs have been generated as they aren't confirmed yet. Please report any mistakes"
  );
}

export function MinecraftVersionArticleButton(articleData: MinecraftArticleDataResponse): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel('Article')
    .setURL(articleData.data?.article ?? 'https://kathund.dev')
    .setDisabled(articleData.data?.article === null || articleData.data?.article === undefined);
}

export function MinecraftVersionDownload(type: string, download: MojangPistonArtifact): SectionBuilder {
  return new SectionBuilder()
    .setButtonAccessory(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Download').setURL(download.url))
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`### ${type}`),
      new TextDisplayBuilder().setContent(`**Size:** ${formatSize(download.size)} (${download.size})`),
      new TextDisplayBuilder().setContent(`**SHA1:** \`${download.sha1}\``)
    );
}

export function MinecraftVersionSourceButton(articleData: MinecraftArticleDataResponse): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel('Source')
    .setURL(articleData.data?.source ?? 'https://kathund.dev')
    .setDisabled(articleData.data?.source === null || articleData.data?.source === undefined);
}

export function MinecraftVersionWikiButton(articleData: MinecraftArticleDataResponse): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel('Wiki')
    .setURL(articleData.data?.wiki ?? 'https://kathund.dev')
    .setDisabled(articleData.data === null);
}

export function MinecraftVersion(
  version: VersionsEntry,
  articleData: MinecraftArticleDataResponse
): NonNullable<BaseMessageOptions['components']> {
  const releaseTime = Math.floor(new Date(version.releaseTime).getTime() / 1000);

  const container = new PatchedContainerBuilder()
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

export function ManageReleaseTypeButton(type: VersionType) {
  return new ButtonBuilder()
    .setLabel(`Manage ${titleCase(type)} Alerts`)
    .setCustomId(`manage_${type}`)
    .setStyle(ButtonStyle.Secondary);
}

export function ManageReleaseTypeButtons() {
  return VersionTypes.map((type) => ManageReleaseTypeButton(type));
}

export function ManageReleaseTypeButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(ManageReleaseTypeButtons());
}

export function ViewInformationButton(ownerId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setLabel('View Information')
    .setCustomId(`viewInformation:${ownerId}`);
}

export function ViewCreditsButton(ownerId: string): ButtonBuilder {
  return new ButtonBuilder()
    .setStyle(ButtonStyle.Secondary)
    .setLabel('View Credits')
    .setCustomId(`viewCredits:${ownerId}`);
}

export async function InformationComponents(
  discord: DiscordManagerWithClient,
  ownerId: string
): Promise<NonNullable<BaseMessageOptions['components']>> {
  const app = await discord.client.application.fetch();
  const versions = discord.application.database.getVersionIds();
  const { commit, dirty, docker } = discord.application.getRuntimeInformation();
  const timestamp = Math.floor((Date.now() - discord.client.uptime) / 1000);
  return [
    new PatchedContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `# ${titleCase(discord.application.package.name.replaceAll('-', '_'))}`
            ),
            new TextDisplayBuilder().setContent(discord.application.package.description)
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel('Bot Invite')
              .setURL(`https://discord.com/oauth2/authorize?client_id=${discord.client.user.id}`)
          )
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            '## Stats',
            ...[
              { name: 'Known Versions', value: versions.length },
              { name: 'Servers', value: app.approximateGuildCount || 0 },
              { name: 'User Installs', value: app.approximateUserInstallCount || 0 }
            ].map((line) => formatInformation(line))
          ].join('\n')
        ),
        new TextDisplayBuilder().setContent(
          [
            '## Runtime Info',
            ...[
              { name: 'Version', value: discord.application.package.version },
              { name: 'Online since', value: `<t:${timestamp}:F> (<t:${timestamp}:R>)`, format: false },
              {
                name: 'Is Inside of Docker Container',
                value: docker ? ':white_check_mark: Yes' : ':x: No',
                format: false
              },
              { name: 'Git Hash', value: commit ?? 'UNKNOWN' },
              {
                name: 'Is Git Dirty',
                value: dirty !== null ? (dirty ? ':white_check_mark: Yes' : ':x: No') : 'UNKNOWN',
                format: false
              }
            ].map((line) => formatInformation(line))
          ].join('\n')
        )
      ),
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      ViewCreditsButton(ownerId),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('View Source Code')
        .setURL('https://github.com/Kathund/Minecraft-Version-Tracker/')
    )
  ];
}

export function CreditsComponents(
  discord: DiscordManagerWithClient,
  ownerId: string
): NonNullable<BaseMessageOptions['components']> {
  return [
    new PatchedContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent('# Credits'))
          .setButtonAccessory(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel('Bot Invite')
              .setURL(`https://discord.com/oauth2/authorize?client_id=${discord.client.user.id}`)
          )
      )
      .addTextDisplayComponents(
        ...DevTypes.filter((type) => Object.values(CommonDevs).filter((data) => data.type === type).length > 0).map(
          (type) =>
            new TextDisplayBuilder().setContent(
              [
                `## ${type}`,
                ...Object.values(CommonDevs)
                  .filter((data) => data.type === type)
                  .sort((a, b) => a.displayName.localeCompare(b.displayName))
                  .map(
                    (dev) => `${convertDevDataToName(dev, true)} - [Github](<https://github.com/${dev.githubUsername}>)`
                  )
              ].join('\n')
            )
        )
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            '## Misc',
            'Below are some tools/projects that this bot utilizes to stay a float',
            ...getParsedMiscCredits()
          ].join('\n')
        ),
        new TextDisplayBuilder().setContent(
          [
            '## Support',
            `If you need any support please reach out to the maintainers: ${Object.values(CommonDevs)
              .filter((dev): dev is MaintainerDevData => dev.type === 'Maintainer')
              .map(({ discord: { username } }) => `@${username}`)
              .join(', ')}`
          ].join('\n')
        )
      ),

    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      ViewInformationButton(ownerId),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('View Source Code')
        .setURL('https://github.com/Kathund/Minecraft-Version-Tracker/')
    )
  ];
}
