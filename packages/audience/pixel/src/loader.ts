export type Command = [string, ...unknown[]];

export interface ImtblGlobal {
  push: (...commands: Command[]) => void;
  _loaded: boolean;
}

type CommandHandler = (command: Command) => void;

export function createLoader(handler: CommandHandler): ImtblGlobal {
  const win = typeof window !== 'undefined' ? window : undefined;
  const existing = win ? (win as unknown as Record<string, unknown>).__imtbl : undefined;

  // Replay any commands that were queued before the script loaded
  const queued: Command[] = Array.isArray(existing) ? (existing as Command[]) : [];

  const loader: ImtblGlobal = {
    push: (...commands: Command[]) => {
      for (const cmd of commands) {
        handler(cmd);
      }
    },
    _loaded: true,
  };

  // Install on window
  if (win) {
    (win as unknown as Record<string, unknown>).__imtbl = loader;
  }

  // Replay queued commands in order
  for (const cmd of queued) {
    handler(cmd);
  }

  return loader;
}
