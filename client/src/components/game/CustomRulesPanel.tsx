import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { X, Save, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';
import type { CustomGameRules } from '@shared/api.interface';
import { DEFAULT_CUSTOM_RULES } from '@shared/game-config';
import { useCustomPresets } from '@client/src/hooks/useCustomPresets';

interface CustomRulesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  rules: CustomGameRules;
  onChange: (rules: CustomGameRules) => void;
  onStartGame?: () => void;
}

const CustomRulesPanel: FC<CustomRulesPanelProps> = ({
  isOpen,
  onClose,
  rules,
  onChange,
  onStartGame,
}) => {
  const { presets, savePreset, deletePreset } = useCustomPresets();
  const [presetName, setPresetName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPresetName('');
      setShowSaveInput(false);
    }
  }, [isOpen]);

  const updateRule = <K extends keyof CustomGameRules>(key: K, value: CustomGameRules[K]) => {
    onChange({ ...rules, [key]: value });
  };

  const applyPreset = (presetRules: CustomGameRules, name: string) => {
    onChange({ ...presetRules });
    toast.success(`已应用预设「${name}」`);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('请输入预设名称');
      return;
    }
    const ok = savePreset(presetName.trim(), rules);
    if (ok) {
      toast.success(`预设「${presetName.trim()}」已保存`);
      setPresetName('');
      setShowSaveInput(false);
    } else {
      toast.error('预设数量已达上限（最多3个）');
    }
  };

  const handleDeletePreset = (index: number, name: string) => {
    deletePreset(index);
    toast.success(`已删除预设「${name}」`);
  };

  const resetToDefault = () => {
    onChange({ ...DEFAULT_CUSTOM_RULES });
    toast.info('已恢复默认规则');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className="cyber-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 md:p-6 relative"
        style={{
          borderColor: 'var(--purple)',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.08)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2
            className="font-cyber text-2xl md:text-3xl tracking-wider mb-2"
            style={{
              color: 'var(--purple)',
              textShadow: '0 0 10px rgba(168, 85, 247, 0.6)',
            }}
          >
            設定 自定义规则
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            定制你的赛博大富翁世界
          </p>
        </div>

        {/* 预设区域 */}
        <div className="mb-6">
          <h3
            className="font-cyber text-sm tracking-wider border-b pb-1 mb-3"
            style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple)' }}
          >
            预设方案
          </h3>

          {presets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {presets.map((preset, idx) => (
                <div key={idx} className="relative group">
                  <button
                    onClick={() => applyPreset(preset.rules, preset.name)}
                    className="w-full p-2 text-xs font-cyber tracking-wide rounded border transition-all text-left truncate"
                    style={{
                      borderColor: 'rgba(168, 85, 247, 0.3)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'rgba(168, 85, 247, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--purple)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow =
                        '0 0 8px rgba(168, 85, 247, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor =
                        'rgba(168, 85, 247, 0.3)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                    }}
                  >
                    <Settings className="w-3 h-3 inline mr-1" />
                    {preset.name}
                  </button>
                  <button
                    onClick={() => handleDeletePreset(idx, preset.name)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: 'var(--red)', color: 'white' }}
                    title="删除预设"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              暂无保存的预设
            </p>
          )}

          {/* 保存预设 */}
          {!showSaveInput ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveInput(true)}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wide"
                style={{
                  borderColor: 'var(--purple)',
                  color: 'var(--purple)',
                  backgroundColor: 'rgba(168, 85, 247, 0.08)',
                }}
              >
                <Save className="w-3.5 h-3.5 inline mr-1.5" />
                保存当前配置
              </button>
              <button
                onClick={resetToDefault}
                className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wide"
              >
                重置
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="输入预设名称"
                className="flex-1 px-3 py-2 rounded text-sm bg-[var(--bg-mid)] border"
                style={{
                  borderColor: 'rgba(168, 85, 247, 0.3)',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePreset();
                }}
              />
              <button
                onClick={handleSavePreset}
                className="cyber-btn px-4 py-2 text-sm"
                style={{
                  borderColor: 'var(--purple)',
                  color: 'var(--purple)',
                }}
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowSaveInput(false);
                  setPresetName('');
                }}
                className="cyber-btn px-3 py-2 text-sm"
              >
                取消
              </button>
            </div>
          )}
        </div>

        {/* 滑块配置区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
          <h3
            className="md:col-span-2 font-cyber text-sm tracking-wider border-b pb-1"
            style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple)' }}
          >
            数值设定
          </h3>

          <SliderSetting
            label="起始资金"
            value={rules.initialMoney}
            min={5000}
            max={30000}
            step={1000}
            unit="元"
            onChange={(v) => updateRule('initialMoney', v)}
          />

          <SliderSetting
            label="过路费比例"
            value={rules.tollPercent}
            min={0.1}
            max={0.8}
            step={0.05}
            unit="%"
            displayValue={Math.round(rules.tollPercent * 100)}
            onChange={(v) => updateRule('tollPercent', v)}
          />

          <SliderSetting
            label="起点奖励"
            value={rules.goBonus}
            min={0}
            max={5000}
            step={500}
            unit="元"
            onChange={(v) => updateRule('goBonus', v)}
          />

          <SliderSetting
            label="命運卡金錢倍率"
            value={rules.fateMoneyMultiplier}
            min={0.5}
            max={3}
            step={0.5}
            unit="x"
            onChange={(v) => updateRule('fateMoneyMultiplier', v)}
          />

          <h3
            className="md:col-span-2 font-cyber text-sm tracking-wider border-b pb-1 pt-2"
            style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple)' }}
          >
            功能开关
          </h3>

          <ToggleSetting
            label="啟用命運卡"
            checked={rules.enableFateCards}
            onChange={(v) => updateRule('enableFateCards', v)}
          />

          <ToggleSetting
            label="啟用機會卡"
            checked={rules.enableChanceCards}
            onChange={(v) => updateRule('enableChanceCards', v)}
          />

          <ToggleSetting
            label="启用全局事件"
            checked={rules.enableGlobalEvents}
            onChange={(v) => updateRule('enableGlobalEvents', v)}
          />

          <ToggleSetting
            label="启用股票市场"
            checked={rules.enableStockMarket}
            onChange={(v) => updateRule('enableStockMarket', v)}
          />

          <h3
            className="md:col-span-2 font-cyber text-sm tracking-wider border-b pb-1 pt-2"
            style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple)' }}
          >
            經濟衍生系統
          </h3>

          <ToggleSetting
            label="地產期貨"
            checked={rules.enablePropertyFutures !== false}
            onChange={(v) => updateRule('enablePropertyFutures', v)}
          />

          <ToggleSetting
            label="期權交易"
            checked={rules.enableOptionsTrading !== false}
            onChange={(v) => updateRule('enableOptionsTrading', v)}
          />

          <ToggleSetting
            label="戰爭系統"
            checked={rules.enableWarSystem !== false}
            onChange={(v) => updateRule('enableWarSystem', v)}
          />

          <ToggleSetting
            label="間諜系統"
            checked={rules.enableSpySystem !== false}
            onChange={(v) => updateRule('enableSpySystem', v)}
          />

          <ToggleSetting
            label="機器人代打"
            checked={rules.enableRobotProxy !== false}
            onChange={(v) => updateRule('enableRobotProxy', v)}
          />

          <h3
            className="md:col-span-2 font-cyber text-sm tracking-wider border-b pb-1 pt-2"
            style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple)' }}
          >
            時間空間系統
          </h3>

          <ToggleSetting
            label="時間旅行道具"
            checked={rules.enableTimeTravel !== false}
            onChange={(v) => updateRule('enableTimeTravel', v)}
          />

          <ToggleSetting
            label="平行世界"
            checked={rules.enableParallelWorld !== false}
            onChange={(v) => updateRule('enableParallelWorld', v)}
          />

          <ToggleSetting
            label="卡牌連鎖"
            checked={rules.enableCardCombo !== false}
            onChange={(v) => updateRule('enableCardCombo', v)}
          />

          <ToggleSetting
            label="地產進化"
            checked={rules.enablePropertyEvolution !== false}
            onChange={(v) => updateRule('enablePropertyEvolution', v)}
          />

          <ToggleSetting
            label="坐騎系統"
            checked={rules.enableMountSystem !== false}
            onChange={(v) => updateRule('enableMountSystem', v)}
          />

          <h3
            className="md:col-span-2 font-cyber text-sm tracking-wider border-b pb-1 pt-2"
            style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: 'var(--purple)' }}
          >
            高级选项
          </h3>

          <SegmentedSetting
            label="建筑过路费模式"
            value={rules.buildingTollMode}
            options={[
              { value: 'standard', label: '标准' },
              { value: 'aggressive', label: '激进' },
            ]}
            onChange={(v) => updateRule('buildingTollMode', v as 'standard' | 'aggressive')}
          />

          <SegmentedSetting
            label="破产线"
            value={rules.bankruptcyLine === 0 ? '0' : '-5000'}
            options={[
              { value: '0', label: '0元' },
              { value: '-5000', label: '负债-5000' },
            ]}
            onChange={(v) => updateRule('bankruptcyLine', Number(v))}
          />
        </div>

        {/* 开始游戏按钮 */}
        {onStartGame && (
          <div className="flex justify-center">
            <button
              onClick={onStartGame}
              className="cyber-btn cyber-btn-pink px-10 py-3 text-lg font-cyber tracking-widest"
            >
              開始遊戲
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== 子组件 ==========

interface SliderSettingProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  displayValue?: number;
  onChange: (value: number) => void;
}

const SliderSetting: FC<SliderSettingProps> = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  displayValue,
  onChange,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const display = displayValue !== undefined ? displayValue : value;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span
          className="text-xs font-cyber tracking-wide"
          style={{ color: 'var(--cyan)', textShadow: '0 0 4px rgba(0, 255, 255, 0.5)' }}
        >
          {display.toLocaleString()}{unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)' }}>
        <div
          className="absolute h-full rounded-full"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, var(--cyan), var(--purple))',
            boxShadow: '0 0 6px var(--cyan-glow)',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
};

