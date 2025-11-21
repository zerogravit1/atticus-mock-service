/* eslint-disable no-console */
export const logger = {
  info: (...msg: unknown[]) => console.log('🟦 [Atticus]', ...msg),
  warn: (...msg: unknown[]) => console.warn('🟨 [Atticus]', ...msg),
  error: (...msg: unknown[]) => console.error('🟥 [Atticus]', ...msg),
  success: (...msg: unknown[]) => console.log('🟩 [Atticus]', ...msg)
};
