import { FC, useState, useEffect } from "react";
import type { GameState, PlayerState, MountType, PetType } from "@shared/api.interface";
import { PETS } from "@shared/game-config";
import {
  Swords,
  Eye,
  Bot,
  RotateCcw,
  Layers,
  Bike,
  Dog,
  X,
  ChevronRight,
  Rocket,
  Plane,
  Fish,
  Sparkles,
  Crown,
  Cat,
  Ghost,
  Rabbit,
  Wand2,
  Grip,
  Car,
} from "lucide-react";

export interface WorldviewSystemsPanelProps {
  gameState: GameState;
  playerIndex: number;
  onClose: () => void;
  onDeclareWar: (targetIndex: number) => void;
  onMakePeace: (targetIndex: number) => void;
  onSendSpy: (targetIndex: number) => void;
  onGatherIntel: (targetIndex: number) => void;
  onCounterSpy: () => void;
  onToggleRobotProxy: (enable: boolean) => void;
  onUseTimeTravel: () => void;
  onTriggerParallelWorld: () => void;
  onEquipMount: (mountType: MountType) => void;
  onBringPet: (petType: PetType) => void;
  onUpgradePet: (petType: PetType) => void;
}

type SystemKey =
  | "war"
  | "spy"
  | "robot"
  | "timeTravel"
  | "parallel"
  | "mount"
  | "pet";

// 寵物圖標映射（未知寵物以 Dog 兜底）
const PET_ICON_MAP: Partial<Record<PetType, FC<{ className?: string; style?: React.CSSProperties }>>> = {
  mechDog: Dog,
  ufo: Sparkles,
  dragon: Crown,
  neon_cat: Cat,
  ghost_hacker: Ghost,
  cyber_bunny: Rabbit,
  data_fairy: Wand2,
};

// 坐騎圖標映射（未知坐騎以 Bike 兜底）
const MOUNT_ICON_MAP: Partial<Record<MountType, FC<{ className?: string; style?: React.CSSProperties }>>> = {
  flyer: Plane,
  diver: Fish,
  rocket: Rocket,
  hoverboard: Grip,
  drone_mount: Bot,
  hover_car: Car,
};

// 取得坐騎剩餘次數（兼容舊型別與 v3 新欄位）
function getMountUses(mounts: PlayerState["mounts"], type: MountType): number {
  if (!mounts) return 0;
  switch (type) {
    case "flyer":
      return mounts.flyerUses ?? 0;
    case "diver":
      return mounts.diverUses ?? 0;
    case "rocket":
      return mounts.rocketUses ?? 0;
    case "hoverboard":
      return mounts.hoverboardUses ?? 0;
    case "drone_mount":
      return mounts.droneMountUses ?? 0;
    case "hover_car":
      return mounts.hoverCarUses ?? 0;
    default:
      return 0;
  }
}

const SYSTEMS: { key: SystemKey; label: string; icon: FC<{ className?: string }>; color: string }[] = [
  { key: "war", label: "戰爭系統", icon: Swords, color: "var(--red)" },
  { key: "spy", label: "間諜系統", icon: Eye, color: "var(--purple)" },
  { key: "robot", label: "機器人代打", icon: Bot, color: "var(--cyan)" },
  { key: "timeTravel", label: "時間旅行", icon: RotateCcw, color: "var(--gold, #ffd700)" },
  { key: "parallel", label: "平行世界", icon: Layers, color: "var(--pink)" },
  { key: "mount", label: "坐騎系統", icon: Bike, color: "var(--cyan)" },
  { key: "pet", label: "寵物系統", icon: Dog, color: "var(--green)" },
];

