import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Activity,
  Trophy,
  MessageCircle,
  Swords,
  X,
  AlertCircle,
  Crown,
  Zap,
  Star,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getFriends,
  getFriendRequests,
  acceptRequest,
  rejectRequest,
  addFriend,
  removeFriend,
  getRecentPlayers,
  getFriendActivities,
  searchUsers,
} from '@client/src/utils/friends-store';
import type {
  FriendInfo,
  FriendRequest,
  RecentPlayer,
  FriendActivity,
  OnlineStatus,
} from '@client/src/utils/friends.types';
import FriendMatchHistory from './FriendMatchHistory';
import PullToRefresh from '@client/src/components/PullToRefresh';

type TabType = 'friends' | 'requests' | 'recent' | 'activity' | 'history';

const STATUS_ORDER: Record<OnlineStatus, number> = {
  online: 0,
  in_game: 1,
  away: 2,
  offline: 3,
};

const STATUS_INFO: Record<OnlineStatus, { label: string; color: string }> = {
  online: { label: '線上', color: 'var(--green)' },
  in_game: { label: '遊戲中', color: 'var(--red)' },
  away: { label: '暫離', color: 'var(--yellow, #ffd93d)' },
  offline: { label: '離線', color: 'var(--text-secondary)' },
};

const ACTIVITY_ICONS: Record<FriendActivity['type'], typeof Trophy> = {
  achievement: Trophy,
  rank_up: Crown,
  new_title: Star,
  win_streak: Zap,
};

const ACTIVITY_COLORS: Record<FriendActivity['type'], string> = {
  achievement: 'var(--yellow, #ffd93d)',
  rank_up: 'var(--pink)',
  new_title: 'var(--purple, #b388ff)',
  win_streak: 'var(--green)',
};

