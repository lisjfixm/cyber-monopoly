import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FC } from 'react';
import { Gavel, Coins, Package, Sparkles, ArrowRight } from 'lucide-react';

interface AuctionItem {
  id: number;
  name: string;
  minBid: number;
  value: number;
  icon: 'coins' | 'item' | 'mystery';
  won?: boolean;
  bidAmount?: number;
}

interface AuctionMasterGameProps {
  items: AuctionItem[];
  currentItem: number;
  aiBid: number;
  aiThinking: boolean;
  playerPassed: boolean;
  finished: boolean;
  reward: number;
  onStart: () => void;
  onPlayerBid: () => void;
  onPlayerPass: () => void;
  onNextItem: () => void;
}

const ITEM_TEMPLATES = [
  { name: '現金包裹', icon: 'coins' as const, minBid: 300, value: [500, 1500] },
  { name: '神祕寶箱', icon: 'mystery' as const, minBid: 500, value: [200, 2000] },
  { name: '數據核心', icon: 'item' as const, minBid: 800, value: [1000, 2500] },
  { name: '霓虹晶片', icon: 'item' as const, minBid: 600, value: [800, 1800] },
  { name: '能源電池', icon: 'mystery' as const, minBid: 400, value: [300, 1200] },
];

const AuctionMasterGame: FC<AuctionMasterGameProps> = ({
  items,
  currentItem,
  aiBid,
  aiThinking,
  playerPassed,
  finished,
  reward,
  onStart,
  onPlayerBid,
  onPlayerPass,
  onNextItem,
}) => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [phase, setPhase] = useState<'intro' | 'bidding' | 'result' | 'final'>('intro');
  const [message, setMessage] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStart = useCallback(() => {
    setGameStarted(true);
    setPhase('bidding');
    setMessage('AI 對手正在出價...');
    onStart();
  }, [onStart]);

  useEffect(() => {
    if (!gameStarted) return;
    if (currentItem >= items.length && items.length > 0) {
      setPhase('final');
    }
  }, [currentItem, items.length, gameStarted]);

  useEffect(() => {
    if (!aiThinking && gameStarted && phase === 'bidding' && aiBid > 0 && !playerPassed) {
      setMessage('AI 出價 ¥' + aiBid + '，你要加價嗎？');
    }
    if (playerPassed && items[currentItem]) {
      setMessage(`你放棄了，AI 以 ¥${items[currentItem]?.bidAmount ?? aiBid} 拍下`);
      setPhase('result');
      timeoutRef.current = setTimeout(() => {
        if (currentItem < items.length - 1) {
          setPhase('bidding');
          setMessage('AI 對手正在出價...');
          onNextItem();
        } else {
          onNextItem();
        }
      }, 1500);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [aiThinking, aiBid, playerPassed, phase, gameStarted, currentItem, items, onNextItem]);

  const handleBid = () => {
    if (phase !== 'bidding' || aiThinking) return;
    setMessage('加價成功！AI 思考中...');
    onPlayerBid();
  };

  const handlePass = () => {
    if (phase !== 'bidding' || aiThinking) return;
    onPlayerPass();
  };

  const getItemIcon = (icon: string) => {
    switch (icon) {
      case 'coins': return <Coins className="w-8 h-8" />;
      case 'item': return <Package className="w-8 h-8" />;
      case 'mystery': return <Sparkles className="w-8 h-8" />;
      default: return <Package className="w-8 h-8" />;
    }
  };

  const currentItemData = items[currentItem];
  const totalValue = items.filter((i) => i.won).reduce((sum, i) => sum + (i.value ?? 0), 0);
  const totalBid = items.filter((i) => i.won).reduce((sum, i) => sum + (i.bidAmount ?? 0), 0);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-1.5 font-cyber text-sm" style={{ color: 'var(--yellow)' }}>
          <Gavel className="w-4 h-4" />
          <span>第 {Math.min(currentItem + 1, items.length)} / {items.length} 件</span>
        </div>
        <div className="font-cyber text-sm" style={{ color: 'var(--text-secondary)' }}>
          盈虧：<span style={{ color: reward >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {reward >= 0 ? '+' : ''}¥{reward}
          </span>
        </div>
      </div>

      {phase === 'intro' && !finished && (
        <div className="flex flex-col items-center gap-3 py-4">
          <Gavel className="w-12 h-12" style={{ color: 'var(--yellow)' }} />
          <div className="font-cyber text-lg tracking-wider" style={{ color: 'var(--text-primary)' }}>
            拍賣大師
          </div>
          <div className="text-xs text-center px-4 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
            3 件賽博物品輸流出現<br />
            與 AI 對手競拍，低價撿漏賺、高位接盤虧
          </div>
          <button
            onClick={handleStart}
            className="cyber-btn cyber-btn-pink px-6 py-2 font-cyber tracking-wider mt-2"
          >
            開始拍賣
          </button>
        </div>
      )}

      {phase !== 'intro' && currentItemData && currentItem < items.length && (
        <div className="flex flex-col items-center gap-3 w-full">
          <div
            className="flex flex-col items-center gap-2 p-4 rounded-lg w-full max-w-xs"
            style={{
              backgroundColor: 'var(--bg-mid)',
              border: '1px solid var(--border-neon-pink)',
              boxShadow: 'inset 0 0 15px color-mix(in srgb, var(--yellow) 8%, transparent)',
            }}
          >
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--purple) 20%, transparent)',
                border: '2px solid var(--purple)',
                color: 'var(--purple)',
                boxShadow: '0 0 10px color-mix(in srgb, var(--purple) 40%, transparent)',
              }}
            >
              {getItemIcon(currentItemData.icon)}
            </div>
            <div className="font-cyber text-base tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {currentItemData.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              底價 ¥{currentItemData.minBid}
            </div>
          </div>

          <div className="font-cyber text-sm text-center" style={{ color: 'var(--cyan)', minHeight: '1.5em' }}>
            {aiThinking && <span className="animate-pulse">AI 對手思考中...</span>}
            {!aiThinking && message}
          </div>

          {phase === 'bidding' && !aiThinking && (
            <div className="flex gap-2 w-full max-w-xs">
              <button
                onClick={handleBid}
                className="flex-1 cyber-btn cyber-btn-pink py-2.5 font-cyber text-sm tracking-wider flex items-center justify-center gap-1"
              >
                加價 ¥{Math.max(100, Math.floor(aiBid * 0.15 / 100) * 100)}
              </button>
              <button
                onClick={handlePass}
                className="flex-1 cyber-btn py-2.5 font-cyber text-sm tracking-wider"
              >
                放棄
              </button>
            </div>
          )}

          {phase === 'result' && (
            <div className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              {currentItemData.won
                ? `你以 ¥${currentItemData.bidAmount ?? 0} 拍下！估值 ¥${currentItemData.value}`
                : `AI 拍下，估值 ¥${currentItemData.value}`}
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="flex flex-col items-center gap-2 w-full">
          <div className="font-cyber text-xl tracking-wider" style={{ color: reward >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {reward >= 0 ? '拍賣成功' : '拍賣虧損'}
          </div>
          <div className="font-cyber text-2xl font-bold" style={{
            color: reward >= 0 ? 'var(--green)' : 'var(--red)',
            textShadow: `0 0 10px ${reward >= 0 ? 'var(--green)' : 'var(--red)'}`,
          }}>
            {reward >= 0 ? '+' : ''}¥{reward}
          </div>
          <div className="text-xs flex flex-col items-center gap-0.5" style={{ color: 'var(--text-muted)' }}>
            <span>總估值 ¥{totalValue}</span>
            <span>總出價 ¥{totalBid}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionMasterGame;
