if (typeof globalThis !== 'undefined' && (!globalThis.localStorage || typeof globalThis.localStorage.getItem !== 'function')) {
  const mockStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  } catch {
    try {
      (globalThis as any).localStorage = mockStorage;
    } catch {
      // Ignore errors if localStorage is completely locked
    }
  }
}
