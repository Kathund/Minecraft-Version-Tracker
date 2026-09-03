import type { ChalkInstance } from 'chalk';
import type { ConfirmedVersion } from './requests.js';

declare global {
  export interface Console {
    discord: (message: string) => void;
    scripts: (message: string) => void;
    other: (message: string) => void;
  }
}

export interface LogData {
  level: string;
  background: ChalkInstance;
  color: ChalkInstance;
}

export interface MinecraftArticleDataResponse {
  data: ConfirmedVersion | null;
  generated: boolean;
}
