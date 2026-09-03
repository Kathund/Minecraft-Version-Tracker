class MinecraftVersionTrackerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MinecraftVersionTrackerError';
  }

  override toString() {
    return this.message;
  }
}

export default MinecraftVersionTrackerError;
