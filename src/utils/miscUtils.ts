import MinecraftVersionTrackerError from '../private/error.js';
import chalk from 'chalk';
import { DiscordjsError, type HexColorString, type RGBTuple } from 'discord.js';
import { ErrorEmbed } from '../discord/private/EmbedHelper.js';
import { execSync } from 'node:child_process';
import type { EmbedHelperField } from '../types/discord.js';
import type { ValidErrors } from '../types/application.js';

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getNestedValue(obj: unknown, path: string): unknown {
  let current = obj;
  for (const key of path.split('.')) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) return undefined;
    current = Reflect.get(current, key);
  }
  return current;
}

export function displayBigMessage(message: string) {
  const columns = process.stdout.columns;
  const warning = 'IMPORTANT!';
  const padding = ' '.repeat(Math.floor((columns - warning.length + 1) / 2));
  const padding2 = ' '.repeat(Math.floor((columns - message.length + 1) / 2));

  console.log(chalk.bgRed.black(' '.repeat(columns).repeat(3)));
  console.log(chalk.bgRed.black(padding + warning + padding));
  console.log(chalk.bgRed.black(padding2 + message + padding2));
  console.log(chalk.bgRed.black(' '.repeat(columns).repeat(3)));
}

export function getErrorString(error: Error): string {
  const message = error.toString();
  const stack = error.stack
    ?.replaceAll(message, '')
    .replaceAll('MinecraftVersionTrackerError:', '\nMinecraftVersionTrackerError:');
  return [message, stack, error.cause ? `Cause: ${String(error.cause)}` : undefined].filter(Boolean).join('');
}

export function getErrorTypeName(error: ValidErrors): string {
  if (error instanceof MinecraftVersionTrackerError) return 'MinecraftVersionTrackerError';
  else if (error instanceof DiscordjsError) return 'DiscordJsError';
  return 'Generic Error';
}

export function getErrorEmbed(error: ValidErrors, extraData: EmbedHelperField[] = []): ErrorEmbed {
  const errorStack = error instanceof Error ? (error.stack ?? error.message) : String(error ?? 'Unknown');
  return new ErrorEmbed()
    .setDescription(`\`\`\`${errorStack}\`\`\``)
    .setFields(...[{ name: 'Error Type', value: getErrorTypeName(error) }, ...extraData]);
}

export function toError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === 'string' ? error : JSON.stringify(error));
}

export function hexToRgb(hex: HexColorString): RGBTuple {
  const value = hex.replace(/^#/, '');
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

export function getGitInfo(): { commit: string | null; dirty: boolean | null } {
  try {
    const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const dirty = execSync('git status --porcelain', { encoding: 'utf8' }).trim().length > 0;
    return { commit, dirty };
  } catch {
    return { commit: null, dirty: null };
  }
}
