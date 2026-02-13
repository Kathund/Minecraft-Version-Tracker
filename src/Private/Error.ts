class MinecraftVersionTrackerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Minecraft Version Tracker';
  }

  override toString(): string {
    return this.message;
  }
}

export default MinecraftVersionTrackerError;
