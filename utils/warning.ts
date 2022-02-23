/**
 * Prints a warning in the console if it exists.
 *
 * @param message The warning message.
 */
export default function warning(message: string): void {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    // 这个错误是为了方便而抛出的，所以如果你在你的控制台中启用了"break on all exceptions"，
    // 它会在这一行暂停执行。
    throw new Error(message);
  } catch (e) {} // eslint-disable-line no-empty
}
