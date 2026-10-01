import type { FC } from 'react';
import type { CellType, MapEditorTool } from '@shared/api.interface';
import { MousePointer2, Paintbrush, Eraser, Flag, Building2, Lock, HelpCircle, Zap, Gamepad2, Car, ShieldAlert, Sparkles, ArrowRightLeft } from 'lucide-react';

interface ToolPanelProps {
  tool: MapEditorTool;
  onToolChange: (tool: MapEditorTool) => void;
  selectedType: CellType;
  onTypeChange: (type: CellType) => void;
}

const cellTypes: { type: CellType; label: string; icon: FC<{ size?: number }>; color: string }[] = [
  { type: 'start', label: '起點', icon: Flag, color: 'var(--green)' },
  { type: 'property', label: '地產', icon: Building2, color: 'var(--cyan)' },
  { type: 'detention', label: '禁閉', icon: Lock, color: 'var(--purple)' },
  { type: 'fate', label: '命運', icon: HelpCircle, color: 'var(--pink)' },
  { type: 'chance', label: '機會', icon: Zap, color: 'hsl(250, 90%, 70%)' },
  { type: 'minigame', label: '遊戲', icon: Gamepad2, color: 'hsl(280, 100%, 75%)' },
  { type: 'parking', label: '停車場', icon: Car, color: 'hsl(200, 70%, 60%)' },
  { type: 'jail', label: '監獄', icon: ShieldAlert, color: 'hsl(15, 80%, 55%)' },
  { type: 'event', label: '奇遇', icon: Sparkles, color: 'hsl(50, 100%, 60%)' },
  { type: 'teleport', label: '傳送門', icon: ArrowRightLeft, color: 'hsl(160, 100%, 60%)' },
];

const ToolPanel: FC<ToolPanelProps> = ({ tool, onToolChange, selectedType, onTypeChange }) => {
  const tools: { key: MapEditorTool; label: string; icon: FC<{ size?: number }> }[] = [
    { key: 'select', label: '選擇', icon: MousePointer2 },
    { key: 'paint', label: '畫筆', icon: Paintbrush },
    { key: 'erase', label: '清除', icon: Eraser },
  ];

  return (
    <div className="cyber-card p-3 md:p-4 h-full flex flex-col gap-4">
      {/* Tools */}
      <div>
        <h3 className="font-cyber text-sm tracking-wider text-neon-cyan mb-2">工具</h3>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((t) => {
            const Icon = t.icon;
            const active = tool === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onToolChange(t.key)}
                className="flex flex-col items-center gap-1 py-2 px-1 text-xs font-cyber tracking-wider transition-all"
                style={{
                  border: `1px solid ${active ? 'var(--cyan)' : 'rgba(0, 255, 255, 0.2)'}`,
                  background: active ? 'rgba(0, 255, 255, 0.12)' : 'transparent',
                  color: active ? 'var(--cyan)' : 'var(--text-secondary)',
                  boxShadow: active ? '0 0 10px rgba(0, 255, 255, 0.3)' : undefined,
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cell type list */}
      <div>
        <h3 className="font-cyber text-sm tracking-wider text-neon-cyan mb-2">格子類型</h3>
        <div className="space-y-1.5">
          {cellTypes.map((ct) => {
            const Icon = ct.icon;
            const active = selectedType === ct.type;
            return (
              <button
                key={ct.type}
                type="button"
                onClick={() => onTypeChange(ct.type)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-cyber tracking-wide transition-all"
                style={{
                  border: `1px solid ${active ? ct.color : 'rgba(255, 255, 255, 0.08)'}`,
                  background: active ? `${ct.color}15` : 'transparent',
                  color: active ? ct.color : 'var(--text-secondary)',
                  boxShadow: active ? `0 0 8px ${ct.color}40` : undefined,
                }}
              >
                <Icon size={14} />
                <span>{ct.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="mt-auto text-[10px] text-[var(--text-muted)] font-cyber leading-relaxed">
        <p>提示 左鍵：應用工具</p>
        <p>提示 右鍵：快速清除</p>
        <p>提示 選擇模式下可編輯屬性</p>
      </div>
    </div>
  );
};

export default ToolPanel;
