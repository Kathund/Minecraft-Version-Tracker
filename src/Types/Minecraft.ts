export interface MinecraftArticleData {
  article: string | null;
  wiki: string;
}

export interface MinecraftArticleDataResponse {
  data: MinecraftArticleData | null;
  generated: boolean;
}
