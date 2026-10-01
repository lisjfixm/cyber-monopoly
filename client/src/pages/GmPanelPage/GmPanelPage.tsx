import React, { useState, useEffect, useCallback } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  gmApi,
  setGmToken,
  clearGmToken,
  hasGmToken,
} from '@client/src/api/gm';
import type {
  GmUserSearchResult,
  GmUpdateUserRequest,
  Announcement,
  GlobalEventConfig,
  GmOAuthBinding,
  OAuthProvider,
} from '@shared/api.interface';
import type { GmOnlineUser } from '@client/src/api/gm';

type GmMenuKey = 'users' | 'announcements' | 'events' | 'online';

const PROVIDER_STYLES: Record<OAuthProvider, { color: string; bg: string; glow: string; label: string }> = {
  google: {
    color: 'hsl(210, 100%, 65%)',
    bg: 'rgba(66, 133, 244, 0.08)',
    glow: 'rgba(66, 133, 244, 0.4)',
    label: 'Google',
  },
  apple: {
    color: 'hsl(0, 0%, 85%)',
    bg: 'rgba(0, 0, 0, 0.4)',
    glow: 'rgba(200, 200, 200, 0.3)',
    label: 'Apple',
  },
  github: {
    color: 'hsl(220, 20%, 80%)',
    bg: 'rgba(30, 30, 40, 0.5)',
    glow: 'rgba(140, 150, 180, 0.3)',
    label: 'GitHub',
  },
};

function providerStyle(provider: OAuthProvider) {
  return PROVIDER_STYLES[provider] ?? PROVIDER_STYLES.google;
}

function providerLabel(provider: OAuthProvider) {
  return PROVIDER_STYLES[provider]?.label ?? provider;
}

const GM_MENU_ITEMS: Array<{ key: GmMenuKey; label: string; icon: string }> = [
  { key: 'users', label: '使用者管理', icon: '用戶' },
  { key: 'announcements', label: '公告管理', icon: '公告' },
  { key: 'events', label: '活動管理', icon: '活動' },
  { key: 'online', label: '在線使用者', icon: '在線' },
];

// ==================== 通用確認彈窗 ====================
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = '確認',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className="w-[90%] max-w-md p-6 rounded-lg"
        style={{
          background: 'hsl(0, 30%, 8%)',
          border: '1px solid hsl(0, 100%, 60%)',
          boxShadow: '0 0 20px hsl(0, 100%, 50%, 0.5), inset 0 0 10px hsl(0, 100%, 50%, 0.2)',
        }}
      >
        <h3
          className="text-xl font-bold mb-3 tracking-wider"
          style={{
            color: 'hsl(0, 100%, 70%)',
            textShadow: '0 0 10px hsl(0, 100%, 60%)',
          }}
        >
          警告 {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'hsl(0, 20%, 80%)' }}>
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded transition-all"
            style={{
              border: '1px solid hsl(0, 50%, 40%)',
              color: 'hsl(0, 20%, 70%)',
              background: 'transparent',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105"
            style={{
              background: danger ? 'hsl(0, 100%, 45%)' : 'hsl(0, 100%, 60%)',
              color: 'white',
              boxShadow: '0 0 15px hsl(0, 100%, 60%, 0.6)',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 通用輸入框 ====================
interface GmInputProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}

const GmInput: React.FC<GmInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  textarea = false,
  rows = 3,
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold tracking-wider" style={{ color: 'hsl(0, 80%, 75%)' }}>
      {label}
    </label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm rounded outline-none resize-y"
        style={{
          background: 'hsl(0, 30%, 5%)',
          border: '1px solid hsl(0, 60%, 40%)',
          color: 'hsl(0, 20%, 90%)',
          caretColor: 'hsl(0, 100%, 60%)',
        }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded outline-none"
        style={{
          background: 'hsl(0, 30%, 5%)',
          border: '1px solid hsl(0, 60%, 40%)',
          color: 'hsl(0, 20%, 90%)',
          caretColor: 'hsl(0, 100%, 60%)',
        }}
      />
    )}
  </div>
);

// ==================== 開關 ====================
interface GmSwitchProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

const GmSwitch: React.FC<GmSwitchProps> = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm" style={{ color: 'hsl(0, 20%, 80%)' }}>
      {label}
    </span>
    <button
      onClick={() => onChange(!checked)}
      className="relative w-12 h-6 rounded-full transition-all"
      style={{
        background: checked ? 'hsl(0, 100%, 60%)' : 'hsl(0, 20%, 20%)',
        boxShadow: checked ? '0 0 10px hsl(0, 100%, 60%, 0.6)' : 'none',
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: checked ? '26px' : '2px' }}
      />
    </button>
  </div>
);

