import { Collection } from 'discord.js';
import type Command from '../Discord/Private/Commands/Command.js';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
  }
}

export enum CommandType {
  General,
  Guild,
  Admin
}

export enum CommandResponse {
  Public,
  Ephemeral
}

export interface AutoComplateOption {
  name: string;
  value?: string;
}
