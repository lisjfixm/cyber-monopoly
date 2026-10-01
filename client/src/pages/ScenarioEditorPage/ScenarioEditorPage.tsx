import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Save,
  Upload,
  Trash2,
  Sparkles,
  ThumbsUp,
  Star,
  Zap,
} from 'lucide-react';
import {
  getLocalScenarios,
  saveLocalScenario,
  deleteLocalScenario,
  getCommunityScenarios,
  publishScenario,
  installScenario,
  likeScenario,
  type CustomScenario,
  type VictoryCondition,
} from '@client/src/utils/customScenarios';
import ScenarioDetailView from './ScenarioDetailView';
import { sortByFeatured } from '@client/src/utils/reviewStorage';

type EditorTab = 'editor' | 'community';

const DIFFICULTY_LABELS: Record<CustomScenario['aiDifficulty'], string> = {
  easy: '簡單',
  normal: '普通',
  hard: '困難',
  extreme: '極限',
};

const VICTORY_LABELS: Record<VictoryCondition, string> = {
  reach_money: '達到指定金額',
  own_properties: '擁有指定數量地產',
  eliminate_all: '淘汰所有對手',
};

function victoryDescription(condition: VictoryCondition, param: number): string {
  switch (condition) {
    case 'reach_money': return `資產達到 $${param.toLocaleString()}`;
    case 'own_properties': return `擁有 ${param} 個地產`;
    case 'eliminate_all': return '淘汰所有對手';
    default: return '未知';
  }
}

const ScenarioEditorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EditorTab>('editor');
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startingMoney, setStartingMoney] = useState<number>(15000);
  const [aiCount, setAiCount] = useState<number>(1);
  const [aiDifficulty, setAiDifficulty] = useState<CustomScenario['aiDifficulty']>('normal');
  const [victoryCondition, setVictoryCondition] = useState<VictoryCondition>('eliminate_all');
  const [victoryParam, setVictoryParam] = useState<number>(100000);
  const [maxTurns, setMaxTurns] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localScenarios, setLocalScenarios] = useState<CustomScenario[]>([]);
  const [communityScenarios, setCommunityScenarios] = useState<CustomScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<CustomScenario | null>(null);
  const [toast, setToast] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  const refreshLocal = useCallback(() => {
    setLocalScenarios(getLocalScenarios());
  }, []);

  const refreshCommunity = useCallback(() => {
    setCommunityScenarios(getCommunityScenarios());
  }, []);

  useEffect(() => { refreshLocal(); }, [refreshLocal]);
  useEffect(() => { refreshCommunity(); }, [refreshCommunity]);

  const handleVictoryConditionChange = (value: VictoryCondition) => {
    setVictoryCondition(value);
    if (value !== 'reach_money' && value !== 'own_properties') {
      setVictoryParam(0);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setStartingMoney(15000);
    setAiCount(1);
    setAiDifficulty('normal');
    setVictoryCondition('eliminate_all');
    setVictoryParam(100000);
    setMaxTurns(0);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name.trim()) { showToast('請輸入劇本名稱'); return; }
    if (!Number.isInteger(startingMoney) || startingMoney < 1000 || startingMoney > 500000) {
      showToast('初始資金必須為 1000 ~ 500000 的整數');
      return;
    }
    if (!Number.isInteger(maxTurns) || maxTurns < 0) {
      showToast('回合上限必須為 >= 0 的整數');
      return;
    }
    if (!Number.isInteger(aiCount) || aiCount < 1 || aiCount > 3) {
      showToast('AI 對手數量必須為 1 ~ 3');
      return;
    }
    if ((victoryCondition === 'reach_money' || victoryCondition === 'own_properties')
      && (!Number.isInteger(victoryParam) || victoryParam <= 0)) {
      showToast('勝利條件參數必須為正整數');
      return;
    }
    const existing = editingId ? localScenarios.find((s) => s.id === editingId) : null;
    const scenario: CustomScenario = {
      id: editingId || `scenario_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      author: '我',
      startingMoney,
      aiCount,
      aiDifficulty,
      victoryCondition,
      victoryParam,
      maxTurns,
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      authorScore: 100,
      isFeatured: false,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    try {
      saveLocalScenario(scenario);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        showToast('儲存失敗：儲存空間已滿');
        return;
      }
      showToast('儲存失敗');
      return;
    }
    refreshLocal();
    showToast('儲存成功！');
  };

  const handleEdit = (scenario: CustomScenario) => {
    setEditingId(scenario.id);
    setName(scenario.name);
    setDescription(scenario.description);
    setStartingMoney(scenario.startingMoney);
    setAiCount(scenario.aiCount);

    const validDifficulties: CustomScenario['aiDifficulty'][] = ['easy', 'normal', 'hard', 'extreme'];
    if (validDifficulties.includes(scenario.aiDifficulty)) {
      setAiDifficulty(scenario.aiDifficulty);
    } else {
      setAiDifficulty('normal');
      showToast('數據格式已升級');
    }

    const validVictory: VictoryCondition[] = ['reach_money', 'own_properties', 'eliminate_all'];
    if (validVictory.includes(scenario.victoryCondition)) {
      setVictoryCondition(scenario.victoryCondition);
    } else {
      setVictoryCondition('eliminate_all');
      showToast('數據格式已升級');
    }

    setVictoryParam(scenario.victoryParam);
    setMaxTurns(scenario.maxTurns);
    setActiveTab('editor');
  };

  const handleDelete = () => {
    if (!editingId) return;
    deleteLocalScenario(editingId);
    refreshLocal();
    resetForm();
    setShowDeleteConfirm(false);
    showToast('已刪除');
  };

  const handlePublish = () => {
    if (!name.trim()) { showToast('請輸入劇本名稱'); return; }
    const scenario: CustomScenario = {
      id: '',
      name: name.trim(),
      description: description.trim(),
      author: '我',
      startingMoney,
      aiCount,
      aiDifficulty,
      victoryCondition,
      victoryParam,
      maxTurns,
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      authorScore: 100,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };
    publishScenario(scenario, '我');
    refreshCommunity();
    showToast('已發布到社區！');
  };

  const handleInstall = (id: string) => {
    const success = installScenario(id);
    refreshCommunity();
    if (success) showToast('安裝成功！');
    else showToast('安裝失敗或已存在');
  };

  const handleLike = (id: string) => {
    likeScenario(id);
    refreshCommunity();
    const updated = getCommunityScenarios().find((s) => s.id === id);
    if (updated && selectedScenario?.id === id) setSelectedScenario(updated);
    showToast('已點讚');
  };

  const handleSelect = (scenario: CustomScenario) => {
    setSelectedScenario(scenario);
  };

  // 詳情頁
  if (activeTab === 'community' && selectedScenario) {
    return (
      <>
        <ScenarioDetailView
          scenario={selectedScenario}
          onBack={() => setSelectedScenario(null)}
          onInstall={handleInstall}
          onLike={handleLike}
          showToast={showToast}
        />
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider"
            style={{ background: 'var(--bg-dark)', border: '1px solid var(--cyan)', color: 'var(--cyan)', boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}>
            {toast}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-6 scanlines relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--cyan)' }} />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]" style={{ background: 'var(--pink)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button type="button" onClick={() => navigate('/')} className="cyber-btn px-3 py-2 text-sm flex items-center gap-1">
            <ChevronLeft size={16} />
            <span className="font-cyber tracking-wider">返回</span>
          </button>
          <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
            劇本製作器
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 max-w-xl">
          {[
            { key: 'editor' as EditorTab, label: '劇本編輯', icon: Zap },
            { key: 'community' as EditorTab, label: '社區劇本', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider flex items-center justify-center gap-2"
                style={{
                  borderColor: isActive ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                  color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                }}>
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 編輯器 Tab */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              <div className="cyber-card p-4" style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">劇本名稱</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="輸入劇本名稱" className="cyber-input w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">劇本描述</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="描述劇本背景與特色" rows={3}
                      className="cyber-input w-full text-sm resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">初始資金</label>
                      <input type="number" value={startingMoney} onChange={(e) => setStartingMoney(Number(e.target.value))}
                        className="cyber-input w-full text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">對手人數</label>
                      <select value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))}
                        className="cyber-input w-full text-sm" style={{ appearance: 'none' }}>
                        <option value={1}>1 個 AI</option>
                        <option value={2}>2 個 AI</option>
                        <option value={3}>3 個 AI</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">AI 難度</label>
                    <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value as CustomScenario['aiDifficulty'])}
                      className="cyber-input w-full text-sm" style={{ appearance: 'none' }}>
                      <option value="easy">簡單</option>
                      <option value="normal">普通</option>
                      <option value="hard">困難</option>
                      <option value="extreme">極限</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">勝利條件</label>
                    <select value={victoryCondition} onChange={(e) => handleVictoryConditionChange(e.target.value as VictoryCondition)}
                      className="cyber-input w-full text-sm" style={{ appearance: 'none' }}>
                      <option value="reach_money">達到指定金額</option>
                      <option value="own_properties">擁有指定數量地產</option>
                      <option value="eliminate_all">淘汰所有對手</option>
                    </select>
                  </div>
                  {(victoryCondition === 'reach_money' || victoryCondition === 'own_properties') && (
                    <div>
                      <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">
                        {victoryCondition === 'reach_money' ? '目標金額' : '目標地產數量'}
                      </label>
                      <input type="number" value={victoryParam} onChange={(e) => setVictoryParam(Number(e.target.value))}
                        className="cyber-input w-full text-sm" />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">
                      回合上限（0 表示無限制）
                    </label>
                    <input type="number" value={maxTurns} onChange={(e) => setMaxTurns(Number(e.target.value))}
                      className="cyber-input w-full text-sm" min={0} />
                  </div>
                </div>
              </div>

              {/* 預覽 */}
              <div className="cyber-card p-4" style={{ borderColor: 'var(--green)' }}>
                <div className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-3">劇本預覽</div>
                <h3 className="font-cyber text-lg text-neon-cyan tracking-wider mb-2">
                  {name || '劇本名稱'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3 min-h-[32px]">
                  {description || '劇本描述'}
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">初始資金</span>
                    <span className="font-cyber text-neon-cyan">${startingMoney.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">AI 對手</span>
                    <span className="font-cyber">{aiCount} 個 · {DIFFICULTY_LABELS[aiDifficulty]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">勝利條件</span>
                    <span className="font-cyber" style={{ color: 'var(--green)' }}>
                      {victoryDescription(victoryCondition, victoryParam)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">回合上限</span>
                    <span className="font-cyber">{maxTurns > 0 ? `${maxTurns} 回合` : '無限制'}</span>
                  </div>
                </div>
              </div>

              {/* 按鈕列 */}
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={handleSave}
                  className="cyber-btn flex-1 py-2.5 font-cyber tracking-wider flex items-center justify-center gap-2"
                  style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                  <Save size={16} />
                  {editingId ? '更新' : '保存到本地'}
                </button>
                <button type="button" onClick={handlePublish}
                  className="cyber-btn flex-1 py-2.5 font-cyber tracking-wider flex items-center justify-center gap-2"
                  style={{ borderColor: 'var(--green)', color: 'var(--green)', backgroundColor: 'rgba(0, 255, 128, 0.08)' }}>
                  <Upload size={16} />
                  上傳分享
                </button>
                {editingId && (
                  <button type="button" onClick={() => setShowDeleteConfirm(true)}
                    className="cyber-btn py-2.5 px-4 font-cyber tracking-wider flex items-center justify-center gap-2"
                    style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                    <Trash2 size={16} />
                    刪除
                  </button>
                )}
              </div>
            </div>

            {/* 右側本地劇本列表 */}
            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              <div className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-1">
                本地劇本 ({localScenarios.length})
              </div>
              {localScenarios.length === 0 ? (
                <div className="cyber-card p-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  尚無自製劇本
                </div>
              ) : (
                localScenarios.map((scenario) => (
                  <button key={scenario.id} type="button" onClick={() => handleEdit(scenario)}
                    className="cyber-card w-full p-3 text-left hover:scale-[1.01]"
                    style={{
                      borderColor: editingId === scenario.id ? 'var(--pink)' : 'rgba(0, 255, 255, 0.15)',
                      boxShadow: editingId === scenario.id ? '0 0 10px rgba(255, 107, 157, 0.2)' : 'none',
                    }}>
                    <div className="font-cyber text-sm tracking-wider text-[var(--text-primary)] truncate">
                      {scenario.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] line-clamp-2">
                      {scenario.description}
                    </div>
                    <div className="text-xs text-[var(--cyan)] mt-1">
                      ${scenario.startingMoney.toLocaleString()} · {scenario.aiCount}AI · {DIFFICULTY_LABELS[scenario.aiDifficulty] ?? '未知'}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 社區 Tab */}
        {activeTab === 'community' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
             {sortByFeatured(communityScenarios, 'scenario').map((scenario) => (
              <button key={scenario.id} type="button" onClick={() => handleSelect(scenario)}
                className="cyber-card p-4 text-left hover:scale-[1.02] transition-transform"
                style={{
                  borderColor: scenario.isFeatured ? 'var(--yellow, #facc15)' : 'rgba(0, 255, 255, 0.2)',
                  boxShadow: scenario.isFeatured ? '0 0 15px rgba(250, 204, 21, 0.25)' : 'none',
                }}>
                {scenario.isFeatured && (
                  <div className="flex items-center gap-1 mb-2 text-xs font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
                    <Sparkles size={12} /> 精選
                  </div>
                )}
                <div className="font-cyber text-base tracking-wider text-neon-cyan truncate mb-1">
                  {scenario.name}
                </div>
                <div className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2 min-h-[32px]">
                  {scenario.description}
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">初始資金</span>
                    <span className="font-cyber text-neon-cyan">${scenario.startingMoney.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">AI</span>
                    <span className="font-cyber">{scenario.aiCount} 個 · {DIFFICULTY_LABELS[scenario.aiDifficulty] ?? '未知'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-secondary)]">勝利</span>
                    <span className="font-cyber" style={{ color: 'var(--green)' }}>
                      {VICTORY_LABELS[scenario.victoryCondition] ?? '未知'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mt-3 pt-2 border-t border-[rgba(255_255_255_0.08)]">
                  <span>by {scenario.author}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><ThumbsUp size={12} />{scenario.likes}</span>
                    <span className="flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
                       <Star size={12} fill="currentColor" />{(scenario.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider"
          style={{ background: 'var(--bg-dark)', border: '1px solid var(--cyan)', color: 'var(--cyan)', boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}>
          {toast}
        </div>
      )}

      {/* 刪除確認對話框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="cyber-card w-full max-w-sm p-5" style={{ borderColor: 'var(--red)', background: 'hsl(240, 18%, 10%)' }}>
            <h3 className="font-cyber text-lg tracking-wider mb-3" style={{ color: 'var(--red)' }}>確認刪除</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              確定要刪除劇本「{name}」嗎？此操作無法復原。
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(false)}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider">
                取消
              </button>
              <button type="button" onClick={handleDelete}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{ borderColor: 'var(--red)', color: 'var(--red)', background: 'rgba(255, 77, 77, 0.08)' }}>
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioEditorPage;
