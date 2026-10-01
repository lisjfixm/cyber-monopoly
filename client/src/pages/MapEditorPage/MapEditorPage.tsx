import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Save,
  Download,
  Upload,
  Play,
  Share2,
  Undo2,
  Redo2,
  LayoutGrid,
  X,
} from 'lucide-react';
import {
  CELL_COUNT,
  encodeMapToBase64,
  decodeMapFromBase64,
  validateMap,
  MAX_CUSTOM_MAPS,
} from '@shared/game-config';
import type { CellConfig, CellType, CustomMapData, MapEditorTool } from '@shared/api.interface';
import { publishMap } from '@client/src/utils/communityMaps';
import EditorBoard from './EditorBoard';
import ToolPanel from './ToolPanel';
import PropertyPanel from './PropertyPanel';
import EditorDialogs from './EditorDialogs';

const STORAGE_KEY = 'cyber_monopoly_custom_maps';

// Default blank-ish map (classic layout but user can edit)
function createDefaultCells(): CellConfig[] {
  // Generate a simple default map: start + property cells + detention + 2 fate + 2 chance
  const cells: CellConfig[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    cells.push({
      id: i,
      name: `格子${i}`,
      type: 'property',
      basePrice: 1000,
      color: '#00e5ff',
      setId: 'set1',
      rent: 250,
    });
  }
  cells[0] = { id: 0, name: '起點', type: 'start', basePrice: 0, color: '#00ff88' };
  cells[10] = { id: 10, name: '禁閉區', type: 'detention', basePrice: 0, color: '#a855f7' };
  cells[20] = { id: 20, name: '命運區', type: 'fate', basePrice: 0, color: '#ff4dff' };
  cells[33] = { id: 33, name: '命運區', type: 'fate', basePrice: 0, color: '#ff4dff' };
  cells[27] = { id: 27, name: '機會區', type: 'chance', basePrice: 0, color: '#6366f1' };
  cells[35] = { id: 35, name: '機會區', type: 'chance', basePrice: 0, color: '#6366f1' };
  return cells;
}

function loadSavedMaps(): CustomMapData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomMapData[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore
  }
  return [];
}

function saveMapsToStorage(maps: CustomMapData[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      return false;
    }
    return false;
  }
}

const typeDefaults: Record<CellType, Partial<CellConfig>> = {
  start: { name: '起點', basePrice: 0, color: '#00ff88', setId: undefined },
  property: { name: '新地產', basePrice: 1000, color: '#00e5ff', setId: 'set1', rent: 250 },
  detention: { name: '禁閉區', basePrice: 0, color: '#a855f7', setId: undefined },
  fate: { name: '命運區', basePrice: 0, color: '#ff4dff', setId: undefined },
  chance: { name: '機會區', basePrice: 0, color: '#6366f1', setId: undefined },
  minigame: { name: '遊戲區', basePrice: 0, color: '#facc15', setId: undefined },
  parking: { name: '停車場', basePrice: 0, color: '#38bdf8', setId: undefined },
  jail: { name: '免費停車', basePrice: 0, color: '#f97316', setId: undefined },
  event: { name: '奇遇事件', basePrice: 0, color: '#facc15', setId: undefined },
  teleport: { name: '傳送門', basePrice: 0, color: '#2dd4bf', setId: undefined },
};

// ===== 預設地圖模板 =====
type PresetMapId = 'classic' | 'small' | 'large';

interface PresetMap {
  id: PresetMapId;
  name: string;
  cellCount: number;
  description: string;
}

const PRESET_MAPS: PresetMap[] = [
  { id: 'classic', name: '經典地圖', cellCount: CELL_COUNT, description: '標準 36 格賽博朋克地圖' },
  { id: 'small', name: '小型地圖', cellCount: CELL_COUNT, description: '精簡 28 地產格，快速對戰' },
  { id: 'large', name: '大型地圖', cellCount: CELL_COUNT, description: '48 區段，更多戰略選擇' },
];

