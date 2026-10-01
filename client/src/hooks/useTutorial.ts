import { useCallback, useEffect, useRef, useState } from 'react';
import { TUTORIAL_STEPS, type TutorialStepConfig } from '@client/src/config/tutorial';
import type { AchievementId } from '@shared/api.interface';

const DONE_KEY = 'monopoly_tutorial_done';
const PROMPTED_KEY = 'monopoly_tutorial_prompted';
const ACTIVE_KEY = 'monopoly_tutorial_active';
const STEP_KEY = 'monopoly_tutorial_step';

function readDone(): boolean {
  try {
    return localStorage.getItem(DONE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDone(value: boolean): void {
  try {
    localStorage.setItem(DONE_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
}

function readPrompted(): boolean {
  try {
    return localStorage.getItem(PROMPTED_KEY) === '1';
  } catch {
    return false;
  }
}

function writePrompted(value: boolean): void {
  try {
    localStorage.setItem(PROMPTED_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
}

function readActiveStep(): number | null {
  try {
    const active = sessionStorage.getItem(ACTIVE_KEY);
    const step = sessionStorage.getItem(STEP_KEY);
    if (active !== '1' || !step) return null;
    const n = parseInt(step, 10);
    if (Number.isNaN(n) || n < 0 || n >= TUTORIAL_STEPS.length) return null;
    return n;
  } catch {
    return null;
  }
}

function writeActiveStep(step: number): void {
  try {
    sessionStorage.setItem(ACTIVE_KEY, '1');
    sessionStorage.setItem(STEP_KEY, String(step));
  } catch {
    // ignore
  }
}

function clearActive(): void {
  try {
    sessionStorage.removeItem(ACTIVE_KEY);
    sessionStorage.removeItem(STEP_KEY);
  } catch {
    // ignore
  }
}

export interface UseTutorialReturn {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepConfig: TutorialStepConfig | null;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  closeTutorial: () => void;
  hasCompleted: boolean;
  shouldAutoPrompt: boolean;
  markPrompted: () => void;
}

interface UseTutorialOptions {
  /** 当完成最后一步时调用，用于解锁成就等 */
  onComplete?: () => void;
}

export function useTutorial(options: UseTutorialOptions = {}): UseTutorialReturn {
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [hasPrompted, setHasPrompted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  // 用 ref 持有 onComplete，避免 options 每次渲染新物件造成 callback 引用不穩定
  const onCompleteRef = useRef(options.onComplete);
  onCompleteRef.current = options.onComplete;

  // 初始化：读取存储状态
  useEffect(() => {
    setHasCompleted(readDone());
    setHasPrompted(readPrompted());
    const savedStep = readActiveStep();
    if (savedStep !== null) {
      setCurrentStep(savedStep);
      setIsActive(true);
    }
  }, []);

  const totalSteps = TUTORIAL_STEPS.length;
  const currentStepConfig: TutorialStepConfig | null = isActive
    ? TUTORIAL_STEPS[currentStep] ?? null
    : null;

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    writeActiveStep(0);
  }, []);

  const nextStep = useCallback(() => {
    const next = currentStep + 1;
    if (next >= TUTORIAL_STEPS.length) {
      // 完成教学：所有副作用都在 updater 外執行，避免 StrictMode 下重複觸發
      clearActive();
      setIsActive(false);
      writeDone(true);
      setHasCompleted(true);
      onCompleteRef.current?.();
      return;
    }
    writeActiveStep(next);
    setCurrentStep(next);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = Math.max(0, prev - 1);
      writeActiveStep(next);
      return next;
    });
  }, []);

  const skipTutorial = useCallback(() => {
    clearActive();
    setIsActive(false);
    // 跳过不标记完成，不解锁成就
  }, []);

  const closeTutorial = useCallback(() => {
    clearActive();
    setIsActive(false);
  }, []);

  const markPrompted = useCallback(() => {
    writePrompted(true);
    setHasPrompted(true);
  }, []);

  const shouldAutoPrompt = !hasCompleted && !hasPrompted;

  return {
    isActive,
    currentStep,
    totalSteps,
    currentStepConfig,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    closeTutorial,
    hasCompleted,
    shouldAutoPrompt,
    markPrompted,
  };
}

export type { AchievementId };
