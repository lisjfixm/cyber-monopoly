export interface DemoAnnotation {
  turn: number;
  playerIndex: number;
  title: string;
  content: string;
  type: 'strategy' | 'warning' | 'tip' | 'analysis';
}

export interface DemoReplay {
  id: string;
  title: string;
  description: string;
  difficulty: 'hard' | 'hell';
  playerNames: string[];
  totalTurns: number;
  annotations: DemoAnnotation[];
}

export const AI_DEMO_REPLAYS: DemoReplay[] = [
  {
    id: 'demo-001',
    title: '地獄級對決：套裝爭奪戰',
    description: '兩個地獄級AI的頂尖對局，全程圍繞核心區塊套裝展開攻防，示範精確計算與資產估算。',
    difficulty: 'hell',
    playerNames: ['Alpha-01', 'Omega-07'],
    totalTurns: 45,
    annotations: [
      {
        turn: 3,
        playerIndex: 0,
        title: '為何不買此塊地？',
        content: 'Alpha-01路過舊城區（地價600）時選擇pass。看似保守，實則計算：此塊所屬系列僅2塊，套裝過路費加成效益低；且後續還有5塊更高價值地，保留現金等待更佳標的。',
        type: 'strategy',
      },
      {
        turn: 7,
        playerIndex: 1,
        title: '為何此塊必須搶？',
        content: 'Omega-07以高於地價20%的價格在拍賣中搶下金融街。計算邏輯：金融街是中央塔/富豪區系列的關鍵一塊，Alpha-01已擁有中央塔，若讓其湊齊套裝，後續被動過路費損失預估超過3000/次，因此即使溢價購入也划算。',
        type: 'analysis',
      },
      {
        turn: 12,
        playerIndex: 0,
        title: '聯合針對最強玩家',
        content: '4人局中，Alpha-01與另一名AI暗中形成「弱勢聯盟」：雙方都優先購買Omega-07快要湊齊的系列地塊，阻止其達成套裝。這是地獄級AI的「聯合圍剿」策略——先幹掉最強對手，再內戰。',
        type: 'strategy',
      },
      {
        turn: 20,
        playerIndex: 1,
        title: '精確現金流管理',
        content: 'Omega-07建房後現金剛好剩1200，恰好等於安全墊×1.2。地獄級AI會計算未來3回合內可能遇到的最高過路費，確保現金始終足以應對，避免被迫抵押套裝地產。',
        type: 'tip',
      },
      {
        turn: 30,
        playerIndex: 0,
        title: '交易談判的底線計算',
        content: 'Alpha-07提議用「舊城區+2000元」換「數據塔」。底線邏輯：數據塔所屬系列若湊齊，套裝加成×3後過路費可達1800/次，預計5回合內回收成本；舊城區即使有套裝，過路費僅400/次，長期收益遠低。',
        type: 'analysis',
      },
      {
        turn: 42,
        playerIndex: 1,
        title: '致命一擊：何時升級酒店',
        content: 'Omega-07在確認Alpha-01下回合必經過富豪區後，才連續升級3級建築到酒店。時機選擇：如果提前升級，Alpha-01可能改變路線（用道具/命運卡）；等到對方已經擲骰、位置確定後再建，確保投資立即見效。',
        type: 'strategy',
      },
    ],
  },
  {
    id: 'demo-002',
    title: '困難級教學：新手常見錯誤',
    description: '對比人類新手常見決策與困難級AI的選擇，解釋為什麼某些看似合理的決定其實是敗筆。',
    difficulty: 'hard',
    playerNames: ['新手', '困難AI'],
    totalTurns: 30,
    annotations: [
      {
        turn: 2,
        playerIndex: 1,
        title: '新手迷思：地價越便宜越賺？',
        content: '新手常見誤解：「便宜地先買，賺得快」。實際上，低價地的過路費也低，即使湊齊套裝也難以構成威脅。困難級AI優先攢錢買中高價位地，寧願錯過前幾塊便宜地，也要保證後續買得起核心區塊。',
        type: 'tip',
      },
      {
        turn: 8,
        playerIndex: 0,
        title: '新手常犯：有錢就建房？',
        content: '新手拿到套裝就立刻把所有地建滿。AI思路：先建1-2級觀望，確保對方還會經常路過此系列再升級；一次建滿會耗盡現金，後續遇到命運卡罰款就被迫賤賣地產。',
        type: 'warning',
      },
      {
        turn: 15,
        playerIndex: 1,
        title: '套裝優先於總數量',
        content: 'AI有5塊散地 vs 人類有3塊但湊齊1套。看似人類地少，但套裝加成讓過路費×3，實際收益更高。原則：1套完整系列 > 4塊散地。',
        type: 'strategy',
      },
      {
        turn: 22,
        playerIndex: 0,
        title: '新手死穴：忽視現金安全墊',
        content: '新手把錢全部拿去買地建房，現金只剩幾百。一旦走到對方套裝地就直接破產。AI永遠保留至少1000-2000元安全墊，地獄級甚至會計算所有對手最貴地塊的過路費總和。',
        type: 'warning',
      },
    ],
  },
  {
    id: 'demo-003',
    title: '投機派AI 經典逆轉',
    description: '投機派AI 前期落後，靠拍賣低買高賣+股票操作逆轉戰局，示範另類獲勝路徑。',
    difficulty: 'hell',
    playerNames: ['激進派', '投機派'],
    totalTurns: 38,
    annotations: [
      {
        turn: 5,
        playerIndex: 1,
        title: '投機派為何也買地？',
        content: '投機派並非不買地，而是選擇性地買：只買即將進入拍賣流程、對方也想要的地。目的不是收租，而是等對方主動提議交易時高價賣出，賺取差價。',
        type: 'strategy',
      },
      {
        turn: 14,
        playerIndex: 1,
        title: '拍賣場上的心理戰',
        content: '投機派AI在拍賣前期故意出價很高，營造「我勢在必得」的假象，引誘對手跟進加價；在對方接近底線時突然放棄，讓對手以高於市場價的價格買入。',
        type: 'analysis',
      },
      {
        turn: 25,
        playerIndex: 1,
        title: '股票操作：別把雞蛋放一個籃子',
        content: '投機派AI分散買入3隻不同板塊的股票，而不是 all-in 一隻。原因：大富翁股市波動隨機，分散投資降低破產風險；長期來看，3隻股票的期望值等同但方差更小。',
        type: 'tip',
      },
      {
        turn: 35,
        playerIndex: 0,
        title: '激進派的盲點',
        content: '激進派AI擁有最多地產，但現金不足且分散在多個未湊齊的系列中。投機派此時發起交易：用少量現金+1塊散地，換取對方1塊關鍵套裝地。激進派因現金緊張被迫接受，從此走上下坡。',
        type: 'analysis',
      },
    ],
  },
];
