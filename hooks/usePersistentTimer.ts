
import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, TimerMode, Language, ActivityCategory } from '../types';
import { storageService } from '../services/storageService';

const TIMER_STATE_KEY = 'ANTIMETODO_TIMER_STATE_V3';

const getInitialState = (defaultState: {
  mode: TimerMode;
  initialDuration: number;
  language: Language;
}): TimerState => ({
  status: 'idle',
  mode: defaultState.mode,
  startTime: 0,
  pauseTime: 0,
  accumulatedTime: 0,
  initialDuration: defaultState.initialDuration,
  activityName: 'Ninguna seleccionada',
  category: null,
  customTitle: '',
  notes: '',
  language: defaultState.language,
  capturedDateTime: null,
});

export const usePersistentTimer = (defaultState: {
  mode: TimerMode;
  initialDuration: number;
  language: Language;
}) => {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const savedState = storageService.getItem<TimerState>(TIMER_STATE_KEY);
    if (savedState) {
      // If the timer was running when the app was closed, we need to adjust the accumulated time
      if (savedState.status === 'running') {
        const elapsed = (Date.now() - savedState.startTime) / 1000;
        savedState.accumulatedTime += elapsed;
        savedState.startTime = Date.now(); // Reset startTime to now for accurate subsequent calculations
        // Keep status as 'running' to simulate continuous operation
      }
      return savedState;
    }
    return getInitialState(defaultState);
  });

  const [displaySeconds, setDisplaySeconds] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Save state only if there's progress or it's actively running/paused
    if (timerState.status === 'running' || timerState.status === 'paused' || timerState.accumulatedTime > 0) {
      storageService.setItem(TIMER_STATE_KEY, timerState);
    } else {
      // If the timer is idle and has no accumulated time, remove it from storage
      storageService.removeItem(TIMER_STATE_KEY);
    }
  }, [timerState]);

  const calculateDisplay = useCallback(() => {
    if (timerState.status === 'running') {
      const elapsedSinceStart = (Date.now() - timerState.startTime) / 1000;
      const totalSeconds = timerState.accumulatedTime + elapsedSinceStart;
      if (timerState.mode === 'countdown') {
        const remaining = Math.max(0, timerState.initialDuration - totalSeconds);
        setDisplaySeconds(remaining);
        if (remaining === 0) {
          setTimerState(prev => ({ ...prev, status: 'completed' }));
        }
      } else { // stopwatch
        setDisplaySeconds(totalSeconds);
      }
    } else { // paused, idle, completed
      if (timerState.mode === 'countdown') {
        setDisplaySeconds(Math.max(0, timerState.initialDuration - timerState.accumulatedTime));
      } else { // stopwatch
        setDisplaySeconds(timerState.accumulatedTime);
      }
    }
  }, [timerState]);

  useEffect(() => {
    const animate = () => {
      calculateDisplay();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (timerState.status === 'running') {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      calculateDisplay(); // Update display one last time when paused/stopped
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [timerState.status, calculateDisplay]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        calculateDisplay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [calculateDisplay]);


  const start = useCallback(() => {
    setTimerState(prev => {
      if (prev.status === 'running') return prev;
      return {
        ...prev,
        status: 'running',
        startTime: Date.now(),
        capturedDateTime: prev.capturedDateTime || {
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().substring(0, 5),
        },
      };
    });
  }, []);

  const pause = useCallback(() => {
    setTimerState(prev => {
      if (prev.status !== 'running') return prev;
      const elapsed = (Date.now() - prev.startTime) / 1000;
      return {
        ...prev,
        status: 'paused',
        accumulatedTime: prev.accumulatedTime + elapsed,
        startTime: 0,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      status: 'idle',
      accumulatedTime: 0,
      startTime: 0,
      capturedDateTime: null,
    }));
  }, []);

  const clear = useCallback(() => {
    setTimerState(getInitialState(defaultState));
  }, [defaultState]);

  const updateActivityDetails = useCallback((details: Partial<TimerState>) => {
    setTimerState(prev => ({ ...prev, ...details }));
  }, []);

  const setTimerMode = useCallback((mode: TimerMode) => {
    setTimerState(prev => ({
      ...prev,
      mode,
      status: 'idle',
      accumulatedTime: 0,
      startTime: 0,
    }));
  }, []);

  const setCountdownDuration = useCallback((minutes: number) => {
    setTimerState(prev => ({
      ...prev,
      initialDuration: minutes * 60,
    }));
  }, []);

  return {
    timerState,
    displaySeconds: Math.round(displaySeconds),
    updateActivityDetails,
    setTimerMode,
    setCountdownDuration,
    start,
    pause,
    reset,
    clear,
  };
};
