import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, Download, Volume2, VolumeX, Type, Megaphone, Shield, Globe, BookOpen, Search, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme, THEMES, type ThemeId } from '@client/src/contexts/ThemeContext';
import { useInstallPrompt } from '@client/src/hooks/useInstallPrompt';
import { useAudio } from '@client/src/hooks/useAudio';
import { VOICE_PACKS, type VoicePackType } from '@shared/game-config';
import { useTranslation } from '@client/src/i18n';
import LanguageSwitch from '@client/src/components/LanguageSwitch';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { theme, setTheme, colorblindMode, setColorblindMode, fontSize, setFontSize, animationEnabled, setAnimationEnabled } = useTheme();
  const { canInstall, promptInstall } = useInstallPrompt();
  const { voiceEnabled, voicePack, toggleVoice, setVoicePack, speak, init, startBGM } = useAudio();
  const [installing, setInstalling] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState<HelpCategoryKey>('basic');
  const [helpSearch, setHelpSearch] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 幫助中心內容
  const helpCategories = {
    basic: { label: '基本規則', color: 'var(--cyan)' },
    career: { label: '職業', color: 'var(--pink)' },
    card: { label: '卡牌', color: 'var(--purple)' },
    item: { label: '道具', color: 'var(--green)' },
    mode: { label: '模式', color: 'var(--blue)' },
    glossary: { label: '術語表', color: 'var(--cyan)' },
  } as const;
  type HelpCategoryKey = keyof typeof helpCategories;

  const helpEntries: Record<HelpCategoryKey, { title: string; description: string }[]> = {
    basic: [
      { title: '遊戲目標', description: '讓對手破產，成為最後的贏家。當所有對手皆因欠債而無法繼續遊戲時，你即獲得勝利。' },
      { title: '擲骰子', description: '點擊「擲骰子」按鈕，根據擲出的點數移動相應步數。每回合可擲一次，擲出點數相同時可獲得額外回合。' },
      { title: '買地', description: '走到無主地塊時可選擇購買，購買後取得該地塊的所有權。之後其他玩家經過此地塊時需支付過路費。' },
      { title: '建房', description: '在自有地塊上可建造房屋或酒店，建築等級越高，過路費越高。需要同色組地塊全部擁有才可建房。' },
      { title: '命運/機會', description: '踩到命運區或機會區時會抽卡，效果隨機，可能獲得金錢、損失金錢、傳送位置等各種效果。' },
    ],
    career: [
      { title: '駭客', description: '被動技能：可侵入對方地塊，短暫降低其過路費收益。擅長干擾敵方經濟體系。' },
      { title: '企業家', description: '被動技能：建造費用降低，建房成本比其他職業更低，適合快速擴張地產帝國。' },
      { title: '銀行家', description: '被動技能：收取過路費時有額外金錢加成，依賴地盤收取穩定收益。' },
      { title: '投機者', description: '被動技能：命運卡金額倍率提升，不論獎勵或罰款都會放大，高風險高報酬。' },
      { title: '工程師', description: '被動技能：修復或拆除建築時獲得部分金錢返還，擅長靈活調整資產結構。' },
      { title: '礦工', description: '被動技能：每回合獲得穩定的被動收入，適合穩健經營的長線策略。' },
    ],
    card: [
      { title: '命運卡', description: '包含金錢獎勵、罰款、隨機傳送等多種效果，抽到什麼全憑運氣。' },
      { title: '機會卡', description: '類似命運卡但更偏向風險與機會並存，可能帶來巨大收益，也可能造成嚴重損失。' },
      { title: '道具卡', description: '可主動使用的特殊效果卡，玩家可在合適時機選擇使用，改變戰局走向。' },
      { title: '建築卡', description: '影響地塊建築的特殊卡牌，可快速升級建築或摧毀對方建築。' },
    ],
    item: [
      { title: '骰子操縱器', description: '指定下一回合的骰子點數，精準控制落點位置，戰略價值極高。' },
      { title: '防護罩', description: '免疫一次負面效果，包括負面命運卡、對手技能等，可在關鍵時刻保命。' },
      { title: '傳送器', description: '立即傳送到任意地塊，可用於搶地、逃離高額過路費或進入命運區。' },
      { title: '金錢炸彈', description: '讓所有玩家損失一定金額的金錢，包括自己，適合在現金優勢時使用打擊對手。' },
    ],
    mode: [
      { title: '經典模式', description: '標準大富翁規則，預設起始資金與地價，適合體驗傳統大富翁玩法。' },
      { title: '閃電戰', description: '低起始資金，快速對決，遊戲時長縮短，節奏更快，考驗短線操作能力。' },
      { title: '瘋狂模式', description: '高起始資金，金錢流動大，買地建房更容易，場面更為混亂刺激。' },
      { title: '生存模式', description: '血量機制，破產不等於淘汰，玩家有機會靠打工或特殊卡逆轉翻盤。' },
      { title: '團隊死鬥', description: '2v2 隊伍對抗，隊友共享資源與地產，考驗團隊配合與策略分工。' },
      { title: '暗網模式', description: '信息不對稱，隱藏對手狀態，只能看到部分資訊，增加心理戰與不確定性。' },
    ],
    glossary: [
      { title: '霓虹幣', description: '遊戲內通用貨幣，用於買地、建房、付費等所有金錢交易。' },
      { title: '數據核心', description: '地塊的所有權證明，相當於地契，持有數據核心即擁有該地塊。' },
      { title: '量子跳躍', description: '隨機傳送到任意地塊的效果，無法預測落點，充滿不確定性。' },
      { title: '暗網', description: '隱藏信息的區域，交易不在檯面上進行，部分特殊規則適用於此。' },
      { title: '禁閉區', description: '玩家被拘留無法行動的區域，類似傳統大富翁的監獄。' },
      { title: '賽博空間', description: '虛擬網絡空間，部分卡牌效果發生在此，與現實地圖分開計算。' },
      { title: '神經連結', description: '玩家與地塊的所有權連接狀態，斷開連結等同失去所有權。' },
      { title: '能量矩陣', description: '建築等級的衡量單位，能量矩陣等級越高，收取的過路費越貴。' },
      { title: '數據風暴', description: '隨機觸發的全局事件，影響所有玩家，可能改變整場遊戲的走勢。' },
      { title: '霓虹護盾', description: '可抵擋一次負面效果的防護道具，是保護自己的重要手段。' },
    ],
  };

  const filteredHelpEntries = (): { category: HelpCategoryKey; title: string; description: string }[] => {
    const keyword = helpSearch.trim().toLowerCase();
    if (!keyword) {
      return helpEntries[helpTab].map((e) => ({ category: helpTab, ...e }));
    }
    const results: { category: HelpCategoryKey; title: string; description: string }[] = [];
    (Object.keys(helpCategories) as HelpCategoryKey[]).forEach((cat) => {
      helpEntries[cat].forEach((entry) => {
        if (
          entry.title.toLowerCase().includes(keyword) ||
          entry.description.toLowerCase().includes(keyword)
        ) {
          results.push({ category: cat, ...entry });
        }
      });
    });
    return results;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (helpOpen) {
        setHelpOpen(false);
        e.stopPropagation();
        return;
      }
      onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleThemeSelect = (themeId: ThemeId) => {
    setTheme(themeId);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ animation: 'fade-in 0.2s ease-out' }}
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div
        className="cyber-card relative w-full max-w-2xl overflow-hidden flex flex-col"
        style={{
          borderColor: 'var(--border-neon-cyan)',
          boxShadow: '0 0 30px rgba(0, 255, 255, 0.25), inset 0 0 20px rgba(0, 255, 255, 0.05)',
          animation: 'fade-in 0.25s ease-out',
          maxHeight: '90vh',
        }}
      >
        {/* 顶部装饰线 */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />

        {/* 标题栏 */}
        <div className="flex items-center justify-between p-5 md:p-7 pb-3 md:pb-4 flex-shrink-0">
          <h2
            className="font-cyber text-xl md:text-2xl tracking-wider"
            style={{
              color: 'var(--cyan)',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
            }}
          >
             設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cyber-btn w-9 h-9 flex items-center justify-center p-0 transition-all"
            style={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'var(--text-secondary)',
            }}
            aria-label="關閉設定"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-5 md:px-7 pb-5 md:pb-7">
        {/* 主题皮肤设置 */}
        <div className="mb-6">
          <h3
            className="font-cyber text-sm md:text-base tracking-wider mb-3 md:mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
             主題皮膚
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {THEMES.map((t) => {
              const isActive = theme === t.id;
              const [c1, c2, c3] = t.previewColors;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeSelect(t.id)}
                  className="group relative flex flex-col rounded overflow-hidden transition-all duration-200 text-left"
                  style={{
                    border: `1px solid ${isActive ? t.previewColors[1] : 'color-mix(in srgb, var(--cyan) 20%, transparent)'}`,
                    boxShadow: isActive
                      ? `0 0 12px ${t.previewColors[1]}66, inset 0 0 10px ${t.previewColors[1]}22`
                      : 'none',
                    transform: 'translateY(0)',
                    background: 'var(--bg-dark)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 0 12px ${t.previewColors[1]}44`;
                      e.currentTarget.style.borderColor = t.previewColors[1];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--cyan) 20%, transparent)';
                    }
                  }}
                >
                  {/* 预览区 */}
                  <div
                    className="h-16 md:h-20 w-full"
                    style={{
                      background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
                    }}
                  />

                  {/* 选中勾选 */}
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: t.previewColors[1],
                        color: t.previewColors[0],
                        boxShadow: `0 0 8px ${t.previewColors[1]}aa`,
                      }}
                    >
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </div>
                  )}

                  {/* 文字区 */}
                  <div className="p-2 md:p-3">
                    <div
                      className="font-cyber text-sm md:text-base font-bold tracking-wide mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.name}
                    </div>
                    <div
                      className="text-xs leading-tight"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 無障礙設定區域 */}
        <div className="mb-6">
          <h3
            className="font-cyber text-sm md:text-base tracking-wider mb-3 md:mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            無障礙設定
          </h3>

          {/* 色盲模式開關 */}
          <div className="flex items-center justify-between mb-4 p-3 rounded" style={{
            background: 'var(--bg-mid)',
            border: '1px solid var(--border)',
          }}>
            <div>
              <div
                className="font-cyber text-sm font-bold tracking-wide mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                色盲模式（形狀區分）
              </div>
              <div
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                玩家棋子與地產色組增加形狀/紋理區分
              </div>
            </div>
            <button
              type="button"
              onClick={() => setColorblindMode(!colorblindMode)}
              className="relative w-12 h-6 rounded-full transition-all duration-300 cyber-btn"
              style={{
                borderColor: colorblindMode ? 'var(--green)' : 'rgba(255,255,255,0.2)',
                background: colorblindMode
                  ? 'linear-gradient(90deg, var(--green), var(--cyan))'
                  : 'var(--bg-dark)',
                boxShadow: colorblindMode
                  ? '0 0 10px rgba(0, 255, 136, 0.4), inset 0 0 6px rgba(0, 255, 136, 0.3)'
                  : 'none',
              }}
              aria-label={colorblindMode ? '關閉色盲模式' : '開啟色盲模式'}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                style={{
                  left: colorblindMode ? 'calc(100% - 22px)' : '2px',
                  boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                }}
              />
            </button>
          </div>

          {/* 字體大小調節 */}
          <div className="p-3 rounded" style={{
            background: 'var(--bg-mid)',
            border: '1px solid var(--border)',
          }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                <span
                  className="font-cyber text-sm font-bold tracking-wide"
                  style={{ color: 'var(--text-primary)' }}
                >
                  字體大小
                </span>
              </div>
              <span
                className="text-xs font-cyber"
                style={{ color: 'var(--cyan)' }}
              >
                {fontSize === 'small' ? '小' : fontSize === 'normal' ? '中' : fontSize === 'large' ? '大' : '超大'}
              </span>
            </div>
            <div className="flex gap-2">
              {(['small', 'normal', 'large', 'xlarge'] as const).map((size) => {
                const isActive = fontSize === size;
                const label = size === 'small' ? '小' : size === 'normal' ? '中' : size === 'large' ? '大' : '超大';
                const ariaLabel = size === 'small' ? '字體大小：小' : size === 'normal' ? '字體大小：中' : size === 'large' ? '字體大小：大' : '字體大小：超大';
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className="flex-1 py-2 rounded cyber-btn transition-all font-cyber text-sm tracking-wide"
                    style={{
                      borderColor: isActive ? 'var(--cyan)' : 'rgba(255,255,255,0.15)',
                      color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                      background: isActive
                        ? 'color-mix(in srgb, var(--cyan) 10%, transparent)'
                        : 'transparent',
                      boxShadow: isActive
                        ? '0 0 8px rgba(0, 255, 255, 0.25), inset 0 0 6px rgba(0, 255, 255, 0.1), 0 0 15px rgba(0, 255, 255, 0.15)'
                        : 'none',
                    }}
                    aria-label={ariaLabel}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 動畫效果 */}
        <div className="mb-6">
          <h3
            className="font-cyber text-sm md:text-base tracking-wider mb-3 md:mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            動畫效果
          </h3>

          <div className="flex items-center justify-between p-3 rounded" style={{
            background: 'var(--bg-mid)',
            border: '1px solid var(--border)',
          }}>
            <div>
              <div
                className="font-cyber text-sm font-bold tracking-wide mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                動畫與特效
              </div>
              <div
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                關閉可提升低端設備性能
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAnimationEnabled(!animationEnabled)}
              className="relative w-12 h-6 rounded-full transition-all duration-300 cyber-btn"
              style={{
                borderColor: animationEnabled ? 'var(--green)' : 'rgba(255,255,255,0.2)',
                background: animationEnabled
                  ? 'linear-gradient(90deg, var(--green), var(--cyan))'
                  : 'var(--bg-dark)',
                boxShadow: animationEnabled
                  ? '0 0 10px rgba(0, 255, 136, 0.4), inset 0 0 6px rgba(0, 255, 136, 0.3)'
                  : 'none',
              }}
              aria-label={animationEnabled ? '關閉動畫' : '開啟動畫'}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                style={{
                  left: animationEnabled ? 'calc(100% - 22px)' : '2px',
                  boxShadow: '0 0 6px rgba(255,255,255,0.5)',
                }}
              />
            </button>
          </div>

          <div className="mt-2 text-right">
            <span
              className="text-xs font-cyber tracking-wide"
              style={{ color: animationEnabled ? 'var(--green)' : 'var(--text-muted)' }}
            >
              {animationEnabled ? '開啟' : '關閉'}
            </span>
          </div>
        </div>

        {/* 新手引導 */}
        <div className="mb-6">
          <h3
            className="font-cyber text-sm md:text-base tracking-wider mb-3 md:mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            新手引導
          </h3>
          <div className="flex items-center justify-between p-3 rounded" style={{
            background: 'var(--bg-mid)',
            border: '1px solid var(--border)',
          }}>
            <div>
              <div
                className="font-cyber text-sm font-bold tracking-wide mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                重新觀看新手教學
              </div>
              <div
                className="text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                回到首頁並重新播放完整新手引導流程
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.removeItem('monopoly_tutorial_done');
                  localStorage.removeItem('monopoly_tutorial_prompted');
                  sessionStorage.removeItem('monopoly_tutorial_active');
                  sessionStorage.removeItem('monopoly_tutorial_step');
                } catch {
                  // ignore
                }
                onClose();
                navigate('/');
              }}
              className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wide transition-all"
              style={{
                borderColor: 'var(--cyan)',
                color: 'var(--cyan)',
                boxShadow: '0 0 8px rgba(0, 255, 255, 0.2), inset 0 0 6px rgba(0, 255, 255, 0.05)',
              }}
            >
              <GraduationCap className="w-4 h-4 inline align-middle mr-1" />
              重新觀看
            </button>
          </div>
        </div>

        {/* 語音播報區域 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3
              className="font-cyber text-sm md:text-base tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              語音播報
            </h3>
            <button
              type="button"
              onClick={() => {
                init();
                startBGM();
                toggleVoice();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded cyber-btn transition-all"
              style={{
                borderColor: voiceEnabled ? 'var(--green)' : 'rgba(255,255,255,0.2)',
                color: voiceEnabled ? 'var(--green)' : 'var(--text-secondary)',
                boxShadow: voiceEnabled ? '0 0 8px rgba(0, 255, 136, 0.3)' : 'none',
              }}
              aria-label={voiceEnabled ? '語音開' : '語音關'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="text-xs font-cyber tracking-wide">
                {voiceEnabled ? '已開啟' : '已關閉'}
              </span>
            </button>
          </div>

          <div
            className="grid grid-cols-2 gap-3 md:gap-4 transition-opacity duration-200"
            style={{ opacity: voiceEnabled ? 1 : 0.4, pointerEvents: voiceEnabled ? 'auto' : 'none' }}
          >
            {(Object.keys(VOICE_PACKS) as VoicePackType[]).map((packId) => {
              const pack = VOICE_PACKS[packId];
              const isActive = voicePack === packId;
              return (
                <div
                  key={packId}
                  className="group relative flex flex-col rounded overflow-hidden transition-all duration-200"
                  style={{
                    border: `1px solid ${isActive ? 'var(--cyan)' : 'color-mix(in srgb, var(--cyan) 20%, transparent)'}`,
                    boxShadow: isActive
                      ? '0 0 12px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)'
                      : 'none',
                    background: 'var(--bg-dark)',
                  }}
                >
                  {/* 選中標記 */}
                  {isActive && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
                      style={{
                        backgroundColor: 'var(--cyan)',
                        color: 'var(--bg-deep)',
                        boxShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
                      }}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}

                  {/* 資訊區 */}
                  <div className="p-3">
                    <div
                      className="font-cyber text-sm font-bold tracking-wide mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {pack.name}
                    </div>
                    <div
                      className="text-xs leading-tight mb-3"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {pack.description}
                    </div>

                    {/* 操作列 */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVoicePack(packId);
                        }}
                        className="flex-1 py-1.5 rounded text-xs font-cyber tracking-wide transition-all cyber-btn"
                        style={{
                          borderColor: isActive ? 'var(--cyan)' : 'rgba(255,255,255,0.15)',
                          color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                          boxShadow: isActive ? '0 0 6px rgba(0, 255, 255, 0.2)' : 'none',
                        }}
                      >
                        {isActive ? '使用中' : '選擇'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          init();
                          speak('歡迎來到賽博大富翁');
                        }}
                        className="cyber-btn px-3 py-1.5 rounded text-xs font-cyber tracking-wide transition-all"
                        style={{
                          borderColor: 'var(--pink)',
                          color: 'var(--pink)',
                          boxShadow: '0 0 6px rgba(255, 107, 157, 0.25)',
                        }}
                        aria-label="試聽"
                      >
                        試聽
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 幫助中心入口 */}
        <div className="mb-6">
          <h3
            className="font-cyber text-sm md:text-base tracking-wider mb-3 md:mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <BookOpen size={16} style={{ color: 'var(--cyan)' }} />
            幫助中心
          </h3>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="cyber-btn w-full py-3 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            style={{
              borderColor: 'var(--cyan)',
              color: 'var(--cyan)',
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.2), inset 0 0 10px rgba(0, 255, 255, 0.05)',
              background: 'color-mix(in srgb, var(--cyan) 8%, transparent)',
            }}
          >
            <span className="text-sm font-cyber" style={{ color: 'var(--cyan)' }}>說明</span>
            <span className="font-cyber tracking-wide text-sm md:text-base">規則說明與術語表</span>
          </button>
        </div>

        {/* 語言設定 */}
        <div className="mb-6">
          <h3
            className="font-cyber text-sm md:text-base tracking-wider mb-3 md:mb-4 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Globe size={16} style={{ color: 'var(--cyan)' }} />
            {t('common.language')}
          </h3>
          <LanguageSwitch />
        </div>

        {/* 公告中心入口 */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/announcements');
            }}
            className="cyber-btn w-full py-2.5 flex items-center gap-2 transition-all"
            style={{
              borderColor: 'var(--cyan)',
              color: 'var(--cyan)',
              boxShadow: '0 0 6px rgba(0, 255, 255, 0.15)',
            }}
          >
            <Megaphone size={16} />
            <span className="font-cyber tracking-wide text-sm">{t('common.announcement')}</span>
          </button>
        </div>

        {/* 安装应用 */}
        {canInstall && (
          <div className="mb-6 p-4 rounded-lg" style={{
            border: '1px solid var(--border-neon-pink)',
            background: 'color-mix(in srgb, var(--pink) 8%, transparent)',
          }}>
            <h3
              className="font-cyber text-sm md:text-base tracking-wider mb-2"
              style={{ color: 'var(--pink)' }}
            >
               安裝應用
            </h3>
            <p
              className="text-xs mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
               將賽博大富翁添加到主畫面，享受離線暢玩體驗
            </p>
            <button
              type="button"
              disabled={installing}
              onClick={async () => {
                setInstalling(true);
                const accepted = await promptInstall();
                if (accepted) {
                   toast.success('安裝成功！');
                }
                setInstalling(false);
              }}
              className="cyber-btn w-full flex items-center justify-center gap-2 py-2.5"
              style={{
                borderColor: 'var(--pink)',
                color: 'var(--pink)',
                boxShadow: '0 0 10px rgba(255, 0, 255, 0.3)',
              }}
            >
              <Download className="w-4 h-4" />
              <span className="font-cyber tracking-wide text-sm">
                 添加到主畫面
              </span>
            </button>
          </div>
        )}

        {/* 反作弊狀態 */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--green)', boxShadow: '0 0 4px var(--green)' }}
          />
          <span
            className="text-[10px] font-cyber tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            <Shield size={10} className="inline mr-1" />
            {t('common.antiCheatEnabled')}
          </span>
        </div>

        {/* 管理後台入口（低調） */}
        <div className="mb-2 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/admin');
            }}
            className="text-[10px] font-cyber tracking-wider transition-colors hover:opacity-100"
            style={{ color: 'var(--text-muted)' }}
          >
            維修 {t('common.admin')}
          </button>
        </div>

        </div>
        {/* 滚动内容区 結束 */}

        {/* 底部版本信息 */}
        <div className="mt-auto pt-4 px-5 md:px-7 pb-5 md:pb-7 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <p
            className="text-xs font-cyber tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
             賽博大富翁 v1.0 · CYBER MONOPOLY
          </p>
        </div>
      </div>

      {/* 幫助中心彈窗 */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ animation: 'fade-in 0.2s ease-out' }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setHelpOpen(false)}
          />
          <div
            className="cyber-card relative w-full flex flex-col overflow-hidden"
            style={{
              maxWidth: '560px',
              maxHeight: '80vh',
              borderColor: 'var(--border-neon-cyan)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.25), inset 0 0 20px rgba(0, 255, 255, 0.05)',
              animation: 'fade-in 0.25s ease-out',
              background: 'var(--bg-dark)',
            }}
          >
            {/* 頂部裝飾線 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan)] to-transparent" />

            {/* 標題欄 */}
            <div className="flex items-center justify-between p-4 md:p-5 pb-3">
              <h2
                className="font-cyber text-xl md:text-2xl tracking-wider"
                style={{
                  color: 'var(--cyan)',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
                }}
              >
                幫助中心
              </h2>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                className="cyber-btn w-9 h-9 flex items-center justify-center p-0 transition-all"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'var(--text-secondary)',
                }}
                aria-label="關閉幫助中心"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* 搜尋框 */}
            <div className="px-4 md:px-5 pb-3">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <input
                  type="text"
                  value={helpSearch}
                  onChange={(e) => setHelpSearch(e.target.value)}
                  placeholder="輸入關鍵字搜尋..."
                  className="cyber-btn w-full pl-9 pr-3 py-2 text-sm outline-none transition-all"
                  style={{
                    borderColor: helpSearch ? 'var(--cyan)' : 'var(--border-neon-cyan)',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-mid)',
                    boxShadow: helpSearch ? '0 0 8px rgba(0, 255, 255, 0.2)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* 分類 Tab */}
            <div
              className="flex items-center gap-1 px-4 md:px-5 pb-0 border-b overflow-x-auto"
              style={{ borderColor: 'var(--border)' }}
            >
              {(Object.keys(helpCategories) as HelpCategoryKey[]).map((key) => {
                const cat = helpCategories[key];
                const isActive = !helpSearch && helpTab === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setHelpTab(key);
                      setHelpSearch('');
                    }}
                    className="relative px-3 py-2 whitespace-nowrap transition-all font-cyber text-xs md:text-sm tracking-wide"
                    style={{
                      color: isActive ? cat.color : 'var(--text-secondary)',
                      textShadow: isActive ? `0 0 8px ${cat.color}aa` : 'none',
                    }}
                  >
                    {cat.label}
                    {isActive && (
                      <span
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                        style={{
                          backgroundColor: cat.color,
                          boxShadow: `0 0 6px ${cat.color}`,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* 內容區 */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5">
              {filteredHelpEntries().length === 0 ? (
                <div
                  className="text-center py-10 text-sm font-cyber tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  找不到相關內容
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHelpEntries().map((entry, idx) => {
                    const cat = helpCategories[entry.category];
                    return (
                      <div
                        key={`${entry.category}-${idx}`}
                        className="p-3 rounded transition-all"
                        style={{
                          border: '1px solid color-mix(in srgb, var(--cyan) 15%, transparent)',
                          background: 'var(--bg-mid)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {helpSearch && (
                            <span
                              className="text-[10px] font-cyber tracking-wider px-1.5 py-0.5 rounded"
                              style={{
                                color: cat.color,
                                border: `1px solid color-mix(in srgb, ${cat.color} 40%, transparent)`,
                                background: `color-mix(in srgb, ${cat.color} 10%, transparent)`,
                              }}
                            >
                              {cat.label}
                            </span>
                          )}
                          <h4
                            className="font-cyber text-sm font-bold tracking-wide"
                            style={{
                              color: 'var(--cyan)',
                              textShadow: '0 0 6px rgba(0, 255, 255, 0.4)',
                            }}
                          >
                            {entry.title}
                          </h4>
                        </div>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {entry.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;
