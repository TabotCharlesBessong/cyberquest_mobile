export const DEBUG = __DEV__;

export function trace(...args: unknown[]) {
  if (DEBUG) {
    console.log('[UnlockTrace]', ...args);
  }
}
