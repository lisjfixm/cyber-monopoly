import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Search,
  ThumbsUp,
  Download,
  Star,
  Sparkles,
  ArrowLeft,
  Heart,
  Upload,
  Tag,
  Grid3X3,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getCommunityMaps,
  likeMap,
  installMap,
  toggleFavorite,
  isFavorite,
  getFavoriteMaps,
  filterMapsByTag,
  MAP_TAGS,
  type CommunityMap,
  type MapTag,
} from '@client/src/utils/communityMaps';
import {
  getReviews,
  submitRating,
  addReview,
  likeReview,
  getAverageRating,
  getTotalReviews,
  sortByFeatured,
  type ReviewItem,
} from '@client/src/utils/reviewStorage';
import RatingReviewSection from '@client/src/components/RatingReviewSection';
import UploadMapDialog from '@client/src/components/social/UploadMapDialog';
import { CELL_COUNT } from '@shared/game-config';
import PullToRefresh from '@client/src/components/PullToRefresh';
import { safeGetJSON } from '@client/src/utils/safeStorage';
import type { CellConfig, CellType, CustomMapData } from '@shared/api.interface';

type SortType = 'hot' | 'newest' | 'rating';
type ViewType = 'all' | 'favorites';

// 迷你地圖預覽（依 cell.color 著色，用於卡片列表）
function MiniMapPreview({ cells }: { cells: CellConfig[] }) {
  if (!cells || cells.length !== CELL_COUNT) return null;
  const sideLen = 10;
  const positions: { x: number; y: number; cell: CellConfig }[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    let x = 0;
    let y = 0;
    if (i <= 9) { x = i; y = 9; }
    else if (i <= 17) { x = 9; y = 9 - (i - 9); }
    else if (i <= 26) { x = 9 - (i - 18); y = 0; }
    else { x = 0; y = i - 27; }
    positions.push({ x, y, cell: cells[i] });
  }
  return (
    <div
      className="grid w-full aspect-square gap-px p-1 rounded-sm"
      style={{
        gridTemplateColumns: `repeat(${sideLen}, 1fr)`,
        background: 'rgba(0, 255, 255, 0.1)',
      }}
    >
      {positions.map((pos, idx: number) => (
        <div
          key={idx}
          className="rounded-[1px]"
          style={{ backgroundColor: pos.cell.color || '#333' }}
        />
      ))}
    </div>
  );
}

// 地圖類型網格預覽（依格子類型著色，用於詳情頁）
const CELL_TYPE_COLORS: Record<CellType, string> = {
  property: 'var(--cyan)',
  fate: 'var(--purple)',
  start: 'var(--green)',
  detention: 'var(--red)',
  chance: '#fb923c',
  minigame: '#facc15',
  parking: '#64748b',
  jail: '#ef4444',
  event: '#a855f7',
  teleport: '#22d3ee',
};

function MapTypeGrid({ cells }: { cells: CellConfig[] | undefined }) {
  const sideLen = 10;
  // 若 cells 不可用，用預設 36 格模板
  const displayCells: CellConfig[] = (cells && cells.length === CELL_COUNT)
    ? cells
    : Array.from({ length: CELL_COUNT }, (_, i) => ({
      id: i,
      name: `格子${i}`,
      type: 'property' as CellType,
      basePrice: 0,
      color: '#333',
    }));

  // 外圈佈局：只有邊上有格子，中間為空
  const gridItems: Array<{ idx: number; cell: CellConfig | null }> = [];
  let cellIdx = 0;
  for (let y = 0; y < sideLen; y++) {
    for (let x = 0; x < sideLen; x++) {
      const isEdge = y === 0 || y === sideLen - 1 || x === 0 || x === sideLen - 1;
      if (isEdge) {
        gridItems.push({ idx: cellIdx, cell: displayCells[cellIdx] ?? null });
        cellIdx += 1;
      } else {
        gridItems.push({ idx: -1, cell: null });
      }
    }
  }

  return (
    <div
      className="grid w-full aspect-square gap-px p-2 rounded-sm"
      style={{
        gridTemplateColumns: `repeat(${sideLen}, 1fr)`,
        background: 'rgba(168, 85, 247, 0.15)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        boxShadow: 'inset 0 0 20px rgba(0, 255, 255, 0.1)',
      }}
    >
      {gridItems.map((item, i: number) => {
        if (!item.cell) {
          return <div key={i} className="bg-transparent" />;
        }
        const bg = CELL_TYPE_COLORS[item.cell.type] ?? '#6b7280';
        return (
          <div
            key={i}
            className="rounded-[1px]"
            style={{
              backgroundColor: bg,
              boxShadow: `0 0 4px ${bg}`,
              opacity: 0.85,
            }}
            title={item.cell.name}
          />
        );
      })}
    </div>
  );
}

