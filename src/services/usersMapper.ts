import mappingConfig from '../config/mapping';

class UsersMapper {
  private snaxToDiscordMap = new Map();
  private discordToSnaxMap = new Map();
  private snaxToIdMap = new Map();

  constructor(mapping) {
    mapping.forEach(item => {
      this.createSnaxDiscordMapping(item);
    });
  }

  public snaxToDiscord = snaxAccount => {
    if (!this.snaxToDiscordMap.has(snaxAccount)) {
      return null;
    }

    return this.snaxToDiscordMap.get(snaxAccount);
  };

  public snaxToId = snaxAccount => {
    if (!this.snaxToIdMap.has(snaxAccount)) {
      return null;
    }

    return this.snaxToIdMap.get(snaxAccount);
  };

  public discordToSnax = discordAccount => {
    if (!this.discordToSnaxMap.has(discordAccount)) {
      return null;
    }

    return this.discordToSnaxMap.get(discordAccount);
  };

  private createSnaxDiscordMapping = ({ snax, discord, id }) => {
    if (snax && discord) {
      this.snaxToDiscordMap.set(snax, discord);
      this.discordToSnaxMap.set(discord, snax);
      this.snaxToIdMap.set(snax, id);
    }
  };
}

export default new UsersMapper(mappingConfig);
