/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */

export default function warning(message) {
  /* eslint-disable no-console */

  // 检测console是否存在
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.

    // 如果console开启了"break on all exceptions"，在warning的地方停下
    throw new Error(message);
  } catch (e) {} // eslint-disable-line no-empty
}
