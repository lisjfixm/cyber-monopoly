import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Star,
  Trash2,
  Edit,
  Plus,
  Copy,
  Check,
  Code,
  Package,
  Sparkles,
  AlertTriangle,
  Zap,
  Heart,
  Gift,
  Coins,
  Crown,
  FastForward,
  Grid3X3,
  MinusCircle,
  CloudRain,
  Stars,
  TrendingUp,
  Gamepad2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { BUILTIN_MODS } from '@shared/game-config';
import type { Mod, ModCard, ModProperty, ModRules } from '@shared/api.interface';
import {
  loadInstalledMods,
  saveInstalledMods,
  loadEnabledModIds,
  saveEnabledModIds,
  encodeModToCode,
  decodeModFromCode,
  isValidMod,
} from '@client/src/utils/mod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import RatingReviewSection from '@client/src/components/RatingReviewSection';
import {
  getReviews,
  submitRating,
  addReview,
  likeReview,
  getAverageRating,
  getTotalReviews,
  sortByFeatured,
  getAuthorScore,
  type ReviewItem,
} from '@client/src/utils/reviewStorage';

type TabType = 'installed' | 'market' | 'create';
type ModCategory = 'all' | 'gameplay' | 'visual';

// Built-in game rule & visual mods (追加到已安裝清單)
const BUILTIN_GAMEPLAY_MODS: Mod[] = [
  { id: 'builtin_quick_mode', name: '快速模式', description: '回合時間限制30秒，遊戲節奏加快', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'Zap', conflictsWith: ['builtin_time_accel'], rules: {} },
  { id: 'builtin_infinite_fate', name: '無限命運', description: '每輪都抽取命運卡', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'Sparkles' },
  { id: 'builtin_crazy_prices', name: '瘋狂地價', description: '地產價格×2，租金×3', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'TrendingUp', rules: { rentMultiplier: 3.0 } },
  { id: 'builtin_pacifist', name: '和平主義', description: '取消所有負面事件，只有好事件', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'Heart', conflictsWith: ['builtin_random_surprise'] },
  { id: 'builtin_random_surprise', name: '隨機驚喜', description: '每回合隨機觸發一個特殊效果', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'Gift', conflictsWith: ['builtin_pacifist'] },
  { id: 'builtin_underdog', name: '窮人逆襲', description: '初始資產低的玩家每回合額外補貼', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'Coins' },
  { id: 'builtin_monopoly', name: '資本壟斷', description: '同一顏色地產租金翻倍效果×2', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'Crown' },
  { id: 'builtin_time_accel', name: '時間加速', description: '骰子移動力+2', version: '1.0.0', author: '內建', category: 'gameplay', isBuiltin: true, iconKey: 'FastForward', conflictsWith: ['builtin_quick_mode'] },
];

const BUILTIN_VISUAL_MODS: Mod[] = [
  { id: 'builtin_retro_pixel', name: '懷舊像素風', description: '復古像素畫質', version: '1.0.0', author: '內建', category: 'visual', isBuiltin: true, iconKey: 'Grid3X3' },
  { id: 'builtin_minimal', name: '極簡模式', description: '關閉所有特效，提升性能', version: '1.0.0', author: '內建', category: 'visual', isBuiltin: true, iconKey: 'MinusCircle' },
  { id: 'builtin_rainy', name: '雨天效果', description: '背景下雨動畫', version: '1.0.0', author: '內建', category: 'visual', isBuiltin: true, iconKey: 'CloudRain' },
  { id: 'builtin_starry_night', name: '星空夜晚', description: '背景星空+流星', version: '1.0.0', author: '內建', category: 'visual', isBuiltin: true, iconKey: 'Stars' },
];

const ALL_BUILTIN_MODS: Mod[] = [...BUILTIN_GAMEPLAY_MODS, ...BUILTIN_VISUAL_MODS];

const iconMap: Record<string, FC<{ size?: number }>> = {
  Zap,
  Sparkles,
  Heart,
  Gift,
  Coins,
  Crown,
  FastForward,
  TrendingUp,
  Grid3X3,
  MinusCircle,
  CloudRain,
  Stars,
  Package,
  Gamepad2,
  Eye,
};

function getModIcon(mod: Mod): FC<{ size?: number }> {
  if (mod.iconKey && iconMap[mod.iconKey]) return iconMap[mod.iconKey];
  return Package;
}

