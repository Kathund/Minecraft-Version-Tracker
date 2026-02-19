import Script from '../Private/Script.js';
import { MessageFlags } from 'discord.js';
import { MinecraftVersion, NewMinecraftVersion } from '../../Discord/Private/Templates/Components.js';
import {
  type Version,
  type VersionType,
  VersionTypeKeys,
  type VersionWithDownload
} from '../../Mongo/Version/Schema.js';
import type { Server } from '../../Mongo/Server/Schema.js';

class CheckForNewVersions extends Script {
  private async handleServer(server: Server, version: VersionWithDownload): Promise<void> {
    try {
      if (!this.scriptManager.Application.discord.client) return;
      const guild = await this.scriptManager.Application.discord.client.guilds.fetch(server.id);

      const channelId = server[version.type]?.channel;
      if (!channelId) return;
      const channel = await guild.channels.fetch(channelId);
      if (!channel?.isSendable()) return;
      const hasPermission =
        await this.scriptManager.Application.discord.utils.checkMessagePermissionsInChannel(channel);
      if (!hasPermission) return;

      const articleData = await this.scriptManager.Application.minecraftUtils.getMinecraftArticleData(version);
      const role = server[version.type]?.role ? `- <@&${server[version.type]?.role}>` : '';

      await channel.send({
        components: [NewMinecraftVersion(version, role), ...MinecraftVersion(version, articleData)],
        flags: MessageFlags.IsComponentsV2
      });
    } catch (error) {
      console.error(`Failed notifying server ${server.id}`);
      console.error(error);
    }
  }

  private getServersByType(servers: Server[]): Record<VersionType, Server[]> {
    const serversByType = VersionTypeKeys.reduce(
      (acc, key) => {
        acc[key] = [];
        return acc;
      },
      {} as Record<VersionType, Server[]>
    );

    for (const server of servers) {
      for (const type of VersionTypeKeys) {
        if (server[type]?.channel) {
          serversByType[type].push(server);
        }
      }
    }

    return serversByType;
  }

  override async execute(): Promise<void> {
    console.other('Checking for new versions');
    const serversDB = await this.scriptManager.Application.mongo.server.getItems();
    if (!serversDB.success || !serversDB.data?.length) return;
    const res = await this.scriptManager.Application.requestHandler.request(
      'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json',
      { noCache: true }
    );
    const versions: Version[] = res.data.versions;

    const versionsDB = await this.scriptManager.Application.mongo.version.getItems();
    const knownIds = new Set(versionsDB.data?.map((v) => v.id));
    const serversByType = this.getServersByType(serversDB.data);

    for (const version of versions) {
      if (knownIds.has(version.id)) continue;
      const alertServers = serversByType[version.type];
      if (!alertServers.length) continue;
      const fullVersion = await this.scriptManager.Application.minecraftUtils.convertVersion(version);
      await Promise.all(alertServers.map((server) => this.handleServer(server, fullVersion)));
      await this.scriptManager.Application.mongo.version.saveItem(fullVersion);
      console.other(`Loaded ${version.id} into the database`);
    }
  }
}

export default CheckForNewVersions;
