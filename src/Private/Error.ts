class TemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Template';
  }

  override toString(): string {
    return this.message;
  }
}
export default TemplateError;