// Mock community mods
const COMMUNITY_MODS: Mod[] = [
  {
    id: 'neon_bloom',
    name: '霓虹綻放',
    description: '增加霓虹節日事件觸發機率，起點獎勵提升50%',
    version: '1.2.0',
    author: 'NeonHacker',
    rules: {
      passStartBonus: 2250,
    },
  },
  {
    id: 'cyberpunk_story',
    name: '賽博龐克劇情',
    description: '新增10張命運卡，講述一個賽博朋克世界的故事',
    version: '2.0.1',
    author: 'StoryWeaver',
    cards: [
      { id: 'cs1', type: 'fate', name: '覺醒', description: '你發現了真相，獲得勇氣 +2000元', effect: { type: 'money', value: 2000 } },
      { id: 'cs2', type: 'fate', name: '追捕', description: '被企業獵人追捕，損失1000元', effect: { type: 'money', value: -1000 } },
      { id: 'cs3', type: 'fate', name: '義體升級', description: '你的義體獲得升級', effect: { type: 'move', value: 2 } },
    ],
  },
  {
    id: 'property_king',
    name: '地產之王',
    description: '所有地塊價格降低20%，建造費用減半',
    version: '1.0.0',
    author: 'TycoonPro',
    rules: {
      rentMultiplier: 0.8,
    },
  },
  {
    id: 'speed_demon',
    name: '極速惡魔',
    description: '遊戲節奏加快，起始金錢減半但過路費翻倍',
    version: '1.1.0',
    author: 'SpeedRunner',
    rules: {
      startMoney: 7500,
      rentMultiplier: 2.0,
    },
  },
];

const SAMPLE_MOD_TEMPLATE = `{
  "id": "my_custom_mod",
  "name": "我的自訂模組",
  "description": "這是一個範例模組，你可以自由修改",
  "version": "1.0.0",
  "author": "你的名字",
  "rules": {
    "startMoney": 20000,
    "rentMultiplier": 1.5
  },
  "cards": [
    {
      "id": "my_card_1",
      "type": "fate",
      "name": "神秘獎勵",
      "description": "獲得一筆神秘獎金",
      "effect": { "type": "money", "value": 1500 }
    }
  ]
}`;