// ==================== 密碼驗證頁 ====================
const GmLoginView: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!password.trim()) {
      setError('請輸入密碼');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await gmApi.login(password);
      setGmToken(result.token);
      logger.info({ level: 'info', args: ['GM 登入成功'] });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '密碼錯誤';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      logger.error({ level: 'error', args: ['GM 登入失敗', msg] });
    } finally {
      setLoading(false);
    }
  }, [password, onSuccess]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'hsl(0, 30%, 5%)' }}
    >
      {/* 頂部警告條 */}
      <div
        className="fixed top-0 left-0 right-0 py-2 text-center text-sm font-bold tracking-widest"
        style={{
          background: 'hsl(0, 100%, 20%)',
          color: 'hsl(0, 100%, 80%)',
          textShadow: '0 0 5px hsl(0, 100%, 60%)',
          borderBottom: '1px solid hsl(0, 100%, 50%)',
          boxShadow: '0 2px 20px hsl(0, 100%, 50%, 0.3)',
        }}
      >
        警告 GM 控制台 - 僅限授權人員使用 警告
      </div>

      <div
        className={`w-full max-w-md p-8 rounded-lg ${shake ? 'animate-pulse' : ''}`}
        style={{
          background: 'hsl(0, 30%, 8%)',
          border: '2px solid hsl(0, 100%, 60%)',
          boxShadow:
            '0 0 30px hsl(0, 100%, 50%, 0.4), inset 0 0 30px hsl(0, 100%, 50%, 0.1)',
        }}
      >
        <div className="text-center mb-8">
          <div
            className="text-5xl mb-4"
            style={{ textShadow: '0 0 20px hsl(0, 100%, 60%)' }}
          >
             管理
          </div>
          <h1
            className="text-3xl font-bold tracking-widest mb-2"
            style={{
              color: 'hsl(0, 100%, 60%)',
              textShadow: '0 0 15px hsl(0, 100%, 60%), 0 0 30px hsl(0, 100%, 60%)',
            }}
          >
            GM 控制台
          </h1>
          <p className="text-sm tracking-wide" style={{ color: 'hsl(0, 30%, 60%)' }}>
            CYBER MONOPOLY ADMINISTRATION
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-bold mb-2 tracking-wider"
              style={{ color: 'hsl(0, 80%, 75%)' }}
            >
              請輸入管理員密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="GM PASSWORD"
              className="w-full px-4 py-3 text-lg rounded outline-none tracking-widest"
              style={{
                background: 'hsl(0, 30%, 5%)',
                border: '2px solid hsl(0, 80%, 50%)',
                color: 'hsl(0, 100%, 70%)',
                caretColor: 'hsl(0, 100%, 60%)',
                boxShadow: 'inset 0 0 10px hsl(0, 100%, 50%, 0.2)',
              }}
              autoFocus
            />
          </div>

          {error && (
            <div
              className="text-center py-2 px-4 rounded text-sm font-bold animate-pulse"
              style={{
                background: 'hsl(0, 100%, 20%, 0.5)',
                color: 'hsl(0, 100%, 80%)',
                border: '1px solid hsl(0, 100%, 50%)',
              }}
            >
              錯誤 {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 text-lg font-bold rounded tracking-widest transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, hsl(0, 100%, 50%), hsl(0, 100%, 30%))',
              color: 'white',
              boxShadow: '0 0 20px hsl(0, 100%, 60%, 0.6)',
              border: '1px solid hsl(0, 100%, 70%)',
            }}
          >
            {loading ? '驗證中...' : '進 入'}
          </button>
        </div>

        <div
          className="mt-8 pt-4 text-center text-xs tracking-wider"
          style={{
            color: 'hsl(0, 50%, 40%)',
            borderTop: '1px dashed hsl(0, 50%, 30%)',
          }}
        >
           警告 未經授權存取將被記錄 警告
          <br />
          UNAUTHORIZED ACCESS WILL BE TRACED
        </div>
      </div>
    </div>
  );
};

