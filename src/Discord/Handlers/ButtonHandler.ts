import TemplateError from '../../Private/Error.js';
import { type ButtonInteraction, Collection, MessageFlags } from 'discord.js';
import { ButtonResponse, CommandType } from '../../Types/Discord.js';
import { readdirSync } from 'node:fs';
import type Button from '../Private/Buttons/Button.js';
import type DiscordManager from '../DiscordManager.js';

class ButtonHandler {
  private readonly discord: DiscordManager;
  constructor(discord: DiscordManager) {
    this.discord = discord;
  }

  async onButton(interaction: ButtonInteraction): Promise<void> {
    const button = interaction.client.buttons.get(interaction.customId);
    if (!button) return;
    try {
      if (button.response === ButtonResponse.Update) {
        await interaction.deferUpdate();
      } else {
        await interaction.deferReply({
          flags: button.response === ButtonResponse.Ephemeral ? MessageFlags.Ephemeral : undefined
        });
      }

      console.discord(
        `Button Clicked ${interaction.user.username} (${interaction.user.id}) button ${interaction.customId}`
      );

      const owners = await this.discord.utils.getOwners();
      if (button.type === CommandType.Guild && interaction.guild === null) {
        throw new TemplateError('Please run this button in a server');
      } else if (button.type === CommandType.Admin && !owners.includes(interaction.user.id)) {
        throw new TemplateError('This is an admin command. Please either own the bot or be apart of the team');
      }

      await button.execute(interaction);
    } catch (error) {
      if (error instanceof Error || error instanceof TemplateError) {
        this.discord.utils.handleError(error, interaction);
      }
    }
  }

  async loadButtons(): Promise<void> {
    if (!this.discord.client) return;

    this.discord.client.buttons = new Collection<string, Button>();
    const buttonFiles = readdirSync('./src/Discord/Buttons/', {
      recursive: true,
      encoding: 'utf-8'
    }).filter((file) => file.endsWith('.ts'));

    for (const file of buttonFiles) {
      const button: Button = new (await import(`../Buttons/${file}`)).default(this.discord);
      button.setType(CommandType[file.split('/')[0] as keyof typeof CommandType] ?? CommandType.General);
      this.discord.client.buttons.set(button.data.id, button);
    }

    console.discord(`Successfully loaded ${this.discord.client.buttons.size} button(s).`);
  }
}

export default ButtonHandler;