const WorldviewSystemsPanel: FC<WorldviewSystemsPanelProps> = ({
  gameState,
  playerIndex,
  onClose,
  onDeclareWar,
  onMakePeace,
  onSendSpy,
  onGatherIntel,
  onCounterSpy,
  onToggleRobotProxy,
  onUseTimeTravel,
  onTriggerParallelWorld,
  onEquipMount,
  onBringPet,
  onUpgradePet,
}) => {
  const [activeSystem, setActiveSystem] = useState<SystemKey | null>(null);
  const [targetPlayer, setTargetPlayer] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  // Esc 關閉 + 背景滾動鎖
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmAction) {
          setConfirmAction(null);
        } else if (activeSystem) {
          handleBack();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSystem, confirmAction, onClose]);

  const currentPlayer = gameState.players[playerIndex];
  const opponents = gameState.players
    .map((p: PlayerState, i: number) => ({ player: p, index: i }))
    .filter(({ player: p, index: i }) => i !== playerIndex && !p.isBankrupt);

  const isAtWar = (targetIdx: number): boolean => {
    return (
      gameState.wars?.some(
        (w: { attackerIndex: number; defenderIndex: number }) =>
          (w.attackerIndex === playerIndex && w.defenderIndex === targetIdx) ||
          (w.attackerIndex === targetIdx && w.defenderIndex === playerIndex)
      ) ?? false
    );
  };

  const hasActiveSpy = (targetIdx: number): boolean => {
    return (
      gameState.spies?.some(
        (s: { spyIndex: number; targetIndex: number; remainingTurns: number }) =>
          s.spyIndex === playerIndex && s.targetIndex === targetIdx && s.remainingTurns <= 2
      ) ?? false
    );
  };

  const hasSpyAgainstMe = (): boolean => {
    return (
      gameState.spies?.some(
        (s: { targetIndex: number }) => s.targetIndex === playerIndex
      ) ?? false
    );
  };

  const isRobotActive = (gameState.robotProxy?.[playerIndex] ?? 0) > 0;
  const robotTurns = gameState.robotProxy?.[playerIndex] ?? 0;
  const hasTimeTravelSnapshot = !!gameState.timeTravelSnapshots?.[playerIndex];
  const timeTravelUsed = currentPlayer?.timeTravelUsed ?? false;
  const isInParallelWorld = gameState.parallelWorld?.active === true;
  const parallelRemaining = gameState.parallelWorld?.remainingTurns ?? 0;

  const mounts = currentPlayer?.mounts;
  const equippedPet = currentPlayer?.equippedPet;

  const handleBack = () => {
    setActiveSystem(null);
    setTargetPlayer(null);
    setConfirmAction(null);
  };

  const handleClose = () => {
    handleBack();
    onClose();
  };

  const renderMenu = () => (
    <div className="space-y-2">
      {SYSTEMS.map((sys) => {
        const Icon = sys.icon;
        return (
          <button
            key={sys.key}
            onClick={() => setActiveSystem(sys.key)}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all"
            style={{
              border: "1px solid var(--border-neon-cyan)",
              background: "rgba(0, 200, 255, 0.03)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0, 200, 255, 0.08)";
              e.currentTarget.style.boxShadow = "0 0 10px rgba(0, 200, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0, 200, 255, 0.03)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: `${sys.color}15`,
                border: `1px solid ${sys.color}`,
                color: sys.color,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-cyber tracking-wide text-sm">{sys.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {sys.key === "war" && (gameState.wars?.length ?? 0) > 0 ? `交戰中：${gameState.wars?.length} 場` : "宣戰 / 停戰"}
                {sys.key === "spy" && "派遣間諜 / 獲取情報 / 反間諜"}
                {sys.key === "robot" && (isRobotActive ? `AI 托管中（剩 ${robotTurns} 回合）` : "開啟 / 關閉 AI 代打")}
                {sys.key === "timeTravel" && (timeTravelUsed ? "本場已使用" : hasTimeTravelSnapshot ? "可回溯至快照" : "尚無快照")}
                {sys.key === "parallel" && (isInParallelWorld ? `平行世界（剩 ${parallelRemaining} 回合）` : "切換至平行世界")}
                {sys.key === "mount" && (mounts
                  ? `${(mounts.flyerUses ?? 0) + (mounts.diverUses ?? 0) + (mounts.rocketUses ?? 0) + (mounts.hoverboardUses ?? 0) + (mounts.droneMountUses ?? 0) + (mounts.hoverCarUses ?? 0)} 次可用`
                  : "未解鎖坐騎")}
                {sys.key === "pet" && (equippedPet ? `攜帶中：${PETS[equippedPet as PetType]?.name ?? "未知"}` : "尚未攜帶寵物")}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--text-secondary)" }} />
          </button>
        );
      })}
    </div>
  );

  const renderWar = () => (
    <div className="space-y-3">
      <div className="text-xs px-3 py-2 rounded" style={{ background: "rgba(255, 77, 109, 0.1)", color: "var(--red)" }}>
        戰爭期間雙方過路費雙倍，禁止交易。宣戰需花費 ¥500，持續 5 回合。
      </div>
      <div className="space-y-2">
        {opponents.map(({ player: p, index: pIdx }) => {
          const atWar = isAtWar(pIdx);
          return (
            <div
              key={pIdx}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ border: "1px solid var(--border-neon-cyan)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: p.color, color: "var(--bg-deep)" }}
                >
                  {p.name[0]}
                </div>
                <div>
                  <div className="text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    ¥{p.money.toLocaleString()}
                  </div>
                </div>
              </div>
              {atWar ? (
                <button
                  onClick={() => {
                    setTargetPlayer(pIdx);
                    setConfirmAction("makePeace");
                  }}
                  className="px-3 py-1.5 text-xs rounded font-cyber tracking-wide"
                  style={{ border: "1px solid var(--cyan)", color: "var(--cyan)" }}
                >
                  停戰
                </button>
              ) : (
                <button
                  onClick={() => {
                    setTargetPlayer(pIdx);
                    setConfirmAction("declareWar");
                  }}
                  disabled={(currentPlayer?.money ?? 0) < 500}
                  className="px-3 py-1.5 text-xs rounded font-cyber tracking-wide disabled:opacity-40"
                  style={{ border: "1px solid var(--red)", color: "var(--red)" }}
                >
                  宣戰
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSpy = () => (
    <div className="space-y-3">
      <div className="text-xs px-3 py-2 rounded" style={{ background: "rgba(168, 85, 247, 0.1)", color: "var(--purple)" }}>
        派遣間諜需花費 ¥500，間諜 3 回合後可獲取對手情報。
      </div>
      {hasSpyAgainstMe() && (
        <div
          className="text-xs p-3 rounded flex items-center justify-between"
          style={{ background: "rgba(255, 77, 109, 0.1)", color: "var(--red)", border: "1px dashed var(--red)" }}
        >
          <span>注意 你察覺到可疑人物！</span>
          <button
            onClick={() => setConfirmAction("counterSpy")}
            className="px-2 py-1 text-xs rounded font-cyber"
            style={{ border: "1px solid var(--red)" }}
          >
            反間諜（¥300）
          </button>
        </div>
      )}
      <div className="space-y-2">
        {opponents.map(({ player: p, index: pIdx }) => {
          const spied = gameState.spies?.some(
            (s: { spyIndex: number; targetIndex: number; remainingTurns: number }) =>
              s.spyIndex === playerIndex && s.targetIndex === pIdx
          );
          const intelReady = hasActiveSpy(pIdx);
          return (
            <div
              key={pIdx}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ border: "1px solid var(--border-neon-cyan)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: p.color, color: "var(--bg-deep)" }}
                >
                  {p.name[0]}
                </div>
                <div>
                  <div className="text-sm" style={{ color: "var(--text-primary)" }}>{p.name}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {spied ? (intelReady ? "情報已就緒" : "間諜潛伏中…") : "未派遣間諜"}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                {intelReady && (
                  <button
                    onClick={() => onGatherIntel(pIdx)}
                    className="px-2 py-1 text-xs rounded font-cyber"
                    style={{ border: "1px solid var(--green)", color: "var(--green)" }}
                  >
                    獲取情報
                  </button>
                )}
                {!spied && (
                  <button
                    onClick={() => {
                      setTargetPlayer(pIdx);
                      setConfirmAction("sendSpy");
                    }}
                    disabled={(currentPlayer?.money ?? 0) < 500}
                    className="px-2 py-1 text-xs rounded font-cyber disabled:opacity-40"
                    style={{ border: "1px solid var(--purple)", color: "var(--purple)" }}
                  >
                    派遣
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRobot = () => (
    <div className="space-y-4">
      <div className="text-xs px-3 py-2 rounded" style={{ background: "rgba(0, 200, 255, 0.1)", color: "var(--cyan)" }}>
        機器人代打費用 ¥2,000，持續 3 回合。開啟後 AI 將自動進行擲骰與買賣決策。
      </div>
      <div className="flex items-center justify-between p-4 rounded-lg" style={{ border: "1px solid var(--border-neon-cyan)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: isRobotActive ? "rgba(0, 255, 128, 0.15)" : "rgba(0, 200, 255, 0.1)",
              border: `2px solid ${isRobotActive ? "var(--green)" : "var(--cyan)"}`,
              color: isRobotActive ? "var(--green)" : "var(--cyan)",
            }}
          >
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="font-cyber tracking-wide" style={{ color: "var(--text-primary)" }}>
              {isRobotActive ? "AI 托管中" : "AI 代打"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {isRobotActive ? `剩餘 ${robotTurns} 回合` : "尚未開啟"}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (isRobotActive) {
              setConfirmAction("disableRobot");
            } else {
              setConfirmAction("enableRobot");
            }
          }}
          disabled={!isRobotActive && (currentPlayer?.money ?? 0) < 2000}
          className="px-4 py-2 rounded font-cyber text-sm tracking-wide disabled:opacity-40"
          style={{
            border: `1px solid ${isRobotActive ? "var(--red)" : "var(--cyan)"}`,
            color: isRobotActive ? "var(--red)" : "var(--cyan)",
            background: isRobotActive ? "rgba(255, 77, 109, 0.1)" : "rgba(0, 200, 255, 0.1)",
          }}
        >
          {isRobotActive ? "收回控制權" : "開啟代打"}
        </button>
      </div>
    </div>
  );

  const renderTimeTravel = () => (
    <div className="space-y-4">
      <div
        className="text-xs px-3 py-2 rounded"
        style={{ background: "rgba(255, 215, 0, 0.1)", color: "var(--gold, #ffd700)" }}
      >
        時間旅行可回溯到 3 回合前的金錢與位置（地產保留）。每局限用 1 次。
      </div>
      <div className="p-4 rounded-lg text-center" style={{ border: "1px solid var(--border-neon-cyan)" }}>
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{
            background: "rgba(255, 215, 0, 0.1)",
            border: "2px solid var(--gold, #ffd700)",
            color: "var(--gold, #ffd700)",
            animation: timeTravelUsed ? "none" : "pulse 2s ease-in-out infinite",
          }}
        >
          <RotateCcw className="w-8 h-8" />
        </div>
        <div className="font-cyber tracking-wide mb-1" style={{ color: "var(--text-primary)" }}>
          {timeTravelUsed ? "本場已使用" : hasTimeTravelSnapshot ? "快照就緒，可回溯" : "尚無快照"}
        </div>
        {gameState.timeTravelSnapshots?.[playerIndex] && !timeTravelUsed && (
          <div className="text-xs space-y-0.5" style={{ color: "var(--text-secondary)" }}>
            <div>快照回合：第 {gameState.timeTravelSnapshots[playerIndex].turn} 回合</div>
            <div>快照金錢：¥{gameState.timeTravelSnapshots[playerIndex].money.toLocaleString()}</div>
          </div>
        )}
        <button
          onClick={() => setConfirmAction("timeTravel")}
          disabled={timeTravelUsed || !hasTimeTravelSnapshot}
          className="mt-4 px-6 py-2 rounded font-cyber text-sm tracking-wide disabled:opacity-40 w-full"
          style={{
            border: "1px solid var(--gold, #ffd700)",
            color: "var(--gold, #ffd700)",
            background: "rgba(255, 215, 0, 0.1)",
            boxShadow: "0 0 10px rgba(255, 215, 0, 0.3)",
          }}
        >
          啟動時間旅行
        </button>
      </div>
    </div>
  );

  const renderParallel = () => (
    <div className="space-y-4">
      <div className="text-xs px-3 py-2 rounded" style={{ background: "rgba(255, 0, 200, 0.1)", color: "var(--pink)" }}>
        切換至平行世界，地產所有權與事件將短暫重置，持續 3 回合。
      </div>
      <div className="p-4 rounded-lg text-center" style={{ border: "1px solid var(--border-neon-cyan)" }}>
        <div
          className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{
            background: isInParallelWorld ? "rgba(255, 0, 200, 0.2)" : "rgba(255, 0, 200, 0.1)",
            border: "2px solid var(--pink)",
            color: "var(--pink)",
            animation: isInParallelWorld ? "pulse 2s ease-in-out infinite" : "none",
          }}
        >
          <Layers className="w-8 h-8" />
        </div>
        <div className="font-cyber tracking-wide mb-1" style={{ color: "var(--text-primary)" }}>
          {isInParallelWorld ? "平行世界中" : "主世界"}
        </div>
        {isInParallelWorld && (
          <div className="text-xs" style={{ color: "var(--pink)" }}>
            剩餘 {parallelRemaining} 回合
          </div>
        )}
        {!isInParallelWorld && (
          <button
            onClick={() => setConfirmAction("parallelWorld")}
            className="mt-4 px-6 py-2 rounded font-cyber text-sm tracking-wide w-full"
            style={{
              border: "1px solid var(--pink)",
              color: "var(--pink)",
              background: "rgba(255, 0, 200, 0.1)",
              boxShadow: "0 0 10px rgba(255, 0, 200, 0.3)",
            }}
          >
            切換至平行世界
          </button>
        )}
      </div>
    </div>
  );

  const MOUNT_DATA: { type: MountType; name: string; desc: string; icon: FC<{ className?: string; style?: React.CSSProperties }> }[] = [
    { type: "flyer", name: "飛行器", desc: "可跳過 1 格對方地產，免繳過路費", icon: Plane },
    { type: "diver", name: "潛水艇", desc: "規避命運區負面效果", icon: Fish },
    { type: "rocket", name: "火箭", desc: "隨機衝刺 5~12 格", icon: Rocket },
    { type: "hoverboard", name: "懸浮滑板", desc: "平滑前進 3 格，不觸發落地事件", icon: Grip },
    { type: "drone_mount", name: "偵查無人機", desc: "偵察全場，下回合買地 9 折", icon: Bot },
    { type: "hover_car", name: "懸浮跑車", desc: "立即移動到任意地塊", icon: Car },
  ];

  const renderMount = () => (
    <div className="space-y-3">
      <div className="text-xs px-3 py-2 rounded" style={{ background: "rgba(0, 200, 255, 0.1)", color: "var(--cyan)" }}>
        坐騎每局可使用 3 次，根據戰況靈活運用。
      </div>
      <div className="space-y-2">
      {MOUNT_DATA.map((m) => {
        const Icon = m.icon;
        const uses = getMountUses(mounts, m.type);
        return (
          <div
            key={m.type}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ border: "1px solid var(--border-neon-cyan)" }}
          >
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: uses > 0 ? "rgba(0, 200, 255, 0.15)" : "rgba(255, 255, 255, 0.05)",
                border: `1px solid ${uses > 0 ? "var(--cyan)" : "var(--text-secondary)"}`,
                color: uses > 0 ? "var(--cyan)" : "var(--text-secondary)",
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-cyber tracking-wide" style={{ color: "var(--text-primary)" }}>
                {m.name}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {m.desc}
              </div>
              <div className="text-xs mt-1" style={{ color: uses > 0 ? "var(--green)" : "var(--text-secondary)" }}>
                剩餘 {uses} 次
              </div>
            </div>
            <button
              type="button"
              onClick={() => onEquipMount(m.type)}
              disabled={uses <= 0}
              className="px-3 py-1.5 text-xs rounded font-cyber shrink-0 disabled:opacity-40 min-h-[36px]"
              style={{ border: "1px solid var(--cyan)", color: "var(--cyan)" }}
            >
              使用
            </button>
          </div>
        );
      })}
      </div>
      {!mounts && (
        <div className="text-center text-xs py-2" style={{ color: "var(--text-secondary)" }}>
          尚未解鎖任何坐騎，可通過商店或命運卡獲得
        </div>
      )}
    </div>
  );

  const PET_LIST: PetType[] = ["mechDog", "ufo", "dragon", "neon_cat", "ghost_hacker", "cyber_bunny", "data_fairy"];

  const renderPet = () => (
    <div className="space-y-3">
      <div className="text-xs px-3 py-2 rounded" style={{ background: "rgba(0, 255, 128, 0.1)", color: "var(--green)" }}>
        寵物可提供被動加成，每次只能攜帶一隻。
      </div>
      <div className="space-y-2">
      {PET_LIST.map((petType) => {
        const pet = PETS[petType];
        if (!pet) return null;
        const isEquipped = equippedPet === petType;
        const rarityColor =
          pet.rarity === "epic" ? "var(--gold, #ffd700)" : pet.rarity === "rare" ? "var(--purple)" : "var(--cyan)";
        const PetIcon = PET_ICON_MAP[petType] ?? Dog;
        return (
          <div
            key={petType}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{
              border: `1px solid ${isEquipped ? rarityColor : "var(--border-neon-cyan)"}`,
              background: isEquipped ? `${rarityColor}08` : "transparent",
              boxShadow: isEquipped ? `0 0 10px ${rarityColor}33` : "none",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: `${rarityColor}15`,
                border: `1px solid ${rarityColor}`,
                color: rarityColor,
              }}
            >
              <PetIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-cyber tracking-wide flex items-center gap-2" style={{ color: rarityColor }}>
                {pet.name}
                {isEquipped && <Crown className="w-3 h-3" />}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {pet.description}
              </div>
              <div className="text-xs mt-1" style={{ color: rarityColor }}>
                {pet.rarity === "epic" ? "史詩" : pet.rarity === "rare" ? "稀有" : "普通"}
              </div>
            </div>
            <div className="flex flex-col gap-1 items-end shrink-0">
              <button
                type="button"
                onClick={() => onBringPet(petType)}
                disabled={isEquipped}
                className="px-2.5 py-1 text-xs rounded font-cyber disabled:opacity-40 min-h-[36px]"
                style={{ border: `1px solid ${rarityColor}`, color: rarityColor }}
              >
                {isEquipped ? "攜帶中" : "攜帶"}
              </button>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSystem) {
      case "war":
        return renderWar();
      case "spy":
        return renderSpy();
      case "robot":
        return renderRobot();
      case "timeTravel":
        return renderTimeTravel();
      case "parallel":
        return renderParallel();
      case "mount":
        return renderMount();
      case "pet":
        return renderPet();
      default:
        return renderMenu();
    }
  };

  const activeSystemInfo = SYSTEMS.find((s) => s.key === activeSystem);

  const getConfirmText = (): { title: string; desc: string; onConfirm: () => void; color: string } | null => {
    if (!confirmAction || targetPlayer === null && ["declareWar", "makePeace", "sendSpy"].includes(confirmAction)) {
      if (confirmAction === "counterSpy") {
        return {
          title: "反間諜",
          desc: "花費 ¥300 清除所有針對你的間諜？",
          onConfirm: () => {
            onCounterSpy();
            setConfirmAction(null);
          },
          color: "var(--red)",
        };
      }
      if (confirmAction === "enableRobot") {
        return {
          title: "開啟機器人代打",
          desc: "花費 ¥2,000，交由 AI 自動對戰 3 回合？",
          onConfirm: () => {
            onToggleRobotProxy(true);
            setConfirmAction(null);
          },
          color: "var(--cyan)",
        };
      }
      if (confirmAction === "disableRobot") {
        return {
          title: "收回控制權",
          desc: "確定要收回控制權，提前結束 AI 代打嗎？",
          onConfirm: () => {
            onToggleRobotProxy(false);
            setConfirmAction(null);
          },
          color: "var(--red)",
        };
      }
      if (confirmAction === "timeTravel") {
        return {
          title: "時間旅行",
          desc: "回溯到 3 回合前的狀態？（金錢與位置回滾，地產保留。每局限 1 次）",
          onConfirm: () => {
            onUseTimeTravel();
            setConfirmAction(null);
            handleClose();
          },
          color: "var(--gold, #ffd700)",
        };
      }
      if (confirmAction === "parallelWorld") {
        return {
          title: "切換平行世界",
          desc: "進入平行世界 3 回合，地產所有權與事件將短暫重置？",
          onConfirm: () => {
            onTriggerParallelWorld();
            setConfirmAction(null);
            handleClose();
          },
          color: "var(--pink)",
        };
      }
      return null;
    }
    const target = targetPlayer !== null ? gameState.players[targetPlayer] : null;
    if (!target) return null;

    if (confirmAction === "declareWar") {
      return {
        title: "宣戰",
        desc: `你確定要對 ${target.name} 宣戰嗎？\n戰爭期間雙方過路費雙倍，禁止交易，持續 5 回合。\n花費：¥500`,
        onConfirm: () => {
          onDeclareWar(targetPlayer!);
          setConfirmAction(null);
          setTargetPlayer(null);
        },
        color: "var(--red)",
      };
    }
    if (confirmAction === "makePeace") {
      return {
        title: "停戰協議",
        desc: `你確定要與 ${target.name} 停戰嗎？`,
        onConfirm: () => {
          onMakePeace(targetPlayer!);
          setConfirmAction(null);
          setTargetPlayer(null);
        },
        color: "var(--cyan)",
      };
    }
    if (confirmAction === "sendSpy") {
      return {
        title: "派遣間諜",
        desc: `你確定要向 ${target.name} 派遣間諜嗎？\n間諜將於 3 回合後回傳情報。\n花費：¥500`,
        onConfirm: () => {
          onSendSpy(targetPlayer!);
          setConfirmAction(null);
          setTargetPlayer(null);
        },
        color: "var(--purple)",
      };
    }
    return null;
  };

  const confirmData = getConfirmText();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="世界觀系統"
      style={{
        backgroundColor: "rgba(10, 10, 25, 0.85)",
        backdropFilter: "blur(4px)",
        animation: "fade-in 0.2s ease-out",
      }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md cyber-card rounded-xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ animation: "modal-in 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: "var(--border-neon-cyan)" }}
        >
          {activeSystem && activeSystemInfo && (
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ color: "var(--text-secondary)" }}
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
          <div className="flex-1 font-cyber text-lg tracking-wider" style={{ color: "var(--cyan)", textShadow: "0 0 8px rgba(0, 200, 255, 0.6)" }}>
            {activeSystem && activeSystemInfo ? activeSystemInfo.label : "世界觀系統"}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{renderContent()}</div>

        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-[var(--pink)]" />
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-[var(--pink)]" />
      </div>

      {confirmData && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="cyber-card rounded-lg w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
            style={{
              border: `1px solid ${confirmData.color}`,
              boxShadow: `0 0 20px ${confirmData.color}66, inset 0 0 15px ${confirmData.color}22`,
              animation: "modal-in 0.2s ease-out",
            }}
          >
            <h3
              className="font-cyber text-lg tracking-wider mb-3 text-center"
              style={{ color: confirmData.color, textShadow: `0 0 8px ${confirmData.color}aa` }}
            >
              {confirmData.title}
            </h3>
            <div className="text-sm text-center mb-5 whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
              {confirmData.desc}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 rounded font-cyber text-sm tracking-wide"
                style={{ border: "1px solid var(--border-neon-cyan)", color: "var(--text-secondary)" }}
              >
                取消
              </button>
              <button
                onClick={confirmData.onConfirm}
                className="flex-1 py-2 rounded font-cyber text-sm tracking-wide"
                style={{
                  border: `1px solid ${confirmData.color}`,
                  color: confirmData.color,
                  backgroundColor: `${confirmData.color}15`,
                  boxShadow: `0 0 10px ${confirmData.color}44`,
                  textShadow: `0 0 4px ${confirmData.color}88`,
                }}
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldviewSystemsPanel;
