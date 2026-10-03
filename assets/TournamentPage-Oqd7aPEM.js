import { bI as TOURNAMENT_CONFIG, j as jsxRuntimeExports, aK as Award, t as Crown, r as reactExports, b9 as Sparkles, aB as Clock, U as Users, aI as Trophy, at as Check, C as ChevronUp, f as ChevronDown, S as Swords, Z as Zap, aL as Star, aO as Medal, b4 as ChevronRight, u as useNavigate, aC as RefreshCw, bJ as Ticket, aP as TrendingUp, bK as Play } from "./index-ymfxQ6bv.js";
import { G as Gem } from "./gem-4YA6Ub_Y.js";
import { C as Calendar } from "./calendar-DzeNaHko.js";
import { A as ArrowLeft } from "./arrow-left-BPtyRQLF.js";
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function generateGroupMatches(groupName, players) {
  const matches = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `${groupName}-${i}-${j}`,
        player1: players[i],
        player2: players[j],
        status: "pending",
        group: groupName,
        round: 0
      });
    }
  }
  return matches;
}
function createTournamentState(size, playerName) {
  const players = [playerName];
  for (let i = 1; i < size; i++) {
    players.push(`AI-${i}`);
  }
  const shuffled = shuffle(players);
  const groupCount = size === 8 ? 2 : size === 16 ? 4 : 8;
  const groupSize = size / groupCount;
  const groups = {};
  const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"];
  let allMatches = [];
  for (let g = 0; g < groupCount; g++) {
    const groupPlayers = shuffled.slice(g * groupSize, (g + 1) * groupSize);
    groups[groupNames[g]] = groupPlayers;
    allMatches = [...allMatches, ...generateGroupMatches(groupNames[g], groupPlayers)];
  }
  const standings = shuffled.map((p) => ({
    player: p,
    points: 0,
    wins: 0,
    losses: 0
  }));
  return {
    id: `t-${Date.now()}`,
    size,
    phase: "group",
    players: shuffled,
    matches: allMatches,
    standings,
    groups,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function simulateMatches(matches) {
  const updatedMatches = matches.map((m) => {
    if (m.status !== "pending") return m;
    const winner = Math.random() < 0.5 ? m.player1 : m.player2;
    return {
      ...m,
      status: "finished",
      winner
    };
  });
  const winners = updatedMatches.filter((m) => m.status === "finished" && m.winner).map((m) => m.winner);
  return {
    updatedMatches,
    winners
  };
}
function computeStandings(standings, matches) {
  const map = /* @__PURE__ */ new Map();
  standings.forEach((s) => {
    map.set(s.player, {
      ...s,
      points: 0,
      wins: 0,
      losses: 0
    });
  });
  matches.forEach((m) => {
    if (m.status !== "finished" || !m.winner) return;
    const loser = m.winner === m.player1 ? m.player2 : m.player1;
    const w = map.get(m.winner);
    const l = map.get(loser);
    if (w) {
      w.wins += 1;
      w.points += TOURNAMENT_CONFIG.pointsPerWin;
    }
    if (l) {
      l.losses += 1;
      l.points += TOURNAMENT_CONFIG.pointsPerLoss;
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
}
function getGroupAdvancers(groupName, groups, standings) {
  const groupPlayers = groups[groupName] ?? [];
  return standings.filter((s) => groupPlayers.includes(s.player)).slice(0, 2).map((s) => s.player);
}
function generateKnockoutBracket(advancers) {
  const matches = [];
  const totalRounds = Math.log2(advancers.length);
  let roundSize = advancers.length / 2;
  let playerIdx = 0;
  for (let r = 0; r < totalRounds; r++) {
    const roundMatches = [];
    if (r === 0) {
      for (let i = 0; i < roundSize; i++) {
        roundMatches.push({
          id: `ko-r${r}-m${i}`,
          player1: advancers[playerIdx++],
          player2: advancers[playerIdx++],
          status: "pending",
          round: r
        });
      }
    } else {
      for (let i = 0; i < roundSize; i++) {
        roundMatches.push({
          id: `ko-r${r}-m${i}`,
          player1: "",
          player2: "",
          status: "pending",
          round: r
        });
      }
    }
    matches.push(...roundMatches);
    roundSize = roundSize / 2;
  }
  return matches;
}
function advanceKnockoutWinners(matches) {
  const updated = [...matches];
  const totalRounds = Math.max(...matches.map((m) => m.round ?? 0));
  for (let r = 0; r < totalRounds; r++) {
    const currentRound = updated.filter((m) => m.round === r && m.status === "finished" && m.winner);
    const nextRound = updated.filter((m) => m.round === r + 1);
    if (currentRound.length !== nextRound.length * 2) break;
    for (let i = 0; i < nextRound.length; i++) {
      const idx = updated.findIndex((m) => m.id === nextRound[i].id);
      if (idx === -1) continue;
      const w1 = currentRound[i * 2].winner;
      const w2 = currentRound[i * 2 + 1].winner;
      if (w1 && w2) {
        updated[idx] = {
          ...updated[idx],
          player1: w1,
          player2: w2,
          status: "pending"
        };
      }
    }
  }
  return updated;
}
function getGroupMatches(tournament) {
  if (!tournament.groups) return {};
  const result = {};
  Object.keys(tournament.groups).forEach((g) => {
    result[g] = tournament.matches.filter((m) => m.group === g);
  });
  return result;
}
function getKnockoutRounds(tournament) {
  const koMatches = tournament.matches.filter((m) => m.round !== void 0 && !m.group);
  if (koMatches.length === 0) return [];
  const maxRound = Math.max(...koMatches.map((m) => m.round ?? 0));
  const rounds = [];
  for (let r = 0; r <= maxRound; r++) {
    rounds.push(koMatches.filter((m) => m.round === r));
  }
  return rounds;
}
function getSortedStandings(tournament) {
  return [...tournament.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
}
function canSimulateNextRound(tournament) {
  if (!tournament) return false;
  if (tournament.phase === "finished") return false;
  if (tournament.phase === "group") {
    return tournament.matches.some((m) => m.status === "pending" && m.group);
  }
  if (tournament.phase === "knockout") {
    return tournament.matches.some((m) => m.round !== void 0 && !m.group && m.status === "pending" && m.player1 && m.player2);
  }
  return false;
}
function simulateNextRound(tournament) {
  if (tournament.phase === "group") {
    const pendingMatches = tournament.matches.filter((m) => m.status === "pending" && m.group);
    if (pendingMatches.length === 0) {
      const standings2 = computeStandings(tournament.standings, tournament.matches);
      const advancers = [];
      const groupNames = Object.keys(tournament.groups ?? {});
      groupNames.forEach((g) => {
        advancers.push(...getGroupAdvancers(g, tournament.groups, standings2));
      });
      const koMatches = generateKnockoutBracket(advancers);
      return {
        ...tournament,
        phase: "knockout",
        matches: [...tournament.matches, ...koMatches],
        standings: standings2
      };
    }
    const {
      updatedMatches
    } = simulateMatches(tournament.matches);
    const standings = computeStandings(tournament.standings, updatedMatches);
    return {
      ...tournament,
      matches: updatedMatches,
      standings
    };
  }
  if (tournament.phase === "knockout") {
    const koMatches = tournament.matches.filter((m) => m.round !== void 0 && !m.group);
    const firstPendingRound = koMatches.filter((m) => m.status === "pending" && m.player1 && m.player2).sort((a, b) => (a.round ?? 0) - (b.round ?? 0))[0]?.round;
    if (firstPendingRound === void 0) {
      const finalMatch = koMatches.find((m) => m.round === Math.max(...koMatches.map((x) => x.round ?? 0)));
      if (finalMatch && finalMatch.status === "finished" && finalMatch.winner) {
        return {
          ...tournament,
          phase: "finished",
          champion: finalMatch.winner
        };
      }
      return tournament;
    }
    const roundMatches = koMatches.filter((m) => m.round === firstPendingRound && m.status === "pending" && m.player1 && m.player2);
    const otherMatches = tournament.matches.filter((m) => !roundMatches.find((rm) => rm.id === m.id));
    const {
      updatedMatches: simulated
    } = simulateMatches(roundMatches);
    let allMatches = [...otherMatches, ...simulated];
    allMatches = advanceKnockoutWinners(allMatches);
    const totalRounds = Math.log2(tournament.size / 2);
    if (firstPendingRound >= totalRounds - 1) {
      const finalMatch = simulated.find((m) => m.round === firstPendingRound);
      if (finalMatch && finalMatch.winner) {
        const standings2 = computeStandings(tournament.standings, allMatches);
        return {
          ...tournament,
          matches: allMatches,
          phase: "finished",
          champion: finalMatch.winner,
          standings: standings2
        };
      }
    }
    const standings = computeStandings(tournament.standings, allMatches);
    return {
      ...tournament,
      matches: allMatches,
      standings
    };
  }
  return tournament;
}
const GroupCard = ({
  groupName,
  players,
  matches,
  sortedStandings
}) => {
  const groupStandings = sortedStandings.filter((s) => players.includes(s.player)).slice(0, 2);
  const advancerSet = new Set(groupStandings.map((s) => s.player));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4", style: {
    borderColor: "rgba(0, 255, 255, 0.25)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber text-lg text-neon-cyan tracking-wider", children: [
        groupName,
        " 組"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber", children: [
        players.length,
        " 隊"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 mb-3", children: players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-2 py-1 text-sm", style: {
      color: advancerSet.has(p) ? "var(--green)" : "var(--text-primary)",
      background: advancerSet.has(p) ? "rgba(0, 255, 128, 0.08)" : "transparent",
      borderRadius: "2px"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-cyber tracking-wider", children: p }),
      advancerSet.has(p) && /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 14, style: {
        color: "var(--green)"
      } })
    ] }, p)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 pt-2 border-t border-[rgba(0_255_255_0.1)]", children: matches.map((m) => {
      const w1 = m.winner === m.player1;
      const w2 = m.winner === m.player2;
      const done = m.status === "finished";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs px-2 py-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-cyber flex-1", style: {
          color: w1 ? "var(--green)" : done ? "rgba(255,255,255,0.4)" : "var(--text-secondary)"
        }, children: m.player1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 font-cyber", style: {
          color: done ? "var(--cyan)" : "var(--text-secondary)"
        }, children: done ? "VS" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-cyber flex-1 text-right", style: {
          color: w2 ? "var(--green)" : done ? "rgba(255,255,255,0.4)" : "var(--text-secondary)"
        }, children: m.player2 })
      ] }, m.id);
    }) })
  ] });
};
const ROUND_LABELS_ASC = ["三十二強", "十六強", "八強", "四強", "準決賽", "決賽"];
function getRoundLabel(idx, total) {
  const labelCount = ROUND_LABELS_ASC.length;
  const fromRight = total - 1 - idx;
  if (fromRight < labelCount) {
    return ROUND_LABELS_ASC[labelCount - 1 - fromRight] || `第${idx + 1}輪`;
  }
  return `第${idx + 1}輪`;
}
const KnockoutBracket = ({
  rounds
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-4 overflow-x-auto", style: {
    borderColor: "rgba(255, 107, 157, 0.25)"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 min-w-max", children: rounds.map((round, roundIdx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-around gap-3 min-w-[160px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-center text-[var(--text-secondary)] font-cyber tracking-wider mb-1", children: getRoundLabel(roundIdx, rounds.length) }),
    round.map((m) => {
      const done = m.status === "finished";
      const w1 = m.winner === m.player1;
      const w2 = m.winner === m.player2;
      const hasPlayers = m.player1 && m.player2;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "cyber-card p-2 text-xs relative", style: {
        borderColor: done ? "rgba(0, 255, 128, 0.4)" : hasPlayers ? "rgba(255, 107, 157, 0.3)" : "rgba(255, 255, 255, 0.1)",
        boxShadow: done ? "0 0 8px rgba(0, 255, 128, 0.2)" : "none",
        minHeight: "60px"
      }, children: hasPlayers ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-1 py-0.5 font-cyber", style: {
          color: w1 ? "var(--green)" : done ? "rgba(255,255,255,0.4)" : "var(--text-primary)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[70px]", children: m.player1 }),
          w1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 12, style: {
            color: "var(--green)"
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-[rgba(255_255_255_0.1)] my-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-1 py-0.5 font-cyber", style: {
          color: w2 ? "var(--green)" : done ? "rgba(255,255,255,0.4)" : "var(--text-primary)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[70px]", children: m.player2 }),
          w2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 12, style: {
            color: "var(--green)"
          } })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-[52px] text-[var(--text-secondary)] font-cyber", children: "— 待定 —" }) }, m.id);
    })
  ] }, roundIdx)) }) });
};
const StandingsTable = ({
  standings,
  champion,
  phase
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card overflow-hidden", style: {
    borderColor: "rgba(0, 255, 255, 0.25)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-[rgba(0_255_255_0.1)] flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-neon-cyan tracking-wider", children: "積分榜" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber", children: [
        "共 ",
        standings.length,
        " 人"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 px-4 py-2 text-xs font-cyber tracking-wider text-[var(--text-secondary)] border-b border-[rgba(0_255_255_0.1)]", style: {
      background: "rgba(0, 255, 255, 0.03)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1", children: "排名" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-5", children: "玩家" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-center", children: "勝場" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-center", children: "敗場" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-center", children: "積分" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: standings.map((s, idx) => {
      const rank = idx + 1;
      const isChamp = champion === s.player;
      const top2 = phase === "group" && rank <= 2;
      const highlight = isChamp || top2;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid grid-cols-12 px-4 py-2.5 text-sm items-center transition-all hover:bg-[rgba(0_255_255_0.05)] ${idx % 2 === 1 ? "bg-[rgba(255_255_255_0.02)]" : ""}`, style: {
        background: isChamp ? "linear-gradient(90deg, rgba(250,204,21,0.15), transparent)" : void 0,
        boxShadow: highlight ? "inset 3px 0 0 var(--green)" : void 0
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 font-cyber font-bold", style: {
          color: isChamp ? "#facc15" : top2 ? "var(--green)" : "var(--cyan)"
        }, children: isChamp ? /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 16, style: {
          color: "#facc15",
          filter: "drop-shadow(0 0 4px #facc15)"
        } }) : rank }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-5 flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate font-cyber tracking-wider", style: {
            color: isChamp ? "#facc15" : top2 ? "var(--green)" : "var(--text-primary)",
            textShadow: isChamp ? "0 0 8px rgba(250,204,21,0.5)" : "none"
          }, children: s.player }),
          isChamp && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 font-cyber rounded-sm", style: {
            color: "#facc15",
            border: "1px solid #facc15",
            background: "rgba(250,204,21,0.1)"
          }, children: "冠軍" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-center font-cyber", style: {
          color: "var(--green)"
        }, children: s.wins }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-center font-cyber", style: {
          color: "var(--red)",
          opacity: 0.7
        }, children: s.losses }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-center font-cyber font-bold", style: {
          color: isChamp ? "#facc15" : "var(--cyan)"
        }, children: s.points })
      ] }, s.player);
    }) })
  ] });
};
const STORAGE_KEY$1 = "monopoly_official_registrations";
const STATUS_LABELS$1 = {
  registering: "報名中",
  closed: "已截止",
  ongoing: "進行了"
};
const STATUS_COLORS$1 = {
  registering: "var(--green)",
  closed: "var(--text-secondary)",
  ongoing: "var(--cyan)"
};
const MOCK_TOURNAMENTS = [{
  id: "off_001",
  name: "霓虹杯·週年慶典賽",
  time: "2026-09-25 20:00",
  maxPlayers: 512,
  currentPlayers: 387,
  status: "registering",
  skinName: "霓虹魅影",
  skinColor: "hsl(320, 100%, 60%)",
  titleName: "霓虹霸主",
  description: "賽博大富翁一週年慶典官方賽事，百位頂尖玩家同場競技，爭奪限定傳說皮膚與永恆稱號。"
}, {
  id: "off_002",
  name: "數據塔挑戰賽",
  time: "2026-09-22 19:30",
  maxPlayers: 256,
  currentPlayers: 256,
  status: "closed",
  skinName: "數據行者",
  skinColor: "hsl(180, 100%, 50%)",
  titleName: "數據先鋒",
  description: "數據塔主題賽事，考驗玩家的投資眼光與風險控制能力，前三名獲得限定皮膚。"
}, {
  id: "off_003",
  name: "地獄瘋狂賽",
  time: "2026-09-30 21:00",
  maxPlayers: 128,
  currentPlayers: 96,
  status: "registering",
  skinName: "地獄領主",
  skinColor: "hsl(0, 100%, 60%)",
  titleName: "瘋狂之王",
  description: "瘋狂模式專屬賽事，20000 起始資金、50% 過路費、雙倍命運卡獎勵，只有最瘋狂的玩家才能勝出。"
}, {
  id: "off_004",
  name: "新人爭霸戰",
  time: "2026-09-20 20:00",
  maxPlayers: 1024,
  currentPlayers: 1024,
  status: "ongoing",
  skinName: "星銳先鋒",
  skinColor: "hsl(140, 100%, 50%)",
  titleName: "明日之星",
  description: "專為註冊30天內玩家打造的新人賽事，零門檻參與，冠軍直接獲得晉級年度總決賽資格。"
}, {
  id: "off_005",
  name: "雙人搭檔賽",
  time: "2026-10-05 20:00",
  maxPlayers: 64,
  currentPlayers: 42,
  status: "registering",
  skinName: "雙影刺客",
  skinColor: "hsl(270, 80%, 60%)",
  titleName: "黃金搭檔",
  description: "雙人組隊模式，與你的戰友並肩作戰，考驗默契與策略，共同爭奪限定雙人皮膚。"
}, {
  id: "off_006",
  name: "年度總決賽·資格賽",
  time: "2026-11-11 18:00",
  maxPlayers: 2048,
  currentPlayers: 1580,
  status: "registering",
  skinName: "永恆王者",
  skinColor: "hsl(50, 100%, 60%)",
  titleName: "傳奇選手",
  description: "年度最高規格賽事的資格選拔，晉級者將進入年度總決賽，爭奪高額獎金與終身榮譽。"
}];
const OfficialTournaments = () => {
  const [registered, setRegistered] = reactExports.useState([]);
  const [expandedId, setExpandedId] = reactExports.useState(null);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY$1);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRegistered(parsed);
        }
      }
    } catch {
    }
  }, []);
  const handleRegister = (id) => {
    setRegistered((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY$1, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  };
  const toggleExpand = (id) => {
    setExpandedId((prev) => prev === id ? null : id);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card px-4 py-3 flex items-center justify-between", style: {
      borderColor: "var(--purple)",
      boxShadow: "0 0 12px rgba(167, 139, 250, 0.25)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 20, style: {
          color: "var(--purple)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-lg tracking-wider", style: {
          color: "var(--purple)"
        }, children: "官方線上錦標賽" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: [
        "共 ",
        MOCK_TOURNAMENTS.length,
        " 場賽事"
      ] })
    ] }),
    MOCK_TOURNAMENTS.map((t) => {
      const isRegistered = registered.includes(t.id);
      const isExpanded = expandedId === t.id;
      const isDisabled = t.status === "closed" || t.status === "ongoing";
      const progress = Math.round(t.currentPlayers / t.maxPlayers * 100);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card overflow-hidden", style: {
        borderColor: t.status === "registering" ? "rgba(0, 255, 128, 0.25)" : t.status === "ongoing" ? "rgba(0, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)",
        boxShadow: t.status === "registering" ? "0 0 12px rgba(0, 255, 128, 0.15)" : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 md:p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-base md:text-lg tracking-wider truncate", style: {
                  color: t.status === "registering" ? "var(--green)" : t.status === "ongoing" ? "var(--cyan)" : "var(--text-primary)",
                  textShadow: t.status === "registering" ? "0 0 8px rgba(0, 255, 128, 0.5)" : "none"
                }, children: t.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-cyber tracking-wider px-2 py-0.5 border rounded", style: {
                  borderColor: STATUS_COLORS$1[t.status],
                  color: STATUS_COLORS$1[t.status],
                  background: `${STATUS_COLORS$1[t.status]}15`
                }, children: STATUS_LABELS$1[t.status] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-[var(--text-secondary)] font-cyber tracking-wider flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 12 }),
                  t.time
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 12 }),
                  t.currentPlayers,
                  " / ",
                  t.maxPlayers,
                  " 人"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 28, className: "flex-shrink-0", style: {
              color: t.status === "registering" ? "var(--green)" : t.status === "ongoing" ? "var(--cyan)" : "var(--text-secondary)",
              opacity: t.status === "closed" ? 0.4 : 0.8
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 rounded-full overflow-hidden", style: {
            background: "rgba(255,255,255,0.08)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
            width: `${progress}%`,
            background: t.status === "registering" ? "linear-gradient(90deg, var(--green), var(--cyan))" : t.status === "ongoing" ? "linear-gradient(90deg, var(--cyan), var(--purple))" : "var(--text-secondary)",
            boxShadow: t.status !== "closed" ? `0 0 8px ${t.status === "registering" ? "var(--green)" : "var(--cyan)"}` : "none"
          } }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-2 py-1 rounded border", style: {
              borderColor: `${t.skinColor}55`,
              background: `${t.skinColor}10`
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded", style: {
                background: t.skinColor,
                boxShadow: `0 0 6px ${t.skinColor}`
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", style: {
                color: t.skinColor
              }, children: t.skinName })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded border", style: {
              borderColor: "rgba(250, 204, 21, 0.4)",
              background: "rgba(250, 204, 21, 0.08)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 12, style: {
                color: "#facc15"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", style: {
                color: "#facc15"
              }, children: t.titleName })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: isDisabled, onClick: () => handleRegister(t.id), className: "cyber-btn flex-1 py-2.5 text-sm font-cyber tracking-wider flex items-center justify-center gap-2 transition-all", style: {
              borderColor: isDisabled ? "rgba(255, 255, 255, 0.1)" : isRegistered ? "var(--cyan)" : "var(--pink)",
              color: isDisabled ? "var(--text-secondary)" : isRegistered ? "var(--cyan)" : "var(--pink)",
              background: isDisabled ? "rgba(255, 255, 255, 0.03)" : isRegistered ? "rgba(0, 255, 255, 0.08)" : "rgba(255, 107, 157, 0.08)",
              boxShadow: isDisabled ? "none" : isRegistered ? "0 0 10px rgba(0, 255, 255, 0.3)" : "0 0 10px rgba(255, 107, 157, 0.3)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.5 : 1
            }, children: isDisabled ? t.status === "closed" ? "報名已截止" : "賽事進行中" : isRegistered ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
              "已報名"
            ] }) : "立即報名" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => toggleExpand(t.id), className: "cyber-btn px-3 py-2.5 flex items-center justify-center", style: {
              borderColor: "rgba(167, 139, 250, 0.4)",
              color: "var(--purple)"
            }, "aria-label": isExpanded ? "收起" : "展開獎勵詳情", children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { size: 16 }) })
          ] })
        ] }),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-5 md:px-5 md:pb-5 pt-0 border-t", style: {
          borderColor: "rgba(167, 139, 250, 0.15)",
          background: "linear-gradient(180deg, transparent, rgba(167, 139, 250, 0.04))"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-[var(--text-secondary)] mb-4 mt-4 leading-relaxed", children: t.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "font-cyber text-sm tracking-wider mb-3", style: {
            color: "var(--purple)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 14, className: "inline mr-1" }),
            "獎勵預覽"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 flex flex-col items-center text-center", style: {
              borderColor: `${t.skinColor}40`,
              background: `${t.skinColor}08`
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-20 h-20 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden", style: {
                background: `linear-gradient(135deg, ${t.skinColor}33, ${t.skinColor}11)`,
                border: `1px solid ${t.skinColor}66`,
                boxShadow: `0 0 15px ${t.skinColor}40, inset 0 0 15px ${t.skinColor}22`
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-12 rounded-t-full", style: {
                  background: `linear-gradient(180deg, ${t.skinColor}, ${t.skinColor}88)`,
                  boxShadow: `0 0 10px ${t.skinColor}`
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0", style: {
                  background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)"
                } })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider", style: {
                color: t.skinColor,
                textShadow: `0 0 6px ${t.skinColor}88`
              }, children: t.skinName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] mt-1", children: "限定皮膚" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 flex flex-col items-center text-center justify-center", style: {
              borderColor: "rgba(250, 204, 21, 0.3)",
              background: "rgba(250, 204, 21, 0.05)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-widest mb-2 px-4 py-2 border rounded", style: {
                color: "#facc15",
                borderColor: "#facc15",
                background: "linear-gradient(180deg, rgba(250, 204, 21, 0.15), rgba(250, 204, 21, 0.03))",
                textShadow: "0 0 10px #facc15, 0 0 20px rgba(250, 204, 21, 0.5)",
                boxShadow: "0 0 15px rgba(250, 204, 21, 0.3), inset 0 0 10px rgba(250, 204, 21, 0.1)"
              }, children: t.titleName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)]", children: "專屬稱號" })
            ] })
          ] })
        ] })
      ] }, t.id);
    })
  ] });
};
const ROUND_LABELS = {
  8: ["八強", "四強", "決賽"],
  16: ["十六強", "八強", "四強", "決賽"],
  32: ["三十二強", "十六強", "八強", "四強", "決賽"]
};
function getRoundLabels(format, totalRounds) {
  const labels = ROUND_LABELS[format];
  if (labels && labels.length === totalRounds) return labels;
  const full = ROUND_LABELS[32];
  return full.slice(full.length - totalRounds);
}
const TournamentBracket = ({
  rounds,
  format
}) => {
  const labels = getRoundLabels(format, rounds.length);
  const totalRounds = rounds.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-6 overflow-x-auto", style: {
    borderColor: "rgba(255, 107, 157, 0.3)",
    boxShadow: "0 0 16px rgba(255, 107, 157, 0.15)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 20, style: {
        color: "var(--pink)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg text-neon-pink tracking-wider", children: "賽程樹狀圖" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber ml-auto", children: [
        format,
        " 人單敗淘汰制"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 md:gap-6 min-w-max pb-2", children: [
      rounds.map((round, roundIdx) => {
        const isFinal = roundIdx === totalRounds - 1;
        const matchCount = round.length;
        const gapClass = matchCount >= 8 ? "gap-2" : matchCount >= 4 ? "gap-6" : matchCount >= 2 ? "gap-14" : "gap-0";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col justify-around ${gapClass} min-w-[180px] md:min-w-[200px]`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-center font-cyber tracking-widest mb-2", style: {
            color: isFinal ? "#facc15" : "var(--cyan)",
            textShadow: isFinal ? "0 0 8px rgba(250, 204, 21, 0.6)" : "0 0 6px rgba(0, 255, 255, 0.4)"
          }, children: labels[roundIdx] }),
          round.map((m) => {
            const hasWinner = m.player1.won || m.player2.won;
            const isLive = m.isLive;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-2 text-xs relative overflow-hidden", style: {
              borderColor: isLive ? "var(--pink)" : hasWinner ? "rgba(0, 255, 128, 0.4)" : "rgba(0, 255, 255, 0.2)",
              boxShadow: isLive ? "0 0 12px rgba(255, 107, 157, 0.5), inset 0 0 8px rgba(255, 107, 157, 0.15)" : hasWinner ? "0 0 8px rgba(0, 255, 128, 0.2)" : "none",
              animation: isLive ? "pulse-glow 1.5s ease-in-out infinite" : "none",
              minHeight: "72px",
              background: isLive ? "linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(0, 255, 255, 0.04))" : void 0
            }, children: [
              isLive && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-full h-px", style: {
                background: "linear-gradient(90deg, transparent, var(--pink), transparent)",
                animation: "sweep-h 2s linear infinite"
              } }),
              isFinal && hasWinner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-cyber flex items-center gap-1", style: {
                background: "rgba(250, 204, 21, 0.15)",
                border: "1px solid #facc15",
                color: "#facc15",
                boxShadow: "0 0 8px rgba(250, 204, 21, 0.5)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 10 }),
                "冠軍"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-2 py-1.5 font-cyber tracking-wider rounded-sm", style: {
                color: m.player1.won ? "var(--green)" : hasWinner ? "rgba(255,255,255,0.35)" : "var(--text-primary)",
                background: m.player1.won ? "rgba(0, 255, 128, 0.1)" : "transparent",
                boxShadow: m.player1.won ? "inset 2px 0 0 var(--green)" : "none"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[100px]", children: m.player1.name }),
                m.player1.won && /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, style: {
                  color: "var(--green)"
                }, fill: "currentColor" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-px my-1 bg-[rgba(255_255_255_0.08)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-1/2 -translate-x-1/2 -top-2 px-1.5 text-[10px] font-cyber tracking-widest", style: {
                color: isLive ? "var(--pink)" : "var(--text-secondary)",
                background: "var(--bg-dark)"
              }, children: isLive ? "LIVE" : "VS" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-2 py-1.5 font-cyber tracking-wider rounded-sm", style: {
                color: m.player2.won ? "var(--green)" : hasWinner ? "rgba(255,255,255,0.35)" : "var(--text-primary)",
                background: m.player2.won ? "rgba(0, 255, 128, 0.1)" : "transparent",
                boxShadow: m.player2.won ? "inset 2px 0 0 var(--green)" : "none"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[100px]", children: m.player2.name }),
                m.player2.won && /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 12, style: {
                  color: "var(--green)"
                }, fill: "currentColor" })
              ] })
            ] }, `r${roundIdx}-m${m.matchNumber}`);
          })
        ] }, roundIdx);
      }),
      rounds.length > 0 && rounds[totalRounds - 1]?.length === 1 && rounds[totalRounds - 1][0]?.winner && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center items-center min-w-[140px] pl-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-center font-cyber tracking-widest mb-2", style: {
          color: "#facc15",
          textShadow: "0 0 10px rgba(250, 204, 21, 0.8)"
        }, children: "頒獎台" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 flex flex-col items-center justify-center relative overflow-hidden", style: {
          borderColor: "#facc15",
          boxShadow: "0 0 20px rgba(250, 204, 21, 0.5), inset 0 0 12px rgba(250, 204, 21, 0.15)",
          background: "linear-gradient(180deg, rgba(250, 204, 21, 0.12), rgba(250, 204, 21, 0.02))",
          minWidth: "120px",
          minHeight: "180px",
          animation: "pulse-glow 3s ease-in-out infinite"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 36, style: {
            color: "#facc15",
            filter: "drop-shadow(0 0 8px #facc15)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm font-cyber tracking-wider text-center", style: {
            color: "#facc15",
            textShadow: "0 0 8px rgba(250, 204, 21, 0.6)"
          }, children: rounds[totalRounds - 1][0].winner }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-secondary)] font-cyber mt-1 tracking-wider", children: "錦標之王" })
        ] })
      ] })
    ] })
  ] });
};
const RARITY_COLORS = {
  common: "var(--text-secondary)",
  rare: "var(--blue)",
  epic: "var(--purple)",
  legendary: "#facc15"
};
const REWARD_DATA = {
  8: [{
    position: "冠軍",
    currency: 5e3,
    reward: "稀有道具·霓虹晶片",
    rarity: "rare"
  }, {
    position: "亞軍",
    currency: 3e3,
    reward: "參加獎·強化模組",
    rarity: "common"
  }, {
    position: "四強",
    currency: 1500,
    reward: "參加獎·修復套件",
    rarity: "common"
  }],
  16: [{
    position: "冠軍",
    currency: 2e4,
    reward: "史詩收藏品·數據核心",
    rarity: "epic"
  }, {
    position: "亞軍",
    currency: 1e4,
    reward: "稀有道具·霓虹晶片",
    rarity: "rare"
  }, {
    position: "四強",
    currency: 5e3,
    reward: "強化模組 x2",
    rarity: "rare"
  }, {
    position: "八強",
    currency: 2e3,
    reward: "參加獎·修復套件",
    rarity: "common"
  }],
  32: [{
    position: "冠軍",
    currency: 1e5,
    reward: "傳級收藏品·永恆之核 + 傳級稱號「錦標之王」",
    rarity: "legendary"
  }, {
    position: "亞軍",
    currency: 5e4,
    reward: "史詩收藏品·量子引擎",
    rarity: "epic"
  }, {
    position: "季軍",
    currency: 3e4,
    reward: "史詩道具·時空裂隙",
    rarity: "epic"
  }, {
    position: "四強",
    currency: 15e3,
    reward: "稀有套裝·霓虹行者",
    rarity: "rare"
  }, {
    position: "八強",
    currency: 8e3,
    reward: "強化模組 x5",
    rarity: "rare"
  }, {
    position: "十六強",
    currency: 3e3,
    reward: "參加獎·修復套件",
    rarity: "common"
  }]
};
const POSITION_ICONS = {
  冠軍: Crown,
  亞軍: Trophy,
  季軍: Medal,
  四強: Star,
  八強: Award,
  十六強: Gem
};
const TournamentRewards = ({
  format
}) => {
  const rewards = reactExports.useMemo(() => REWARD_DATA[format] ?? [], [format]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-5", style: {
    borderColor: "rgba(0, 255, 255, 0.3)",
    boxShadow: "0 0 12px rgba(0, 255, 255, 0.15)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 20, style: {
        color: "var(--cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg text-neon-cyan tracking-wider", children: "獎勵預覽" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber ml-auto", children: [
        format,
        " 人賽制"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: rewards.map((r, idx) => {
      const color = r.rarity ? RARITY_COLORS[r.rarity] : "var(--text-secondary)";
      const Icon = POSITION_ICONS[r.position] ?? Star;
      const isTop = idx === 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-sm relative overflow-hidden", style: {
        border: `1px solid ${isTop ? color : "rgba(255, 255, 255, 0.08)"}`,
        background: isTop ? `linear-gradient(90deg, ${color}15, transparent)` : "rgba(255, 255, 255, 0.02)",
        boxShadow: isTop ? `0 0 12px ${color}33` : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-sm", style: {
          border: `1px solid ${color}`,
          color,
          background: `${color}15`,
          boxShadow: `0 0 8px ${color}44`
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider text-sm", style: {
              color
            }, children: r.position }),
            r.rarity && r.rarity !== "common" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-1.5 py-0.5 rounded-sm font-cyber tracking-wider", style: {
              border: `1px solid ${color}`,
              color,
              background: `${color}15`
            }, children: r.rarity === "legendary" ? "傳級" : r.rarity === "epic" ? "史詩" : "稀有" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs truncate", style: {
            color: "var(--text-secondary)"
          }, children: r.reward })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber font-bold tracking-wider", style: {
            color: isTop ? color : "var(--cyan)",
            textShadow: isTop ? `0 0 6px ${color}` : "none"
          }, children: r.currency.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider", children: "幣" })
        ] })
      ] }, r.position);
    }) })
  ] });
};
const RANK_COLORS = {
  1: "#facc15",
  2: "var(--cyan)",
  3: "var(--pink)"
};
function getRankColor(rank) {
  return RANK_COLORS[rank] ?? "var(--text-secondary)";
}
function getRankLabel(rank) {
  if (rank === 1) return "冠軍";
  if (rank === 2) return "亞軍";
  if (rank === 3) return "季軍";
  return `第 ${rank} 名`;
}
const TournamentHistoryPanel = ({
  history
}) => {
  const bestRank = reactExports.useMemo(() => {
    if (history.length === 0) return null;
    return history.reduce((best, h) => !best || h.myRank < best.myRank ? h : best, null);
  }, [history]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-5", style: {
    borderColor: "rgba(167, 139, 250, 0.3)",
    boxShadow: "0 0 12px rgba(167, 139, 250, 0.15)"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { size: 20, style: {
        color: "var(--purple)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg tracking-wider", style: {
        color: "var(--purple)"
      }, children: "歷史記錄" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber ml-auto", children: [
        "共 ",
        history.length,
        " 場"
      ] })
    ] }),
    bestRank && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-4 rounded-sm relative overflow-hidden", style: {
      border: "1px solid #facc15",
      background: "linear-gradient(135deg, rgba(250, 204, 21, 0.12), rgba(250, 204, 21, 0.02))",
      boxShadow: "0 0 16px rgba(250, 204, 21, 0.25)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 16, style: {
          color: "#facc15",
          filter: "drop-shadow(0 0 4px #facc15)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-sm tracking-widest", style: {
          color: "#facc15",
          textShadow: "0 0 6px rgba(250,204,21,0.5)"
        }, children: "我的最好成績" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-2xl tracking-wider", style: {
            color: "#facc15",
            textShadow: "0 0 10px rgba(250,204,21,0.6)"
          }, children: getRankLabel(bestRank.myRank) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] font-cyber mt-0.5", children: [
            bestRank.format,
            " 人賽 · ",
            bestRank.date
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-cyber tracking-wider", style: {
            color: "#facc15"
          }, children: bestRank.rewards }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-secondary)] font-cyber mt-0.5", children: "獲得獎勵" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 px-3 py-2 text-xs font-cyber tracking-wider text-[var(--text-secondary)] border-b", style: {
      borderColor: "rgba(167, 139, 250, 0.15)",
      background: "rgba(167, 139, 250, 0.04)"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12 }),
        " 日期"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 12 }),
        " 賽制"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Medal, { size: 12 }),
        " 名次"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-4 text-right", children: "獎勵" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", style: {
      borderColor: "rgba(255,255,255,0.04)"
    }, children: history.map((h, idx) => {
      const rankColor = getRankColor(h.myRank);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid grid-cols-12 px-3 py-3 text-xs items-center transition-all hover:bg-[rgba(167_139_250_0.05)] ${idx % 2 === 1 ? "bg-[rgba(255_255_255_0.015)]" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3 font-cyber", style: {
          color: "var(--text-primary)"
        }, children: h.date }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 font-cyber tracking-wider", style: {
          color: "var(--cyan)"
        }, children: [
          h.format,
          " 人"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-3 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 12, style: {
            color: rankColor,
            opacity: 0.6
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber font-bold tracking-wider", style: {
            color: rankColor,
            textShadow: h.myRank <= 3 ? `0 0 6px ${rankColor}` : "none"
          }, children: getRankLabel(h.myRank) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-4 text-right truncate font-cyber", style: {
          color: "var(--text-secondary)"
        }, children: h.rewards })
      ] }, h.id);
    }) }),
    history.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-8 text-center text-[var(--text-secondary)] text-sm font-cyber", children: "尚無歷史記錄" })
  ] });
};
const STATUS_LABELS = {
  registration: "報名中",
  "in-progress": "進行中",
  completed: "已結束"
};
const STATUS_COLORS = {
  registration: "var(--green)",
  "in-progress": "var(--pink)",
  completed: "var(--text-secondary)"
};
const LiveTournamentCard = ({
  tournament,
  onJoin
}) => {
  const statusColor = STATUS_COLORS[tournament.status];
  tournament.format > 0 ? (tournament.format - tournament.remainingPlayers + tournament.remainingPlayers) / tournament.format * 100 : 0;
  const survivalPercent = tournament.format > 0 ? Math.round(tournament.remainingPlayers / tournament.format * 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-4 md:p-6 relative overflow-hidden", style: {
    borderColor: "rgba(255, 107, 157, 0.35)",
    boxShadow: "0 0 20px rgba(255, 107, 157, 0.2)",
    background: "linear-gradient(135deg, rgba(255, 107, 157, 0.08), rgba(0, 255, 255, 0.04))"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 left-0 w-20 h-20 opacity-20", style: {
      background: "radial-gradient(circle at top left, var(--pink), transparent 70%)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 right-0 w-20 h-20 opacity-20", style: {
      background: "radial-gradient(circle at bottom right, var(--cyan), transparent 70%)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 flex items-center justify-center rounded-sm", style: {
            border: "1px solid var(--pink)",
            color: "var(--pink)",
            background: "rgba(255, 107, 157, 0.1)",
            boxShadow: "0 0 12px rgba(255, 107, 157, 0.3)"
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 24 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg md:text-xl tracking-wider", style: {
                color: "var(--pink)",
                textShadow: "0 0 8px rgba(255, 107, 157, 0.5)"
              }, children: "霓虹挑戰賽" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-sm font-cyber tracking-wider", style: {
                border: `1px solid ${statusColor}`,
                color: statusColor,
                background: `${statusColor}15`,
                animation: tournament.status === "in-progress" ? "pulse-glow 2s ease-in-out infinite" : "none"
              }, children: STATUS_LABELS[tournament.status] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: [
              tournament.format,
              " 人單敗淘汰制"
            ] })
          ] })
        ] }),
        tournament.myPosition !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex-shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5", children: "我的位置" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-2xl font-bold tracking-wider", style: {
            color: "var(--cyan)",
            textShadow: "0 0 8px rgba(0, 255, 255, 0.5)"
          }, children: [
            "#",
            tournament.myPosition
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-sm text-center", style: {
          border: "1px solid rgba(0, 255, 255, 0.2)",
          background: "rgba(0, 255, 255, 0.04)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 16, className: "mx-auto mb-1", style: {
            color: "var(--cyan)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-wider", style: {
            color: "var(--cyan)"
          }, children: tournament.remainingPlayers }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider", children: "剩餘選手" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-sm text-center", style: {
          border: "1px solid rgba(255, 107, 157, 0.2)",
          background: "rgba(255, 107, 157, 0.04)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 16, className: "mx-auto mb-1", style: {
            color: "var(--pink)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-lg tracking-wider", style: {
            color: "var(--pink)"
          }, children: [
            "第 ",
            tournament.currentRound,
            " 輪"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider", children: "當前輪次" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-sm text-center", style: {
          border: "1px solid rgba(167, 139, 250, 0.2)",
          background: "rgba(167, 139, 250, 0.04)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 16, className: "mx-auto mb-1", style: {
            color: "var(--purple)"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-lg tracking-wider", style: {
            color: "var(--purple)"
          }, children: tournament.nextRoundAt }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-[var(--text-secondary)] font-cyber tracking-wider", children: "下一輪" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", style: {
            color: "var(--text-secondary)"
          }, children: "淘汰進度" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-cyber", style: {
            color: "var(--pink)"
          }, children: [
            survivalPercent,
            "% 存活"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full overflow-hidden", style: {
          background: "rgba(255, 255, 255, 0.08)"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full transition-all", style: {
          width: `${survivalPercent}%`,
          background: "linear-gradient(90deg, var(--cyan), var(--pink))",
          boxShadow: "0 0 8px rgba(255, 107, 157, 0.6)"
        } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onJoin, className: "cyber-btn w-full py-3.5 font-cyber text-base tracking-widest flex items-center justify-center gap-2 group", style: {
        borderColor: "var(--pink)",
        color: "var(--pink)",
        background: "linear-gradient(135deg, rgba(255, 107, 157, 0.1), rgba(255, 107, 157, 0.05))",
        boxShadow: "0 0 12px rgba(255, 107, 157, 0.3)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 16 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tournament.status === "registration" ? "立即報名" : "參加下一場" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16, className: "transition-transform group-hover:translate-x-1" })
      ] })
    ] })
  ] });
};
const STORAGE_KEY = "cyber_monopoly_tournament";
const TABS = [{
  key: "create",
  label: "創建錦標賽",
  icon: Users
}, {
  key: "schedule",
  label: "賽程",
  icon: Swords
}, {
  key: "standings",
  label: "積分榜",
  icon: Trophy
}, {
  key: "official",
  label: "官方賽事",
  icon: Crown
}];
const PHASE_LABELS = {
  group: "分組循環賽",
  knockout: "淘汰賽",
  final: "決賽",
  finished: "已結束"
};
const FORMAT_OPTIONS = [{
  size: 8,
  label: "8 人賽",
  desc: "快速對決"
}, {
  size: 16,
  label: "16 人賽",
  desc: "標準賽制"
}, {
  size: 32,
  label: "32 人賽",
  desc: "頂級爭霸"
}];
function buildMockLiveBracket() {
  const playerNames = ["霓虹行者", "暗影獵手", "數據暴君", "量子先鋒", "地獄領主", "星塵騎士", "電馭叛客", "夜之精靈", "鋼鐵之心", "極速之影", "深藍薩滿", "紫晶巫師", "赤焰戰神", "銀河護衛", "網路忍者", "終端守望者"];
  const round1 = [{
    round: 0,
    matchNumber: 1,
    player1: {
      name: playerNames[0],
      avatar: "",
      won: true
    },
    player2: {
      name: playerNames[1],
      avatar: "",
      won: false
    },
    winner: playerNames[0],
    isLive: false
  }, {
    round: 0,
    matchNumber: 2,
    player1: {
      name: playerNames[2],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[3],
      avatar: "",
      won: true
    },
    winner: playerNames[3],
    isLive: false
  }, {
    round: 0,
    matchNumber: 3,
    player1: {
      name: playerNames[4],
      avatar: "",
      won: true
    },
    player2: {
      name: playerNames[5],
      avatar: "",
      won: false
    },
    winner: playerNames[4],
    isLive: false
  }, {
    round: 0,
    matchNumber: 4,
    player1: {
      name: playerNames[6],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[7],
      avatar: "",
      won: true
    },
    winner: playerNames[7],
    isLive: false
  }, {
    round: 0,
    matchNumber: 5,
    player1: {
      name: playerNames[8],
      avatar: "",
      won: true
    },
    player2: {
      name: playerNames[9],
      avatar: "",
      won: false
    },
    winner: playerNames[8],
    isLive: false
  }, {
    round: 0,
    matchNumber: 6,
    player1: {
      name: playerNames[10],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[11],
      avatar: "",
      won: true
    },
    winner: playerNames[11],
    isLive: false
  }, {
    round: 0,
    matchNumber: 7,
    player1: {
      name: playerNames[12],
      avatar: "",
      won: true
    },
    player2: {
      name: playerNames[13],
      avatar: "",
      won: false
    },
    winner: playerNames[12],
    isLive: false
  }, {
    round: 0,
    matchNumber: 8,
    player1: {
      name: playerNames[14],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[15],
      avatar: "",
      won: true
    },
    winner: playerNames[15],
    isLive: false
  }];
  const round2 = [{
    round: 1,
    matchNumber: 1,
    player1: {
      name: playerNames[0],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[3],
      avatar: "",
      won: false
    },
    isLive: true
  }, {
    round: 1,
    matchNumber: 2,
    player1: {
      name: playerNames[4],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[7],
      avatar: "",
      won: false
    },
    isLive: true
  }, {
    round: 1,
    matchNumber: 3,
    player1: {
      name: playerNames[8],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[11],
      avatar: "",
      won: false
    },
    isLive: true
  }, {
    round: 1,
    matchNumber: 4,
    player1: {
      name: playerNames[12],
      avatar: "",
      won: false
    },
    player2: {
      name: playerNames[15],
      avatar: "",
      won: false
    },
    isLive: true
  }];
  const round3 = [{
    round: 2,
    matchNumber: 1,
    player1: {
      name: "— 待定 —",
      avatar: "",
      won: false
    },
    player2: {
      name: "— 待定 —",
      avatar: "",
      won: false
    },
    isLive: false
  }, {
    round: 2,
    matchNumber: 2,
    player1: {
      name: "— 待定 —",
      avatar: "",
      won: false
    },
    player2: {
      name: "— 待定 —",
      avatar: "",
      won: false
    },
    isLive: false
  }];
  const round4 = [{
    round: 3,
    matchNumber: 1,
    player1: {
      name: "— 待定 —",
      avatar: "",
      won: false
    },
    player2: {
      name: "— 待定 —",
      avatar: "",
      won: false
    },
    isLive: false
  }];
  return [round1, round2, round3, round4];
}
const MOCK_HISTORY = [{
  id: "h1",
  date: "2026-09-28",
  format: 16,
  myRank: 1,
  rewards: "20000 幣 + 數據核心"
}, {
  id: "h2",
  date: "2026-09-25",
  format: 32,
  myRank: 3,
  rewards: "30000 幣 + 時空裂隙"
}, {
  id: "h3",
  date: "2026-09-20",
  format: 8,
  myRank: 2,
  rewards: "3000 幣 + 強化模組"
}, {
  id: "h4",
  date: "2026-09-15",
  format: 16,
  myRank: 5,
  rewards: "5000 幣"
}, {
  id: "h5",
  date: "2026-09-10",
  format: 8,
  myRank: 1,
  rewards: "5000 幣 + 霓虹晶片"
}];
const REGISTRATION_REQS = {
  8: {
    free: true,
    desc: "免費參加，隨機匹配"
  },
  16: {
    free: false,
    tickets: 1,
    elo: 1e3,
    desc: "入場券 x1 或 ELO > 1000"
  },
  32: {
    free: false,
    tickets: 3,
    elo: 1500,
    desc: "入場券 x3 或 ELO > 1500"
  }
};
const TournamentPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = reactExports.useState("create");
  const [tournament, setTournament] = reactExports.useState(null);
  const [size, setSize] = reactExports.useState(16);
  const [playerName, setPlayerName] = reactExports.useState("玩家");
  const [showMyTournament, setShowMyTournament] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) {
          setTournament(parsed);
        }
      }
    } catch {
    }
  }, []);
  const saveTournament = reactExports.useCallback((state) => {
    setTournament(state);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
    }
  }, []);
  const handleCreate = () => {
    const name = playerName.trim() || "玩家";
    const state = createTournamentState(size, name);
    saveTournament(state);
    setShowMyTournament(true);
    setActiveTab("schedule");
  };
  const handleSimulate = reactExports.useCallback(() => {
    if (!tournament) return;
    const next = simulateNextRound(tournament);
    saveTournament(next);
  }, [tournament, saveTournament]);
  const canSimulate = reactExports.useMemo(() => canSimulateNextRound(tournament), [tournament]);
  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
    }
    setTournament(null);
    setActiveTab("create");
  };
  const handleBack = () => navigate("/");
  const groupMatches = reactExports.useMemo(() => tournament ? getGroupMatches(tournament) : {}, [tournament]);
  const knockoutRounds = reactExports.useMemo(() => tournament ? getKnockoutRounds(tournament) : [], [tournament]);
  const sortedStandings = reactExports.useMemo(() => tournament ? getSortedStandings(tournament) : [], [tournament]);
  const liveBracket = reactExports.useMemo(() => buildMockLiveBracket(), []);
  const liveTournament = reactExports.useMemo(() => ({
    id: "live_001",
    format: 16,
    status: "in-progress",
    currentRound: 2,
    remainingPlayers: 8,
    nextRoundAt: "20:30",
    myPosition: 5,
    bracket: liveBracket
  }), [liveBracket]);
  const historyData = reactExports.useMemo(() => MOCK_HISTORY, []);
  const regReq = REGISTRATION_REQS[size];
  const handleJoinLive = () => {
    handleCreate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full flex flex-col px-4 py-6 scanlines relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 pointer-events-none overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--cyan)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-10 blur-[100px]", style: {
        background: "var(--pink)"
      } })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleBack, className: "cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
          borderColor: "var(--cyan)",
          color: "var(--cyan)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { size: 16 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider", children: "返回" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-cyber text-2xl md:text-3xl text-neon-pink tracking-wider", children: "錦標賽" }),
        tournament && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleReset, className: "ml-auto cyber-btn px-3 py-2 text-sm flex items-center gap-1", style: {
          borderColor: "var(--red)",
          color: "var(--red)"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 14 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber tracking-wider text-xs", children: "重置" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-8 space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 18, style: {
              color: "var(--cyan)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider text-neon-cyan", children: "選擇賽制" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4", children: FORMAT_OPTIONS.map((opt) => {
            const selected = size === opt.size;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSize(opt.size), className: "cyber-btn p-4 md:p-6 flex flex-col items-center gap-2 transition-all group", style: {
              borderColor: selected ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)",
              color: selected ? "var(--cyan)" : "var(--text-secondary)",
              background: selected ? "rgba(0, 255, 255, 0.08)" : "transparent",
              boxShadow: selected ? "0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 12px rgba(0, 255, 255, 0.08)" : "none"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-3xl md:text-4xl tracking-wider", style: {
                color: selected ? "var(--cyan)" : "var(--text-primary)",
                textShadow: selected ? "0 0 10px rgba(0, 255, 255, 0.6)" : "none"
              }, children: opt.size }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber tracking-widest text-sm", children: opt.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs opacity-60 font-cyber tracking-wider", children: opt.desc }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16, className: "transition-all", style: {
                opacity: selected ? 1 : 0,
                transform: selected ? "translateX(0)" : "translateX(-8px)"
              } })
            ] }, opt.size);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TournamentRewards, { format: size }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-5 h-full flex flex-col", style: {
            borderColor: "rgba(255, 107, 157, 0.3)",
            boxShadow: "0 0 16px rgba(255, 107, 157, 0.15)"
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { size: 20, style: {
                color: "var(--pink)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg tracking-wider text-neon-pink", children: "報名資訊" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-sm", style: {
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 18, style: {
                  color: "var(--cyan)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5", children: "賽制" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-cyber text-base tracking-wider", style: {
                    color: "var(--text-primary)"
                  }, children: [
                    size,
                    " 人單敗淘汰制"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-sm", style: {
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { size: 18, style: {
                  color: "var(--pink)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5", children: "報名條件" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-sm tracking-wider", style: {
                    color: "var(--text-primary)"
                  }, children: regReq.desc })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-sm", style: {
                border: "1px solid rgba(167,139,250,0.2)",
                background: "rgba(167,139,250,0.04)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 18, style: {
                  color: "var(--purple)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider mb-0.5", children: "玩家暱稱" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: playerName, onChange: (e) => setPlayerName(e.target.value), maxLength: 12, className: "w-full bg-transparent border-none outline-none font-cyber tracking-wider text-sm p-0", style: {
                    color: "var(--text-primary)"
                  }, placeholder: "輸入你的暱稱" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleCreate, className: "cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest flex items-center justify-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 18 }),
              "立即報名"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-xs text-[var(--text-secondary)] space-y-1 font-cyber tracking-wider", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 對手不足時由 AI 填補" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 勝一場 3 分、敗一場 1 分" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 淘汰賽單場淘汰，直至產生冠軍" })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 18, style: {
              color: "var(--pink)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider text-neon-pink", children: "當前進行中的賽事" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(LiveTournamentCard, { tournament: liveTournament, onJoin: handleJoinLive })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { size: 18, style: {
              color: "var(--cyan)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider text-neon-cyan", children: "賽程樹狀圖" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TournamentBracket, { rounds: liveBracket, format: 16 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 18, style: {
              color: "var(--purple)"
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider", style: {
              color: "var(--purple)"
            }, children: "歷史記錄" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TournamentHistoryPanel, { history: historyData })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 cursor-pointer select-none", onClick: () => setShowMyTournament((v) => !v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { size: 18, style: {
                color: "var(--cyan)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl tracking-wider text-neon-cyan", children: "我的錦標賽" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider flex items-center gap-1", children: [
              showMyTournament ? "收起" : "展開",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14, style: {
                transform: showMyTournament ? "rotate(90deg)" : "none",
                transition: "transform 0.2s"
              } })
            ] })
          ] }),
          showMyTournament && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: TABS.map((tab) => {
              const selected = activeTab === tab.key;
              const Icon = tab.icon;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab(tab.key), className: "cyber-btn flex-1 min-w-[100px] py-2 text-sm md:text-base font-cyber tracking-wider transition-all flex items-center justify-center gap-2", style: {
                borderColor: selected ? "var(--pink)" : "rgba(0, 255, 255, 0.2)",
                color: selected ? "var(--pink)" : "var(--text-secondary)",
                background: selected ? "rgba(255, 107, 157, 0.08)" : "transparent",
                boxShadow: selected ? "0 0 12px rgba(255, 107, 157, 0.3)" : "none"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: tab.label })
              ] }, tab.key);
            }) }),
            activeTab === "create" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 max-w-md mx-auto", style: {
              borderColor: "rgba(255, 107, 157, 0.3)"
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-cyber text-xl text-neon-pink tracking-wider mb-6 text-center", children: "創建錦標賽" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2", children: "參賽人數" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: [8, 16, 32].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSize(s), className: "cyber-btn flex-1 py-3 font-cyber text-lg tracking-wider transition-all", style: {
                  borderColor: size === s ? "var(--cyan)" : "rgba(0, 255, 255, 0.2)",
                  color: size === s ? "var(--cyan)" : "var(--text-secondary)",
                  background: size === s ? "rgba(0, 255, 255, 0.08)" : "transparent",
                  boxShadow: size === s ? "0 0 12px rgba(0, 255, 255, 0.3)" : "none"
                }, children: [
                  s,
                  " 人"
                ] }, s)) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm text-[var(--text-secondary)] font-cyber tracking-wider mb-2", children: "玩家暱稱" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: playerName, onChange: (e) => setPlayerName(e.target.value), maxLength: 12, className: "w-full cyber-input px-4 py-3 font-cyber tracking-wider", style: {
                  borderColor: "rgba(0, 255, 255, 0.3)"
                }, placeholder: "輸入你的暱稱" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleCreate, className: "cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 18 }),
                "開始錦標賽"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-xs text-[var(--text-secondary)] space-y-1 font-cyber tracking-wider", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 對手不足時由 AI 填補" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 勝一場 3 分、敗一場 1 分" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 小組前 2 名晉級淘汰賽" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• 淘汰賽單場淘汰，直至產生冠軍" })
              ] })
            ] }),
            activeTab === "schedule" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: !tournament ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 text-center text-[var(--text-secondary)] max-w-md mx-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-12 h-12 mx-auto mb-4", style: {
                color: "var(--purple)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-cyber tracking-wider text-base mb-2", children: "尚無進行中的錦標賽" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "前往「創建錦標賽」頁面開始" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setActiveTab("create"), className: "cyber-btn mt-4 px-6 py-2 text-sm", style: {
                borderColor: "var(--pink)",
                color: "var(--pink)"
              }, children: "立即創建" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card px-4 py-3 flex items-center justify-between", style: {
                borderColor: tournament.phase === "finished" ? "var(--green)" : "var(--cyan)",
                boxShadow: tournament.phase === "finished" ? "0 0 12px rgba(0, 255, 128, 0.25)" : "0 0 12px rgba(0, 255, 255, 0.25)"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  tournament.phase === "finished" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 20, style: {
                    color: "var(--green)"
                  } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Swords, { size: 20, style: {
                    color: "var(--cyan)"
                  } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-cyber text-lg tracking-wider", style: {
                    color: tournament.phase === "finished" ? "var(--green)" : "var(--cyan)"
                  }, children: PHASE_LABELS[tournament.phase] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: [
                  tournament.size,
                  " 人參賽"
                ] })
              ] }),
              tournament.champion && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-6 text-center", style: {
                borderColor: "#facc15",
                background: "linear-gradient(135deg, rgba(250, 204, 21, 0.1), var(--bg-card))",
                boxShadow: "0 0 20px rgba(250, 204, 21, 0.3)",
                animation: "pulse-glow 2s ease-in-out infinite"
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { size: 48, className: "mx-auto mb-3", style: {
                  color: "#facc15",
                  filter: "drop-shadow(0 0 8px #facc15)"
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-cyber text-2xl tracking-wider mb-1", style: {
                  color: "#facc15",
                  textShadow: "0 0 10px #facc15"
                }, children: tournament.champion }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--text-secondary)] font-cyber tracking-wider", children: "獎盃 錦標賽冠軍" })
              ] }),
              canSimulate && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleSimulate, className: "cyber-btn cyber-btn-pink w-full py-4 text-lg font-cyber tracking-widest flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { size: 18 }),
                "模擬下一輪"
              ] }),
              tournament.groups && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg text-neon-cyan tracking-wider mb-3", children: "分組循環賽" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(tournament.groups).map(([groupName, players]) => /* @__PURE__ */ jsxRuntimeExports.jsx(GroupCard, { groupName, players, matches: groupMatches[groupName] ?? [], sortedStandings }, groupName)) })
              ] }),
              knockoutRounds.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-cyber text-lg text-neon-pink tracking-wider mb-3", children: "淘汰賽" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(KnockoutBracket, { rounds: knockoutRounds })
              ] })
            ] }) }),
            activeTab === "standings" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: !tournament ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cyber-card p-8 text-center text-[var(--text-secondary)] max-w-md mx-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "w-12 h-12 mx-auto mb-4", style: {
                color: "var(--purple)"
              } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-cyber tracking-wider text-base mb-2", children: "尚無積分數據" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: "創建錦標賽後查看積分榜" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StandingsTable, { standings: sortedStandings, champion: tournament.champion, phase: tournament.phase }) }),
            activeTab === "official" && /* @__PURE__ */ jsxRuntimeExports.jsx(OfficialTournaments, {})
          ] })
        ] })
      ] })
    ] })
  ] });
};
export {
  TournamentPage as default
};
