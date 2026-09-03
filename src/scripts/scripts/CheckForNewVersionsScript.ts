import BasicScript from '../BasicScript.js';
import MinecraftVersionTrackerError from '../../private/error.js';
import assert from 'node:assert';
import { MessageFlags } from 'discord.js';
import { MinecraftVersion, NewMinecraftVersion } from '../../discord/private/ComponentHelper.js';
import { MojangPistonVersionResponse, MojangPistonVersionResponseVersion } from '../../types/requests.js';
import { canSendMessages } from '../../utils/discordUtils.js';
import type ScriptManager from '../ScriptManager.js';

class CheckForNewVersions extends BasicScript {
  constructor(scripts: ScriptManager) {
    super(scripts, { id: 'checkForNewVersions', interval: '1m' });
  }

  async loadNewVersion(rawVersion: MojangPistonVersionResponseVersion) {
    const version = await this.scripts.application.parseRawManifestVersion(rawVersion);
    await this.scripts.application.database.insertVersion(version);
    console.scripts(`Loaded ${version.id} into the database`);
    if (!this.scripts.application.discord.isClientOnline()) return;
    const servers = await this.scripts.application.database.getServersWithType(version.type);
    for (const server of servers) {
      const serverData = server[version.type];
      assert(serverData);
      const guild = await this.scripts.application.discord.client.guilds.fetch(server.id);
      const channel = await guild.channels.fetch(serverData.channel);
      if (!channel?.isSendable()) return;
      const hasPermission = await canSendMessages(channel);
      if (!hasPermission) return;

      const articleData = await this.scripts.application.getMinecraftArticleData(version);
      const role = server[version.type]?.role ? `- <@&${server[version.type]?.role}>` : '';

      await channel.send({
        components: [NewMinecraftVersion(version, role), ...MinecraftVersion(version, articleData)],
        flags: MessageFlags.IsComponentsV2
      });
    }
  }

  override async execute() {
    const databaseVersions = this.scripts.application.database.getVersionIds();
    const versions = await this.scripts.application.request<MojangPistonVersionResponse>(
      'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json',
      MojangPistonVersionResponse
    );
    if (!versions) throw new MinecraftVersionTrackerError('Could not fetch the full version list');

    for (const version of versions.versions) {
      if (databaseVersions.includes(version.id)) continue;
      await this.loadNewVersion(version);
    }
  }
}

export default CheckForNewVersions;