function avatarColor(seed: string): string {
  const colors = [
    'linear-gradient(135deg, var(--cyan), var(--purple))',
    'linear-gradient(135deg, var(--pink), var(--purple))',
    'linear-gradient(135deg, var(--cyan), var(--green))',
    'linear-gradient(135deg, var(--pink), var(--red))',
    'linear-gradient(135deg, var(--yellow, #ffd93d), var(--pink))',
    'linear-gradient(135deg, var(--purple, #b388ff), var(--blue))',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '剛剛';
  if (mins < 60) return `${mins} 分鐘前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;
  return date.toLocaleDateString('zh-TW');
}

const FriendsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friendsList, setFriendsList] = useState<FriendInfo[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [recentPlayers, setRecentPlayers] = useState<RecentPlayer[]>([]);
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    Array<{ userId: string; nickname: string; rank?: string; isFriend: boolean }>
  >([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [friendToDelete, setFriendToDelete] = useState<FriendInfo | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // 載入所有資料
  const loadAllData = useCallback(() => {
    setFriendsList(getFriends());
    setRequests(getFriendRequests());
    setRecentPlayers(getRecentPlayers());
    setActivities(getFriendActivities());
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    loadAllData();
    setRefreshKey((k) => k + 1);
  }, [loadAllData]);

  // 排序後的好友列表
  const sortedFriends = useMemo(() => {
    return [...friendsList].sort(
      (a: FriendInfo, b: FriendInfo) =>
        STATUS_ORDER[a.onlineStatus] - STATUS_ORDER[b.onlineStatus],
    );
  }, [friendsList]);

  // 收到的請求
  const incomingRequests = useMemo(
    () => requests.filter((r: FriendRequest) => r.toUserId === 'self'),
    [requests],
  );

  // 發出的請求
  const outgoingRequests = useMemo(
    () => requests.filter((r: FriendRequest) => r.fromUserId === 'self'),
    [requests],
  );

  // 線上好友數
  const onlineCount = useMemo(
    () => friendsList.filter((f: FriendInfo) => f.onlineStatus !== 'offline').length,
    [friendsList],
  );

  // 搜尋使用者
  const handleSearch = useCallback(() => {
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = searchUsers(trimmed);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  }, [searchInput]);

  const handleSearchSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSearch();
    },
    [handleSearch],
  );

  const showSearchResults = searchQuery.length > 0 && activeTab !== 'history';

  // 選擇好友
  const handleSelectFriend = useCallback((friend: FriendInfo) => {
    setSelectedFriend(friend);
  }, []);

  // 發送好友邀請
  const handleAddFriend = useCallback(
    (userId: string, nickname: string) => {
      setActionLoading(userId);
      try {
        const success = addFriend(userId, nickname, '一起來玩賽博大富翁吧！');
        if (success) {
          toast.success(`已向 ${nickname} 發送好友請求`);
          loadAllData();
          setSearchResults((prev) =>
            prev.map((u) => (u.userId === userId ? { ...u, isFriend: true } : u)),
          );
        } else {
          toast.error('發送失敗，可能已是好友');
        }
      } catch {
        toast.error('發送好友請求失敗');
      } finally {
        setActionLoading(null);
      }
    },
    [loadAllData],
  );

  // 接受請求
  const handleAcceptRequest = useCallback(
    (requestId: string) => {
      setActionLoading(requestId);
      try {
        const newFriend = acceptRequest(requestId);
        if (newFriend) {
          toast.success(`已新增 ${newFriend.nickname} 為好友`);
          loadAllData();
        } else {
          toast.error('接受請求失敗');
        }
      } finally {
        setActionLoading(null);
      }
    },
    [loadAllData],
  );

  // 拒絕請求
  const handleRejectRequest = useCallback(
    (requestId: string) => {
      setActionLoading(requestId);
      try {
        const success = rejectRequest(requestId);
        if (success) {
          toast.success('已拒絕好友請求');
          loadAllData();
        } else {
          toast.error('操作失敗');
        }
      } finally {
        setActionLoading(null);
      }
    },
    [loadAllData],
  );

  // 撤銷發出的請求
  const handleCancelRequest = useCallback(
    (requestId: string) => {
      setActionLoading(requestId);
      try {
        const all = getFriendRequests();
        const filtered = all.filter((r: FriendRequest) => r.id !== requestId);
        // 直接存儲（通過 saveRequests 不可用，手動處理）
        try {
          localStorage.setItem('monopoly_friends_requests', JSON.stringify(filtered));
        } catch {
          // ignore
        }
        toast.success('已撤銷好友請求');
        loadAllData();
      } finally {
        setActionLoading(null);
      }
    },
    [loadAllData],
  );

  // 從最近玩家加好友
  const handleAddRecentFriend = useCallback(
    (player: RecentPlayer) => {
      setActionLoading(player.userId);
      try {
        const success = addFriend(player.userId, player.nickname, '上次對戰很精彩！');
        if (success) {
          toast.success(`已向 ${player.nickname} 發送好友請求`);
          loadAllData();
        } else {
          toast.error('發送失敗');
        }
      } finally {
        setActionLoading(null);
      }
    },
    [loadAllData],
  );

  // 邀請組隊
  const handleInviteTeam = useCallback((friend: FriendInfo) => {
    toast.success(`已向 ${friend.nickname} 發出組隊邀請`);
  }, []);

  // 打開刪除確認
  const handleDeleteClick = useCallback((friend: FriendInfo) => {
    setFriendToDelete(friend);
    setShowDeleteDialog(true);
  }, []);

  // 確認刪除
  const confirmDelete = useCallback(() => {
    if (!friendToDelete) return;
    const success = removeFriend(friendToDelete.userId);
    if (success) {
      toast.success(`已刪除好友 ${friendToDelete.nickname}`);
      if (selectedFriend?.userId === friendToDelete.userId) {
        setSelectedFriend(null);
      }
      loadAllData();
    } else {
      toast.error('刪除失敗');
    }
    setShowDeleteDialog(false);
    setFriendToDelete(null);
  }, [friendToDelete, selectedFriend, loadAllData]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines">
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
          好友中心
        </h1>
      </div>

      {/* 主內容 */}
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        {/* 左側欄 */}
        <div
          className="cyber-card w-full md:w-80 lg:w-96 flex flex-col min-h-0 overflow-hidden"
          style={{ borderColor: 'var(--border-neon)' }}
        >
          {/* 搜尋列 */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border-neon)' }}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-secondary)' }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜尋玩家 ID / 暱稱"
                className="cyber-input w-full pl-9 pr-20 text-sm"
                style={{ borderColor: 'var(--border-neon)' }}
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 cyber-btn px-2.5 py-1 text-xs flex items-center gap-1"
                style={{
                  borderColor: 'var(--cyan)',
                  color: 'var(--cyan)',
                  background: 'rgba(0, 255, 255, 0.08)',
                }}
              >
                <Search size={12} />
                搜尋
              </button>
              {isSearching && (
                <Loader2
                  size={14}
                  className="absolute right-16 top-1/2 -translate-y-1/2 animate-spin"
                  style={{ color: 'var(--cyan)' }}
                />
              )}
            </form>
          </div>

          {/* Tabs */}
          {!showSearchResults && (
            <div
              className="flex border-b overflow-x-auto"
              style={{ borderColor: 'var(--border-neon)' }}
            >
              {[
                { key: 'friends' as const, label: '好友', icon: Users, count: friendsList.length },
                {
                  key: 'requests' as const,
                  label: '請求',
                  icon: UserPlus,
                  count: incomingRequests.length,
                },
                { key: 'recent' as const, label: '最近', icon: Clock, count: 0 },
                { key: 'activity' as const, label: '動態', icon: Activity, count: 0 },
                { key: 'history' as const, label: '對戰', icon: Swords, count: 0 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const accentColor =
                  tab.key === 'requests'
                    ? 'var(--pink)'
                    : tab.key === 'recent'
                      ? 'var(--yellow, #ffd93d)'
                      : tab.key === 'activity'
                        ? 'var(--purple, #b388ff)'
                        : tab.key === 'history'
                          ? 'var(--red)'
                          : 'var(--cyan)';
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className="flex-1 min-w-fit py-2.5 px-2 text-xs font-cyber tracking-wider flex flex-col items-center justify-center gap-1 transition-colors flex-shrink-0"
                    style={{
                      color: isActive ? accentColor : 'var(--text-secondary)',
                      borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                    }}
                  >
                    <Icon size={16} />
                    <div className="flex items-center gap-1">
                      {tab.label}
                      {tab.count > 0 && (
                        <span
                          className="text-[10px] px-1 rounded"
                          style={{
                            background: `${accentColor}22`,
                            color: accentColor,
                          }}
                        >
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 列表內容 */}
          <PullToRefresh onRefresh={handleRefresh} className="flex-1 min-h-0 overflow-hidden">
            <div key={refreshKey} className="flex-1 overflow-y-auto min-h-0 h-full scroll-container">
            {/* 搜尋結果 */}
            {showSearchResults && (
              <div className="p-2">
                <div
                  className="text-xs px-2 py-1 mb-2 font-cyber tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  搜尋結果 ({searchResults.length})
                </div>
                {searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                    找不到符合的玩家
                  </div>
                )}
                {searchResults.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-lg mb-1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
                        style={{
                          background: avatarColor(user.userId),
                          color: 'var(--bg-deep)',
                        }}
                      >
                        {user.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-[var(--text-primary)] truncate">
                          {user.nickname}
                        </div>
                        {user.rank && (
                          <div
                            className="text-[10px] font-cyber tracking-wider"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {user.rank}
                          </div>
                        )}
                      </div>
                    </div>
                    {user.isFriend ? (
                      <span
                        className="text-xs px-2 py-1 rounded font-cyber tracking-wider flex items-center gap-1"
                        style={{
                          color: 'var(--green)',
                          border: '1px solid var(--green)',
                          background: 'rgba(0, 255, 128, 0.08)',
                        }}
                      >
                        <UserCheck size={12} />
                        已是好友
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddFriend(user.userId, user.nickname)}
                        disabled={actionLoading === user.userId}
                        className="cyber-btn px-2.5 py-1 text-xs flex items-center gap-1"
                        style={{
                          borderColor: 'var(--cyan)',
                          color: 'var(--cyan)',
                          background: 'rgba(0, 255, 255, 0.08)',
                        }}
                      >
                        {actionLoading === user.userId ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        加好友
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 好友列表 */}
            {!showSearchResults && activeTab === 'friends' && (
              <div className="p-2">
                <div
                  className="text-xs px-2 py-1 mb-2 font-cyber tracking-wider flex items-center justify-between"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span>線上 {onlineCount} / {friendsList.length}</span>
                </div>
                {sortedFriends.length === 0 && (
                  <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                    還沒有好友
                  </div>
                )}
                {sortedFriends.map((friend: FriendInfo) => {
                  const isSelected = selectedFriend?.userId === friend.userId;
                  const statusInfo = STATUS_INFO[friend.onlineStatus];
                  return (
                    <button
                      key={friend.userId}
                      type="button"
                      onClick={() => handleSelectFriend(friend)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-all"
                      style={{
                        background: isSelected ? 'rgba(0, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isSelected ? 'var(--cyan)' : 'transparent'}`,
                        boxShadow: isSelected ? '0 0 8px rgba(0, 255, 255, 0.15)' : 'none',
                      }}
                    >
                      <div className="relative">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
                          style={{
                            background: avatarColor(friend.userId),
                            color: 'var(--bg-deep)',
                          }}
                        >
                          {friend.nickname.charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                          style={{
                            backgroundColor: statusInfo.color,
                            borderColor: 'var(--bg-dark)',
                            boxShadow: `0 0 4px ${statusInfo.color}`,
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {friend.nickname}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[10px] font-cyber tracking-wider px-1.5 py-px rounded"
                            style={{
                              background: 'rgba(168, 85, 247, 0.15)',
                              color: 'var(--purple, #b388ff)',
                            }}
                          >
                            {friend.rank || '新手'}
                          </span>
                          <span className="text-xs" style={{ color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      {/* 操作按鈕 */}
                      <div className="flex items-center gap-1">
                        {friend.onlineStatus === 'online' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInviteTeam(friend);
                            }}
                            className="cyber-btn p-1.5"
                            style={{
                              borderColor: 'var(--green)',
                              color: 'var(--green)',
                              background: 'rgba(0, 255, 128, 0.08)',
                            }}
                            title="邀請組隊"
                          >
                            <Swords size={14} />
                          </button>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 好友請求 */}
            {!showSearchResults && activeTab === 'requests' && (
              <div className="p-2">
                {/* 收到的請求 */}
                <div
                  className="text-xs px-2 py-1 mb-2 font-cyber tracking-wider"
                  style={{ color: 'var(--pink)' }}
                >
                  收到的請求 ({incomingRequests.length})
                </div>
                {incomingRequests.length === 0 && (
                  <div
                    className="text-center py-4 text-xs mb-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    沒有待處理的請求
                  </div>
                )}
                {incomingRequests.map((req: FriendRequest) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg mb-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 107, 157, 0.2)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
                        style={{
                          background: 'linear-gradient(135deg, var(--pink), var(--purple))',
                          color: 'var(--bg-deep)',
                        }}
                      >
                        {req.fromNickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-primary)] truncate">
                          {req.fromNickname}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                          {formatRelativeTime(req.createdAt)}
                        </div>
                      </div>
                    </div>
                    {req.message && (
                      <div
                        className="text-xs mb-2 px-2 py-1.5 rounded"
                        style={{
                          background: 'var(--bg-mid)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        「{req.message}」
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req.id)}
                        disabled={actionLoading === req.id}
                        className="cyber-btn flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                        style={{
                          borderColor: 'var(--green)',
                          color: 'var(--green)',
                          background: 'rgba(0, 255, 128, 0.08)',
                        }}
                      >
                        {actionLoading === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserCheck size={14} />
                        )}
                        接受
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={actionLoading === req.id}
                        className="cyber-btn flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                        style={{
                          borderColor: 'var(--red)',
                          color: 'var(--red)',
                          background: 'rgba(255, 0, 0, 0.08)',
                        }}
                      >
                        {actionLoading === req.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserX size={14} />
                        )}
                        拒絕
                      </button>
                    </div>
                  </div>
                ))}

                {/* 發出的請求 */}
                <div
                  className="text-xs px-2 py-1 mt-4 mb-2 font-cyber tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  發出的請求 ({outgoingRequests.length})
                </div>
                {outgoingRequests.length === 0 && (
                  <div
                    className="text-center py-4 text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    尚未發出任何請求
                  </div>
                )}
                {outgoingRequests.map((req: FriendRequest) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 p-3 rounded-lg mb-1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
                      style={{
                        background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
                        color: 'var(--bg-deep)',
                      }}
                    >
                      {req.toNickname.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] truncate">
                        {req.toNickname}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        {formatRelativeTime(req.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-cyber tracking-wider px-2 py-1 rounded"
                        style={{
                          color: 'var(--yellow, #ffd93d)',
                          border: '1px solid var(--yellow, #ffd93d)',
                          background: 'rgba(255, 217, 61, 0.08)',
                        }}
                      >
                        已發送
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(req.id)}
                        disabled={actionLoading === req.id}
                        className="cyber-btn p-1.5"
                        style={{
                          borderColor: 'var(--text-secondary)',
                          color: 'var(--text-secondary)',
                        }}
                        title="撤銷"
                      >
                        {actionLoading === req.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 最近玩家 */}
            {!showSearchResults && activeTab === 'recent' && (
              <div className="p-2">
                <div
                  className="text-xs px-2 py-1 mb-2 font-cyber tracking-wider"
                  style={{ color: 'var(--yellow, #ffd93d)' }}
                >
                  最近對戰玩家
                </div>
                {recentPlayers.length === 0 && (
                  <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                    暫無最近玩家
                  </div>
                )}
                {recentPlayers.map((player: RecentPlayer) => (
                  <div
                    key={player.userId}
                    className="flex items-center gap-3 p-3 rounded-lg mb-1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
                      style={{
                        background: avatarColor(player.userId),
                        color: 'var(--bg-deep)',
                      }}
                    >
                      {player.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-[var(--text-primary)] truncate">
                        {player.nickname}
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        {player.rank && (
                          <span
                            className="font-cyber tracking-wider px-1.5 py-px rounded"
                            style={{
                              background: 'rgba(168, 85, 247, 0.15)',
                              color: 'var(--purple, #b388ff)',
                            }}
                          >
                            {player.rank}
                          </span>
                        )}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          對戰 {player.playedCount} 次
                        </span>
                      </div>
                    </div>
                    {player.isFriend ? (
                      <span
                        className="text-xs px-2 py-1 rounded font-cyber tracking-wider"
                        style={{
                          color: 'var(--green)',
                          border: '1px solid var(--green)',
                          background: 'rgba(0, 255, 128, 0.08)',
                        }}
                      >
                        已是好友
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddRecentFriend(player)}
                        disabled={actionLoading === player.userId}
                        className="cyber-btn px-2.5 py-1 text-xs flex items-center gap-1"
                        style={{
                          borderColor: 'var(--yellow, #ffd93d)',
                          color: 'var(--yellow, #ffd93d)',
                          background: 'rgba(255, 217, 61, 0.08)',
                        }}
                      >
                        {actionLoading === player.userId ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        加好友
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 好友動態 */}
            {!showSearchResults && activeTab === 'activity' && (
              <div className="p-2">
                <div
                  className="text-xs px-2 py-1 mb-2 font-cyber tracking-wider"
                  style={{ color: 'var(--purple, #b388ff)' }}
                >
                  好友動態
                </div>
                {activities.length === 0 && (
                  <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                    暫無動態
                  </div>
                )}
                {activities.map((activity: FriendActivity) => {
                  const IconComp = ACTIVITY_ICONS[activity.type];
                  const color = ACTIVITY_COLORS[activity.type];
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg mb-2"
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${color}22`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${color}15`,
                          border: `1px solid ${color}44`,
                        }}
                      >
                        <IconComp size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-primary)]">
                          <span className="font-semibold">{activity.userName}</span>
                          <span style={{ color: 'var(--text-secondary)' }}> </span>
                          <span style={{ color }}>{activity.content}</span>
                        </div>
                        {activity.detail && (
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {activity.detail}
                          </div>
                        )}
                        <div className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {formatRelativeTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 對戰記錄（左側簡化概覽） */}
            {!showSearchResults && activeTab === 'history' && (
              <div className="p-2">
                <div
                  className="text-xs px-2 py-1 mb-2 font-cyber tracking-wider"
                  style={{ color: 'var(--red)' }}
                >
                  對戰概覽
                </div>
                <div
                  className="p-3 rounded-lg mb-2 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 71, 87, 0.2)',
                  }}
                >
                  <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    點擊右側面板查看詳細對戰記錄
                  </div>
                  <Swords size={32} className="mx-auto mb-2" style={{ color: 'var(--cyan)' }} />
                  <div
                    className="font-cyber tracking-wider text-sm"
                    style={{ color: 'var(--cyan)' }}
                  >
                    對戰記錄
                  </div>
                </div>
              </div>
            )}
           </div>
          </PullToRefresh>
        </div>

        {/* 右側內容區 */}
        <div
          className="cyber-card flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{ borderColor: 'var(--border-neon)' }}
        >
          {/* 對戰記錄頁 */}
          {activeTab === 'history' && <FriendMatchHistory />}

          {/* 搜尋狀態或非好友 Tab 時顯示引導 */}
          {(activeTab !== 'friends' && activeTab !== 'history') && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{
                  border: '1px solid var(--border-neon)',
                  background: 'rgba(0, 255, 255, 0.05)',
                }}
              >
                <Users size={36} style={{ color: 'var(--cyan)' }} />
              </div>
              <div className="font-cyber text-lg tracking-wider text-neon-cyan mb-2">
                好友中心
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                從左側「好友」分頁選擇一位好友查看詳情
              </div>
            </div>
          )}

          {/* 好友列表時，右側顯示好友資料或引導 */}
          {activeTab === 'friends' && !selectedFriend && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{
                  border: '1px solid var(--border-neon)',
                  background: 'rgba(0, 255, 255, 0.05)',
                }}
              >
                <UserCheck size={36} style={{ color: 'var(--cyan)' }} />
              </div>
              <div className="font-cyber text-lg tracking-wider text-neon-cyan mb-2">
                選擇一位好友查看詳情
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                從左側好友列表中選擇一位好友
              </div>
            </div>
          )}

          {activeTab === 'friends' && selectedFriend && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              {/* 好友資料卡 */}
              <div
                className="p-6 border-b"
                style={{
                  borderColor: 'var(--border-neon)',
                  background: 'linear-gradient(180deg, rgba(0,255,255,0.04), transparent)',
                }}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center font-cyber text-3xl"
                      style={{
                        background: avatarColor(selectedFriend.userId),
                        color: 'var(--bg-deep)',
                        border: `3px solid ${STATUS_INFO[selectedFriend.onlineStatus].color}`,
                        boxShadow: `0 0 16px ${STATUS_INFO[selectedFriend.onlineStatus].color}55`,
                      }}
                    >
                      {selectedFriend.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-2"
                      style={{
                        backgroundColor: STATUS_INFO[selectedFriend.onlineStatus].color,
                        borderColor: 'var(--bg-dark)',
                        boxShadow: `0 0 6px ${STATUS_INFO[selectedFriend.onlineStatus].color}`,
                      }}
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="font-cyber text-xl tracking-wider text-neon-cyan mb-1">
                      {selectedFriend.nickname}
                    </h2>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <span
                        className="text-xs font-cyber tracking-wider px-2 py-0.5 rounded"
                        style={{
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: 'var(--purple, #b388ff)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                        }}
                      >
                        {selectedFriend.rank || '新手'}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: STATUS_INFO[selectedFriend.onlineStatus].color }}
                      >
                        {STATUS_INFO[selectedFriend.onlineStatus].label}
                      </span>
                    </div>
                    {selectedFriend.level !== undefined && (
                      <div
                        className="text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        等級 Lv.{selectedFriend.level}
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => handleInviteTeam(selectedFriend)}
                    disabled={selectedFriend.onlineStatus === 'offline'}
                    className="cyber-btn px-4 py-2 text-sm flex items-center gap-2"
                    style={{
                      borderColor:
                        selectedFriend.onlineStatus === 'offline'
                          ? 'var(--text-secondary)'
                          : 'var(--green)',
                      color:
                        selectedFriend.onlineStatus === 'offline'
                          ? 'var(--text-secondary)'
                          : 'var(--green)',
                      background:
                        selectedFriend.onlineStatus === 'offline'
                          ? 'transparent'
                          : 'rgba(0, 255, 128, 0.08)',
                      boxShadow:
                        selectedFriend.onlineStatus === 'offline'
                          ? 'none'
                          : '0 0 8px rgba(0, 255, 128, 0.2)',
                      cursor:
                        selectedFriend.onlineStatus === 'offline' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Swords size={16} />
                    <span className="font-cyber tracking-wider">邀請組隊</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('開啟聊天面板');
                    }}
                    className="cyber-btn px-4 py-2 text-sm flex items-center gap-2"
                    style={{
                      borderColor: 'var(--cyan)',
                      color: 'var(--cyan)',
                      background: 'rgba(0, 255, 255, 0.08)',
                    }}
                  >
                    <MessageCircle size={16} />
                    <span className="font-cyber tracking-wider">私訊</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(selectedFriend)}
                    className="cyber-btn px-4 py-2 text-sm flex items-center gap-2"
                    style={{
                      borderColor: 'var(--red)',
                      color: 'var(--red)',
                      background: 'rgba(255, 0, 0, 0.08)',
                    }}
                  >
                    <UserX size={16} />
                    <span className="font-cyber tracking-wider">刪除好友</span>
                  </button>
                </div>
              </div>

              {/* 好友資訊 */}
              <div className="p-4 md:p-6 space-y-4 flex-1">
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: 'var(--bg-mid)',
                    border: '1px solid var(--border-neon)',
                  }}
                >
                  <h3
                    className="font-cyber text-sm tracking-wider mb-3"
                    style={{ color: 'var(--pink)' }}
                  >
                    好友資訊
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>玩家 ID</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedFriend.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>段位</span>
                      <span style={{ color: 'var(--cyan)' }}>{selectedFriend.rank || '新手'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>等級</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        Lv.{selectedFriend.level ?? '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>狀態</span>
                      <span style={{ color: STATUS_INFO[selectedFriend.onlineStatus].color }}>
                        {STATUS_INFO[selectedFriend.onlineStatus].label}
                      </span>
                    </div>
                    {selectedFriend.addedAt && (
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>成為好友</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {new Date(selectedFriend.addedAt).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: 'var(--bg-mid)',
                    border: '1px solid var(--border-neon)',
                  }}
                >
                  <h3
                    className="font-cyber text-sm tracking-wider mb-3"
                    style={{ color: 'var(--purple, #b388ff)' }}
                  >
                    成就摘要
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="font-cyber text-lg" style={{ color: 'var(--cyan)' }}>
                        {selectedFriend.level ?? 0}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        等級
                      </div>
                    </div>
                    <div>
                      <div className="font-cyber text-lg" style={{ color: 'var(--pink)' }}>
                        {Math.floor((selectedFriend.level ?? 0) * 12)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        場次
                      </div>
                    </div>
                    <div>
                      <div className="font-cyber text-lg" style={{ color: 'var(--green)' }}>
                        {Math.floor((selectedFriend.level ?? 0) * 6)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        勝場
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 刪除好友確認彈窗 */}
      {showDeleteDialog && friendToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            className="cyber-card w-full max-w-sm p-6"
            style={{
              borderColor: 'var(--red)',
              boxShadow: '0 0 20px rgba(255, 71, 87, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255, 71, 87, 0.15)',
                  border: '1px solid var(--red)',
                }}
              >
                <AlertCircle size={20} style={{ color: 'var(--red)' }} />
              </div>
              <div>
                <h3
                  className="font-cyber text-lg tracking-wider mb-1"
                  style={{ color: 'var(--red)' }}
                >
                  確認刪除好友
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  確定要將{' '}
                  <span style={{ color: 'var(--text-primary)' }}>{friendToDelete.nickname}</span>{' '}
                  從好友名單中刪除嗎？此操作無法復原。
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="cyber-btn px-4 py-2 text-sm"
                style={{
                  borderColor: 'var(--text-secondary)',
                  color: 'var(--text-secondary)',
                }}
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="cyber-btn px-4 py-2 text-sm"
                style={{
                  borderColor: 'var(--red)',
                  color: 'var(--red)',
                  background: 'rgba(255, 71, 87, 0.1)',
                  boxShadow: '0 0 8px rgba(255, 71, 87, 0.3)',
                }}
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
