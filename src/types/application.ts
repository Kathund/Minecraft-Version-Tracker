import type MinecraftVersionTrackerError from '../private/error.js';
import type { DiscordjsError } from 'discord.js';

export const DevNames = ['Kathund'] as const;
export type DevName = (typeof DevNames)[number];
export const DevTypes = ['Maintainer', 'Contributor'] as const;
export type DevType = (typeof DevTypes)[number];
export interface DevData {
  username: string;
  github?: string;
  id: string;
  iconURL: string;
  type: DevType;
}

export interface CreditData {
  name: string;
  description: string;
  link: string;
}

export type ValidErrors = Error | DiscordjsError | MinecraftVersionTrackerError;
