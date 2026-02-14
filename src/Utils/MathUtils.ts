// eslint-disable-next-line import/prefer-default-export
export function FormatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let index = 0;

  while (bytes >= 1024 && index < units.length - 1) {
    bytes /= 1024;
    index++;
  }

  return `${bytes.toFixed(2)} ${units[index]}`;
}