function ModCardComponent({
  mod,
  isInstalled,
  isEnabled,
  onToggle,
  onDelete,
  onEdit,
  onInstall,
  showInstallButton = false,
  downloadCount,
  rating,
  isFeatured = false,
  conflictWithName,
}: {
  mod: Mod;
  isInstalled: boolean;
  isEnabled: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onInstall?: () => void;
  showInstallButton?: boolean;
  downloadCount?: number;
  rating?: number;
  isFeatured?: boolean;
  conflictWithName?: string | null;
}) {
  const Icon = getModIcon(mod);
  const borderColor = isFeatured
    ? 'var(--yellow, #facc15)'
    : isEnabled
      ? 'color-mix(in srgb, var(--green) 40%, transparent)'
      : 'color-mix(in srgb, var(--cyan) 20%, transparent)';
  const boxShadow = isFeatured
    ? '0 0 18px rgba(250, 204, 21, 0.3)'
    : isEnabled
      ? '0 0 12px rgba(0, 255, 128, 0.2)'
      : 'none';

  const categoryLabel = mod.category === 'gameplay' ? '遊戲規則' : mod.category === 'visual' ? '視覺美化' : null;
  const categoryColor = mod.category === 'gameplay' ? 'var(--cyan)' : mod.category === 'visual' ? 'var(--pink)' : 'var(--text-secondary)';

  return (
    <div
      className="cyber-card p-4 flex flex-col gap-3"
      style={{
        borderColor,
        boxShadow,
      }}
    >
      {isFeatured && (
        <div className="flex items-center gap-1 text-xs font-cyber tracking-wider" style={{ color: 'var(--yellow, #facc15)' }}>
          <Sparkles size={12} />
          置頂精選
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm"
            style={{
              border: `1px solid ${mod.isBuiltin ? 'var(--purple)' : 'var(--cyan)'}`,
              color: mod.isBuiltin ? 'var(--purple)' : 'var(--cyan)',
              backgroundColor: mod.isBuiltin ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0, 255, 255, 0.08)',
              boxShadow: `0 0 8px ${mod.isBuiltin ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 255, 255, 0.2)'}`,
            }}
          >
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-cyber text-base text-neon-cyan tracking-wider truncate">
              {mod.name}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              v{mod.version} · {mod.author}
            </div>
          </div>
        </div>
        {isEnabled && (
          <span
            className="text-xs px-2 py-0.5 font-cyber tracking-wider rounded-sm flex-shrink-0"
            style={{
              color: 'var(--green)',
              border: '1px solid var(--green)',
              backgroundColor: 'rgba(0, 255, 128, 0.1)',
            }}
          >
            啟用中
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--text-primary)] line-clamp-2">
        {mod.description}
      </p>

      {mod.cards && mod.cards.length > 0 && (
        <div className="text-xs text-[var(--text-secondary)]">
          自訂卡：{mod.cards.length} 張
        </div>
      )}
      {mod.rules && (
        <div className="text-xs text-[var(--text-secondary)]">
          自訂規則
        </div>
      )}
      {mod.properties && mod.properties.length > 0 && (
        <div className="text-xs text-[var(--text-secondary)]">
          自訂地塊：{mod.properties.length} 個
        </div>
      )}

      {downloadCount !== undefined && rating !== undefined && (
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1">
            <Download size={12} />
            {downloadCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
            <Star size={12} fill="currentColor" />
            {rating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Conflict warning */}
      {conflictWithName && (
        <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-sm" style={{ color: 'var(--red)', border: '1px solid var(--red)', backgroundColor: 'rgba(255, 77, 77, 0.08)' }}>
          <AlertCircle size={12} />
          <span>與「{conflictWithName}」不相容</span>
        </div>
      )}

      {/* Category badge + actions */}
      <div className="flex items-center gap-2 mt-auto pt-2">
        {categoryLabel && (
          <span
            className="text-[10px] px-2 py-0.5 font-cyber tracking-wider rounded-sm"
            style={{
              color: categoryColor,
              border: `1px solid ${categoryColor}`,
              backgroundColor: `${categoryColor}10`,
            }}
          >
            {categoryLabel}
          </span>
        )}
        <div className="flex-1" />
        {showInstallButton ? (
          <button
            type="button"
            onClick={onInstall}
            disabled={isInstalled}
            className="cyber-btn flex-1 py-1.5 text-sm font-cyber tracking-wider"
            style={{
              borderColor: isInstalled ? 'var(--text-muted)' : 'var(--green)',
              color: isInstalled ? 'var(--text-muted)' : 'var(--green)',
              backgroundColor: isInstalled ? 'transparent' : 'rgba(0, 255, 128, 0.08)',
              cursor: isInstalled ? 'not-allowed' : 'pointer',
            }}
          >
            {isInstalled ? '已安裝' : '安裝'}
          </button>
        ) : (
          <>
            {/* Neon toggle switch */}
            <button
              type="button"
              onClick={onToggle}
              className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
              style={{
                backgroundColor: isEnabled ? 'rgba(0, 255, 128, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: `1px solid ${isEnabled ? 'var(--green)' : 'rgba(255, 255, 255, 0.15)'}`,
                boxShadow: isEnabled ? '0 0 10px rgba(0, 255, 128, 0.5), inset 0 0 5px rgba(0, 255, 128, 0.3)' : 'none',
              }}
              aria-label={isEnabled ? '停用' : '啟用'}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-300"
                style={{
                  left: isEnabled ? 'calc(100% - 20px)' : '2px',
                  backgroundColor: isEnabled ? 'var(--green)' : 'var(--text-secondary)',
                  boxShadow: isEnabled ? '0 0 8px var(--green), 0 0 16px var(--green)' : 'none',
                }}
              />
            </button>
            {onEdit && !mod.isBuiltin && (
              <button
                type="button"
                onClick={onEdit}
                className="cyber-btn p-1.5"
                style={{ borderColor: 'var(--yellow)', color: 'var(--yellow)' }}
                aria-label="編輯"
              >
                <Edit size={14} />
              </button>
            )}
            {onDelete && !mod.isBuiltin && (
              <button
                type="button"
                onClick={onDelete}
                className="cyber-btn p-1.5"
                style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                aria-label="刪除"
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const ModManagerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('installed');
  const [installedMods, setInstalledMods] = useState<Mod[]>([]);
  const [enabledIds, setEnabledIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<ModCategory>('all');

  // Import dialog
  const [showImport, setShowImport] = useState<boolean>(false);
  const [importCode, setImportCode] = useState<string>('');
  const [importError, setImportError] = useState<string>('');

  // Create mod
  const [editorText, setEditorText] = useState<string>(SAMPLE_MOD_TEMPLATE);
  const [parseError, setParseError] = useState<string>('');
  const [parsedMod, setParsedMod] = useState<Mod | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Mod | null>(null);

  // Mod detail dialog
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);
  const [modReviews, setModReviews] = useState<ReviewItem[]>([]);
  const [modAvgRating, setModAvgRating] = useState<number>(0);
  const [modTotalReviews, setModTotalReviews] = useState<number>(0);

  // Load from storage
  useEffect(() => {
    setInstalledMods(loadInstalledMods());
    setEnabledIds(loadEnabledModIds());
  }, []);

  const persistMods = useCallback((mods: Mod[]) => {
    setInstalledMods(mods);
    saveInstalledMods(mods);
  }, []);

  const persistEnabled = useCallback((ids: string[]) => {
    setEnabledIds(ids);
    saveEnabledModIds(ids);
  }, []);

  // Refs for use inside toggleMod (avoid circular deps)
  const getAllInstalledModsRef = useRef<Mod[]>([]);

  const toggleMod = useCallback((modId: string) => {
    setEnabledIds((prev) => {
      const isCurrentlyEnabled = prev.includes(modId);
      let next: string[];
      if (isCurrentlyEnabled) {
        next = prev.filter((id: string) => id !== modId);
      } else {
        const allMods = getAllInstalledModsRef.current ?? [];
        const targetMod = allMods.find((m: Mod) => m.id === modId);
        const conflicts = targetMod?.conflictsWith ?? [];
        const filtered = prev.filter((id: string) => !conflicts.includes(id));
        next = [...filtered, modId];
      }
      saveEnabledModIds(next);
      return next;
    });
  }, []);

  const deleteMod = useCallback((modId: string) => {
    setInstalledMods((prev) => {
      const next = prev.filter((m: Mod) => m.id !== modId);
      saveInstalledMods(next);
      return next;
    });
    setEnabledIds((prev) => {
      const next = prev.filter((id: string) => id !== modId);
      saveEnabledModIds(next);
      return next;
    });
  }, []);

  const installMod = useCallback((mod: Mod) => {
    setInstalledMods((prev) => {
      if (prev.some((m: Mod) => m.id === mod.id)) return prev;
      const next = [...prev, mod];
      saveInstalledMods(next);
      return next;
    });
  }, []);

  const handleImport = useCallback(() => {
    setImportError('');
    const mod = decodeModFromCode(importCode);
    if (!mod) {
      setImportError('無效的模組碼，請檢查格式');
      return;
    }
    if (installedMods.some((m: Mod) => m.id === mod.id)) {
      setImportError('已存在相同ID的模組');
      return;
    }
    persistMods([...installedMods, mod]);
    setImportCode('');
    setShowImport(false);
  }, [importCode, installedMods, persistMods]);

  // Editor validation
  useEffect(() => {
    try {
      const parsed = JSON.parse(editorText);
      if (isValidMod(parsed)) {
        setParsedMod(parsed as Mod);
        setParseError('');
      } else {
        setParsedMod(null);
        setParseError('模組格式不正確，請檢查必填欄位');
      }
    } catch (err) {
      setParsedMod(null);
      const message = err instanceof Error ? err.message : '語法錯誤';
      setParseError(message);
    }
  }, [editorText]);

  const handleGenerateCode = useCallback(() => {
    if (!parsedMod) return;
    const code = encodeModToCode(parsedMod);
    setGeneratedCode(code);
  }, [parsedMod]);

  const handleCopyCode = useCallback(async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [generatedCode]);

  const handleSaveLocal = useCallback(() => {
    if (!parsedMod) return;
    const exists = installedMods.some((m: Mod) => m.id === parsedMod.id);
    if (exists) {
      // Update existing
      const next = installedMods.map((m: Mod) => (m.id === parsedMod.id ? parsedMod : m));
      persistMods(next);
    } else {
      persistMods([...installedMods, parsedMod]);
    }
  }, [parsedMod, installedMods, persistMods]);

  const loadTemplate = useCallback(() => {
    setEditorText(SAMPLE_MOD_TEMPLATE);
  }, []);

  const handleEditorChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEditorText(e.target.value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Market data
  const allMarketMods = useMemo(() => {
    return [...BUILTIN_MODS, ...COMMUNITY_MODS];
  }, []);

  const filteredMarketMods = useMemo(() => {
    const filtered = searchQuery.trim()
      ? allMarketMods.filter(
          (m: Mod) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : allMarketMods;
    return sortByFeatured(filtered, 'mod');
  }, [allMarketMods, searchQuery]);

  const installedIds = useMemo(
    () => new Set(installedMods.map((m: Mod) => m.id)),
    [installedMods],
  );

  const enableMarketMods = useMemo(() => new Set(enabledIds), [enabledIds]);

  // Get conflict mod name for display
  const getConflictName = useCallback((mod: Mod, enabled: Set<string>): string | null => {
    if (!mod.conflictsWith || mod.conflictsWith.length === 0) return null;
    const allMods = [...BUILTIN_GAMEPLAY_MODS, ...BUILTIN_VISUAL_MODS, ...installedMods];
    for (const cid of mod.conflictsWith) {
      if (enabled.has(cid)) {
        const conflictMod = allMods.find((m: Mod) => m.id === cid);
        if (conflictMod) return conflictMod.name;
      }
    }
    return null;
  }, [installedMods]);

  const loadModReviews = useCallback((modId: string) => {
    const data = getReviews('mod', modId);
    setModReviews(data.reviews);
    setModAvgRating(getAverageRating('mod', modId));
    setModTotalReviews(getTotalReviews('mod', modId));
  }, []);

  const handleModRate = useCallback((score: number) => {
    if (!selectedMod) return;
    submitRating('mod', selectedMod.id, 'local_user', score);
    loadModReviews(selectedMod.id);
  }, [selectedMod, loadModReviews]);

  const handleModAddReview = useCallback((text: string) => {
    if (!selectedMod) return;
    const newReview: ReviewItem = {
      id: `review_${Date.now()}`,
      author: '我',
      authorScore: 200,
      content: text,
      score: 5,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    addReview('mod', selectedMod.id, newReview);
    loadModReviews(selectedMod.id);
  }, [selectedMod, loadModReviews]);

  const handleModLikeReview = useCallback((reviewId: string) => {
    if (!selectedMod) return;
    likeReview('mod', selectedMod.id, reviewId);
    loadModReviews(selectedMod.id);
  }, [selectedMod, loadModReviews]);

  const openModDetail = useCallback((mod: Mod) => {
    setSelectedMod(mod);
    loadModReviews(mod.id);
  }, [loadModReviews]);

  // Download/rating mock data
  const getMarketStats = (modId: string) => {
    const hash = modId.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    return {
      downloads: 1000 + (hash * 37) % 50000,
      rating: 3.5 + (hash % 15) / 10,
    };
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{
            borderColor: 'var(--cyan)',
            color: 'var(--cyan)',
          }}
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          模組管理
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 max-w-2xl w-full mx-auto">
        {[
          { key: 'installed' as TabType, label: '已安裝', icon: Package },
          { key: 'market' as TabType, label: '模組市集', icon: Sparkles },
          { key: 'create' as TabType, label: '建立模組', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
              style={{
                borderColor: isActive ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                boxShadow: isActive ? '0 0 12px rgba(0, 255, 255, 0.3)' : 'none',
              }}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl w-full mx-auto pb-8">
        {/* Tab: Installed */}
        {activeTab === 'installed' && (
          <div className="space-y-4">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { key: 'all' as ModCategory, label: '全部', color: 'var(--cyan)' },
                { key: 'gameplay' as ModCategory, label: '遊戲規則', color: 'var(--cyan)' },
                { key: 'visual' as ModCategory, label: '視覺美化', color: 'var(--pink)' },
              ].map((cat) => {
                const isActive = categoryFilter === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategoryFilter(cat.key)}
                    className="cyber-btn cyber-btn-sm px-4 py-1.5 text-xs font-cyber tracking-wider"
                    style={{
                      borderColor: isActive ? cat.color : 'rgba(255, 255, 255, 0.1)',
                      color: isActive ? cat.color : 'var(--text-secondary)',
                      backgroundColor: isActive ? `${cat.color}15` : 'transparent',
                      boxShadow: isActive ? `0 0 10px ${cat.color}40` : 'none',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Built-in + installed combined list */}
            {(() => {
              const allMods = [...ALL_BUILTIN_MODS, ...installedMods];
              const filtered = categoryFilter === 'all'
                ? allMods
                : allMods.filter((m: Mod) => m.category === categoryFilter);
              const enabled = new Set(enabledIds);

              // Update ref for toggleMod
              getAllInstalledModsRef.current = allMods;

              if (filtered.length === 0) {
                return (
                  <div
                    className="cyber-card p-8 text-center"
                    style={{ borderColor: 'color-mix(in srgb, var(--cyan) 20%, transparent)' }}
                  >
                    <Package size={48} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                    <div className="text-[var(--text-secondary)] font-cyber tracking-wider mb-4">
                      此分類暫無模組
                    </div>
                  </div>
                );
              }

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((mod: Mod) => (
                      <ModCardComponent
                        key={mod.id}
                        mod={mod}
                        isInstalled
                        isEnabled={enabled.has(mod.id)}
                        onToggle={() => toggleMod(mod.id)}
                        onDelete={mod.isBuiltin ? undefined : () => setDeleteTarget(mod)}
                        conflictWithName={getConflictName(mod, enabled)}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] text-center mt-2">
                    已啟用 {enabledIds.length} / {allMods.length} 個模組
                  </div>
                </>
              );
            })()}

            <button
              type="button"
              onClick={() => setShowImport(true)}
              className="cyber-btn w-full py-3 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
              style={{
                borderColor: 'var(--purple)',
                color: 'var(--purple)',
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
              }}
            >
              <Plus size={16} />
              匯入模組碼
            </button>
          </div>
        )}

        {/* Tab: Market */}
        {activeTab === 'market' && (
          <div className="space-y-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-secondary)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="搜尋模組名稱、作者..."
                className="cyber-input w-full pl-10"
                style={{ borderColor: 'color-mix(in srgb, var(--cyan) 30%, transparent)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarketMods.map((mod) => {
                const stats = getMarketStats(mod.id);
                return (
                  <div key={mod.id} className="flex flex-col gap-2">
                    <ModCardComponent
                      mod={mod}
                      isInstalled={installedIds.has(mod.id)}
                      isEnabled={enableMarketMods.has(mod.id)}
                      onInstall={() => installMod(mod)}
                      showInstallButton
                      downloadCount={stats.downloads}
                      rating={stats.rating}
                      isFeatured={mod.isFeatured}
                    />
                    <button
                      type="button"
                      onClick={() => openModDetail(mod)}
                      className="cyber-btn cyber-btn-sm text-xs font-cyber tracking-wider w-full"
                      style={{
                        borderColor: 'var(--purple)',
                        color: 'var(--purple)',
                        backgroundColor: 'rgba(168, 85, 247, 0.08)',
                      }}
                    >
                      查看詳情
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredMarketMods.length === 0 && (
              <div
                className="cyber-card p-8 text-center"
                style={{ borderColor: 'color-mix(in srgb, var(--cyan) 20%, transparent)' }}
              >
                <Search size={40} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
                <div className="text-[var(--text-secondary)] font-cyber tracking-wider">
                  找不到符合條件的模組
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Create */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-cyber tracking-wider text-[var(--text-secondary)]">
                JSON 編輯器
              </div>
              <button
                type="button"
                onClick={loadTemplate}
                className="cyber-btn px-3 py-1 text-xs font-cyber tracking-wider"
                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
              >
                載入範本
              </button>
            </div>

            <textarea
              value={editorText}
              onChange={handleEditorChange}
              spellCheck={false}
              className="w-full h-80 p-3 font-mono text-xs md:text-sm resize-none cyber-input"
              style={{
                borderColor: parseError
                  ? 'color-mix(in srgb, var(--red) 50%, transparent)'
                  : 'color-mix(in srgb, var(--cyan) 30%, transparent)',
                backgroundColor: 'hsl(240, 20%, 8%)',
                color: parseError ? 'var(--red)' : 'var(--text-primary)',
              }}
            />

            {parseError && (
              <div
                className="flex items-start gap-2 p-3 text-sm"
                style={{
                  color: 'var(--red)',
                  border: '1px solid var(--red)',
                  backgroundColor: 'rgba(255, 77, 77, 0.08)',
                }}
              >
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{parseError}</span>
              </div>
            )}

            {parsedMod && (
              <div
                className="cyber-card p-4"
                style={{ borderColor: 'color-mix(in srgb, var(--green) 30%, transparent)' }}
              >
                <div className="font-cyber text-sm tracking-wider text-neon-green mb-2">
                  模組預覽
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">名稱：</span>
                    <span className="text-neon-cyan">{parsedMod.name}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">作者：</span>
                    {parsedMod.author}
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">版本：</span>
                    v{parsedMod.version}
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">描述：</span>
                    {parsedMod.description}
                  </div>
                  {parsedMod.cards && parsedMod.cards.length > 0 && (
                    <div>
                      <span className="text-[var(--text-secondary)]">自訂卡：</span>
                      {parsedMod.cards.length} 張
                    </div>
                  )}
                  {parsedMod.properties && parsedMod.properties.length > 0 && (
                    <div>
                      <span className="text-[var(--text-secondary)]">自訂地塊：</span>
                      {parsedMod.properties.length} 個
                    </div>
                  )}
                  {parsedMod.rules && (
                    <div>
                      <span className="text-[var(--text-secondary)]">自訂規則：</span>
                      已設定
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSaveLocal}
                disabled={!parsedMod}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
                style={{
                  borderColor: parsedMod ? 'var(--green)' : 'var(--text-muted)',
                  color: parsedMod ? 'var(--green)' : 'var(--text-muted)',
                  backgroundColor: parsedMod ? 'rgba(0, 255, 128, 0.08)' : 'transparent',
                  cursor: parsedMod ? 'pointer' : 'not-allowed',
                }}
              >
                <Download size={16} />
                保存到本地
              </button>
              <button
                type="button"
                onClick={handleGenerateCode}
                disabled={!parsedMod}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
                style={{
                  borderColor: parsedMod ? 'var(--purple)' : 'var(--text-muted)',
                  color: parsedMod ? 'var(--purple)' : 'var(--text-muted)',
                  backgroundColor: parsedMod ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
                  cursor: parsedMod ? 'pointer' : 'not-allowed',
                }}
              >
                <Code size={16} />
                生成模組碼
              </button>
            </div>

            {generatedCode && (
              <div
                className="cyber-card p-4"
                style={{ borderColor: 'color-mix(in srgb, var(--purple) 30%, transparent)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-cyber text-sm tracking-wider" style={{ color: 'var(--purple)' }}>
                    模組碼
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="cyber-btn px-2 py-1 text-xs font-cyber tracking-wider flex items-center gap-1"
                    style={{
                      borderColor: copied ? 'var(--green)' : 'var(--cyan)',
                      color: copied ? 'var(--green)' : 'var(--cyan)',
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? '已複製' : '複製'}
                  </button>
                </div>
                <div
                  className="p-3 text-xs font-mono break-all max-h-32 overflow-y-auto"
                  style={{
                    backgroundColor: 'hsl(240, 20%, 8%)',
                    border: '1px solid color-mix(in srgb, var(--purple) 20%, transparent)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {generatedCode}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogContent
          className="cyber-card max-w-md"
          style={{
            borderColor: 'var(--purple)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-cyber text-xl tracking-wider"
              style={{ color: 'var(--purple)', textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}
            >
              匯入模組碼
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-secondary)]">
              貼上 base64 編碼的模組碼以安裝新模組
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={importCode}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setImportCode(e.target.value)}
            placeholder="貼上模組碼..."
            spellCheck={false}
            className="w-full h-32 p-3 font-mono text-xs resize-none cyber-input"
            style={{
              borderColor: importError
                ? 'color-mix(in srgb, var(--red) 50%, transparent)'
                : 'color-mix(in srgb, var(--purple) 30%, transparent)',
              backgroundColor: 'hsl(240, 20%, 8%)',
              color: importError ? 'var(--red)' : 'var(--text-primary)',
            }}
          />

          {importError && (
            <div className="text-sm" style={{ color: 'var(--red)' }}>
              {importError}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                setShowImport(false);
                setImportCode('');
                setImportError('');
              }}
              className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
              style={{
                borderColor: 'var(--purple)',
                color: 'var(--purple)',
                backgroundColor: 'rgba(168, 85, 247, 0.08)',
              }}
            >
              匯入
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mod Detail Dialog */}
      <Dialog
        open={!!selectedMod}
        onOpenChange={(open) => !open && setSelectedMod(null)}
      >
        <DialogContent
          className="cyber-card max-w-2xl max-h-[85vh] overflow-y-auto"
          style={{
            borderColor: 'var(--purple)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
        >
          {selectedMod && (
            <>
              <DialogHeader>
                <DialogTitle
                  className="font-cyber text-xl tracking-wider"
                  style={{ color: 'var(--purple)', textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}
                >
                  {selectedMod.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-[var(--text-secondary)]">
                  v{selectedMod.version} · by {selectedMod.author} ·{' '}
                  {getAuthorScore(selectedMod.author, allMarketMods.map((m: Mod) => ({
                    author: m.author,
                    likes: getMarketStats(m.id).downloads,
                    downloads: getMarketStats(m.id).downloads,
                  })))} 積分
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {selectedMod.description}
                </div>

                {selectedMod.cards && selectedMod.cards.length > 0 && (
                  <div className="text-xs text-[var(--text-secondary)]">
                    自訂卡：{selectedMod.cards.length} 張
                  </div>
                )}
                {selectedMod.rules && (
                  <div className="text-xs text-[var(--text-secondary)]">
                    自訂規則：已設定
                  </div>
                )}
                {selectedMod.properties && selectedMod.properties.length > 0 && (
                  <div className="text-xs text-[var(--text-secondary)]">
                    自訂地塊：{selectedMod.properties.length} 個
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    installMod(selectedMod);
                  }}
                  disabled={installedIds.has(selectedMod.id)}
                  className="cyber-btn w-full py-2.5 text-sm font-cyber tracking-wider"
                  style={{
                    borderColor: installedIds.has(selectedMod.id)
                      ? 'var(--text-muted)'
                      : 'var(--green)',
                    color: installedIds.has(selectedMod.id)
                      ? 'var(--text-muted)'
                      : 'var(--green)',
                    backgroundColor: installedIds.has(selectedMod.id)
                      ? 'transparent'
                      : 'rgba(0, 255, 128, 0.08)',
                    cursor: installedIds.has(selectedMod.id) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {installedIds.has(selectedMod.id) ? '已安裝' : '安裝模組'}
                </button>

                <div className="pt-2 border-t" style={{ borderColor: 'rgba(168, 85, 247, 0.2)' }}>
                  <div
                    className="text-sm font-cyber tracking-wider mb-3"
                    style={{ color: 'var(--purple)' }}
                  >
                    評分與評論
                  </div>
                  <RatingReviewSection
                    contentType="mod"
                    contentId={selectedMod.id}
                    averageRating={modAvgRating || getMarketStats(selectedMod.id).rating}
                    ratingCount={modTotalReviews || Math.floor(getMarketStats(selectedMod.id).downloads / 50)}
                    reviews={modReviews}
                    onRate={handleModRate}
                    onAddReview={handleModAddReview}
                    onLikeReview={handleModLikeReview}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent
          className="cyber-card max-w-sm"
          style={{
            borderColor: 'var(--red)',
            boxShadow: '0 0 30px rgba(255, 77, 77, 0.3)',
            backgroundColor: 'hsl(240, 18%, 10%)',
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-cyber text-xl tracking-wider"
              style={{ color: 'var(--red)', textShadow: '0 0 10px rgba(255, 77, 77, 0.5)' }}
            >
              確認刪除
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--text-secondary)]">
              確定要刪除模組「{deleteTarget?.name}」嗎？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteTarget) deleteMod(deleteTarget.id);
                setDeleteTarget(null);
              }}
              className="cyber-btn px-5 py-2 text-sm w-full sm:w-auto font-cyber tracking-wider"
              style={{
                borderColor: 'var(--red)',
                color: 'var(--red)',
                backgroundColor: 'rgba(255, 77, 77, 0.08)',
              }}
            >
              刪除
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModManagerPage;
