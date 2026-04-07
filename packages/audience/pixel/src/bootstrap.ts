/**
 * Self-executing bootstrap that wires the command-queue loader to the Pixel.
 *
 * When the IIFE bundle loads, this module:
 *  1. Creates a Pixel singleton
 *  2. Maps command names to Pixel methods
 *  3. Installs the loader on window.__imtbl (replacing the stub array)
 *  4. Replays any commands the snippet queued before the script loaded
 */
import { Pixel } from './pixel';
import { createLoader } from './loader';
import type { Command } from './loader';

const pixel = new Pixel();

function handleCommand(command: Command): void {
  const [name, ...args] = command;

  switch (name) {
    case 'init':
      pixel.init(args[0] as Parameters<Pixel['init']>[0]);
      break;
    case 'page':
      pixel.page(args[0] as Parameters<Pixel['page']>[0]);
      break;
    case 'identify':
      pixel.identify(
        args[0] as string,
        args[1] as Parameters<Pixel['identify']>[1],
      );
      break;
    case 'consent':
      pixel.setConsent(args[0] as Parameters<Pixel['setConsent']>[0]);
      break;
    default:
      // Unknown command — ignore silently
      break;
  }
}

createLoader(handleCommand);
