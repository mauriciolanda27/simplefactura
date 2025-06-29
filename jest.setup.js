require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return require('react').createElement('img', props)
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
} 

// --- GLOBAL TEARDOWN TO PREVENT LEAKS ---
beforeEach(() => {
  // Clear all timers and mocks before each test
  jest.clearAllTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clear all timers and mocks after each test
  jest.clearAllTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  
  // Wait for any pending promises to resolve
  await new Promise(resolve => setTimeout(resolve, 0));
});

afterAll(async () => {
  // Final cleanup after all tests
  jest.clearAllTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  
  // Clean up global instances from errorHandling
  try {
    const { cleanupGlobalInstances } = require('./src/utils/errorHandling');
    if (typeof cleanupGlobalInstances === 'function') {
      cleanupGlobalInstances();
    }
  } catch (error) {
    // Ignore if module not found
  }
  
  // Attempt to disconnect Prisma if present
  if (global.prisma && typeof global.prisma.$disconnect === 'function') {
    await global.prisma.$disconnect();
  }
  
  // Clear any global instances that might hold references
  if (global.AdminAlertSystem && global.AdminAlertSystem.instance) {
    global.AdminAlertSystem.instance = null;
  }
  
  // Clear any remaining timers
  const activeHandles = process._getActiveHandles();
  activeHandles.forEach(handle => {
    if (handle && typeof handle.unref === 'function') {
      handle.unref();
    }
  });
  
  // Wait for any remaining async operations
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
}); 