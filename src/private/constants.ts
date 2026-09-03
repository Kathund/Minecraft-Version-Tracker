import type { CreditData, DevData, DevName } from '../types/application.js';
import type { EmbedStyleData, EmbedStyleName } from '../types/discord.js';

export const EmbedStyles: Record<EmbedStyleName, EmbedStyleData> = {
  Generic: { color: 'Pink', footer: 'Kathund' },
  Warning: { author: { name: 'An Warning has occurred' }, color: 'Yellow', footer: 'Kathund' },
  Error: { author: { name: 'An Error has occurred' }, color: 'Red', footer: 'Kathund' },
  Success: { author: { name: 'Success' }, color: 'Green', footer: 'Kathund' }
};

export const CommonDevs: Record<DevName, DevData> = {
  Kathund: {
    username: '.kathund',
    github: 'kathund',
    id: '1276524855445164098',
    iconURL: 'https://i.imgur.com/uUuZx2E.png',
    type: 'Maintainer'
  }
};

export const MiscCredits: CreditData[] = [
  {
    name: 'Minecraft Wiki',
    description: 'Documenting how Minecraft version manifest works and providing sources',
    link: 'minecraft.wiki'
  },
  { name: 'discord.js', description: 'Handles the discord part of this project', link: 'discord.js.org' }
];

export function parseMiscCredit({ name, description, link }: CreditData): string {
  return `- **[${name}](<https://${link}>):** ${description}`;
}

export function parseMiscCredits(credits: CreditData[]): string[] {
  return credits.map((line) => parseMiscCredit(line));
}

export function getParsedMiscCredits(): string[] {
  return parseMiscCredits(MiscCredits);
}