function createPresetCells(presetId: PresetMapId): CellConfig[] {
  const cells: CellConfig[] = [];
  for (let i = 0; i < CELL_COUNT; i++) {
    cells.push({
      id: i,
      name: `地塊${i}`,
      type: 'property',
      basePrice: 1000 + Math.floor(i / 4) * 400,
      color: '#00e5ff',
      setId: `set${Math.floor(i / 4) + 1}`,
      rent: Math.round((1000 + Math.floor(i / 4) * 400) * 0.25),
    });
  }

  // Always place start + detention + fate + chance
  cells[0] = { id: 0, name: '起點', type: 'start', basePrice: 0, color: '#00ff88' };
  cells[10] = { id: 10, name: '禁閉區', type: 'detention', basePrice: 0, color: '#a855f7' };
  cells[20] = { id: 20, name: '命運區', type: 'fate', basePrice: 0, color: '#ff4dff' };
  cells[33] = { id: 33, name: '命運區', type: 'fate', basePrice: 0, color: '#ff4dff' };
  cells[27] = { id: 27, name: '機會區', type: 'chance', basePrice: 0, color: '#6366f1' };
  cells[35] = { id: 35, name: '機會區', type: 'chance', basePrice: 0, color: '#6366f1' };

  if (presetId === 'classic') {
    // Classic: balanced, parking + event
    cells[9] = { id: 9, name: '停車場', type: 'parking', basePrice: 0, color: '#38bdf8' };
    cells[18] = { id: 18, name: '奇遇事件', type: 'event', basePrice: 0, color: '#facc15' };
    // Set classic property names and prices
    const names = ['霓虹區', '舊城區', '能源站', '數據塔', '維修區', '核心區', '深海港', '金融街', '地下街'];
    const prices = [600, 600, 1000, 1000, 1200, 1400, 1400, 1600, 1800];
    for (let i = 1; i <= 8; i++) {
      cells[i] = { ...cells[i], name: names[i - 1], basePrice: prices[i - 1], rent: Math.round(prices[i - 1] * 0.25) };
    }
  } else if (presetId === 'small') {
    // Small: fewer special cells, simpler layout
    cells[9] = { id: 9, name: '地產九', type: 'property', basePrice: 2000, color: '#00e5ff', setId: 'set3', rent: 500 };
    cells[18] = { id: 18, name: '地產十八', type: 'property', basePrice: 2500, color: '#f472b6', setId: 'set5', rent: 625 };
  } else if (presetId === 'large') {
    // Large: more variety, parking + event + teleport + jail
    cells[9] = { id: 9, name: '停車場', type: 'parking', basePrice: 0, color: '#38bdf8' };
    cells[18] = { id: 18, name: '奇遇事件', type: 'event', basePrice: 0, color: '#facc15' };
    cells[4] = { id: 4, name: '傳送門', type: 'teleport', basePrice: 0, color: '#2dd4bf' };
    cells[14] = { id: 14, name: '免費停車', type: 'jail', basePrice: 0, color: '#f97316' };
    cells[24] = { id: 24, name: '傳送門', type: 'teleport', basePrice: 0, color: '#2dd4bf' };
    cells[30] = { id: 30, name: '奇遇事件', type: 'event', basePrice: 0, color: '#facc15' };
  }

  return cells;
}

