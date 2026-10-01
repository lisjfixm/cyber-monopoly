import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Upload,
  Save,
  Sparkles,
  ThumbsUp,
  Star,
} from 'lucide-react';
import type { CardEffect } from '@shared/api.interface';
import {
  getLocalCustomCards,
  saveLocalCard,
  deleteLocalCard,
  getCommunityCards,
  publishCard,
  installCard,
  likeCard,
  type CustomCard,
} from '@client/src/utils/customCards';
import CardDetailView from './CardDetailView';
import { sortByFeatured } from '@client/src/utils/reviewStorage';

type EditorTab = 'editor' | 'community';
type CardType = 'fate' | 'chance';

const EFFECT_TYPES = [
  { value: 'money', label: '金額增減', hasAmount: true, amountLabel: '金額（正=獲得，負=扣除）' },
  { value: 'forward', label: '前進 N 步', hasAmount: true, amountLabel: '步數' },
  { value: 'backward', label: '後退 N 步', hasAmount: true, amountLabel: '步數' },
  { value: 'teleport_start', label: '傳送到起點', hasAmount: false },
  { value: 'go_to_detention', label: '進入禁閉區', hasAmount: false },
  { value: 'get_out_of_jail', label: '免費越獄', hasAmount: false },
  { value: 'random_teleport', label: '隨機傳送', hasAmount: false },
  { value: 'collect_from_all', label: '向所有玩家收取金額', hasAmount: true, amountLabel: '金額' },
  { value: 'pay_to_all', label: '向所有玩家支付金額', hasAmount: true, amountLabel: '金額' },
  { value: 'steal_money', label: '偷取金額', hasAmount: true, amountLabel: '金額' },
  { value: 'chain_draw', label: '連鎖抽卡', hasAmount: true, amountLabel: '抽卡次數' },
];

function buildEffect(type: string, amount: number): CardEffect | null {
  switch (type) {
    case 'money': return { type: 'money', amount };
    case 'forward': return { type: 'forward', steps: Math.abs(amount) };
    case 'backward': return { type: 'backward', steps: Math.abs(amount) };
    case 'teleport_start': return { type: 'teleport_start' };
    case 'go_to_detention': return { type: 'go_to_detention' };
    case 'get_out_of_jail': return { type: 'get_out_of_jail' };
    case 'random_teleport': return { type: 'random_teleport' };
    case 'collect_from_all': return { type: 'collect_from_all', amount: Math.abs(amount) };
    case 'pay_to_all': return { type: 'pay_to_all', amount: Math.abs(amount) };
    case 'steal_money': return { type: 'steal_money', amount: Math.abs(amount) };
    case 'chain_draw': return { type: 'chain_draw', count: Math.max(1, Math.abs(Math.floor(amount))) };
    default: return null;
  }
}

function describeEffect(effect: CardEffect): string {
  switch (effect.type) {
    case 'money': return effect.amount >= 0 ? `獲得 $${effect.amount}` : `損失 $${Math.abs(effect.amount)}`;
    case 'forward': return `前進 ${effect.steps} 步`;
    case 'backward': return `後退 ${effect.steps} 步`;
    case 'teleport_start': return '傳送到起點';
    case 'go_to_detention': return '進入禁閉區';
    case 'get_out_of_jail': return '免費越獄';
    case 'random_teleport': return '隨機傳送';
    case 'collect_from_all': return `向所有玩家收取 $${effect.amount}`;
    case 'pay_to_all': return `向所有玩家支付 $${effect.amount}`;
    case 'steal_money': return `偷取 $${effect.amount}`;
    case 'chain_draw': return `連鎖抽卡 ${effect.count} 次`;
    default: return '未知效果';
  }
}

const CardEditorPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EditorTab>('editor');
  const [cardType, setCardType] = useState<CardType>('fate');
  const [cardName, setCardName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [effectType, setEffectType] = useState<string>('money');
  const [effectAmount, setEffectAmount] = useState<number>(1000);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [localCards, setLocalCards] = useState<CustomCard[]>([]);
  const [communityCards, setCommunityCards] = useState<CustomCard[]>([]);
  const [communityCardType, setCommunityCardType] = useState<CardType>('fate');
  const [selectedCommunityCard, setSelectedCommunityCard] = useState<CustomCard | null>(null);
  const [toast, setToast] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  const refreshLocal = useCallback(() => {
    setLocalCards(getLocalCustomCards());
  }, []);

  const refreshCommunity = useCallback(() => {
    setCommunityCards(getCommunityCards(communityCardType));
  }, [communityCardType]);

  useEffect(() => { refreshLocal(); }, [refreshLocal]);
  useEffect(() => { refreshCommunity(); }, [refreshCommunity]);

  const currentEffectConfig = EFFECT_TYPES.find((e) => e.value === effectType);

  const resetForm = () => {
    setCardName('');
    setDescription('');
    setEffectType('money');
    setEffectAmount(1000);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!cardName.trim()) { showToast('請輸入卡牌名稱'); return; }
    const amount = Number(effectAmount);
    if (!Number.isFinite(amount)) {
      showToast('效果數值必須是數字');
      return;
    }
    const effect = buildEffect(effectType, amount);
    if (!effect) {
      showToast('不支援的效果類型，無法儲存');
      return;
    }
    const existing = editingId ? localCards.find((c) => c.id === editingId) : null;
    const card: CustomCard = {
      id: editingId || `custom_card_${Date.now()}`,
      name: cardName.trim(),
      description: description.trim() || describeEffect(effect),
      cardType,
      effect,
      author: '我',
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      isFeatured: false,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    saveLocalCard(card);
    refreshLocal();
    showToast('儲存成功！');
  };

  const handleEdit = (card: CustomCard) => {
    setEditingId(card.id);
    setCardType(card.cardType);
    setCardName(card.name);
    setDescription(card.description);
    const eff = card.effect;
    const knownType = EFFECT_TYPES.some((e) => e.value === eff.type);
    if (!knownType) {
      setEffectType(eff.type);
      setEffectAmount(0);
    } else if ('amount' in eff) {
      setEffectAmount(eff.amount);
    } else if ('steps' in eff) {
      setEffectAmount(eff.steps);
    } else if ('count' in eff) {
      setEffectAmount(eff.count);
    } else {
      setEffectAmount(0);
    }
    setActiveTab('editor');
  };

  const handleDelete = () => {
    if (!editingId) return;
    deleteLocalCard(editingId);
    refreshLocal();
    resetForm();
    setShowDeleteConfirm(false);
    showToast('已刪除');
  };

  const handlePublish = () => {
    if (!cardName.trim()) { showToast('請輸入卡牌名稱'); return; }
    const amount = Number(effectAmount);
    if (!Number.isFinite(amount)) {
      showToast('效果數值必須是數字');
      return;
    }
    const effect = buildEffect(effectType, amount);
    if (!effect) {
      showToast('不支援的效果類型，無法發布');
      return;
    }
    const card: CustomCard = {
      id: '',
      name: cardName.trim(),
      description: description.trim() || describeEffect(effect),
      cardType,
      effect,
      author: '我',
      likes: 0,
      downloads: 0,
      rating: 0,
      ratings: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };
    publishCard(card, '我');
    refreshCommunity();
    showToast('已發布到社區！');
  };

  const handleInstall = (id: string) => {
    const success = installCard(id);
    refreshCommunity();
    if (success) showToast('安裝成功！');
    else showToast('安裝失敗或已存在');
  };

  const handleLikeCommunity = (id: string) => {
    likeCard(id);
    refreshCommunity();
    const updated = getCommunityCards().find((c) => c.id === id);
    if (updated && selectedCommunityCard?.id === id) setSelectedCommunityCard(updated);
    showToast('已點讚');
  };

  const handleSelectCommunity = (card: CustomCard) => {
    setSelectedCommunityCard(card);
  };

  const previewEffect = buildEffect(effectType, effectAmount);
  const filteredCommunity = sortByFeatured(
    communityCards.filter((c) => c.cardType === communityCardType),
    'card',
  );

  // 社區詳情頁
  if (activeTab === 'community' && selectedCommunityCard) {
    return (
      <>
        <CardDetailView
          card={selectedCommunityCard}
          onBack={() => setSelectedCommunityCard(null)}
          onInstall={handleInstall}
          onLike={handleLikeCommunity}
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
            自製卡牌
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 max-w-xl">
          {[
            { key: 'editor' as EditorTab, label: '卡牌編輯器', icon: Plus },
            { key: 'community' as EditorTab, label: '社區卡牌', icon: Sparkles },
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
            {/* 左側編輯面板 */}
            <div className="space-y-4">
              <div className="cyber-card p-4" style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}>
                <div className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-3">卡牌類型</div>
                <div className="flex gap-2 mb-4">
                  {[
                    { value: 'fate' as CardType, label: '命運卡', color: 'var(--purple)' },
                    { value: 'chance' as CardType, label: '機會卡', color: 'var(--cyan)' },
                  ].map((t) => (
                    <button key={t.value} type="button" onClick={() => setCardType(t.value)}
                      className="cyber-btn cyber-btn-sm flex-1 font-cyber tracking-wider"
                      style={{
                        borderColor: cardType === t.value ? t.color : 'rgba(255, 255, 255, 0.1)',
                        color: cardType === t.value ? t.color : 'var(--text-secondary)',
                        backgroundColor: cardType === t.value ? `${t.color}15` : 'transparent',
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">卡牌名稱</label>
                    <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)}
                      placeholder="輸入卡牌名稱" className="cyber-input w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">卡牌描述</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="輸入卡牌描述" rows={2}
                      className="cyber-input w-full text-sm resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">效果類型</label>
                    <select value={effectType} onChange={(e) => setEffectType(e.target.value)}
                      className="cyber-input w-full text-sm" style={{ appearance: 'none' }}>
                      {EFFECT_TYPES.map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>
                  {currentEffectConfig?.hasAmount && (
                    <div>
                      <label className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] block mb-1">
                        {currentEffectConfig.amountLabel}
                      </label>
                      <input type="number" value={effectAmount} onChange={(e) => setEffectAmount(Number(e.target.value))}
                        className="cyber-input w-full text-sm" />
                    </div>
                  )}
                </div>
              </div>

              {/* 即時預覽 */}
              <div className="cyber-card p-4" style={{ borderColor: cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)' }}>
                <div className="text-xs font-cyber tracking-wider text-[var(--text-secondary)] mb-3">卡牌預覽</div>
                <div className="mx-auto max-w-xs p-5 rounded text-center"
                  style={{
                    border: `2px solid ${cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)'}`,
                    background: `linear-gradient(135deg, ${cardType === 'fate' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(0, 255, 255, 0.1)'}, transparent)`,
                    boxShadow: `0 0 20px ${cardType === 'fate' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 255, 255, 0.2)'}`,
                  }}>
                  <div className="text-xs font-cyber tracking-wider mb-2"
                    style={{ color: cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)' }}>
                    {cardType === 'fate' ? '命運卡' : '機會卡'}
                  </div>
                  <div className="font-cyber text-xl tracking-wider mb-2 text-[var(--text-primary)]">
                    {cardName || '卡牌名稱'}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mb-3 min-h-[40px]">
                    {description || '卡牌描述'}
                  </div>
                  <div className="py-2 px-3 rounded-sm font-cyber text-sm"
                    style={{ background: 'rgba(0, 0, 0, 0.4)', color: cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)' }}>
                    {describeEffect(previewEffect ?? { type: 'money', amount: 0 })}
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

            {/* 右側本地卡牌列表 */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => setCardType('fate')}
                  className="cyber-btn cyber-btn-sm flex-1 font-cyber tracking-wider text-xs"
                  style={{
                    borderColor: cardType === 'fate' ? 'var(--purple)' : 'rgba(255, 255, 255, 0.1)',
                    color: cardType === 'fate' ? 'var(--purple)' : 'var(--text-secondary)',
                  }}>
                  命運卡
                </button>
                <button type="button" onClick={() => setCardType('chance')}
                  className="cyber-btn cyber-btn-sm flex-1 font-cyber tracking-wider text-xs"
                  style={{
                    borderColor: cardType === 'chance' ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                    color: cardType === 'chance' ? 'var(--cyan)' : 'var(--text-secondary)',
                  }}>
                  機會卡
                </button>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {localCards.filter((c) => c.cardType === cardType).length === 0 ? (
                  <div className="cyber-card p-4 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    尚無自製卡牌
                  </div>
                ) : (
                  localCards.filter((c) => c.cardType === cardType).map((card) => (
                    <button key={card.id} type="button" onClick={() => handleEdit(card)}
                      className="cyber-card w-full p-3 text-left hover:scale-[1.01]"
                      style={{
                        borderColor: editingId === card.id ? 'var(--pink)' : 'rgba(0, 255, 255, 0.15)',
                        boxShadow: editingId === card.id ? '0 0 10px rgba(255, 107, 157, 0.2)' : 'none',
                      }}>
                      <div className="font-cyber text-sm tracking-wider text-[var(--text-primary)] truncate">
                        {card.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] truncate">
                        {describeEffect(card.effect)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 社區 Tab */}
        {activeTab === 'community' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button type="button" onClick={() => setCommunityCardType('fate')}
                className="cyber-btn cyber-btn-sm px-4 font-cyber tracking-wider"
                style={{
                  borderColor: communityCardType === 'fate' ? 'var(--purple)' : 'rgba(255, 255, 255, 0.1)',
                  color: communityCardType === 'fate' ? 'var(--purple)' : 'var(--text-secondary)',
                }}>
                命運卡
              </button>
              <button type="button" onClick={() => setCommunityCardType('chance')}
                className="cyber-btn cyber-btn-sm px-4 font-cyber tracking-wider"
                style={{
                  borderColor: communityCardType === 'chance' ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                  color: communityCardType === 'chance' ? 'var(--cyan)' : 'var(--text-secondary)',
                }}>
                機會卡
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCommunity.map((card) => (
                <button key={card.id} type="button" onClick={() => handleSelectCommunity(card)}
                  className="cyber-card p-4 text-left hover:scale-[1.02] transition-transform"
                  style={{
                    borderColor: card.isFeatured
                      ? 'var(--yellow, #facc15)'
                      : card.cardType === 'fate' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 255, 255, 0.2)',
                    boxShadow: card.isFeatured ? '0 0 15px rgba(250, 204, 21, 0.25)' : 'none',
                  }}>
                  {card.isFeatured && (
                    <div className="flex items-center gap-1 mb-2 text-xs font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
                      <Sparkles size={12} />
                      精選
                    </div>
                  )}
                  <div className="text-xs font-cyber tracking-wider mb-1"
                    style={{ color: card.cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)' }}>
                    {card.cardType === 'fate' ? '命運卡' : '機會卡'}
                  </div>
                  <div className="font-cyber text-base tracking-wider text-[var(--text-primary)] truncate mb-1">
                    {card.name}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2 min-h-[32px]">
                    {card.description}
                  </div>
                  <div className="text-xs font-cyber mb-2"
                    style={{ color: card.cardType === 'fate' ? 'var(--purple)' : 'var(--cyan)' }}>
                    {describeEffect(card.effect)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>by {card.author}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><ThumbsUp size={12} />{card.likes}</span>
                      <span className="flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
                        <Star size={12} fill="currentColor" />{(card.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
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
              確定要刪除卡牌「{cardName}」嗎？此操作無法復原。
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

export default CardEditorPage;
