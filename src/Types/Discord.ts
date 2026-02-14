import { Collection } from 'discord.js';
import type Button from '../Discord/Private/Buttons/Button.js';
import type Command from '../Discord/Private/Commands/Command.js';

declare module 'discord.js' {
  export interface Client {
    commands: Collection<string, Command>;
    buttons: Collection<string, Button>;
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

export enum ButtonResponse {
  Public,
  Ephemeral,
  Update
}

export interface AutoComplateOption {
  name: string;
  value?: string;
}
