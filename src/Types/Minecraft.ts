export interface MinecraftArticleData {
  article: string | null;
  wiki: string;
  source: string | null;
}

export interface MinecraftArticleDataResponse {
  data: MinecraftArticleData | null;
  generated: boolean;
}