const CommunityMapsPage = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<CommunityMap[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortType, setSortType] = useState<SortType>('hot');
   const [selectedMap, setSelectedMap] = useState<CommunityMap | null>(null);
   const [toast, setToast] = useState<string>('');
   const [reviews, setReviews] = useState<ReviewItem[]>([]);
   const [avgRating, setAvgRating] = useState<number>(0);
   const [totalReviews, setTotalReviews] = useState<number>(0);
   const [viewType, setViewType] = useState<ViewType>('all');
   const [activeTag, setActiveTag] = useState<MapTag | null>(null);
   const [uploadOpen, setUploadOpen] = useState(false);
   const [favorites, setFavorites] = useState<string[]>([]);
   const [localMaps, setLocalMaps] = useState<CustomMapData[]>([]);
   const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});

   const refreshMaps = useCallback(() => {
     setMaps(getCommunityMaps());
     setFavorites(getFavoriteMaps());
     const favMap: Record<string, boolean> = {};
     getFavoriteMaps().forEach((id) => { favMap[id] = true; });
     setFavoriteStates(favMap);
   }, []);

   useEffect(() => {
     refreshMaps();
     const parsed = safeGetJSON<CustomMapData[]>('cyber_monopoly_custom_maps', []);
     if (Array.isArray(parsed)) setLocalMaps(parsed);
   }, [refreshMaps]);

   const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
   useEffect(() => () => {
     if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
   }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 2000);
  }, []);

  const loadReviews = useCallback((mapId: string) => {
    const data = getReviews('map', mapId);
    setReviews(data.reviews);
    setAvgRating(getAverageRating('map', mapId));
    setTotalReviews(getTotalReviews('map', mapId));
  }, []);

  const handleSelect = useCallback((map: CommunityMap) => {
    setSelectedMap(map);
    loadReviews(map.id);
  }, [loadReviews]);

   const handleLike = useCallback((id: string) => {
     likeMap(id);
     refreshMaps();
     const updated = getCommunityMaps().find((m) => m.id === id);
     if (updated) setSelectedMap(updated);
     showToast('已點讚！');
   }, [refreshMaps, showToast]);

   const handleToggleFavorite = useCallback((id: string) => {
     const isFav = toggleFavorite(id);
     setFavorites(getFavoriteMaps());
     setFavoriteStates((prev) => ({ ...prev, [id]: isFav }));
      showToast(isFav ? '已加入收藏' : '已取消收藏');
     const updated = getCommunityMaps().find((m) => m.id === id);
     if (updated) setSelectedMap(updated);
   }, []);

  const handleInstall = useCallback((id: string) => {
    const success = installMap(id);
    refreshMaps();
    if (success) {
      showToast('安裝成功！已加入本地地圖庫');
    } else {
      showToast('安裝失敗：地圖已存在或格式錯誤');
    }
  }, [refreshMaps, showToast]);

  const handleRate = useCallback((score: number) => {
    if (!selectedMap) return;
    submitRating('map', selectedMap.id, 'local_user', score);
    loadReviews(selectedMap.id);
    showToast('評分成功！');
  }, [selectedMap, loadReviews, showToast]);

  const handleAddReview = useCallback((text: string) => {
    if (!selectedMap) return;
    const newReview: ReviewItem = {
      id: `review_${Date.now()}`,
      author: '我',
      authorScore: 200,
      content: text,
      score: 5,
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    addReview('map', selectedMap.id, newReview);
    loadReviews(selectedMap.id);
  }, [selectedMap, loadReviews]);

  const handleLikeReview = useCallback((reviewId: string) => {
    if (!selectedMap) return;
    likeReview('map', selectedMap.id, reviewId);
    loadReviews(selectedMap.id);
  }, [selectedMap, loadReviews]);

   const filteredMaps = maps
     .filter((m: CommunityMap) => {
       if (viewType === 'favorites' && !favorites.includes(m.id)) return false;
       if (!searchQuery.trim()) return true;
       const q = searchQuery.toLowerCase();
       return (
         m.name.toLowerCase().includes(q) ||
         m.author.toLowerCase().includes(q)
       );
     })
     .filter((m) => (activeTag ? m.tags.includes(activeTag) : true))
     .sort((a: CommunityMap, b: CommunityMap) => {
       if (sortType === 'hot') return b.likes + b.downloads - (a.likes + a.downloads);
       if (sortType === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
       return b.rating - a.rating;
     });

  const featuredSortedMaps = sortByFeatured(filteredMaps, 'map');

  // 列表視圖
  if (!selectedMap) {
    return (
      <div className="min-h-screen w-full px-4 py-6 scanlines relative">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
            style={{ background: 'var(--cyan)' }}
          />
          <div
            className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
            style={{ background: 'var(--pink)' }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cyber-btn px-3 py-2 text-sm flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              <span className="font-cyber tracking-wider">返回</span>
            </button>
            <h1 className="font-cyber text-2xl md:text-3xl text-neon-cyan tracking-wider">
              社區地圖
            </h1>
          </div>

           {/* 視圖切換與上傳 */}
           <div className="flex items-center gap-3 mb-4">
             <div className="flex gap-2">
               {[
                 { key: 'all' as ViewType, label: '全部地圖', icon: Grid3X3 },
                 { key: 'favorites' as ViewType, label: '我的收藏', icon: Heart },
               ].map((v) => (
                 <button
                   key={v.key}
                   type="button"
                   onClick={() => setViewType(v.key)}
                   className="cyber-btn cyber-btn-sm font-cyber tracking-wider flex items-center gap-1.5"
                   style={{
                     borderColor: viewType === v.key ? 'var(--pink)' : 'rgba(255, 255, 255, 0.1)',
                     color: viewType === v.key ? 'var(--pink)' : 'var(--text-secondary)',
                     backgroundColor: viewType === v.key ? 'rgba(255, 0, 170, 0.08)' : 'transparent',
                   }}
                 >
                   <v.icon size={14} />
                   {v.label}
                   {v.key === 'favorites' && favorites.length > 0 && (
                     <span className="text-[10px] px-1.5 rounded-full" style={{ background: 'var(--pink)', color: '#fff' }}>
                       {favorites.length}
                     </span>
                   )}
                 </button>
               ))}
             </div>
             <button
               type="button"
               onClick={() => setUploadOpen(true)}
               className="cyber-btn cyber-btn-sm font-cyber tracking-wider ml-auto flex items-center gap-1.5"
               style={{
                 borderColor: 'var(--cyan)',
                 color: 'var(--cyan)',
                 backgroundColor: 'rgba(0, 255, 255, 0.08)',
               }}
             >
               <Upload size={14} />
               上傳地圖
             </button>
           </div>

           {/* 標籤篩選 */}
           <div className="mb-6 flex flex-wrap gap-2 items-center">
             <span className="text-xs font-cyber flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
               <Tag size={12} />
               標籤：
             </span>
             <button
               type="button"
               onClick={() => setActiveTag(null)}
               className="px-2.5 py-1 text-xs rounded-full transition-all"
               style={{
                 background: !activeTag ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0,0,0,0.3)',
                 border: `1px solid ${!activeTag ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                 color: !activeTag ? 'var(--cyan)' : 'var(--text-secondary)',
               }}
             >
               全部
             </button>
             {MAP_TAGS.map((tag) => (
               <button
                 key={tag}
                 type="button"
                 onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                 className="px-2.5 py-1 text-xs rounded-full transition-all"
                 style={{
                   background: activeTag === tag ? 'rgba(255, 0, 170, 0.15)' : 'rgba(0,0,0,0.3)',
                   border: `1px solid ${activeTag === tag ? 'var(--pink)' : 'rgba(255,255,255,0.1)'}`,
                   color: activeTag === tag ? 'var(--pink)' : 'var(--text-secondary)',
                 }}
               >
                 {tag}
               </button>
             ))}
           </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
             <div className="relative flex-1">
               <Search
                 size={16}
                 className="absolute left-3 top-1/2 -translate-y-1/2"
                 style={{ color: 'var(--text-secondary)' }}
               />
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="搜尋地圖名稱、作者..."
                 className="cyber-input w-full pl-10"
               />
             </div>
             <div className="flex gap-2">
               {[
                 { key: 'hot' as SortType, label: '熱度' },
                 { key: 'newest' as SortType, label: '最新' },
                 { key: 'rating' as SortType, label: '評分' },
               ].map((s) => (
                 <button
                   key={s.key}
                   type="button"
                   onClick={() => setSortType(s.key)}
                   className="cyber-btn cyber-btn-sm font-cyber tracking-wider"
                   style={{
                     borderColor: sortType === s.key ? 'var(--cyan)' : 'rgba(255, 255, 255, 0.1)',
                     color: sortType === s.key ? 'var(--cyan)' : 'var(--text-secondary)',
                     backgroundColor: sortType === s.key ? 'rgba(0, 255, 255, 0.08)' : 'transparent',
                   }}
                 >
                   {s.label}
                 </button>
               ))}
             </div>
           </div>

           {/* 地圖網格 */}
           <PullToRefresh
             onRefresh={async () => {
               await new Promise<void>((resolve) => { setTimeout(resolve, 800); });
               refreshMaps();
             }}
             className="flex-1 overflow-hidden"
           >
             <div className="scroll-container">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSortedMaps.map((map) => (
              <button
                key={map.id}
                type="button"
                onClick={() => handleSelect(map)}
                className="cyber-card p-4 text-left hover:scale-[1.02] transition-transform"
                style={{
                  borderColor: map.isFeatured
                    ? 'var(--yellow, #facc15)'
                    : 'rgba(0, 255, 255, 0.2)',
                  boxShadow: map.isFeatured
                    ? '0 0 15px rgba(250, 204, 21, 0.25)'
                    : 'none',
                }}
              >
                {map.isFeatured && (
                  <div className="flex items-center gap-1 mb-2 text-xs font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
                    <Sparkles size={12} />
                    精選地圖
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="w-20 h-20 flex-shrink-0">
                    <MiniMapPreview cells={map.mapData} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-cyber text-base text-neon-cyan tracking-wider truncate">
                      {map.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      by {map.author} · {map.authorScore} 積分
                    </div>
                 <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                       <span className="flex items-center gap-1">
                         <ThumbsUp size={12} />
                         {map.likes}
                       </span>
                       <span className="flex items-center gap-1">
                         <Download size={12} />
                         {map.downloads}
                       </span>
                       <span className="flex items-center gap-1" style={{ color: 'var(--yellow)' }}>
                         <Star size={12} fill="currentColor" />
                         {(Number(map.rating) || 0).toFixed(1)}
                       </span>
                       <button
                         type="button"
                         onClick={(e) => {
                           e.stopPropagation();
                           handleToggleFavorite(map.id);
                         }}
                         className="ml-auto flex-shrink-0 p-1 rounded transition-all hover:scale-110"
                         style={{
                           color: favoriteStates[map.id] ? 'var(--red)' : 'var(--text-secondary)',
                         }}
                         title={favoriteStates[map.id] ? '取消收藏' : '收藏'}
                       >
                         <Heart size={14} fill={favoriteStates[map.id] ? 'currentColor' : 'none'} />
                       </button>
                     </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

           {filteredMaps.length === 0 && (
             <div className="cyber-card p-8 text-center mt-4" style={{ borderColor: 'rgba(0, 255, 255, 0.15)' }}>
               <Search size={40} className="mx-auto mb-3" style={{ color: 'var(--text-secondary)' }} />
               <div className="text-[var(--text-secondary)] font-cyber tracking-wider">
                 找不到符合條件的地圖
               </div>
             </div>
           )}
             </div>
           </PullToRefresh>
         </div>

         {toast && (
           <div
             className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider"
             style={{
               background: 'var(--bg-dark)',
               border: '1px solid var(--cyan)',
               color: 'var(--cyan)',
               boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
             }}
           >
             {toast}
           </div>
         )}

         <UploadMapDialog
           open={uploadOpen}
           onClose={() => setUploadOpen(false)}
           localMaps={localMaps}
           authorName="賽博玩家"
           onPublished={() => refreshMaps()}
         />
       </div>
     );
   }

   // 詳情視圖
  return (
    <div className="min-h-screen w-full px-4 py-6 scanlines relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: 'var(--cyan)' }}
        />
        <div
          className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]"
          style={{ background: 'var(--pink)' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => setSelectedMap(null)}
          className="cyber-btn px-3 py-2 text-sm flex items-center gap-1 mb-6"
        >
          <ArrowLeft size={16} />
          <span className="font-cyber tracking-wider">返回列表</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          {/* 左側：地圖預覽與資訊 */}
          <div className="space-y-4">
            <div
              className="cyber-card p-5"
              style={{
                borderColor: selectedMap.isFeatured
                  ? 'var(--yellow, #facc15)'
                  : 'rgba(0, 255, 255, 0.25)',
                boxShadow: selectedMap.isFeatured
                  ? '0 0 20px rgba(250, 204, 21, 0.2)'
                  : 'none',
              }}
            >
              {selectedMap.isFeatured && (
                <div className="flex items-center gap-1 mb-3 text-sm font-cyber tracking-wider" style={{ color: 'var(--yellow)' }}>
                  <Sparkles size={16} />
                  精選地圖
                </div>
              )}
              <h2 className="font-cyber text-2xl text-neon-cyan tracking-wider mb-2">
                {selectedMap.name}
              </h2>
               <div className="text-sm text-[var(--text-secondary)] mb-3">
                 by {selectedMap.author} · {selectedMap.authorScore} 積分
               </div>

               {/* 標籤 */}
               {selectedMap.tags && selectedMap.tags.length > 0 && (
                 <div className="flex flex-wrap gap-1.5 mb-3">
                   {selectedMap.tags.map((tag) => (
                     <span
                       key={tag}
                       className="px-2 py-0.5 text-[10px] rounded-full font-cyber tracking-wider"
                       style={{
                         background: 'rgba(0, 255, 255, 0.1)',
                         border: '1px solid rgba(0, 255, 255, 0.3)',
                         color: 'var(--cyan)',
                       }}
                     >
                       {tag}
                     </span>
                   ))}
                 </div>
               )}

               {/* 描述 */}
               {selectedMap.description && (
                 <div className="mb-4 p-3 rounded text-sm leading-relaxed" style={{
                   background: 'rgba(0,0,0,0.2)',
                   border: '1px solid rgba(255,255,255,0.05)',
                   color: 'var(--text-primary)',
                 }}>
                   {selectedMap.description}
                 </div>
               )}

              {/* 地圖類型網格縮覽圖 */}
              <div className="mb-4">
                <div
                  className="text-xs font-cyber tracking-wider mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  地圖預覽
                </div>
                <div className="max-w-xs mx-auto">
                  <MapTypeGrid cells={selectedMap.mapData} />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 justify-center text-[10px] text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--cyan)' }} />
                    地產
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--green)' }} />
                    起點
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--red)' }} />
                    禁閉
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm" style={{ background: 'var(--purple)' }} />
                    命運
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm" style={{ background: '#fb923c' }} />
                    機會
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm" style={{ background: '#facc15' }} />
                    小遊戲
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-around text-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1" style={{ color: 'var(--pink)' }}>
                    <ThumbsUp size={16} />
                    <span className="font-cyber text-lg">{selectedMap.likes}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">讚</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1" style={{ color: 'var(--cyan)' }}>
                    <Download size={16} />
                    <span className="font-cyber text-lg">{selectedMap.downloads}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">下載</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1" style={{ color: 'var(--yellow)' }}>
                    <Star size={16} fill="currentColor" />
                    <span className="font-cyber text-lg">{(Number(selectedMap.rating) || 0).toFixed(1)}</span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">評分</div>
                </div>
              </div>
            </div>

             <div className="flex gap-3">
               <button
                 type="button"
                 onClick={() => handleToggleFavorite(selectedMap.id)}
                 className={`cyber-btn flex-1 py-3 font-cyber tracking-wider flex items-center justify-center gap-2 ${
                   favoriteStates[selectedMap.id] ? 'flex-[0.8]' : ''
                 }`}
                 style={{
                   borderColor: favoriteStates[selectedMap.id] ? 'var(--red)' : 'rgba(255,255,255,0.15)',
                   color: favoriteStates[selectedMap.id] ? 'var(--red)' : 'var(--text-secondary)',
                   backgroundColor: favoriteStates[selectedMap.id] ? 'rgba(255, 0, 0, 0.08)' : 'transparent',
                 }}
               >
                 <Heart size={16} fill={favoriteStates[selectedMap.id] ? 'currentColor' : 'none'} />
                 {favoriteStates[selectedMap.id] ? '已收藏' : '收藏'}
               </button>
               <button
                type="button"
                onClick={() => handleLike(selectedMap.id)}
                className="cyber-btn flex-1 py-3 font-cyber tracking-wider"
                style={{
                  borderColor: 'var(--pink)',
                  color: 'var(--pink)',
                  backgroundColor: 'rgba(255, 107, 157, 0.08)',
                }}
              >
                點讚
              </button>
            </div>
          </div>

          {/* 右側：評分評論 */}
          <div>
            <RatingReviewSection
              contentType="map"
              contentId={selectedMap.id}
              averageRating={avgRating || selectedMap.rating}
              ratingCount={totalReviews || selectedMap.ratings}
              reviews={reviews}
              onRate={handleRate}
              onAddReview={handleAddReview}
              onLikeReview={handleLikeReview}
            />
          </div>
        </div>
      </div>

      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-sm font-cyber text-sm tracking-wider"
          style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--cyan)',
            color: 'var(--cyan)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};

export default CommunityMapsPage;
