/* eslint-disable */
/** auto generated, do not edit */
import { sql } from 'drizzle-orm';
import { boolean, date, foreignKey, index, integer, jsonb, pgTable, smallint, text, uniqueIndex, uuid, varchar, customType } from "drizzle-orm/pg-core"

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number };
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number) {
    if (value == null) return value as any;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if (value instanceof Date) return value;
    return new Date(value);
  },
});

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

export function escapeLiteral(str: string): string {
  return "'" + str.replace(/'/g, "''") + "'";
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const monopolyCheckin = pgTable("monopoly_checkin", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull(),
  checkinDate: date("checkin_date").notNull(),
  streakDays: integer("streak_days").notNull().default(1),
  totalDays: integer("total_days").notNull().default(1),
  rewardCoins: integer("reward_coins").notNull().default(100),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_checkin_account_date").on(table.accountId, table.checkinDate),
  index("idx_checkin_account").on(table.accountId, table.createdAt),
  foreignKey({
    columns: [table.accountId],
    foreignColumns: [monopolyAccount.id],
    name: "monopoly_checkin_account_id_fkey",
  }).onDelete("cascade"),
]);

export const monopolyAccountProvider = pgTable("monopoly_account_provider", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull(),
  provider: varchar("provider", { length: 20 }).notNull(),
  providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  displayName: varchar("display_name", { length: 100 }),
  boundAt: customTimestamptz("bound_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("idx_account_provider_unique").on(table.provider, table.providerUserId),
  index("idx_account_provider_account_id").on(table.accountId),
  foreignKey({
    columns: [table.accountId],
    foreignColumns: [monopolyAccount.id],
    name: "monopoly_account_provider_account_id_fkey",
  }).onDelete("cascade"),
]);

export const monopolyGmLog = pgTable("monopoly_gm_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  gmId: varchar("gm_id", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  targetUserId: uuid("target_user_id"),
  /**
   * @type { [key: string]: any }
   */
  details: jsonb("details").notNull().default('{}'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const monopolyGlobalEvent = pgTable("monopoly_global_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(false),
  /**
   * @type { [key: string]: any }
   */
  config: jsonb("config").notNull().default('{}'),
  startsAt: customTimestamptz("starts_at", { precision: 3 }),
  endsAt: customTimestamptz("ends_at", { precision: 3 }),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const monopolyAnnouncement = pgTable("monopoly_announcement", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const monopolyAccount = pgTable("monopoly_account", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  avatarFrame: varchar("avatar_frame", { length: 50 }).notNull().default('default'),
  elo: integer("elo").notNull().default(1000),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  coins: integer("coins").notNull().default(0),
  level: integer("level").notNull().default(1),
  isBanned: boolean("is_banned").notNull().default(false),
  banReason: varchar("ban_reason", { length: 255 }),
  lastLoginAt: customTimestamptz("last_login_at", { precision: 3 }),
  /**
   * @type string[]
   */
  unlockedSkins: jsonb("unlocked_skins").notNull().default('[]'),
  /**
   * @type string[]
   */
  unlockedTitles: jsonb("unlocked_titles").notNull().default('[]'),
  /**
   * @type { [key: string]: boolean }
   */
  unlockedAchievements: jsonb("unlocked_achievements").notNull().default('{}'),
  /**
   * @type { coins: number, items: { [key: string]: number } }
   */
  inventory: jsonb("inventory").notNull().default('{}'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("monopoly_account_username_key").on(table.username),
  index("idx_account_nickname").on(table.nickname),
  index("idx_account_elo").on(table.elo),
  index("idx_account_wins").on(table.wins),
]);

export const monopolyFriendMessages = pgTable("monopoly_friend_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUser: userProfile("from_user").notNull(),
  toUser: userProfile("to_user").notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).notNull().default('text'),
  isRead: boolean("is_read").notNull().default(false),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  // Complex index: CREATE INDEX idx_friend_msgs_pair_time ON monopoly_friend_messages USING btree (LEAST((from_user).user_id, (to_user).user_id), GREATEST((from_user).user_id, (to_user).user_id), _created_at DESC),
  // Complex index: CREATE INDEX idx_friend_msgs_unread ON monopoly_friend_messages USING btree (((to_user).user_id), is_read) WHERE (is_read = false),
]);

export const monopolyFriends = pgTable("monopoly_friends", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: userProfile("user_id").notNull(),
  friendId: userProfile("friend_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'),
  remark: varchar("remark", { length: 50 }),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  // Complex index: CREATE UNIQUE INDEX idx_monopoly_friends_pair ON monopoly_friends USING btree (LEAST((user_id).user_id, (friend_id).user_id), GREATEST((user_id).user_id, (friend_id).user_id)),
  // Complex index: CREATE INDEX idx_monopoly_friends_user ON monopoly_friends USING btree (((user_id).user_id)),
  // Complex index: CREATE INDEX idx_monopoly_friends_friend ON monopoly_friends USING btree (((friend_id).user_id)),
]);

export const monopolyMatchQueue = pgTable("monopoly_match_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  nickname: varchar("nickname", { length: 50 }).notNull(),
  gameMode: varchar("game_mode", { length: 20 }).notNull().default('classic'),
  maxPlayers: integer("max_players").notNull().default(2),
  joinedAt: customTimestamptz("joined_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_match_queue_mode_players").on(table.gameMode, table.maxPlayers, table.joinedAt),
]);

export const monopolyPlayer = pgTable("monopoly_player", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull().unique(),
  nickname: varchar("nickname", { length: 50 }).notNull().default('匿名玩家'),
  elo: integer("elo").notNull().default(1000),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  totalTurns: integer("total_turns").notNull().default(0),
  highestAssets: integer("highest_assets").notNull().default(0),
  seasonWins: integer("season_wins").notNull().default(0),
  seasonElo: integer("season_elo").notNull().default(1000),
  currentSeason: varchar("current_season", { length: 7 }).notNull().default(sql`to_char((CURRENT_DATE)::timestamp with time zone, 'YYYY-MM'::text)`),
  title: varchar("title", { length: 20 }).notNull(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("monopoly_player_visitor_id_key").on(table.visitorId),
  index("idx_monopoly_player_elo").on(table.elo),
  index("idx_monopoly_player_season_wins").on(table.seasonWins),
  index("idx_monopoly_player_wins").on(table.wins),
  index("idx_monopoly_player_visitor").on(table.visitorId),
]);

export const monopolyRoom = pgTable("monopoly_room", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomCode: varchar("room_code", { length: 6 }).notNull().unique(),
  gameMode: varchar("game_mode", { length: 20 }).notNull().default('classic'),
  hostName: varchar("host_name", { length: 50 }).notNull(),
  guestName: varchar("guest_name", { length: 50 }),
  status: varchar("status", { length: 20 }).notNull().default('waiting'),
  gameState: jsonb("game_state"),
  /**
   * @type { id: number; sender: number; senderName: string; content: string; type: "player" | "system"; timestamp: string; }[]
   */
  messages: jsonb("messages").notNull().default('[]'),
  unreadHost: smallint("unread_host").notNull().default(0),
  unreadGuest: smallint("unread_guest").notNull().default(0),
  hostLastSeen: customTimestamptz("host_last_seen", { precision: 6 }),
  guestLastSeen: customTimestamptz("guest_last_seen", { precision: 6 }),
  disconnectedPlayer: smallint("disconnected_player"),
  maxPlayers: smallint("max_players").notNull().default(2),
  /**
   * @type { name: string; color: string; ready: boolean }[]
   */
  playerNames: jsonb("player_names").notNull().default('[]'),
  hostIndex: smallint("host_index").notNull().default(0),
  /**
   * @type (string | null)[]
   */
  playerLastSeen: jsonb("player_last_seen").notNull().default('[]'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by").default(sql`CASE
    WHEN (current_setting('app.user_id'::text, true) = ''::text) THEN NULL`),
}, (table) => [
  uniqueIndex("monopoly_room_room_code_key").on(table.roomCode),
  uniqueIndex("idx_monopoly_room_code").on(table.roomCode),
]);

// ===== v3.0.0 新增：使用者雲端存檔（monopoly.service 已直接以 SQL 存取）=====
export const monopolyUserSaves = pgTable("monopoly_user_saves", {
  visitorId: varchar("visitor_id", { length: 64 }).primaryKey(),
  /**
   * @type unknown
   */
  saveData: jsonb("save_data").notNull().default('{}'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// ===== v3.0.0 新增：完賽戰報（戰績統計 / 賽季戰報）=====
export const monopolyGameRecord = pgTable("monopoly_game_record", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  season: varchar("season", { length: 7 }).notNull(),
  /**
   * @type string[]
   */
  opponentIds: jsonb("opponent_ids").notNull().default('[]'),
  winnerVisitorId: varchar("winner_visitor_id", { length: 64 }),
  myRank: integer("my_rank").notNull(),
  totalTurns: integer("total_turns").notNull().default(0),
  myAssets: integer("my_assets").notNull().default(0),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_game_record_visitor_season").on(table.visitorId, table.season),
  index("idx_game_record_visitor_created").on(table.visitorId, table.createdAt),
]);

// ===== v4.0.0 新增：幫派系統 =====
export const monopolyGang = pgTable("monopoly_gang", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 20 }).notNull().unique(),
  announcement: varchar("announcement", { length: 100 }),
  description: varchar("description", { length: 200 }),
  leaderId: uuid("leader_id").notNull(),
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("monopoly_gang_name_key").on(table.name),
  index("idx_monopoly_gang_leader").on(table.leaderId),
]);

export const monopolyGangMember = pgTable("monopoly_gang_member", {
  id: uuid("id").primaryKey().defaultRandom(),
  gangId: uuid("gang_id").notNull(),
  accountId: uuid("account_id").notNull(),
  role: varchar("role", { length: 20 }).notNull().default('member'),
  joinedAt: customTimestamptz("joined_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_monopoly_gang_member_unique").on(table.gangId, table.accountId),
  index("idx_monopoly_gang_member_account").on(table.accountId),
]);

// ===== v4.0.0 新增：賽季積分 =====
export const monopolySeasonScore = pgTable("monopoly_season_score", {
  id: uuid("id").primaryKey().defaultRandom(),
  seasonId: varchar("season_id", { length: 40 }).notNull(),
  accountId: uuid("account_id").notNull(),
  score: integer("score").notNull().default(0),
  gamesPlayed: integer("games_played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  updatedAt: customTimestamptz("_updated_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_monopoly_season_score_unique").on(table.seasonId, table.accountId),
  index("idx_monopoly_season_score_season").on(table.seasonId, table.score),
]);

// ===== v4.0.0 新增：經濟事件（加密貨幣/稅務/股息）=====
export const monopolyEconomyEvent = pgTable("monopoly_economy_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull(),
  eventType: varchar("event_type", { length: 30 }).notNull(),
  amount: integer("amount").notNull().default(0),
  assetSymbol: varchar("asset_symbol", { length: 40 }),
  note: varchar("note", { length: 100 }),
  roomCode: varchar("room_code", { length: 6 }).notNull(),
  createdAt: customTimestamptz("_created_at", { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_monopoly_economy_account").on(table.accountId, table.eventType),
  index("idx_monopoly_economy_type").on(table.eventType),
]);

// table aliases
export const monopolyAccountTable = monopolyAccount;
export const monopolyAccountProviderTable = monopolyAccountProvider;
export const monopolyAnnouncementTable = monopolyAnnouncement;
export const monopolyCheckinTable = monopolyCheckin;
export const monopolyFriendMessagesTable = monopolyFriendMessages;
export const monopolyFriendsTable = monopolyFriends;
export const monopolyGlobalEventTable = monopolyGlobalEvent;
export const monopolyGmLogTable = monopolyGmLog;
export const monopolyMatchQueueTable = monopolyMatchQueue;
export const monopolyPlayerTable = monopolyPlayer;
export const monopolyRoomTable = monopolyRoom;
export const monopolyGangTable = monopolyGang;
export const monopolyGangMemberTable = monopolyGangMember;
export const monopolySeasonScoreTable = monopolySeasonScore;
export const monopolyEconomyEventTable = monopolyEconomyEvent;
