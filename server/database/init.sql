-- Standalone 自動建表 SQL
-- 從 server/database/schema.ts 翻譯而來
-- 重複執行安全（IF NOT EXISTS + DO BLOCK）

-- ===== 自訂 composite types =====
DO $$ BEGIN
  CREATE TYPE user_profile AS (user_id text);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE file_attachment AS (bucket_id text, file_path text);
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ===== monopoly_account（基礎表，其他表 FK 指向它）=====
CREATE TABLE IF NOT EXISTS monopoly_account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username varchar(50) NOT NULL UNIQUE,
  password_hash varchar(255) NOT NULL,
  nickname varchar(50) NOT NULL,
  avatar_frame varchar(50) NOT NULL DEFAULT 'default',
  elo integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  coins integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason varchar(255),
  last_login_at timestamptz(3),
  unlocked_skins jsonb NOT NULL DEFAULT '[]',
  unlocked_titles jsonb NOT NULL DEFAULT '[]',
  unlocked_achievements jsonb NOT NULL DEFAULT '{}',
  inventory jsonb NOT NULL DEFAULT '{}',
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS monopoly_account_username_key ON monopoly_account (username);
CREATE INDEX IF NOT EXISTS idx_account_nickname ON monopoly_account (nickname);
CREATE INDEX IF NOT EXISTS idx_account_elo ON monopoly_account (elo);
CREATE INDEX IF NOT EXISTS idx_account_wins ON monopoly_account (wins);

-- ===== monopoly_account_provider =====
CREATE TABLE IF NOT EXISTS monopoly_account_provider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  provider varchar(20) NOT NULL,
  provider_user_id varchar(255) NOT NULL,
  email varchar(255),
  display_name varchar(100),
  bound_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile,
  FOREIGN KEY (account_id) REFERENCES monopoly_account(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_account_provider_unique ON monopoly_account_provider (provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_account_provider_account_id ON monopoly_account_provider (account_id);

-- ===== monopoly_checkin =====
CREATE TABLE IF NOT EXISTS monopoly_checkin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  checkin_date date NOT NULL,
  streak_days integer NOT NULL DEFAULT 1,
  total_days integer NOT NULL DEFAULT 1,
  reward_coins integer NOT NULL DEFAULT 100,
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES monopoly_account(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkin_account_date ON monopoly_checkin (account_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkin_account ON monopoly_checkin (account_id, _created_at);

-- ===== monopoly_gm_log =====
CREATE TABLE IF NOT EXISTS monopoly_gm_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gm_id varchar(100) NOT NULL,
  action varchar(50) NOT NULL,
  target_user_id uuid,
  details jsonb NOT NULL DEFAULT '{}',
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== monopoly_global_event =====
CREATE TABLE IF NOT EXISTS monopoly_global_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type varchar(50) NOT NULL,
  name varchar(100) NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}',
  starts_at timestamptz(3),
  ends_at timestamptz(3),
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== monopoly_announcement =====
CREATE TABLE IF NOT EXISTS monopoly_announcement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(100) NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== monopoly_friend_messages =====
CREATE TABLE IF NOT EXISTS monopoly_friend_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user user_profile NOT NULL,
  to_user user_profile NOT NULL,
  content text NOT NULL,
  type varchar(20) NOT NULL DEFAULT 'text',
  is_read boolean NOT NULL DEFAULT false,
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===== monopoly_friends =====
CREATE TABLE IF NOT EXISTS monopoly_friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id user_profile NOT NULL,
  friend_id user_profile NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'pending',
  remark varchar(50),
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile
);

-- ===== monopoly_match_queue =====
CREATE TABLE IF NOT EXISTS monopoly_match_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id varchar(64) NOT NULL,
  nickname varchar(50) NOT NULL,
  game_mode varchar(20) NOT NULL DEFAULT 'classic',
  max_players integer NOT NULL DEFAULT 2,
  joined_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_match_queue_mode_players ON monopoly_match_queue (game_mode, max_players, joined_at);

-- ===== monopoly_player =====
CREATE TABLE IF NOT EXISTS monopoly_player (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id varchar(64) NOT NULL UNIQUE,
  nickname varchar(50) NOT NULL DEFAULT '匿名玩家',
  elo integer NOT NULL DEFAULT 1000,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  total_turns integer NOT NULL DEFAULT 0,
  highest_assets integer NOT NULL DEFAULT 0,
  season_wins integer NOT NULL DEFAULT 0,
  season_elo integer NOT NULL DEFAULT 1000,
  current_season varchar(7) NOT NULL DEFAULT to_char(CURRENT_DATE::timestamptz, 'YYYY-MM'),
  title varchar(20) NOT NULL,
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS monopoly_player_visitor_id_key ON monopoly_player (visitor_id);
CREATE INDEX IF NOT EXISTS idx_monopoly_player_elo ON monopoly_player (elo);
CREATE INDEX IF NOT EXISTS idx_monopoly_player_season_wins ON monopoly_player (season_wins);
CREATE INDEX IF NOT EXISTS idx_monopoly_player_wins ON monopoly_player (wins);
CREATE INDEX IF NOT EXISTS idx_monopoly_player_visitor ON monopoly_player (visitor_id);

-- ===== monopoly_room =====
CREATE TABLE IF NOT EXISTS monopoly_room (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code varchar(6) NOT NULL UNIQUE,
  game_mode varchar(20) NOT NULL DEFAULT 'classic',
  host_name varchar(50) NOT NULL,
  guest_name varchar(50),
  status varchar(20) NOT NULL DEFAULT 'waiting',
  game_state jsonb,
  messages jsonb NOT NULL DEFAULT '[]',
  unread_host smallint NOT NULL DEFAULT 0,
  unread_guest smallint NOT NULL DEFAULT 0,
  host_last_seen timestamptz(6),
  guest_last_seen timestamptz(6),
  disconnected_player smallint,
  max_players smallint NOT NULL DEFAULT 2,
  player_names jsonb NOT NULL DEFAULT '[]',
  host_index smallint NOT NULL DEFAULT 0,
  player_last_seen jsonb NOT NULL DEFAULT '[]',
  _created_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _created_by user_profile,
  _updated_at timestamptz(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  _updated_by user_profile
);

CREATE UNIQUE INDEX IF NOT EXISTS monopoly_room_room_code_key ON monopoly_room (room_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_monopoly_room_code ON monopoly_room (room_code);
