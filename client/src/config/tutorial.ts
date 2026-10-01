export interface TutorialStepConfig {
  id: string;
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  targetSelector?: string;
  actionLabel?: string;
}

export const TUTORIAL_STEPS: TutorialStepConfig[] = [
  {
    id: "welcome",
    title: "歡迎來到賽博大富翁",
    description:
      "在這座霓虹閃爍的賽博都市中，你將與對手展開一場地產豪賭。目標只有一個：讓對手破產，成為統治這座城市的賽博霸主！",
    placement: "center",
    actionLabel: "開始冒險",
  },
  {
    id: "gameModes",
    title: "選擇對戰方式",
    description:
      "遊戲支援三種對戰模式：雙人同屏對戰（與好友在同一裝置上對決）、人機對戰（挑戰 AI 對手）、聯機對戰（與遠方的朋友連線博弈）。新手推薦從人機對戰開始練手。",
    placement: "bottom",
    targetSelector: "[data-tutorial='game-modes']",
  },
  {
    id: "ruleModes",
    title: "選擇遊戲模式",
    description:
      "經典模式：標準規則，穩步經營。快速模式：地價更低、節奏更快，適合短局。瘋狂模式：命運卡效果翻倍，現金更多，刺激拉滿。新手推薦從經典模式開始。",
    placement: "top",
    targetSelector: "[data-tutorial='rule-modes']",
  },
  {
    id: "professions",
    title: "職業選擇",
    description:
      "每位玩家可以選擇一個職業，獲得獨特的技能加成。共有 6 種職業：工程師（建造打折）、銀行家（抵押優惠）、投機者（抽卡加倍）、地產大亨（買地打折）、駭客（越獄達人）、醫生（絕境復活）。新手推薦選擇醫生，穩紮穩打。",
    placement: "bottom",
    targetSelector: "[data-tutorial='professions']",
  },
  {
    id: "boardIntro",
    title: "認識棋盤",
    description:
      "棋盤共有 36 格，順時針排列。綠色格子是起點（每次經過獲得獎勵）；各色地塊可以購買收租；紫色格子是禁閉區（被抓進去要蹲監獄）；粉色格子是命運區／機會區（抽取隨機卡牌）。",
    placement: "top",
    targetSelector: "[data-tutorial='board']",
  },
  {
    id: "rollDice",
    title: "擲骰子前進",
    description:
      "點擊「擲骰子」按鈕投擲兩枚骰子，按點數之和在棋盤上順時針移動。如果擲出雙骰（兩枚點數相同），停在目標格後還能再擲一次。連續三次雙骰？抱歉，你被懷疑出老千，直接進禁閉區！",
    placement: "left",
    targetSelector: "[data-tutorial='roll-dice']",
  },
  {
    id: "buyProperty",
    title: "購買地產",
    description:
      "落在無主地產上時，彈窗會顯示地價和收益資訊，你可以選擇購買或放棄。支付地價後，你就成為這塊地的主人，以後對手踩到你的地盤，都要向你支付過路費！買地越早，收益越大。",
    placement: "center",
    actionLabel: "繼續",
  },
  {
    id: "colorSets",
    title: "地產套裝加成",
    description:
      "棋盤上同顏色的地塊屬於同一個系列。當你集齊一個系列的所有地塊時，該系列的過路費會翻倍！盡早收集成套地塊，是致富的關鍵策略。",
    placement: "top",
    targetSelector: "[data-tutorial='board']",
  },
  {
    id: "fateChance",
    title: "命運與機會",
    description:
      "落在命運區或機會區會彈出卡牌，效果五花八門：可能獲得意外之財，也可能被罰款，甚至直接被傳送或送進禁閉區。命運卡偏向金錢變化，機會卡則有更多移動和特殊效果。每一步都充滿未知，謹慎前行！",
    placement: "center",
    actionLabel: "繼續",
  },
  {
    id: "detention",
    title: "禁閉區規則",
    description:
      "棋盤上的紫色格子是禁閉區。被送進去後，你需要待滿 3 回合才能出獄。每回合仍然可以擲骰子，如果擲出雙骰可以直接出獄。也可以使用「免費出獄卡」或者支付罰款立即出獄。在禁閉區裡不會被收過路費，被關進去也不全是壞事。",
    placement: "center",
    actionLabel: "繼續",
  },
  {
    id: "building",
    title: "建築升級與抵押",
    description:
      "擁有成套地塊後，你可以在上面建造房屋（最多 4 棟）和酒店（1 棟），大幅提高過路費。點擊自己的地塊可以查看操作選項。如果現金緊張，還可以抵押地產換取現金，但抵押期間不能收過路費。",
    placement: "left",
    targetSelector: "[data-tutorial='building']",
  },
  {
    id: "victory",
    title: "勝利條件",
    description:
      "當對手的現金不足以支付費用時，他就破產了，你將贏得最終勝利，成為賽博霸主！合理規劃資產、控制風險、抓住機遇——願財富與你同在。",
    placement: "center",
    actionLabel: "開始遊戲",
  },
];

export const TUTORIAL_TOTAL = TUTORIAL_STEPS.length;
