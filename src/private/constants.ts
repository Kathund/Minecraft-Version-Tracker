import type { CreditData, DevData } from '../types/application.ts';
import type { EmbedStyleData } from '../types/discord.ts';

export const EmbedStyles = {
  Generic: { color: 'Blue', footer: 'Amber' },
  Warning: { author: { name: 'An Warning has occurred' }, color: 'Yellow', footer: 'Amber' },
  Error: { author: { name: 'An Error has occurred' }, color: 'Red', footer: 'Amber' },
  Success: { author: { name: 'Success' }, color: 'Green', footer: 'Amber' }
} satisfies Record<string, EmbedStyleData>;

export const CommonDevs = {
  Amber: {
    displayName: 'Amber',
    githubUsername: 'kathund',
    type: 'Maintainer',
    avatarURL: 'https://kathund.dev/kathund.png',
    discord: { username: 'amber.rip', id: '1276524855445164098' },
    note: ':purple_heart:'
  }
} satisfies Record<string, DevData>;

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
