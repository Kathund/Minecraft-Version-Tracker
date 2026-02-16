import { EmbedBuilder } from 'discord.js';

// eslint-disable-next-line import/exports-last
export const Colors = { Blue: 0x17bebb, Green: 0x00ff3c, Yellow: 0xffbc1f, Red: 0xed474a, Pink: 0xff70a2 };

class Embed extends EmbedBuilder {
  constructor() {
    super();
    this.setColor(Colors.Pink);
    this.setTimestamp();
    this.setFooter({ text: 'Minecraft Version Tracker by @.kathund', iconURL: 'https://i.imgur.com/uUuZx2E.png' });
  }
}

export class ErrorEmbed extends Embed {
  constructor() {
    super();
    this.setColor(Colors.Red);
    this.setAuthor({ name: 'Something went wrong' });
  }
}

export default Embed;
