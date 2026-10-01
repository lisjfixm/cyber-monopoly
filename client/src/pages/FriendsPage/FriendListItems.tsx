import { Check, X, UserPlus, Loader2 } from 'lucide-react';
import type { FriendInfo, SearchUserResult, OnlineStatus } from '@shared/api.interface';

const ONLINE_STATUS_INFO: Record<OnlineStatus, { label: string; color: string }> = {
  online: { label: '線上', color: 'var(--green)' },
  in_game: { label: '遊戲中', color: 'var(--blue)' },
  away: { label: '暫離', color: 'var(--yellow)' },
  offline: { label: '離線', color: 'var(--text-secondary)' },
};

interface FriendItemProps {
  friend: FriendInfo;
  isSelected: boolean;
  onClick: () => void;
}

export const FriendItem = ({ friend, isSelected, onClick }: FriendItemProps) => {
  const statusInfo = ONLINE_STATUS_INFO[friend.onlineStatus];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg mb-1 text-left transition-colors"
      style={{
        background: isSelected ? 'rgba(0, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
        border: `1px solid ${isSelected ? 'var(--cyan)' : 'transparent'}`,
      }}
    >
      <div className="relative">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-cyber text-sm"
          style={{
            background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
            color: 'var(--bg-deep)',
            border: friend.onlineStatus === 'online' ? '2px solid var(--green)' : '2px solid transparent',
            boxShadow: friend.onlineStatus === 'online' ? '0 0 8px var(--green)' : 'none',
          }}
        >
          {friend.nickname.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--text-primary)] truncate">
          {friend.nickname}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: statusInfo.color,
              boxShadow: `0 0 4px ${statusInfo.color}`,
            }}
          />
          <span className="text-xs" style={{ color: statusInfo.color }}>
            {statusInfo.label}
          </span>
        </div>
      </div>
      {friend.unreadCount !== undefined && friend.unreadCount > 0 && (
        <span
          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            backgroundColor: 'var(--red)',
            color: 'white',
            boxShadow: '0 0 6px var(--red)',
          }}
        >
          {friend.unreadCount > 99 ? '99+' : friend.unreadCount}
        </span>
      )}
    </button>
  );
};

interface PendingFriendItemProps {
  friend: FriendInfo;
  loading: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const PendingFriendItem = ({
  friend,
  loading,
  onAccept,
  onReject,
}: PendingFriendItemProps) => (
  <div
    className="p-3 rounded-lg mb-1"
    style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid transparent',
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
        {friend.nickname.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--text-primary)] truncate">
          {friend.nickname}
        </div>
      </div>
    </div>
    {friend.remark && (
      <div
        className="text-xs mb-2 px-2 py-1.5 rounded"
        style={{
          background: 'var(--bg-mid)',
          color: 'var(--text-secondary)',
        }}
      >
        {friend.remark}
      </div>
    )}
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onAccept}
        disabled={loading}
        className="cyber-btn flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
        style={{
          borderColor: 'var(--green)',
          color: 'var(--green)',
          background: 'rgba(0, 255, 128, 0.08)',
        }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        接受
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={loading}
        className="cyber-btn flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
        style={{
          borderColor: 'var(--red)',
          color: 'var(--red)',
          background: 'rgba(255, 0, 0, 0.08)',
        }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
        拒絕
      </button>
    </div>
  </div>
);

interface SearchResultItemProps {
  user: SearchUserResult;
  loading: boolean;
  onAdd: () => void;
}

export const SearchResultItem = ({ user, loading, onAdd }: SearchResultItemProps) => (
  <div
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
          background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
          color: 'var(--bg-deep)',
        }}
      >
        {user.nickname.charAt(0).toUpperCase()}
      </div>
      <div>
        <div className="text-sm text-[var(--text-primary)]">
          {user.nickname}
        </div>
      </div>
    </div>
    {user.isFriend ? (
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
        onClick={onAdd}
        disabled={loading}
        className="cyber-btn px-2.5 py-1 text-xs flex items-center gap-1"
        style={{
          borderColor: 'var(--cyan)',
          color: 'var(--cyan)',
          background: 'rgba(0, 255, 255, 0.08)',
        }}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
        加好友
      </button>
    )}
  </div>
);
