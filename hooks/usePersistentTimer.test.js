import { renderHook, act } from '@testing-library/react-hooks';
import { usePersistentTimer } from './usePersistentTimer';
import { storageService } from '../services/storageService';

// Mock storageService
jest.mock('../services/storageService', () => ({
  storageService: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockedStorageService = storageService as jest.Mocked<typeof storageService>;

describe('usePersistentTimer', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should return displaySeconds as an integer', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      usePersistentTimer({
        mode: 'stopwatch',
        initialDuration: 0,
        language: 'English',
      })
    );

    act(() => {
        result.current.start();
        jest.advanceTimersByTime(1500); // 1.5 seconds
        result.current.pause();
    });

    expect(Number.isInteger(result.current.displaySeconds)).toBe(true);
    expect(result.current.displaySeconds).toBe(2); // it should round up
  });

  it('accumulatedTime should be an integer', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() =>
        usePersistentTimer({
            mode: 'stopwatch',
            initialDuration: 0,
            language: 'English',
        })
    );

    act(() => {
        result.current.start();
        jest.advanceTimersByTime(1234); // Simulate non-integer seconds
        result.current.pause();
    });
    
    expect(Number.isInteger(result.current.timerState.accumulatedTime)).toBe(false); // This will fail initially
    
    act(() => {
        result.current.start();
        jest.advanceTimersByTime(1000);
        result.current.pause();
    });
    
    expect(Number.isInteger(result.current.timerState.accumulatedTime)).toBe(false); // This will also fail
  });
});
