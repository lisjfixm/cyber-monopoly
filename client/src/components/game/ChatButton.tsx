import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  hasNewMessage: boolean;
  onClick: () => void;
  messageCount?: number;
}

const ChatButton: React.FC<ChatButtonProps> = ({ hasNewMessage, onClick, messageCount }) => {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className="cyber-btn w-9 h-9 md:w-10 md:h-10 flex items-center justify-center p-0 transition-all relative"
        style={{
          borderColor: hasNewMessage ? 'var(--green)' : 'rgba(255,255,255,0.2)',
          color: hasNewMessage ? 'var(--green)' : 'rgba(255,255,255,0.4)',
          boxShadow: hasNewMessage ? '0 0 8px rgba(0, 255, 150, 0.4)' : 'none',
          animation: hasNewMessage ? 'chatPulse 1.5s ease-in-out infinite' : 'none',
        }}
        aria-label="聊天"
      >
        <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />

        {/* 未读消息红点 / 数字 */}
        {hasNewMessage && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              background: 'var(--red)',
              color: 'white',
              fontSize: '10px',
              boxShadow: '0 0 6px rgba(255, 0, 0, 0.6)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            {messageCount && messageCount > 0 ? (messageCount > 99 ? '99+' : messageCount) : ''}
          </span>
        )}
      </button>

      <style>{`
        @keyframes chatPulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(0, 255, 150, 0.4);
          }
          50% {
            box-shadow: 0 0 16px rgba(0, 255, 150, 0.7), 0 0 24px rgba(0, 255, 150, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatButton;
