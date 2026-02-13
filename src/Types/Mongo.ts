export interface MongoReturnData<T> {
  success: boolean;
  info: string;
  data: T;
}
