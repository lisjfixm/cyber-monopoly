import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, Trophy, Shield, UserPlus, Eye, Mail, Map } from 'lucide-react';
import { GlobalChatPanel } from '@client/src/components/social/GlobalChatPanel';
import { usePlayerIdentity } from '@client/src/hooks/usePlayerIdentity';

interface SocialCenterPageProps {
}

const SocialCenterPage: React.FC<SocialCenterPageProps> = () => {
  const navigate = useNavigate();
  const { visitorId, nickname } = usePlayerIdentity();
  const [chatOpen, setChatOpen] = useState(false);

  const items = [
    {
      icon: Users,
      title: '好友中心',
      desc: '管理好友、查看上線狀態、發起私聊',
      color: 'var(--cyan)',
      onClick: () => navigate('/friends'),
    },
    {
      icon: Shield,
      title: '戰隊公會',
      desc: '加入或創建戰隊，與隊友並肩作戰',
      color: 'var(--pink)',
      onClick: () => navigate('/guild'),
    },
    {
      icon: Eye,
      title: '觀戰大廳',
      desc: '觀看頂尖對局，導師實時講解',
      color: 'var(--green)',
      onClick: () => navigate('/spectate'),
    },
    {
      icon: MessageSquare,
      title: '全域聊天',
      desc: '與全城玩家交流，認識更多小夥伴',
      color: 'var(--green)',
      onClick: () => setChatOpen(true),
    },
    {
      icon: Trophy,
      title: '排行榜',
      desc: '查看個人、戰隊各項排名',
      color: 'var(--yellow, #ffd700)',
      onClick: () => navigate('/leaderboard'),
    },
     {
       icon: UserPlus,
       title: '尋找玩家',
       desc: '搜尋並添加新的小夥伴',
       color: 'var(--purple, #a855f7)',
       onClick: () => navigate('/friends'),
     },
     {
       icon: Mail,
       title: '遊戲郵箱',
       desc: '系統通知、獎勵領取、好友與戰隊郵件',
       color: 'var(--cyan)',
       onClick: () => navigate('/mail'),
     },
     {
       icon: Map,
       title: '社區地圖',
       desc: '玩家創意地圖分享、評分與收藏',
       color: 'var(--pink)',
       onClick: () => navigate('/community-maps'),
     },
   ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center px-4 py-8 scanlines">
      <div className="w-full max-w-3xl flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cyber-btn p-2"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1
          className="text-2xl md:text-3xl font-bold tracking-wider"
          style={{
            color: 'var(--cyan)',
            textShadow: '0 0 10px var(--cyan), 0 0 20px var(--cyan)',
          }}
        >
          社交中心
        </h1>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={item.onClick}
              className="cyber-card p-5 text-left group hover:scale-[1.02] transition-transform"
              style={{ borderColor: item.color }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `${item.color}20`,
                    border: `1px solid ${item.color}`,
                    boxShadow: `0 0 12px ${item.color}40`,
                  }}
                >
                  <Icon size={24} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-bold mb-1 tracking-wide group-hover:translate-x-1 transition-transform"
                    style={{ color: item.color, textShadow: `0 0 8px ${item.color}60` }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-3xl mt-8 cyber-card p-5" style={{ borderColor: 'var(--border-neon)' }}>
        <h3 className="text-sm font-bold mb-3 tracking-wide" style={{ color: 'var(--text-primary)' }}>
          快速操作
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="cyber-btn cyber-btn-sm px-4 py-2 text-xs"
            style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
          >
            <MessageSquare size={14} className="inline mr-1.5" />
            打開聊天
          </button>
          <button
            type="button"
            onClick={() => navigate('/friends')}
            className="cyber-btn cyber-btn-sm px-4 py-2 text-xs"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <Users size={14} className="inline mr-1.5" />
            好友列表
          </button>
          <button
            type="button"
            onClick={() => navigate('/guild')}
            className="cyber-btn cyber-btn-sm px-4 py-2 text-xs"
            style={{ borderColor: 'var(--pink)', color: 'var(--pink)' }}
          >
            <Shield size={14} className="inline mr-1.5" />
            我的戰隊
          </button>
          <button
            type="button"
            onClick={() => navigate('/report-block')}
            className="cyber-btn cyber-btn-sm px-4 py-2 text-xs"
            style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
          >
            舉報與封鎖
          </button>
        </div>
      </div>

      <GlobalChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        currentUserId={visitorId || 'local_user'}
        currentUserName={nickname || '匿名玩家'}
        anchorSide="right"
      />
    </div>
  );
};

export default SocialCenterPage;
