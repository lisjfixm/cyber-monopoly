import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Inbox, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type DemoStatus = 'idle' | 'loading' | 'error' | 'ready';

// 範例頁：示範統一的「載入 / 空態 / 錯誤重試」狀態，作為其他頁面的參考版型。
// 純前端模擬，不依賴後端；任何非預期錯誤都會降級到錯誤卡，不白屏。
const EXAMPLE_STEPS = [
  { title: '載入骨架屏', desc: '資料讀取期間以 Skeleton/Spinner 呈現，避免版面跳動。' },
  { title: '空態引導', desc: '無資料時顯示圖標＋說明＋主要操作按鈕，告訴玩家下一步。' },
  { title: '錯誤降級', desc: '後端或資料失敗時顯示錯誤卡與重試按鈕，不整頁白屏。' },
];

const ExamplePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<DemoStatus>('idle');

  const runDemo = useCallback(() => {
    setStatus('loading');
    // 模擬一次非同步讀取，必定成功
    const timer = setTimeout(() => {
      setStatus('ready');
      toast.success('範例資料載入完成');
    }, 900);
    // unmount 清除，避免對已卸載元件 setState
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = runDemo();
    return cleanup;
  }, [runDemo]);

  const handleSimulateError = useCallback(() => {
    setStatus('error');
    toast.error('模擬載入失敗，請點重試');
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col px-4 py-6 scanlines relative pb-8">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
          style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
          aria-label="返回"
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回</span>
        </button>
        <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
          範例頁
        </h1>
      </div>

      <div className="max-w-2xl w-full mx-auto space-y-4">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: 'var(--cyan)' }} />
            <h2 className="font-cyber tracking-wider text-[var(--text-primary)]">
              狀態示範
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            此頁示範賽博大富翁 v3.0.0 統一的介面狀態處理：載入、空態、錯誤重試。
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setTimeout(runDemo, 0);
              }}
              className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider"
              style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
            >
              重新載入
            </button>
            <button
              type="button"
              onClick={handleSimulateError}
              className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider"
              style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
            >
              模擬錯誤
            </button>
          </div>
        </div>

        {/* 狀態區：載入 / 錯誤 / 空態 / 就緒 */}
        {status === 'loading' && (
          <div className="cyber-card p-8 flex flex-col items-center gap-3" role="status" aria-live="polite">
            <div
              className="w-10 h-10 rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--cyan)', borderTopColor: 'transparent' }}
            />
            <div className="text-sm font-cyber" style={{ color: 'var(--text-secondary)' }}>
              資料載入中…
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="cyber-card p-8 text-center" style={{ borderColor: 'var(--red)' }} role="alert">
            <AlertTriangle size={36} className="mx-auto mb-3" style={{ color: 'var(--red)' }} />
            <div className="font-cyber text-base mb-1" style={{ color: 'var(--red)' }}>
              載入失敗
            </div>
            <div className="text-xs text-[var(--text-secondary)] mb-4">
              無法取得範例資料，請檢察網路後重試。
            </div>
            <button
              type="button"
              onClick={runDemo}
              className="cyber-btn px-4 py-2 text-sm font-cyber tracking-wider inline-flex items-center gap-2"
              style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
            >
              <RefreshCw size={16} />
              重試
            </button>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="cyber-card p-4 flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: 'var(--green)' }} />
              <span className="text-sm font-cyber" style={{ color: 'var(--green)' }}>
                載入成功，以下為範例內容
              </span>
            </div>
            <div className="space-y-2">
              {EXAMPLE_STEPS.map((step, idx) => (
                <div key={step.title} className="cyber-card p-3 flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-cyber text-sm"
                    style={{ border: '1px solid var(--cyan)', color: 'var(--cyan)' }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-cyber text-sm text-[var(--text-primary)]">{step.title}</div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* 空態示範 */}
            <div className="cyber-card p-8 text-center">
              <Inbox size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <div className="font-cyber text-base mb-1" style={{ color: 'var(--text-secondary)' }}>
                這是空態範例
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                當沒有資料時，以圖標＋說明引導玩家下一步操作。
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamplePage;