// ==================== 使用者管理 ====================
const UsersSection: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState<GmUserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<GmUserSearchResult | null>(null);
  const [editForm, setEditForm] = useState<GmUpdateUserRequest>({});
  const [skinText, setSkinText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [rewardCoins, setRewardCoins] = useState('');
  const [rewardItems, setRewardItems] = useState('');
  const [rewardSkins, setRewardSkins] = useState('');
  const [rewardReason, setRewardReason] = useState('');
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('請輸入關鍵字');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await gmApi.searchUsers(keyword);
      setUsers(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '搜尋失敗';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: GmUserSearchResult) => {
    setEditingUser(user);
    setEditForm({
      elo: user.elo,
      wins: user.wins,
      losses: user.losses,
      coins: user.coins,
      level: user.level,
      isBanned: user.isBanned,
      banReason: '',
      unlockedSkins: [],
      unlockedTitles: [],
    });
    setSkinText('');
    setTitleText('');
    setShowReward(false);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    const patch: GmUpdateUserRequest = {};
    if (editForm.elo !== undefined) patch.elo = Number(editForm.elo);
    if (editForm.wins !== undefined) patch.wins = Number(editForm.wins);
    if (editForm.losses !== undefined) patch.losses = Number(editForm.losses);
    if (editForm.coins !== undefined) patch.coins = Number(editForm.coins);
    if (editForm.level !== undefined) patch.level = Number(editForm.level);
    if (editForm.isBanned !== undefined) patch.isBanned = editForm.isBanned;
    if (editForm.isBanned && editForm.banReason) patch.banReason = editForm.banReason;
    if (skinText.trim()) {
      patch.unlockedSkins = skinText.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (titleText.trim()) {
      patch.unlockedTitles = titleText.split(',').map((s) => s.trim()).filter(Boolean);
    }
    try {
      const updated = await gmApi.updateUser(editingUser.id, patch);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      showSuccess('使用者資料已更新');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '更新失敗';
      setError(msg);
    }
  };

  const handleSendReward = async () => {
    if (!editingUser) return;
    // 至少要有一項獎勵內容
    if (!rewardCoins.trim() && !rewardItems.trim() && !rewardSkins.trim()) {
      setError('請至少填寫一項獎勵內容');
      return;
    }
    const data: { coins?: number; items?: Record<string, number>; skins?: string[]; reason?: string } = {};
    if (rewardCoins.trim()) {
      const coins = Number(rewardCoins);
      if (!Number.isFinite(coins)) {
        setError('金幣數量必須是有效數字');
        return;
      }
      data.coins = coins;
    }
    if (rewardItems.trim()) {
      const items: Record<string, number> = {};
      rewardItems.split(',').forEach((pair) => {
        const [k, v] = pair.split(':').map((s) => s.trim());
        if (k && v) items[k] = Number(v);
      });
      if (Object.keys(items).length > 0) data.items = items;
    }
    if (rewardSkins.trim()) {
      data.skins = rewardSkins.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (rewardReason.trim()) data.reason = rewardReason;

    try {
      await gmApi.sendReward(editingUser.id, data);
      setShowReward(false);
      setRewardCoins('');
      setRewardItems('');
      setRewardSkins('');
      setRewardReason('');
      showSuccess('獎勵已發放');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '發放失敗';
      setError(msg);
    }
  };

  const handleReset = async () => {
    if (!confirmReset) return;
    try {
      await gmApi.resetUser(confirmReset);
      setUsers((prev) => prev.filter((u) => u.id !== confirmReset));
      setConfirmReset(null);
      setEditingUser(null);
      showSuccess('使用者數據已重置');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '重置失敗';
      setError(msg);
    }
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div
          className="p-3 rounded text-sm font-bold text-center"
          style={{
            background: 'hsl(140, 50%, 15%)',
            color: 'hsl(140, 80%, 70%)',
            border: '1px solid hsl(140, 60%, 40%)',
          }}
        >
          成功 {successMsg}
        </div>
      )}
      {error && (
        <div
          className="p-3 rounded text-sm text-center"
          style={{
            background: 'hsl(0, 60%, 15%)',
            color: 'hsl(0, 80%, 70%)',
            border: '1px solid hsl(0, 60%, 40%)',
          }}
        >
          錯誤 {error}
        </div>
      )}

      {/* 搜尋列 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="輸入暱稱或帳號搜尋..."
          className="flex-1 px-4 py-2 rounded outline-none"
          style={{
            background: 'hsl(0, 30%, 5%)',
            border: '1px solid hsl(0, 60%, 40%)',
            color: 'hsl(0, 20%, 90%)',
            caretColor: 'hsl(0, 100%, 60%)',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 font-bold rounded transition-all hover:scale-105 disabled:opacity-50"
          style={{
            background: 'hsl(0, 100%, 50%)',
            color: 'white',
            boxShadow: '0 0 10px hsl(0, 100%, 60%, 0.5)',
          }}
        >
          {loading ? '搜尋中...' : '搜尋'}
        </button>
      </div>

      {/* 使用者列表 */}
      {users.length > 0 && (
        <div className="overflow-x-auto rounded" style={{ border: '1px solid hsl(0, 50%, 30%)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(0, 40%, 12%)' }}>
                {['ID', '暱稱', '第三方登入', 'ELO', '勝場', '等級', '註冊時間', '狀態', '操作'].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-bold tracking-wider"
                    style={{ color: 'hsl(0, 80%, 70%)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t"
                  style={{
                    borderColor: 'hsl(0, 30%, 20%)',
                    background: 'hsl(0, 20%, 6%)',
                  }}
                >
                  <td className="px-3 py-2" style={{ color: 'hsl(0, 20%, 60%)' }}>
                    {user.id.slice(0, 8)}...
                  </td>
                  <td className="px-3 py-2 font-bold" style={{ color: 'hsl(0, 20%, 90%)' }}>
                    {user.nickname}
                  </td>
                  <td className="px-3 py-2">
                    {user.oauthBindings && user.oauthBindings.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.oauthBindings.map((b: GmOAuthBinding) => (
                          <span
                            key={b.provider}
                            className="px-2 py-0.5 rounded text-xs font-bold"
                            style={{
                              border: `1px solid ${providerStyle(b.provider).color}`,
                              color: providerStyle(b.provider).color,
                              background: providerStyle(b.provider).bg,
                              boxShadow: `0 0 6px ${providerStyle(b.provider).glow}`,
                            }}
                          >
                            {providerLabel(b.provider)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: 'hsl(0, 20%, 45%)' }}>
                        無
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2" style={{ color: 'hsl(0, 20%, 80%)' }}>
                    {user.elo}
                  </td>
                  <td className="px-3 py-2" style={{ color: 'hsl(0, 20%, 80%)' }}>
                    {user.wins}
                  </td>
                  <td className="px-3 py-2" style={{ color: 'hsl(0, 20%, 80%)' }}>
                    Lv.{user.level}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: 'hsl(0, 20%, 60%)' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        background: user.isBanned ? 'hsl(0, 80%, 20%)' : 'hsl(140, 50%, 15%)',
                        color: user.isBanned ? 'hsl(0, 100%, 70%)' : 'hsl(140, 80%, 60%)',
                      }}
                    >
                      {user.isBanned ? '已封禁' : '正常'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="px-3 py-1 text-xs rounded transition-all hover:scale-105"
                      style={{
                        border: '1px solid hsl(0, 60%, 50%)',
                        color: 'hsl(0, 100%, 70%)',
                        background: 'transparent',
                      }}
                    >
                      編輯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 編輯彈窗 */}
      {editingUser && !showReward && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-lg"
            style={{
              background: 'hsl(0, 30%, 8%)',
              border: '2px solid hsl(0, 100%, 60%)',
              boxShadow: '0 0 30px hsl(0, 100%, 50%, 0.4)',
            }}
          >
            <h3
              className="text-xl font-bold mb-4 tracking-wider"
              style={{ color: 'hsl(0, 100%, 70%)', textShadow: '0 0 10px hsl(0, 100%, 60%)' }}
            >
              編輯使用者 - {editingUser.nickname}
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <GmInput
                label="ELO 評分"
                type="number"
                value={editForm.elo ?? 0}
                onChange={(v) => setEditForm({ ...editForm, elo: Number(v) })}
              />
              <GmInput
                label="勝場"
                type="number"
                value={editForm.wins ?? 0}
                onChange={(v) => setEditForm({ ...editForm, wins: Number(v) })}
              />
              <GmInput
                label="負場"
                type="number"
                value={editForm.losses ?? 0}
                onChange={(v) => setEditForm({ ...editForm, losses: Number(v) })}
              />
              <GmInput
                label="金幣"
                type="number"
                value={editForm.coins ?? 0}
                onChange={(v) => setEditForm({ ...editForm, coins: Number(v) })}
              />
              <GmInput
                label="等級"
                type="number"
                value={editForm.level ?? 1}
                onChange={(v) => setEditForm({ ...editForm, level: Number(v) })}
              />
            </div>

              <div className="space-y-3 mb-4">
                <GmInput
                  label="已解鎖皮膚（逗號分隔）"
                  value={skinText}
                  onChange={setSkinText}
                  placeholder="例如: mecha,ufo,dragon"
                />
                <GmInput
                  label="已解鎖稱號（逗號分隔）"
                  value={titleText}
                  onChange={setTitleText}
                  placeholder="例如: tycoon,champion"
                />
              </div>

              <div
                className="mb-4 p-3 rounded"
                style={{ border: '1px solid hsl(270, 60%, 40%)', background: 'hsl(270, 30%, 8%)' }}
              >
                <h4
                  className="text-sm font-bold mb-2 tracking-wider"
                  style={{ color: 'hsl(270, 90%, 75%)', textShadow: '0 0 6px hsl(270, 80%, 60%)' }}
                >
                  第三方登入綁定
                </h4>
                {editingUser.oauthBindings && editingUser.oauthBindings.length > 0 ? (
                  <div className="space-y-2">
                    {editingUser.oauthBindings.map((b: GmOAuthBinding) => {
                      const style = providerStyle(b.provider);
                      return (
                        <div
                          key={b.provider}
                          className="flex items-center justify-between p-2 rounded"
                          style={{
                            border: `1px solid ${style.color}`,
                            background: style.bg,
                            boxShadow: `0 0 8px ${style.glow}`,
                          }}
                        >
                          <div>
                            <div
                              className="text-sm font-bold"
                              style={{ color: style.color, textShadow: `0 0 4px ${style.glow}` }}
                            >
                              {providerLabel(b.provider)}
                            </div>
                            <div className="text-xs" style={{ color: 'hsl(0, 20%, 70%)' }}>
                              {b.displayName || b.email || b.providerUserId}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs" style={{ color: 'hsl(0, 20%, 50%)' }}>
                              綁定時間
                            </div>
                            <div className="text-xs font-mono" style={{ color: 'hsl(0, 20%, 70%)' }}>
                              {new Date(b.boundAt).toLocaleString('zh-TW')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'hsl(0, 20%, 50%)' }}>
                    此使用者未綁定任何第三方帳號
                  </p>
                )}
              </div>

            <div className="space-y-3 mb-6 p-3 rounded" style={{ border: '1px solid hsl(0, 60%, 30%)' }}>
              <GmSwitch
                label="封禁狀態"
                checked={!!editForm.isBanned}
                onChange={(v) => setEditForm({ ...editForm, isBanned: v })}
              />
              {editForm.isBanned && (
                <GmInput
                  label="封禁原因"
                  value={editForm.banReason ?? ''}
                  onChange={(v) => setEditForm({ ...editForm, banReason: v })}
                  placeholder="請輸入封禁原因"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setShowReward(true)}
                className="px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105"
                style={{
                  background: 'hsl(40, 80%, 45%)',
                  color: 'white',
                  boxShadow: '0 0 10px hsl(40, 80%, 50%, 0.5)',
                }}
              >
                 發放獎勵
              </button>
              <button
                onClick={() => setConfirmReset(editingUser.id)}
                className="px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105"
                style={{
                  background: 'hsl(0, 80%, 30%)',
                  color: 'white',
                  border: '1px solid hsl(0, 100%, 60%)',
                }}
              >
                 警告 重置數據
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm rounded"
                style={{
                  border: '1px solid hsl(0, 50%, 40%)',
                  color: 'hsl(0, 20%, 70%)',
                  background: 'transparent',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105"
                style={{
                  background: 'hsl(0, 100%, 50%)',
                  color: 'white',
                  boxShadow: '0 0 10px hsl(0, 100%, 60%, 0.5)',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 獎勵發放彈窗 */}
      {showReward && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-md p-6 rounded-lg"
            style={{
              background: 'hsl(0, 30%, 8%)',
              border: '2px solid hsl(40, 80%, 50%)',
              boxShadow: '0 0 30px hsl(40, 80%, 50%, 0.4)',
            }}
          >
            <h3
              className="text-xl font-bold mb-4 tracking-wider"
              style={{ color: 'hsl(40, 100%, 70%)', textShadow: '0 0 10px hsl(40, 80%, 50%)' }}
            >
               發放獎勵 - {editingUser.nickname}
            </h3>
            <div className="space-y-3 mb-6">
              <GmInput
                label="金幣數量"
                type="number"
                value={rewardCoins}
                onChange={setRewardCoins}
                placeholder="例如: 1000"
              />
              <GmInput
                label="道具（格式: 道具ID:數量，逗號分隔）"
                value={rewardItems}
                onChange={setRewardItems}
                placeholder="例如: double_dice:2,shield:1"
              />
              <GmInput
                label="皮膚（逗號分隔）"
                value={rewardSkins}
                onChange={setRewardSkins}
                placeholder="例如: mecha,gold"
              />
              <GmInput
                label="發放原因"
                value={rewardReason}
                onChange={setRewardReason}
                placeholder="例如: 活動獎勵"
                textarea
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReward(false)}
                className="px-4 py-2 text-sm rounded"
                style={{
                  border: '1px solid hsl(0, 50%, 40%)',
                  color: 'hsl(0, 20%, 70%)',
                  background: 'transparent',
                }}
              >
                返回
              </button>
              <button
                onClick={handleSendReward}
                className="px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105"
                style={{
                  background: 'hsl(40, 80%, 50%)',
                  color: 'white',
                  boxShadow: '0 0 10px hsl(40, 80%, 60%, 0.5)',
                }}
              >
                確認發放
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重置確認 */}
      <ConfirmDialog
        open={!!confirmReset}
        title="確認重置？"
        message="此操作將清空該使用者的所有遊戲數據（金幣、ELO、皮膚等），且無法恢復。"
        confirmText="確認重置"
        danger
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(null)}
      />
    </div>
  );
};

// ==================== 公告管理 ====================
const AnnouncementsSection: React.FC = () => {
  const [list, setList] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState('0');
  const [formActive, setFormActive] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await gmApi.getAnnouncements();
      setList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '載入失敗';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openNew = () => {
    setIsNew(true);
    setEditing(null);
    setFormTitle('');
    setFormContent('');
    setFormPriority('0');
    setFormActive(true);
  };

  const openEdit = (a: Announcement) => {
    setIsNew(false);
    setEditing(a);
    setFormTitle(a.title);
    setFormContent(a.content);
    setFormPriority(String(a.priority));
    setFormActive(a.isActive);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      setError('標題和內容不能為空');
      return;
    }
    try {
      const payload = {
        title: formTitle,
        content: formContent,
        priority: Number(formPriority),
        isActive: formActive,
      };
      if (isNew) {
        const created = await gmApi.createAnnouncement(payload);
        setList((prev) => [created, ...prev]);
      } else if (editing) {
        const updated = await gmApi.updateAnnouncement(editing.id, payload);
        setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      }
      setEditing(null);
      setIsNew(false);
      showSuccess('公告已保存');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失敗';
      setError(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await gmApi.deleteAnnouncement(deleteId);
      setList((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      showSuccess('公告已刪除');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '刪除失敗';
      setError(msg);
    }
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="p-3 rounded text-sm font-bold text-center" style={{ background: 'hsl(140, 50%, 15%)', color: 'hsl(140, 80%, 70%)', border: '1px solid hsl(140, 60%, 40%)' }}>
          成功 {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 rounded text-sm text-center" style={{ background: 'hsl(0, 60%, 15%)', color: 'hsl(0, 80%, 70%)', border: '1px solid hsl(0, 60%, 40%)' }}>
          錯誤 {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-wider" style={{ color: 'hsl(0, 100%, 70%)' }}>
          公告列表
        </h2>
        <button
          onClick={openNew}
          className="px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105"
          style={{ background: 'hsl(0, 100%, 50%)', color: 'white', boxShadow: '0 0 10px hsl(0, 100%, 60%, 0.5)' }}
        >
          + 新增公告
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8" style={{ color: 'hsl(0, 30%, 60%)' }}>載入中...</div>
      ) : (
        <div className="space-y-2">
          {list.length === 0 && (
            <div className="text-center py-8" style={{ color: 'hsl(0, 30%, 60%)' }}>
              尚無公告
            </div>
          )}
          {list.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              style={{ background: 'hsl(0, 20%, 6%)', border: '1px solid hsl(0, 40%, 25%)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold" style={{ color: 'hsl(0, 20%, 90%)' }}>{a.title}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      background: a.isActive ? 'hsl(140, 50%, 15%)' : 'hsl(0, 30%, 20%)',
                      color: a.isActive ? 'hsl(140, 80%, 60%)' : 'hsl(0, 30%, 60%)',
                    }}
                  >
                    {a.isActive ? '啟用' : '停用'}
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(0, 30%, 50%)' }}>
                    優先級: {a.priority}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'hsl(0, 20%, 60%)' }}>
                  創建時間: {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(a)}
                  className="px-3 py-1 text-xs rounded"
                  style={{ border: '1px solid hsl(0, 60%, 50%)', color: 'hsl(0, 100%, 70%)', background: 'transparent' }}
                >
                  編輯
                </button>
                <button
                  onClick={() => setDeleteId(a.id)}
                  className="px-3 py-1 text-xs rounded"
                  style={{ border: '1px solid hsl(0, 80%, 50%)', color: 'hsl(0, 100%, 80%)', background: 'hsl(0, 60%, 15%)' }}
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 編輯/新增彈窗 */}
      {(editing || isNew) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-lg p-6 rounded-lg"
            style={{ background: 'hsl(0, 30%, 8%)', border: '2px solid hsl(0, 100%, 60%)', boxShadow: '0 0 30px hsl(0, 100%, 50%, 0.4)' }}
          >
            <h3 className="text-xl font-bold mb-4 tracking-wider" style={{ color: 'hsl(0, 100%, 70%)', textShadow: '0 0 10px hsl(0, 100%, 60%)' }}>
              {isNew ? '新增公告' : '編輯公告'}
            </h3>
            <div className="space-y-3 mb-6">
              <GmInput label="標題" value={formTitle} onChange={setFormTitle} placeholder="請輸入公告標題" />
              <GmInput label="內容" value={formContent} onChange={setFormContent} placeholder="請輸入公告內容" textarea rows={5} />
              <div className="grid grid-cols-2 gap-3">
                <GmInput label="優先級" type="number" value={formPriority} onChange={setFormPriority} />
                <div className="flex items-end">
                  <GmSwitch label="啟用狀態" checked={formActive} onChange={setFormActive} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="px-4 py-2 text-sm rounded"
                style={{ border: '1px solid hsl(0, 50%, 40%)', color: 'hsl(0, 20%, 70%)', background: 'transparent' }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105"
                style={{ background: 'hsl(0, 100%, 50%)', color: 'white', boxShadow: '0 0 10px hsl(0, 100%, 60%, 0.5)' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="確認刪除？"
        message="此公告將被永久刪除，無法恢復。"
        confirmText="確認刪除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

// ==================== 活動管理 ====================
const EventsSection: React.FC = () => {
  const [list, setList] = useState<GlobalEventConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<GlobalEventConfig | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('economic_crisis');
  const [formDesc, setFormDesc] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');
  const [formConfig, setFormConfig] = useState('{}');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const EVENT_TYPE_OPTIONS = [
    { value: 'double_coins', label: '雙倍金幣' },
    { value: 'double_exp', label: '雙倍經驗' },
    { value: 'limited_item', label: '限時道具' },
    { value: 'economic_crisis', label: '經濟危機' },
    { value: 'tech_boom', label: '科技繁榮' },
    { value: 'neon_festival', label: '霓虹嘉年華' },
  ];

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await gmApi.getEvents();
      setList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '載入失敗';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const openNew = () => {
    setIsNew(true);
    setEditing(null);
    setFormName('');
    setFormType('economic_crisis');
    setFormDesc('');
    setFormActive(true);
    setFormStart('');
    setFormEnd('');
    setFormConfig('{}');
  };

  const openEdit = (e: GlobalEventConfig) => {
    setIsNew(false);
    setEditing(e);
    setFormName(e.name);
    setFormType(e.eventType);
    setFormDesc(e.description || '');
    setFormActive(e.isActive);
    setFormStart(e.startsAt ? e.startsAt.slice(0, 16) : '');
    setFormEnd(e.endsAt ? e.endsAt.slice(0, 16) : '');
    setFormConfig(JSON.stringify(e.config, null, 2));
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setError('活動名稱不能為空');
      return;
    }
    // 時間區間合理性檢查：若兩者皆填，結束時間不得早於開始時間
    if (formStart && formEnd && new Date(formEnd).getTime() <= new Date(formStart).getTime()) {
      setError('結束時間必須晚於開始時間');
      return;
    }
    let config: Record<string, unknown> = {};
    try {
      config = JSON.parse(formConfig);
    } catch {
      setError('配置 JSON 格式錯誤');
      return;
    }
    if (typeof config !== 'object' || config === null || Array.isArray(config)) {
      setError('配置 JSON 必須是物件（{}）');
      return;
    }
    try {
      const payload = {
        name: formName,
        eventType: formType,
        description: formDesc,
        isActive: formActive,
        startsAt: formStart || undefined,
        endsAt: formEnd || undefined,
        config,
      };
      if (isNew) {
        const created = await gmApi.createEvent(payload);
        setList((prev) => [created, ...prev]);
      } else if (editing) {
        const updated = await gmApi.updateEvent(editing.id, payload);
        setList((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      }
      setEditing(null);
      setIsNew(false);
      showSuccess('活動已保存');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '保存失敗';
      setError(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await gmApi.deleteEvent(deleteId);
      setList((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      showSuccess('活動已刪除');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '刪除失敗';
      setError(msg);
    }
  };

  return (
    <div className="space-y-4">
      {successMsg && (
        <div className="p-3 rounded text-sm font-bold text-center" style={{ background: 'hsl(140, 50%, 15%)', color: 'hsl(140, 80%, 70%)', border: '1px solid hsl(140, 60%, 40%)' }}>
          成功 {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 rounded text-sm text-center" style={{ background: 'hsl(0, 60%, 15%)', color: 'hsl(0, 80%, 70%)', border: '1px solid hsl(0, 60%, 40%)' }}>
          錯誤 {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-wider" style={{ color: 'hsl(0, 100%, 70%)' }}>
          活動列表
        </h2>
        <button
          onClick={openNew}
          className="px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105"
          style={{ background: 'hsl(0, 100%, 50%)', color: 'white', boxShadow: '0 0 10px hsl(0, 100%, 60%, 0.5)' }}
        >
          + 新增活動
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8" style={{ color: 'hsl(0, 30%, 60%)' }}>載入中...</div>
      ) : (
        <div className="space-y-2">
          {list.length === 0 && (
            <div className="text-center py-8" style={{ color: 'hsl(0, 30%, 60%)' }}>尚無活動</div>
          )}
          {list.map((e) => (
            <div
              key={e.id}
              className="p-4 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              style={{ background: 'hsl(0, 20%, 6%)', border: '1px solid hsl(0, 40%, 25%)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold" style={{ color: 'hsl(0, 20%, 90%)' }}>{e.name}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{ background: 'hsl(270, 50%, 20%)', color: 'hsl(270, 80%, 70%)' }}
                  >
                    {e.eventType}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      background: e.isActive ? 'hsl(140, 50%, 15%)' : 'hsl(0, 30%, 20%)',
                      color: e.isActive ? 'hsl(140, 80%, 60%)' : 'hsl(0, 30%, 60%)',
                    }}
                  >
                    {e.isActive ? '啟用' : '停用'}
                  </span>
                </div>
                {e.description && (
                  <div className="text-xs mb-1" style={{ color: 'hsl(0, 20%, 70%)' }}>{e.description}</div>
                )}
                <div className="text-xs" style={{ color: 'hsl(0, 20%, 60%)' }}>
                  {e.startsAt && <>開始: {new Date(e.startsAt).toLocaleString()}</>}
                  {e.endsAt && <> 〜 結束: {new Date(e.endsAt).toLocaleString()}</>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(e)}
                  className="px-3 py-1 text-xs rounded"
                  style={{ border: '1px solid hsl(0, 60%, 50%)', color: 'hsl(0, 100%, 70%)', background: 'transparent' }}
                >
                  編輯
                </button>
                <button
                  onClick={() => setDeleteId(e.id)}
                  className="px-3 py-1 text-xs rounded"
                  style={{ border: '1px solid hsl(0, 80%, 50%)', color: 'hsl(0, 100%, 80%)', background: 'hsl(0, 60%, 15%)' }}
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 編輯/新增彈窗 */}
      {(editing || isNew) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-lg"
            style={{ background: 'hsl(0, 30%, 8%)', border: '2px solid hsl(0, 100%, 60%)', boxShadow: '0 0 30px hsl(0, 100%, 50%, 0.4)' }}
          >
            <h3 className="text-xl font-bold mb-4 tracking-wider" style={{ color: 'hsl(0, 100%, 70%)', textShadow: '0 0 10px hsl(0, 100%, 60%)' }}>
              {isNew ? '新增活動' : '編輯活動'}
            </h3>
            <div className="space-y-3 mb-6">
              <GmInput label="活動名稱" value={formName} onChange={setFormName} placeholder="請輸入活動名稱" />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold tracking-wider" style={{ color: 'hsl(0, 80%, 75%)' }}>活動類型</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded outline-none"
                  style={{ background: 'hsl(0, 30%, 5%)', border: '1px solid hsl(0, 60%, 40%)', color: 'hsl(0, 20%, 90%)' }}
                >
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <GmInput label="描述" value={formDesc} onChange={setFormDesc} placeholder="請輸入活動描述" textarea rows={2} />
              <GmSwitch label="啟用狀態" checked={formActive} onChange={setFormActive} />
              <div className="grid grid-cols-2 gap-3">
                <GmInput label="開始時間" type="datetime-local" value={formStart} onChange={setFormStart} />
                <GmInput label="結束時間" type="datetime-local" value={formEnd} onChange={setFormEnd} />
              </div>
              <GmInput label="配置（JSON）" value={formConfig} onChange={setFormConfig} placeholder='{"multiplier": 2}' textarea rows={4} />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setEditing(null); setIsNew(false); }}
                className="px-4 py-2 text-sm rounded"
                style={{ border: '1px solid hsl(0, 50%, 40%)', color: 'hsl(0, 20%, 70%)', background: 'transparent' }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 text-sm font-bold rounded transition-all hover:scale-105"
                style={{ background: 'hsl(0, 100%, 50%)', color: 'white', boxShadow: '0 0 10px hsl(0, 100%, 60%, 0.5)' }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="確認刪除？"
        message="此活動將被永久刪除，無法恢復。"
        confirmText="確認刪除"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

// ==================== 在線使用者 ====================
const OnlineUsersSection: React.FC = () => {
  const [list, setList] = useState<GmOnlineUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await gmApi.getOnlineUsers();
      setList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '載入失敗';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold tracking-wider" style={{ color: 'hsl(0, 100%, 70%)' }}>
          在線使用者
        </h2>
        <button
          onClick={loadList}
          className="px-4 py-2 text-sm font-bold rounded transition-all hover:scale-105"
          style={{ border: '1px solid hsl(0, 60%, 50%)', color: 'hsl(0, 100%, 70%)', background: 'transparent' }}
        >
           重新整理
        </button>
      </div>

      {error && (
        <div className="p-3 rounded text-sm text-center" style={{ background: 'hsl(0, 60%, 15%)', color: 'hsl(0, 80%, 70%)', border: '1px solid hsl(0, 60%, 40%)' }}>
          錯誤 {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8" style={{ color: 'hsl(0, 30%, 60%)' }}>載入中...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'hsl(0, 30%, 60%)' }}>當無在線使用者</div>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: '1px solid hsl(0, 50%, 30%)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'hsl(0, 40%, 12%)' }}>
                {['暱稱', 'ELO', '等級', '最後活躍'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-bold tracking-wider" style={{ color: 'hsl(0, 80%, 70%)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((user) => (
                <tr key={user.id} className="border-t" style={{ borderColor: 'hsl(0, 30%, 20%)', background: 'hsl(0, 20%, 6%)' }}>
                  <td className="px-3 py-2 font-bold" style={{ color: 'hsl(0, 20%, 90%)' }}>{user.nickname}</td>
                  <td className="px-3 py-2" style={{ color: 'hsl(0, 20%, 80%)' }}>{user.elo}</td>
                  <td className="px-3 py-2" style={{ color: 'hsl(0, 20%, 80%)' }}>Lv.{user.level}</td>
                  <td className="px-3 py-2 text-xs" style={{ color: 'hsl(0, 20%, 60%)' }}>
                    {new Date(user.lastActiveAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ==================== 主面板 ====================
const GmMainPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<GmMenuKey>('users');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeMenu) {
      case 'users': return <UsersSection />;
      case 'announcements': return <AnnouncementsSection />;
      case 'events': return <EventsSection />;
      case 'online': return <OnlineUsersSection />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(0, 30%, 5%)' }}>
      {/* 頂部欄 */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: 'hsl(0, 40%, 8%)',
          borderBottom: '2px solid hsl(0, 100%, 50%)',
          boxShadow: '0 2px 20px hsl(0, 100%, 50%, 0.3)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-2xl"
            style={{ color: 'hsl(0, 100%, 70%)' }}
          >
             選單
          </button>
          <h1
            className="text-lg md:text-xl font-bold tracking-widest"
            style={{
              color: 'hsl(0, 100%, 60%)',
              textShadow: '0 0 10px hsl(0, 100%, 60%)',
            }}
          >
             GM 控制台
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-1.5 text-sm font-bold rounded transition-all hover:scale-105"
          style={{
            border: '1px solid hsl(0, 80%, 50%)',
            color: 'hsl(0, 100%, 70%)',
            background: 'transparent',
          }}
        >
          退出 GM
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 側邊欄 */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative z-20 w-56 h-[calc(100vh-57px)] transition-transform flex flex-col`}
          style={{
            background: 'hsl(0, 30%, 7%)',
            borderRight: '1px solid hsl(0, 50%, 30%)',
          }}
        >
          <nav className="flex-1 py-4 px-2 space-y-1">
            {GM_MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveMenu(item.key);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded transition-all"
                style={{
                  background:
                    activeMenu === item.key
                      ? 'hsl(0, 80%, 20%)'
                      : 'transparent',
                  color:
                    activeMenu === item.key
                      ? 'hsl(0, 100%, 90%)'
                      : 'hsl(0, 20%, 70%)',
                  boxShadow:
                    activeMenu === item.key
                      ? 'inset 0 0 10px hsl(0, 100%, 50%, 0.3)'
                      : 'none',
                  borderLeft:
                    activeMenu === item.key
                      ? '3px solid hsl(0, 100%, 60%)'
                      : '3px solid transparent',
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-bold tracking-wider text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div
            className="p-3 text-xs text-center tracking-wider"
            style={{
              color: 'hsl(0, 30%, 40%)',
              borderTop: '1px dashed hsl(0, 30%, 25%)',
            }}
          >
            系統版本 v1.0.0
            <br />
             警告 所有操作均被記錄
          </div>
        </aside>

        {/* 遮罩 */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-10 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主內容 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

// ==================== 根組件 ====================
const GmPanelPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => hasGmToken());

  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    clearGmToken();
    setIsLoggedIn(false);
    logger.info({ level: 'info', args: ['GM 已登出'] });
  }, []);

  return isLoggedIn ? (
    <GmMainPanel onLogout={handleLogout} />
  ) : (
    <GmLoginView onSuccess={handleLoginSuccess} />
  );
};

export default GmPanelPage;
