export interface Logger {
  info: (message: string) => void;
  error: (message: any) => void;
}
