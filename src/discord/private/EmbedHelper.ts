import config from '../../../config.json' with { type: 'json' };
import { type APIEmbed, type APIEmbedField, type ColorResolvable, EmbedBuilder, type EmbedData } from 'discord.js';
import { CommonDevs, EmbedStyles } from '../../private/constants.js';
import { ConfigDiscordEmbedsColors } from '../../types/config.js';
import { type DevData, type DevName } from '../../types/application.js';
import { VersionTypes } from '../../types/requests.js';
import { titleCase } from '../../utils/stringUtils.js';
import type { EmbedHelperField, EmbedStyleData, EmbedStyleName } from '../../types/discord.js';
import type { ServerEntry } from '../../types/database.js';

export default class EmbedHelper extends EmbedBuilder {
  constructor(data?: EmbedData | APIEmbed) {
    super(data);
    if (data) return;
    this.setTimestamp();
    this.setStyle('Generic');
  }

  override setColor(color: ConfigDiscordEmbedsColors | ColorResolvable | null): this {
    if (ConfigDiscordEmbedsColors.safeParse(color).success) {
      return super.setColor(config.discord.embeds.colors[color as ConfigDiscordEmbedsColors] as ColorResolvable);
    }

    return super.setColor(color as ColorResolvable);
  }

  setDevFooter(data: DevName | DevData | null, message: string = 'Consider checking out /information'): this {
    if (data === null) return this.setFooter(null);
    const { username, iconURL } = typeof data === 'string' ? CommonDevs[data] : data;
    return this.setFooter({
      text: config.discord.embeds.showDevFooters ? `by @${username} | ${message}` : message,
      iconURL: config.discord.embeds.showDevFooters ? iconURL : undefined
    });
  }

  setStyle(data: EmbedStyleName | EmbedStyleData): this {
    const { title, author, description, color, footer } = typeof data === 'string' ? EmbedStyles[data] : data;
    this.setTitle(title ?? null);
    this.setAuthor(author ?? null);
    this.setDescription(description ?? null);
    this.setColor(color ?? null);
    this.setDevFooter(footer ?? null);
    return this;
  }

  override setFields(...fields: EmbedHelperField[]): this {
    return super.setFields(fields.map((field) => this.formatField(field)));
  }

  override addFields(...fields: EmbedHelperField[]): this {
    return super.addFields(fields.map((field) => this.formatField(field)));
  }

  private formatField(data: EmbedHelperField): APIEmbedField {
    return { name: data.name, value: this.formatFieldValue(data), inline: data.inline };
  }

  private formatFieldValue({ value, smallBlockValue, blockValue, formatTimestamp }: EmbedHelperField): string {
    if (smallBlockValue) return `\`${value}\``;
    if (blockValue) return `\`\`\`${value}\`\`\``;
    if (formatTimestamp) return `<t:${value}:F> (<t:${value}:R>)`;
    return value;
  }
}

export class WarningEmbed extends EmbedHelper {
  constructor() {
    super();
    this.setStyle('Warning');
  }
}

export class ErrorEmbed extends EmbedHelper {
  constructor() {
    super();
    this.setStyle('Error');
  }
}

export class SuccessEmbed extends EmbedHelper {
  constructor() {
    super();
    this.setStyle('Success');
  }
}

export class ManageAlertsEmbed extends EmbedHelper {
  constructor(data: ServerEntry) {
    super();
    this.setTitle('Managing Alerts');
    this.setFields(
      ...VersionTypes.map((type) => {
        const typeData = data[type];
        return {
          name: titleCase(type),
          value:
            typeData === null
              ? 'Disabled'
              : `**Channel:** <#${typeData.channel}>\n**Role:** ${typeData.role ? `<@&${typeData.role}>` : 'None'}`
        };
      })
    );
  }
}