const MapEditorPage = () => {
  const navigate = useNavigate();
  const [mapName, setMapName] = useState<string>('未命名地圖');
  const [cells, setCells] = useState<CellConfig[]>(createDefaultCells);
  const [selectedId, setSelectedId] = useState<number | null>(0);
  const [tool, setTool] = useState<MapEditorTool>('select');
  const [selectedType, setSelectedType] = useState<CellType>('property');

  // Dialogs
  const [showExport, setShowExport] = useState<boolean>(false);
  const [showImport, setShowImport] = useState<boolean>(false);
  const [showSaveList, setShowSaveList] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [exportText, setExportText] = useState<string>('');
  const [importText, setImportText] = useState<string>('');
  const [savedMaps, setSavedMaps] = useState<CustomMapData[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>('');
  const [saveMsg, setSaveMsg] = useState<string>('');
  const [editingMapId, setEditingMapId] = useState<string | null>(null);

  // History (undo/redo)
  const [history, setHistory] = useState<CellConfig[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Preset template
  const [showPresets, setShowPresets] = useState<boolean>(false);

  // Test preview dialog
  const [showTestPreview, setShowTestPreview] = useState<boolean>(false);

  // Clear confirm
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // 刪除地圖確認
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setSavedMaps(loadSavedMaps());
  }, []);

  // Initialize history with first state
  useEffect(() => {
    setHistory([cells.map((c: CellConfig) => ({ ...c }))]);
    setHistoryIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushHistory = useCallback((nextCells: CellConfig[]) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, nextCells.map((c: CellConfig) => ({ ...c }))];
      if (next.length > 100) next.shift(); // limit history size
      return next;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 99));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    setHistoryIndex(prevIndex);
    setCells(history[prevIndex].map((c: CellConfig) => ({ ...c })));
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setCells(history[nextIndex].map((c: CellConfig) => ({ ...c })));
  }, [historyIndex, history]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z')))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const selectedCell = selectedId !== null ? cells[selectedId] : null;

  const applyTool = useCallback(
    (id: number) => {
      if (tool === 'select') {
        setSelectedId(id);
        return;
      }

      if (tool === 'paint') {
        const next = cells.map((c: CellConfig) => ({ ...c }));
        const defaults = typeDefaults[selectedType];
        next[id] = { ...next[id], ...defaults, id, type: selectedType };
        setCells(next);
        pushHistory(next);
        setSelectedId(id);
        return;
      }

      if (tool === 'erase') {
        const next = cells.map((c: CellConfig) => ({ ...c }));
        next[id] = {
          ...next[id],
          type: 'property',
          name: '空地',
          basePrice: 0,
          color: '#444',
          setId: undefined,
          rent: 0,
        };
        setCells(next);
        pushHistory(next);
      }
    },
    [tool, selectedType, cells, pushHistory],
  );

  const handleContextMenu = useCallback((id: number) => {
    const next = cells.map((c: CellConfig) => ({ ...c }));
    next[id] = {
      ...next[id],
      type: 'property',
      name: '空地',
      basePrice: 0,
      color: '#444',
      setId: undefined,
      rent: 0,
    };
    setCells(next);
    pushHistory(next);
  }, [cells, pushHistory]);

  const updateCell = useCallback((patch: Partial<CellConfig>) => {
    if (selectedId === null) return;
    const next = cells.map((c: CellConfig) => ({ ...c }));
    next[selectedId] = { ...next[selectedId], ...patch };
    setCells(next);
    pushHistory(next);
  }, [cells, selectedId, pushHistory]);

  const handleApplyToSameColor = useCallback(() => {
    if (selectedId === null) return;
    const source = cells[selectedId];
    if (!source.setId) return;
    const next = cells.map((c: CellConfig) => {
      if (c.setId === source.setId && c.type === 'property') {
        return {
          ...c,
          basePrice: source.basePrice,
          rent: source.rent,
          color: source.color,
        };
      }
      return c;
    });
    setCells(next);
    pushHistory(next);
  }, [cells, selectedId, pushHistory]);

  const handleLoadPreset = useCallback((presetId: PresetMapId) => {
    const presetCells = createPresetCells(presetId);
    setCells(presetCells);
    setSelectedId(0);
    setMapName(PRESET_MAPS.find((p: PresetMap) => p.id === presetId)?.name ?? '');
    setShowPresets(false);
    setHistory([presetCells.map((c: CellConfig) => ({ ...c }))]);
    setHistoryIndex(0);
  }, []);

  const handleClearMap = useCallback(() => {
    const cleared: CellConfig[] = Array.from({ length: CELL_COUNT }, (_, i) => ({
      id: i,
      name: `空地${i}`,
      type: 'property' as CellType,
      basePrice: 0,
      color: '#444',
      rent: 0,
    }));
    cleared[0] = { id: 0, name: '起點', type: 'start', basePrice: 0, color: '#00ff88' };
    setCells(cleared);
    setSelectedId(0);
    setEditingMapId(null);
    setShowClearConfirm(false);
    pushHistory(cleared);
  }, [pushHistory]);

  const runValidation = useCallback((): boolean => {
    const result = validateMap(cells);
    if (!result.valid) {
      setErrors(result.errors);
      setShowErrors(true);
      return false;
    }
    return true;
  }, [cells]);

   const handleSave = useCallback(() => {
    if (!runValidation()) return;

    const current = loadSavedMaps();

    if (editingMapId) {
      const idx = current.findIndex((m) => m.id === editingMapId);
      if (idx >= 0) {
        const updated: CustomMapData = {
          ...current[idx],
          name: mapName || '未命名地圖',
          cells: cells.map((c) => ({ ...c })),
        };
        const next = [...current];
        next[idx] = updated;
        const ok = saveMapsToStorage(next);
        if (!ok) {
          setSaveMsg('儲存失敗：儲存空間已滿，請刪除舊地圖');
          setShowSaveList(true);
          return;
        }
        setSavedMaps(next);
        setSaveMsg('儲存成功！');
        setShowSaveList(true);
        return;
      }
    }

    if (current.length >= MAX_CUSTOM_MAPS) {
      setSaveMsg(`已達上限 ${MAX_CUSTOM_MAPS} 張，請先刪除舊地圖`);
      setShowSaveList(true);
      return;
    }

    const newMap: CustomMapData = {
      id: `map_${Date.now()}`,
      name: mapName || '未命名地圖',
      cells: cells.map((c) => ({ ...c })),
      createdAt: new Date().toISOString(),
    };

    const next = [newMap, ...current].slice(0, MAX_CUSTOM_MAPS);
    const ok = saveMapsToStorage(next);
    if (!ok) {
      setSaveMsg('儲存失敗：儲存空間已滿，請刪除舊地圖');
      setShowSaveList(true);
      return;
    }
    setSavedMaps(next);
    setEditingMapId(newMap.id);
    setSaveMsg('儲存成功！');
    setShowSaveList(true);
  }, [cells, mapName, runValidation, editingMapId]);

  const handleDeleteMap = useCallback((id: string) => {
    const current = loadSavedMaps();
    const next = current.filter((m) => m.id !== id);
    saveMapsToStorage(next);
    setSavedMaps(next);
    if (editingMapId === id) {
      setEditingMapId(null);
    }
    setPendingDeleteId(null);
  }, [editingMapId]);

  // 由儲存清單點擊刪除鈕時先彈確認框
  const requestDeleteMap = useCallback((id: string) => {
    setPendingDeleteId(id);
  }, []);

  const handleLoadMap = useCallback((map: CustomMapData) => {
    if (map.cells && map.cells.length === CELL_COUNT) {
      setCells(map.cells.map((c) => ({ ...c })));
      setMapName(map.name);
      setEditingMapId(map.id);
      setHistory([map.cells.map((c: CellConfig) => ({ ...c }))]);
      setHistoryIndex(0);
      setShowSaveList(false);
    }
  }, []);

  const handleExport = useCallback(() => {
    if (!runValidation()) return;
    const encoded = encodeMapToBase64(cells);
    setExportText(encoded);
    setShowExport(true);
  }, [cells, runValidation]);

  const handleCopyExport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, [exportText]);

  const handleImport = useCallback(() => {
    setImportError('');
    try {
      const decoded = decodeMapFromBase64(importText.trim());
      if (!Array.isArray(decoded) || decoded.length !== CELL_COUNT) {
        setImportError('地圖格式錯誤：格子數量不符');
        return;
      }
      const validated = validateMap(decoded);
      if (!validated.valid) {
        setImportError(`地圖格式錯誤：${validated.errors[0] ?? '校驗失敗'}`);
        return;
      }
      const normalized = decoded.map((c, i) => {
        const defaults = typeDefaults[c.type as CellType] ?? {};
        return { ...defaults, ...c, id: i } as CellConfig;
      });
      setCells(normalized);
      setEditingMapId(null);
      setHistory([normalized.map((c: CellConfig) => ({ ...c }))]);
      setHistoryIndex(0);
      setShowImport(false);
      setImportText('');
    } catch {
      setImportError('解析失敗，請確認 base64 字串是否正確');
    }
  }, [importText]);

  const handleTest = useCallback(() => {
    if (!runValidation()) return;
    setShowTestPreview(true);
  }, [runValidation]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handlePublish = useCallback(() => {
    if (!runValidation()) return;
    const mapData: CustomMapData = {
      id: `map_publish_${Date.now()}`,
      name: mapName || '未命名地圖',
      cells: cells,
      createdAt: new Date().toISOString(),
    };
    publishMap(mapData, '我');
    setSaveMsg('已發布到社區！');
    setTimeout(() => setSaveMsg(''), 2000);
  }, [cells, mapName, runValidation]);

  return (
    <div className="min-h-screen w-full flex flex-col scanlines relative">
      {/* Background decoration */}
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

      {/* Top toolbar */}
      <header className="relative z-10 p-3 md:p-4 border-b border-[rgba(0_255_255_0.15)]">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2 md:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleBack}
            className="cyber-btn cyber-btn-sm flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            返回
          </button>

          <div className="flex-1 min-w-[160px] max-w-md">
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="cyber-input text-sm py-1.5 font-cyber tracking-wider"
              placeholder="地圖名稱"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
              style={{
                opacity: historyIndex <= 0 ? 0.4 : 1,
                cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
              }}
              title="復原 (Ctrl+Z)"
            >
              <Undo2 size={14} />
              <span className="hidden sm:inline">復原</span>
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
              style={{
                opacity: historyIndex >= history.length - 1 ? 0.4 : 1,
                cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
              }}
              title="重做 (Ctrl+Y)"
            >
              <Redo2 size={14} />
              <span className="hidden sm:inline">重做</span>
            </button>
            <div className="w-px h-5 bg-[rgba(0_255_255_0.2)] mx-1" />
            <button
              type="button"
              onClick={() => setShowPresets(true)}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
              style={{
                borderColor: 'var(--purple)',
                color: 'var(--purple)',
              }}
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">模板</span>
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
              style={{
                borderColor: 'var(--red)',
                color: 'var(--red)',
              }}
              title="清空地圖"
            >
              <X size={14} />
              <span className="hidden sm:inline">清空</span>
            </button>
            <div className="w-px h-5 bg-[rgba(0_255_255_0.2)] mx-1" />
            <button
              type="button"
              onClick={handleSave}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
            >
              <Save size={14} />
              保存
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
            >
              <Download size={14} />
              導出
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImport(true);
                setImportError('');
              }}
              className="cyber-btn cyber-btn-sm flex items-center gap-1"
            >
              <Upload size={14} />
              導入
            </button>
             <button
               type="button"
               onClick={handleTest}
               className="cyber-btn cyber-btn-sm cyber-btn-pink flex items-center gap-1"
             >
               <Play size={14} />
               測試
             </button>
             <button
               type="button"
               onClick={handlePublish}
               className="cyber-btn cyber-btn-sm flex items-center gap-1"
               style={{
                 borderColor: 'var(--green)',
                 color: 'var(--green)',
                 backgroundColor: 'rgba(0, 255, 128, 0.08)',
               }}
             >
               <Share2 size={14} />
               發布到社區
             </button>
           </div>
        </div>
      </header>

      {/* Main content - 3 columns */}
      <main className="relative z-10 flex-1 p-3 md:p-4">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-3 md:gap-4 h-full">
          {/* Left panel */}
          <div className="order-2 lg:order-1 lg:h-[calc(100vh-120px)] lg:min-h-0">
            <ToolPanel
              tool={tool}
              onToolChange={setTool}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
            />
          </div>

          {/* Center - board preview */}
          <div className="order-1 lg:order-2 flex items-center justify-center">
            <EditorBoard
              cells={cells}
              selectedId={selectedId}
              onCellClick={applyTool}
              onCellContextMenu={handleContextMenu}
            />
          </div>

          {/* Right panel */}
          <div className="order-3 lg:h-[calc(100vh-120px)] lg:min-h-0">
            <PropertyPanel
              cell={selectedCell}
              onUpdate={updateCell}
              onApplyToSameColor={handleApplyToSameColor}
              allCells={cells}
            />
          </div>
        </div>
      </main>

      {/* Validation errors dialog */}
      <EditorDialogs
        showExport={showExport}
        onExportChange={setShowExport}
        exportText={exportText}
        copied={copied}
        onCopy={handleCopyExport}
        showImport={showImport}
        onImportChange={setShowImport}
        importText={importText}
        onImportTextChange={setImportText}
        importError={importError}
        onImport={handleImport}
        showSaveList={showSaveList}
        onSaveListChange={setShowSaveList}
        saveMsg={saveMsg}
        savedMaps={savedMaps}
        onLoadMap={handleLoadMap}
        onDeleteMap={requestDeleteMap}
        showErrors={showErrors}
        onErrorsChange={setShowErrors}
        errors={errors}
      />

      {/* Preset template dialog */}
      {showPresets && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-md p-5"
            style={{
              borderColor: 'var(--purple)',
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
              backgroundColor: 'hsl(240, 18%, 10%)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-cyber text-xl tracking-wider"
                style={{ color: 'var(--purple)', textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}
              >
                選擇地圖模板
              </h2>
              <button
                type="button"
                onClick={() => setShowPresets(false)}
                className="cyber-btn p-1"
                style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {PRESET_MAPS.map((preset: PresetMap) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset.id)}
                  className="w-full text-left p-4 cyber-card transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--cyan) 30%, transparent)',
                    backgroundColor: 'hsl(240, 20%, 8%)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-sm"
                      style={{
                        border: '1px solid var(--cyan)',
                        color: 'var(--cyan)',
                        boxShadow: '0 0 8px rgba(0, 255, 255, 0.3)',
                      }}
                    >
                      <LayoutGrid size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-cyber text-sm tracking-wider text-neon-cyan">
                        {preset.name}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {preset.description} · {preset.cellCount} 格
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-xs text-[var(--text-muted)] font-cyber">
              載入模板將替換目前地圖，操作不可復原
            </div>
          </div>
        </div>
      )}

      {/* Test preview dialog */}
      {showTestPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-lg p-5"
            style={{
              borderColor: 'var(--pink)',
              boxShadow: '0 0 30px rgba(255, 77, 212, 0.4)',
              backgroundColor: 'hsl(240, 18%, 10%)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="font-cyber text-xl tracking-wider"
                style={{ color: 'var(--pink)', textShadow: '0 0 10px rgba(255, 77, 212, 0.5)' }}
              >
                地圖預覽
              </h2>
              <button
                type="button"
                onClick={() => setShowTestPreview(false)}
                className="cyber-btn p-1"
                style={{ borderColor: 'var(--text-secondary)', color: 'var(--text-secondary)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="mb-4">
              <div className="font-cyber text-sm tracking-wider text-neon-cyan mb-1">
                {mapName || '未命名地圖'}
              </div>
              <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
                <div>總格子數：{cells.length}</div>
                <div>
                  地產格數：{cells.filter((c: CellConfig) => c.type === 'property').length}
                </div>
                <div>
                  特殊格子：
                  {cells.filter((c: CellConfig) => c.type !== 'property').length}
                </div>
              </div>
            </div>
            <div className="text-center py-6 border-t border-[rgba(255_77_212_0.2)]">
              <div className="text-[var(--text-secondary)] text-sm mb-4">
                （預覽模式 - 展示地圖結構）
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowTestPreview(false)}
                  className="cyber-btn px-5 py-2 text-sm font-cyber tracking-wider"
                >
                  關閉
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTestPreview(false);
                    navigate('/game', { state: { customMapCells: cells } });
                  }}
                  className="cyber-btn px-5 py-2 text-sm font-cyber tracking-wider"
                  style={{
                    borderColor: 'var(--pink)',
                    color: 'var(--pink)',
                    backgroundColor: 'rgba(255, 77, 212, 0.08)',
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <Play size={14} />
                    開始測試
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear confirm dialog */}
      {showClearConfirm && (        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-sm p-5"
            style={{
              borderColor: 'var(--red)',
              boxShadow: '0 0 30px rgba(255, 77, 77, 0.3)',
              backgroundColor: 'hsl(240, 18%, 10%)',
            }}
          >
            <h2
              className="font-cyber text-xl tracking-wider mb-3"
              style={{ color: 'var(--red)', textShadow: '0 0 10px rgba(255, 77, 77, 0.5)' }}
            >
              確認清空
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              確定要清空目前地圖嗎？此操作可透過復原還原。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleClearMap}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: 'var(--red)',
                  color: 'var(--red)',
                  backgroundColor: 'rgba(255, 77, 77, 0.08)',
                }}
              >
                確認清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 刪除已存地圖確認 */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="cyber-card w-full max-w-sm p-5"
            style={{
              borderColor: 'var(--red)',
              boxShadow: '0 0 30px rgba(255, 77, 77, 0.3)',
              backgroundColor: 'hsl(240, 18%, 10%)',
            }}
          >
            <h2
              className="font-cyber text-xl tracking-wider mb-3"
              style={{ color: 'var(--red)', textShadow: '0 0 10px rgba(255, 77, 77, 0.5)' }}
            >
              確認刪除
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              確定要刪除這張已儲存的地圖嗎？此操作無法復原。
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMap(pendingDeleteId)}
                className="cyber-btn flex-1 py-2 text-sm font-cyber tracking-wider"
                style={{
                  borderColor: 'var(--red)',
                  color: 'var(--red)',
                  backgroundColor: 'rgba(255, 77, 77, 0.08)',
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

export default MapEditorPage;
