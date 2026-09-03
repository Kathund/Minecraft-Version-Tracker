import ButtonHandler from './handlers/ButtonHandler.js';
import CommandHandler from './handlers/CommandHandler.js';
import InteractionHandler from './handlers/InteractionHandler.js';
import MinecraftVersionTrackerError from '../private/error.js';
import ModalHandler from './handlers/ModalHandler.js';
import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  ModalSubmitInteraction
} from 'discord.js';
import { ErrorEmbed } from './private/EmbedHelper.js';
import { getErrorEmbed, toError } from '../utils/miscUtils.js';
import { parseInteractionType } from '../utils/discordUtils.js';
import type Application from '../Application.js';
import type { DiscordManagerWithClient, EmbedHelperField } from '../types/discord.js';
import type { ValidErrors } from '../types/application.js';

class DiscordManager {
  readonly buttonHandler: ButtonHandler;
  readonly commandHandler: CommandHandler;
  readonly interactionHandler: InteractionHandler;
  readonly modalHandler: ModalHandler;
  client?: Client;
  constructor(readonly application: Application) {
    this.buttonHandler = new ButtonHandler(this);
    this.commandHandler = new CommandHandler(this);
    this.interactionHandler = new InteractionHandler(this);
    this.modalHandler = new ModalHandler(this);
  }

  async connect() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    await this.commandHandler.deployCommands();
    await this.buttonHandler.loadButtons();
    await this.modalHandler.loadModals();
    this.client.on(Events.ClientReady, (client) => this.onReady(client));
    this.client.on(Events.InteractionCreate, (interaction) => this.interactionHandler.onInteraction(interaction));
    this.client.login(this.application.config.discord.token).catch((e) => this.handleError(toError(e)));
  }

  isClientOnline(): this is DiscordManagerWithClient {
    return this.client?.isReady() !== undefined;
  }

  private onReady(client: Client<true>) {
    console.discord(`Logged in as ${client.user.username} (${client.user.id})!`);
  }

  async handleError(
    error: ValidErrors,
    interaction:
      ChatInputCommandInteraction | ButtonInteraction | AutocompleteInteraction | ModalSubmitInteraction | null = null,
    extraErrorData: EmbedHelperField[] = []
  ) {
    if (interaction) {
      extraErrorData.push({ name: 'Source', value: 'Discord Interaction' });
      extraErrorData.push({
        name: 'User',
        value: `\`@${interaction.user.username}\` (\`${interaction.user.id}\`) <@${interaction.user.id}>`
      });
      extraErrorData.push({ name: 'Interaction Type', value: parseInteractionType(interaction.type) });
      if (interaction.isCommand()) {
        extraErrorData.push({ name: 'Command', value: interaction.commandName, smallBlockValue: true });
      }
      if (interaction.isButton()) {
        extraErrorData.push({ name: 'Button', value: interaction.customId, smallBlockValue: true });
      }
    }
    await this.application.logError(error, extraErrorData);
    if (!interaction || interaction.isAutocomplete()) return;

    const embed = new ErrorEmbed();
    if (error instanceof MinecraftVersionTrackerError) embed.setDescription(`\`\`\`${error.message}\`\`\``);
    else embed.setDescription('This error has been reported to the owner. Please try again later.');

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
      if (!(error instanceof MinecraftVersionTrackerError)) {
        await interaction.followUp({ embeds: [getErrorEmbed(error)], flags: MessageFlags.Ephemeral });
      }
    } catch (e: unknown) {
      this.application.logError(toError(e));
    }
  }
}

export default DiscordManager;
