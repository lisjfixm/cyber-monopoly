import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  Coins,
  Package,
  Trash2,
  Gift,
  Check,
  Inbox,
  Trophy,
  Crown,
  Shield,
  Users,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getMailState,
  markAsRead,
  claimAttachment,
  deleteMail,
  getUnreadCount,
  type Mail as MailType,
} from '@client/src/utils/mail';
import PullToRefresh from '@client/src/components/PullToRefresh';

type TabType = 'system' | 'friend' | 'guild';

const TAB_LABELS: Record<TabType, string> = {
  system: '系統郵件',
  friend: '好友郵件',
  guild: '戰隊郵件',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const dayMs = 86400000;
  if (diff < dayMs) return '今天';
  if (diff < dayMs * 2) return '昨天';
  if (diff < dayMs * 7) return `${Math.floor(diff / dayMs)} 天前`;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

const MailPage = () => {
  const navigate = useNavigate();
  const [mails, setMails] = useState<MailType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('system');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    const state = getMailState();
    setMails(state.mails);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unreadCounts = useMemo(() => ({
    system: getUnreadCount('system'),
    friend: getUnreadCount('friend'),
    guild: getUnreadCount('guild'),
  }), [mails]);

  const filteredMails = useMemo(() => {
    return mails
      .filter((m) => m.type === activeTab)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [mails, activeTab]);

  const handleMailClick = useCallback((mail: MailType) => {
    if (!mail.isRead) {
      const next = markAsRead(mail.id);
      setMails(next.mails);
    }
    setExpandedId((prev) => (prev === mail.id ? null : mail.id));
  }, []);

  const handleClaim = useCallback((mail: MailType) => {
    if (mail.attachmentClaimed || !mail.attachment) return;
    const next = claimAttachment(mail.id);
    setMails(next.mails);
    const att = mail.attachment;
    if (att.type === 'coins') {
      toast.success(`領取成功！獲得 ${att.amount} 金幣`);
    } else if (att.type === 'item') {
      toast.success(`領取成功！獲得 ${att.itemName} x${att.amount ?? 1}`);
    } else if (att.type === 'title') {
      toast.success(`領取成功！獲得頭像框：${att.itemName}`);
    } else if (att.type === 'achievement') {
      toast.success(`領取成功！解鎖成就：${att.itemName}`);
    }
  }, []);

  const handleDelete = useCallback((mailId: string) => {
    const next = deleteMail(mailId);
    setMails(next.mails);
    if (expandedId === mailId) setExpandedId(null);
    toast.success('郵件已刪除');
  }, [expandedId]);

  // 目前分頁內可執行的批量操作統計
  const unreadInTab = useMemo(
    () => filteredMails.filter((m) => !m.isRead).length,
    [filteredMails],
  );
  const claimableInTab = useMemo(
    () =>
      filteredMails.filter(
        (m) => m.hasAttachment && m.attachment && !m.attachmentClaimed,
      ).length,
    [filteredMails],
  );

  // 全部已讀：逐封呼叫既有 markAsRead，閉環寫回 localStorage
  const handleMarkAllRead = useCallback(() => {
    const targets = mails.filter((m) => !m.isRead);
    if (targets.length === 0) {
      toast.info('目前沒有未讀郵件');
      return;
    }
    let next = getMailState();
    targets.forEach((m) => {
      next = markAsRead(m.id);
    });
    setMails(next.mails);
    toast.success(`已將 ${targets.length} 封郵件標記為已讀`);
  }, [mails]);

  // 一鍵領取：逐封領取尚未領取的附件，並統計回饋
  const handleClaimAll = useCallback(() => {
    const targets = mails.filter(
      (m) => m.hasAttachment && m.attachment && !m.attachmentClaimed,
    );
    if (targets.length === 0) {
      toast.info('目前沒有可領取的附件');
      return;
    }
    let next = getMailState();
    let coins = 0;
    let items = 0;
    targets.forEach((m) => {
      next = claimAttachment(m.id);
      if (m.attachment?.type === 'coins') coins += m.attachment.amount ?? 0;
      else items += 1;
    });
    setMails(next.mails);
    const parts: string[] = [];
    if (coins > 0) parts.push(`${coins} 金幣`);
    if (items > 0) parts.push(`${items} 項附件`);
    toast.success(`一鍵領取完成：${parts.join('、') || '無'}`);
  }, [mails]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col scanlines">
      {/* 頂部標題列 */}
      <div className="flex items-center justify-between px-4 py-4 border-b"
        style={{ borderColor: 'var(--border-neon)' }}>
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--cyan)' }}
        >
          <ArrowLeft size={18} />
          <span>返回</span>
        </button>
        <h1
          className="text-xl md:text-2xl font-bold tracking-widest flex items-center gap-2"
          style={{
            color: 'var(--cyan)',
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor',
          }}
        >
          <Mail size={22} />
          郵件中心
        </h1>
        <div className="w-16" />
      </div>

      {/* Tab 切換 */}
      <div className="flex border-b" style={{ borderColor: 'var(--border-neon)' }}>
        {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => {
          const active = activeTab === tab;
          const count = unreadCounts[tab];
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm md:text-base font-medium tracking-wider transition-all relative ${
                active ? '' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                color: active ? 'var(--pink)' : 'var(--text-secondary)',
                borderBottom: active ? '2px solid var(--pink)' : '2px solid transparent',
                textShadow: active ? '0 0 8px currentColor' : 'none',
              }}
            >
              {TAB_LABELS[tab]}
              {count > 0 && (
                <span
                  className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full"
                  style={{
                    background: 'var(--red)',
                    color: '#fff',
                    boxShadow: '0 0 8px var(--red)',
                  }}
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 批量操作列 */}
      <div
        className="flex items-center justify-between gap-2 px-3 md:px-6 py-2 border-b"
        style={{ borderColor: 'var(--border-neon)' }}
      >
        <span className="text-xs font-cyber tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          未讀 {unreadInTab} · 待領附件 {claimableInTab}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadInTab === 0}
            className="cyber-btn px-3 py-1.5 text-xs font-cyber tracking-wider flex items-center gap-1.5 disabled:opacity-40"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          >
            <CheckCheck size={13} />
            全部已讀
          </button>
          <button
            type="button"
            onClick={handleClaimAll}
            disabled={claimableInTab === 0}
            className="cyber-btn px-3 py-1.5 text-xs font-cyber tracking-wider flex items-center gap-1.5 disabled:opacity-40"
            style={{
              borderColor: 'hsl(45, 100%, 55%)',
              color: 'hsl(45, 100%, 55%)',
            }}
          >
            <Gift size={13} />
            一鍵領取
          </button>
        </div>
      </div>

      {/* 郵件列表 */}
      <PullToRefresh
        onRefresh={async () => {
          await new Promise<void>((resolve) => { setTimeout(resolve, 800); });
          refresh();
        }}
        className="flex-1 min-h-0 overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 scroll-container h-full">
        {filteredMails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4"
            style={{ color: 'var(--text-secondary)' }}>
            <Inbox size={64} style={{ opacity: 0.4 }} />
            <p className="text-lg tracking-wider">暫無郵件</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMails.map((mail) => {
              const isExpanded = expandedId === mail.id;
              return (
                <div
                  key={mail.id}
                  className="rounded-lg overflow-hidden transition-all"
                  style={{
                    border: `1px solid ${mail.isRead ? 'var(--border-neon)' : 'var(--cyan)'}`,
                    background: mail.isRead
                      ? 'rgba(0, 255, 255, 0.02)'
                      : 'rgba(0, 255, 255, 0.06)',
                    boxShadow: mail.isRead
                      ? 'none'
                      : '0 0 15px rgba(0, 255, 255, 0.15), inset 0 0 10px rgba(0, 255, 255, 0.05)',
                  }}
                >
                  {/* 郵件標題列 */}
                  <button
                    type="button"
                    onClick={() => handleMailClick(mail)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left"
                  >
                    {/* 未讀圓點 */}
                    <div className="w-3 flex-shrink-0 flex justify-center">
                      {!mail.isRead && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: 'var(--cyan)',
                            boxShadow: '0 0 6px var(--cyan)',
                          }}
                        />
                      )}
                    </div>
                    {/* 附件圖標 */}
                    {mail.hasAttachment && (
                      <Gift
                        size={16}
                        className="flex-shrink-0"
                        style={{
                          color: mail.attachmentClaimed
                            ? 'var(--text-secondary)'
                            : 'hsl(45, 100%, 60%)',
                          filter: mail.attachmentClaimed
                            ? 'none'
                            : 'drop-shadow(0 0 4px hsl(45, 100%, 60%))',
                          opacity: mail.attachmentClaimed ? 0.5 : 1,
                        }}
                      />
                    )}
                    {/* 內容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-sm md:text-base ${
                            mail.isRead ? 'font-normal' : 'font-bold'
                          }`}
                          style={{
                            color: mail.isRead
                              ? 'var(--text-primary)'
                              : 'var(--cyan)',
                          }}
                        >
                          {mail.title}
                        </span>
                        <span
                          className="flex-shrink-0 text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {formatDate(mail.createdAt)}
                        </span>
                      </div>
                      <div
                        className="text-xs mt-1 truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        來自：{mail.from}
                      </div>
                    </div>
                  </button>

                  {/* 展開詳情 */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 border-t"
                      style={{ borderColor: 'var(--border-neon)' }}
                    >
                      {/* 正文 */}
                      <div
                        className="py-4 text-sm leading-relaxed whitespace-pre-wrap"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {mail.content}
                      </div>

                      {/* 附件區域 */}
                      {mail.hasAttachment && mail.attachment && (
                        <div
                          className="mb-4 p-4 rounded-lg flex items-center justify-between"
                          style={{
                            background: 'rgba(255, 215, 0, 0.06)',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                           <div
                             className="w-10 h-10 rounded-full flex items-center justify-center"
                             style={{
                               background:
                                 mail.attachment.type === 'coins'
                                   ? 'rgba(255, 215, 0, 0.15)'
                                   : mail.attachment.type === 'item'
                                     ? 'rgba(255, 0, 255, 0.15)'
                                     : mail.attachment.type === 'title'
                                       ? 'rgba(168, 85, 247, 0.15)'
                                       : 'rgba(0, 255, 128, 0.15)',
                               color:
                                 mail.attachment.type === 'coins'
                                   ? 'hsl(45, 100%, 60%)'
                                   : mail.attachment.type === 'item'
                                     ? 'var(--pink)'
                                     : mail.attachment.type === 'title'
                                       ? 'var(--purple, #a855f7)'
                                       : 'var(--green)',
                             }}
                           >
                             {mail.attachment.type === 'coins' ? (
                               <Coins size={20} />
                             ) : mail.attachment.type === 'title' ? (
                               <Crown size={20} />
                             ) : mail.attachment.type === 'achievement' ? (
                               <Trophy size={20} />
                             ) : (
                               <Package size={20} />
                             )}
                           </div>
                            <div>
                               <div
                                 className="text-sm font-bold"
                                 style={{ color: 'hsl(45, 100%, 70%)' }}
                               >
                                 {mail.attachment.type === 'coins'
                                   ? `${mail.attachment.amount} 金幣`
                                   : mail.attachment.type === 'title'
                                     ? `${mail.attachment.itemName}`
                                     : mail.attachment.type === 'achievement'
                                       ? `${mail.attachment.itemName}`
                                       : `${mail.attachment.itemName} x${mail.attachment.amount ?? 1}`}
                               </div>
                               <div
                                 className="text-xs flex items-center gap-1"
                                 style={{ color: 'var(--text-secondary)' }}
                               >
                                 {mail.attachment.type === 'coins' ? '金幣獎勵' : mail.attachment.type === 'title' ? '專屬頭像框' : mail.attachment.type === 'achievement' ? '成就徽章' : '附件道具'}
                                 {mail.attachment.rarity && (
                                   <span
                                     className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider"
                                     style={{
                                       background: mail.attachment.rarity === 'legendary'
                                         ? 'rgba(255, 215, 0, 0.2)'
                                         : mail.attachment.rarity === 'epic'
                                           ? 'rgba(168, 85, 247, 0.2)'
                                           : mail.attachment.rarity === 'rare'
                                             ? 'rgba(0, 200, 255, 0.2)'
                                             : 'rgba(255,255,255,0.1)',
                                       color: mail.attachment.rarity === 'legendary'
                                         ? '#ffd700'
                                         : mail.attachment.rarity === 'epic'
                                           ? 'var(--purple, #a855f7)'
                                           : mail.attachment.rarity === 'rare'
                                             ? 'var(--cyan)'
                                             : 'var(--text-secondary)',
                                       border: `1px solid ${mail.attachment.rarity === 'legendary'
                                           ? '#ffd700'
                                           : mail.attachment.rarity === 'epic'
                                             ? 'var(--purple, #a855f7)'
                                             : mail.attachment.rarity === 'rare'
                                               ? 'var(--cyan)'
                                               : 'rgba(255,255,255,0.1)'}`,
                                     }}
                                   >
                                     {mail.attachment.rarity === 'legendary'
                                       ? '傳說'
                                       : mail.attachment.rarity === 'epic'
                                         ? '史詩'
                                         : mail.attachment.rarity === 'rare'
                                           ? '稀有'
                                           : '普通'}
                                   </span>
                                 )}
                               </div>
                            </div>
                          </div>
                          {mail.attachmentClaimed ? (
                            <span
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded"
                              style={{
                                color: 'var(--green)',
                                border: '1px solid var(--green)',
                                boxShadow: '0 0 8px rgba(0, 255, 128, 0.3)',
                              }}
                            >
                              <Check size={14} />
                              已領取
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleClaim(mail)}
                              className="px-4 py-1.5 text-sm font-bold rounded tracking-wider transition-all hover:scale-105 active:scale-95"
                              style={{
                                color: 'hsl(45, 100%, 20%)',
                                background:
                                  'linear-gradient(135deg, hsl(45, 100%, 60%), hsl(35, 100%, 55%))',
                                boxShadow:
                                  '0 0 10px hsl(45, 100%, 60%), 0 0 20px rgba(255, 215, 0, 0.4)',
                              }}
                            >
                              領取
                            </button>
                          )}
                        </div>
                      )}

                      {/* 底部操作 */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDelete(mail.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-all hover:scale-105"
                          style={{
                            color: 'var(--red)',
                            border: '1px solid var(--red)',
                            background: 'rgba(255, 0, 0, 0.05)',
                          }}
                        >
                          <Trash2 size={14} />
                          刪除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
           </div>
         )}
       </div>
       </PullToRefresh>
     </div>
   );
 };

export default MailPage;
