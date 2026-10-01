export interface SampleTurnEvent {
  action: string;
  playerIndex: number;
  description: string;
  propertyName?: string;
  amount?: number;
}

export interface SampleTurn {
  turn: number;
  events: SampleTurnEvent[];
  summary: string;
}

// 樣本回放：18 回合，兩位玩家
export const SAMPLE_REPLAY_TURNS: SampleTurn[] = [
  {
    turn: 1,
    summary: '霓虹行者擲骰子，購買霓虹區',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者擲出 3 點，移動至霓虹區' },
      { action: 'buy', playerIndex: 0, description: '購買霓虹區', propertyName: '霓虹區', amount: -600 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客擲出 2 點，移動至舊城區' },
      { action: 'buy', playerIndex: 1, description: '購買舊城區', propertyName: '舊城區', amount: -600 },
    ],
  },
  {
    turn: 2,
    summary: '暗影黑客繞過能源站，霓虹行者買下數據塔',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者擲出 5 點，移動至數據塔' },
      { action: 'buy', playerIndex: 0, description: '購買數據塔', propertyName: '數據塔', amount: -1000 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客擲出 4 點，路過能源站' },
      { action: 'pass', playerIndex: 1, description: '暗影黑客跳過購買能源站' },
    ],
  },
  {
    turn: 3,
    summary: '霓虹行者購買核心區，資產領先',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者擲出 4 點，移動至核心區' },
      { action: 'buy', playerIndex: 0, description: '購買核心區', propertyName: '核心區', amount: -1400 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客擲出 6 點，移動至中央塔' },
      { action: 'buy', playerIndex: 1, description: '購買中央塔', propertyName: '中央塔', amount: -2000 },
    ],
  },
  {
    turn: 4,
    summary: '暗影黑客抽取命運卡，獲得獎金',
    events: [
      { action: 'draw_fate', playerIndex: 0, description: '霓虹行者抽取命運卡：繳納稅款', amount: -1500 },
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至金融街' },
      { action: 'buy', playerIndex: 0, description: '購買金融街', propertyName: '金融街', amount: -1600 },
      { action: 'draw_fate', playerIndex: 1, description: '暗影黑客抽取命運卡：獲得獎金', amount: 1000 },
    ],
  },
  {
    turn: 5,
    summary: '霓虹行者進入禁閉區，暗影黑客買下富豪區',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者擲出 2 點，進入禁閉區' },
      { action: 'roll', playerIndex: 1, description: '暗影黑客擲出 5 點，移動至富豪區' },
      { action: 'buy', playerIndex: 1, description: '購買富豪區', propertyName: '富豪區', amount: -2600 },
    ],
  },
  {
    turn: 6,
    summary: '霓虹行者出獄，付過路費',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者出獄，移動至地下街' },
      { action: 'pay_toll', playerIndex: 0, description: '支付過路費予暗影黑客', amount: -450 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客擲出 3 點，移動至後街' },
      { action: 'buy', playerIndex: 1, description: '購買後街', propertyName: '後街', amount: -2800 },
    ],
  },
  {
    turn: 7,
    summary: '暗影黑客建造房屋，強化套裝',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至科技城' },
      { action: 'buy', playerIndex: 0, description: '購買科技城', propertyName: '科技城', amount: -3000 },
      { action: 'build', playerIndex: 1, description: '暗影黑客在中央塔建造 2 級房屋', propertyName: '中央塔', amount: -800 },
    ],
  },
  {
    turn: 8,
    summary: '霓虹行者路過中央塔，慘付高額過路費',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至中央塔' },
      { action: 'pay_toll', playerIndex: 0, description: '支付高額過路費（套裝加成）', amount: -1800 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至命運區' },
      { action: 'draw_fate', playerIndex: 1, description: '抽取命運卡：黑客轉帳', amount: 2000 },
    ],
  },
  {
    turn: 9,
    summary: '霓虹行者反擊，買下星光道',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至星光道' },
      { action: 'buy', playerIndex: 0, description: '購買星光道', propertyName: '星光道', amount: -2800 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至貿易區' },
      { action: 'buy', playerIndex: 1, description: '購買貿易區', propertyName: '貿易區', amount: -2600 },
    ],
  },
  {
    turn: 10,
    summary: '雙方通過起點，獲得獎勵',
    events: [
      { action: 'go_to_start', playerIndex: 0, description: '霓虹行者通過起點', amount: 1500 },
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至能源站' },
      { action: 'buy', playerIndex: 0, description: '購買能源站', propertyName: '能源站', amount: -1000 },
      { action: 'go_to_start', playerIndex: 1, description: '暗影黑客通過起點', amount: 1500 },
    ],
  },
  {
    turn: 11,
    summary: '霓虹行者建造房屋，開始收租',
    events: [
      { action: 'build', playerIndex: 0, description: '霓虹行者在霓虹區建造 1 級房屋', propertyName: '霓虹區', amount: -300 },
      { action: 'build', playerIndex: 0, description: '霓虹行者在數據塔建造 1 級房屋', propertyName: '數據塔', amount: -400 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至貧民區' },
      { action: 'buy', playerIndex: 1, description: '購買貧民區', propertyName: '貧民區', amount: -2400 },
    ],
  },
  {
    turn: 12,
    summary: '暗影黑客支付霓虹區過路費',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至維修區' },
      { action: 'buy', playerIndex: 0, description: '購買維修區', propertyName: '維修區', amount: -1200 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至霓虹區' },
      { action: 'pay_toll', playerIndex: 1, description: '支付霓虹區過路費', amount: -350 },
    ],
  },
  {
    turn: 13,
    summary: '命運卡發威，暗影黑客被罰款',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至深海港' },
      { action: 'buy', playerIndex: 0, description: '購買深海港', propertyName: '深海港', amount: -1400 },
      { action: 'draw_fate', playerIndex: 1, description: '暗影黑客抽取命運卡：數據洩露罰款', amount: -500 },
    ],
  },
  {
    turn: 14,
    summary: '霓虹行者升級酒店，戰略升級',
    events: [
      { action: 'build', playerIndex: 0, description: '霓虹行者升級核心區至酒店級', propertyName: '核心區', amount: -2000 },
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至命運區' },
      { action: 'draw_fate', playerIndex: 0, description: '抽取命運卡：獲得補貼', amount: 800 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至總部' },
      { action: 'buy', playerIndex: 1, description: '購買總部', propertyName: '總部', amount: -3500 },
    ],
  },
  {
    turn: 15,
    summary: '暗影黑客踩到核心區酒店，大失血',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至外城區' },
      { action: 'buy', playerIndex: 0, description: '購買外城區', propertyName: '外城區', amount: -2600 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至核心區' },
      { action: 'pay_toll', playerIndex: 1, description: '支付核心區酒店級過路費', amount: -3200 },
    ],
  },
  {
    turn: 16,
    summary: '暗影黑客變賣資產籌現金',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至主塔' },
      { action: 'pay_toll', playerIndex: 0, description: '支付主塔過路費', amount: -800 },
      { action: 'demolish', playerIndex: 1, description: '暗影黑客拆除中央塔房屋套現', propertyName: '中央塔', amount: 400 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至中轉站' },
    ],
  },
  {
    turn: 17,
    summary: '霓虹行者繼續擴張，買下重工區',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至重工區' },
      { action: 'buy', playerIndex: 0, description: '購買重工區', propertyName: '重工區', amount: -3800 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至企業樓' },
      { action: 'pass', playerIndex: 1, description: '暗影黑客現金不足，跳過購買' },
    ],
  },
  {
    turn: 18,
    summary: '暗影黑客宣告破產，霓虹行者獲勝',
    events: [
      { action: 'roll', playerIndex: 0, description: '霓虹行者移動至高新園' },
      { action: 'buy', playerIndex: 0, description: '購買高新園', propertyName: '高新園', amount: -4000 },
      { action: 'roll', playerIndex: 1, description: '暗影黑客移動至核心區' },
      { action: 'pay_toll', playerIndex: 1, description: '再次支付核心區酒店費，現金見底', amount: -3200 },
      { action: 'bankruptcy', playerIndex: 1, description: '暗影黑客宣告破產' },
      { action: 'game_end', playerIndex: 0, description: '遊戲結束，霓虹行者獲勝' },
    ],
  },
];

export const SAMPLE_PLAYERS = [
  { name: '霓虹行者', color: 'cyan' },
  { name: '暗影黑客', color: 'pink' },
];
