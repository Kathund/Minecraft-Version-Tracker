import Button from '../../Private/Buttons/Button.js';
import ButtonData from '../../Private/Buttons/ButtonData.js';
import type DiscordManager from '../../DiscordManager.js';
import type { ButtonInteraction } from 'discord.js';

class Guild extends Button {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new ButtonData('guild');
  }

  override async execute(interaction: ButtonInteraction): Promise<void> {
    await interaction.followUp({
      content: 'This button can only be clicked inside ran inside a guild or it will not get to this execute'
    });
  }
}

export default Guild;