interface ToggleSettingProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const ToggleSetting: FC<ToggleSettingProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-all duration-300"
        style={{
          backgroundColor: checked ? 'var(--purple)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: checked ? '0 0 8px rgba(168, 85, 247, 0.6)' : 'none',
          border: `1px solid ${checked ? 'var(--purple)' : 'rgba(255, 255, 255, 0.2)'}`,
        }}
        aria-label={label}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
          style={{
            left: checked ? '22px' : '2px',
            backgroundColor: checked ? 'white' : 'rgba(255, 255, 255, 0.5)',
            boxShadow: checked ? '0 0 6px rgba(255, 255, 255, 0.8)' : 'none',
          }}
        />
      </button>
    </div>
  );
};

interface SegmentedOption {
  value: string;
  label: string;
}

interface SegmentedSettingProps {
  label: string;
  value: string;
  options: SegmentedOption[];
  onChange: (value: string) => void;
}

const SegmentedSetting: FC<SegmentedSettingProps> = ({ label, value, options, onChange }) => {
  return (
    <div>
      <div className="mb-1.5">
        <span className="text-xs font-cyber tracking-wide" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div
        className="flex rounded overflow-hidden border"
        style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
      >
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className="flex-1 py-1.5 text-xs font-cyber tracking-wide transition-all"
              style={{
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--purple)' : 'transparent',
                boxShadow: isActive ? 'inset 0 0 8px rgba(168, 85, 247, 0.5)' : 'none',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CustomRulesPanel;
