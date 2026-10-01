import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';
import { t } from '@client/src/i18n';

const STORAGE_KEY = 'cyber_monopoly_anti_cheat_logs';
const CRITICAL_THRESHOLD = 3;

export type AntiCheatLevel = 'warning' | 'severe' | 'critical';

export interface AntiCheatEvent {
  id: string;
  type: string;
  level: AntiCheatLevel;
  details: string;
  timestamp: number;
}

export class AntiCheatMonitor {
  private static instance: AntiCheatMonitor | null = null;

  private running = false;
  private clickTimestamps: number[] = [];
  private lastMoneyValues: Map<number, number> = new Map();
  private turnStartTimes: Map<number, number> = new Map();
  private criticalCount = 0;
  private warned = false;

  private constructor() {
    // 單例
  }

  static getInstance(): AntiCheatMonitor {
    if (!AntiCheatMonitor.instance) {
      AntiCheatMonitor.instance = new AntiCheatMonitor();
    }
    return AntiCheatMonitor.instance;
  }

  /**
   * 啟動監控
   */
  start(initialPlayers: Array<{ index: number; money: number }>): void {
    if (this.running) return;
    this.running = true;
    this.clickTimestamps = [];
    this.lastMoneyValues = new Map();
    this.turnStartTimes = new Map();
    this.criticalCount = 0;
    this.warned = false;

    for (const p of initialPlayers) {
      this.lastMoneyValues.set(p.index, p.money);
      this.turnStartTimes.set(p.index, Date.now());
    }

    logger.info('[AntiCheat] Monitor started');
  }

  /**
   * 停止監控
   */
  stop(): void {
    this.running = false;
    logger.info('[AntiCheat] Monitor stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  /**
   * 記錄一次點擊/操作，用於頻率檢測
   */
  recordClick(): void {
    if (!this.running) return;
    const now = Date.now();
    this.clickTimestamps.push(now);

    // 只保留 5 秒內的紀錄
    const windowStart = now - 5000;
    this.clickTimestamps = this.clickTimestamps.filter((t) => t >= windowStart);

    if (this.clickTimestamps.length > 20) {
      this.recordEvent(
        'click_frequency',
        'severe',
        `5秒內操作 ${this.clickTimestamps.length} 次，超過正常閾值`,
      );
      // 重置避免重複觸發
      this.clickTimestamps = [];
    }
  }

  /**
   * 檢測金錢波動是否異常
   * @param playerIndex 玩家索引
   * @param newMoney 新金額
   * @param startingMoney 起始資金（用於計算閾值）
   * @param hasNormalOperation 是否有對應的正常操作（命運卡/交易等）
   */
  checkMoneyFluctuation(
    playerIndex: number,
    newMoney: number,
    startingMoney: number,
    hasNormalOperation: boolean = false,
  ): void {
    if (!this.running) return;
    const lastMoney = this.lastMoneyValues.get(playerIndex);
    if (lastMoney === undefined) {
      this.lastMoneyValues.set(playerIndex, newMoney);
      return;
    }

    const diff = Math.abs(newMoney - lastMoney);
    const threshold = startingMoney * 0.5;

    if (diff > threshold && !hasNormalOperation) {
      const level: AntiCheatLevel = diff > startingMoney * 1.5 ? 'critical' : 'severe';
      this.recordEvent(
        'money_fluctuation',
        level,
        `玩家 ${playerIndex} 金錢變動 ${diff}（${lastMoney} → ${newMoney}），超過閾值 ${Math.floor(threshold)}`,
      );
    }

    this.lastMoneyValues.set(playerIndex, newMoney);
  }

  /**
   * 記錄回合開始時間
   */
  recordTurnStart(playerIndex: number): void {
    if (!this.running) return;
    this.turnStartTimes.set(playerIndex, Date.now());
  }

  /**
   * 檢測回合操作時間是否異常（< 100ms）
   */
  checkTurnTime(playerIndex: number): void {
    if (!this.running) return;
    const startTime = this.turnStartTimes.get(playerIndex);
    if (startTime === undefined) return;

    const elapsed = Date.now() - startTime;
    if (elapsed < 100) {
      this.recordEvent(
        'turn_time',
        'critical',
        `玩家 ${playerIndex} 回合操作耗時 ${elapsed}ms，低於人類反應速度`,
      );
    }
  }

  /**
   * 手動標記一次正常金錢操作（避免誤判）
   */
  markNormalOperation(playerIndex: number, newMoney: number): void {
    this.lastMoneyValues.set(playerIndex, newMoney);
  }

  /**
   * 記錄異常事件並存到 localStorage
   */
  recordEvent(type: string, level: AntiCheatLevel, details: string): void {
    const event: AntiCheatEvent = {
      id: `ac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      level,
      details,
      timestamp: Date.now(),
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const logs: AntiCheatEvent[] = raw ? JSON.parse(raw) : [];
      logs.unshift(event);
      // 最多保留 100 筆
      const trimmed = logs.slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {
      logger.error('Failed to save anti-cheat log:', err instanceof Error ? err.message : String(err));
    }

    if (level === 'critical') {
      this.criticalCount += 1;
      if (this.criticalCount >= CRITICAL_THRESHOLD && !this.warned) {
        this.warned = true;
        toast.warning(t('antiCheat.warning'), {
          style: {
            borderColor: 'var(--red)',
            color: 'var(--red)',
            background: 'var(--bg-dark)',
          },
        });
      }
    }

    logger.warn(`[AntiCheat] [${level}] ${type}: ${details}`);
  }

  /**
   * 讀取所有異常記錄
   */
  getEvents(): AntiCheatEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * 清除所有記錄
   */
  clearEvents(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export default AntiCheatMonitor;
