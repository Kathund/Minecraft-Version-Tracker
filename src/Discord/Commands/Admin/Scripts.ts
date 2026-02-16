import Command from '../../Private/Commands/Command.js';
import CommandData from '../../Private/Commands/CommandData.js';
import Embed, { Colors } from '../../Private/Templates/Embed.js';
import MinecraftVersionTrackerError from '../../../Private/Error.js';
import ms from 'ms';
import { type AutocompleteInteraction, type ChatInputCommandInteraction } from 'discord.js';
import { TitleCase } from '../../../Utils/StringUtils.js';
import type DiscordManager from '../../DiscordManager.js';
import type { AutoComplateOption } from '../../../Types/Discord.js';

class Scripts extends Command {
  constructor(discord: DiscordManager) {
    super(discord);
    this.data = new CommandData()
      .setName('scripts')
      .setDescription('scripts')
      .addStringOption((option) =>
        option.setName('script').setDescription('the script name').setRequired(true).setAutocomplete(true)
      );
  }

  static convertScriptName(key: string): string {
    return TitleCase(key.replace(/([a-z0-9])([A-Z])/g, '$1 $2'));
  }

  override async autocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);
    let choices: AutoComplateOption[];
    switch (focusedOption.name) {
      case 'script': {
        choices = Object.keys(this.discord.Application.scriptManager)
          .filter((key) => key !== 'Application')
          .map((key) => ({ name: Scripts.convertScriptName(key), value: key }));
        break;
      }
      default: {
        choices = [{ name: 'Something went wrong' }];
        break;
      }
    }

    await interaction.respond(this.discord.utils.parseAutoComplete(interaction, choices));
  }

  override async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const script = interaction.options.getString('script');
    if (!script) throw new MinecraftVersionTrackerError('You are missing a script?');
    if (!(script in this.discord.Application.scriptManager) || script === 'Application') {
      throw new MinecraftVersionTrackerError('Invalid script');
    }
    const name = script as Exclude<keyof typeof this.discord.Application.scriptManager, 'Application'>;
    await interaction.followUp({
      embeds: [
        new Embed().setTitle(Scripts.convertScriptName(name)).setColor(Colors.Yellow).addFields(
          {
            name: 'Status',
            value: 'Running',
            inline: true
          },
          {
            name: 'Duration',
            value: 'Script is currently running',
            inline: true
          }
        )
      ]
    });

    const start = performance.now();
    await this.discord.Application.scriptManager[name].execute();
    const executeTime = performance.now() - start;

    await interaction.editReply({
      embeds: [
        new Embed()
          .setTitle(Scripts.convertScriptName(name))
          .setColor(Colors.Green)
          .addFields(
            {
              name: 'Status',
              value: 'Finished',
              inline: true
            },
            {
              name: 'Duration',
              value: `${ms(executeTime)} (${executeTime.toFixed(2)}ms)`,
              inline: true
            }
          )
      ]
    });
  }
}

export default Scripts;
