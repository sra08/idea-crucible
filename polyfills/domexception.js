/**
 * DOMException polyfill - must run before React Native initialises.
 * RN 0.81 references global.DOMException during environment setup.
 */
if (typeof globalThis.DOMException === 'undefined') {
  class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name != null ? String(name) : 'Error';
      this.code = 0;
    }
  }
  globalThis.DOMException = DOMException;
  // eslint-disable-next-line no-undef
  if (typeof global !== 'undefined') {
    global.DOMException = DOMException;
  }
}
