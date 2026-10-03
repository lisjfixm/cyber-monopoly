import React, { useEffect, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './i18n';
import Layout from './components/Layout';
import { PageSkeleton } from './components/NeonSkeleton';
import HomePage from './pages/HomePage/HomePage';
import LocalSetupPage from './pages/LocalSetupPage/LocalSetupPage';
import AISetupPage from './pages/AISetupPage/AISetupPage';
import ModeSelectPage from './pages/ModeSelectPage/ModeSelectPage';
import GamePage from './pages/GamePage/GamePage';
import NotFound from './pages/NotFound/NotFound';
import { registerServiceWorker } from './utils/register-sw';

// 懶加載頁面（非首屏關鍵路徑）
const OnlineCreatePage = React.lazy(() => import('./pages/OnlineCreatePage/OnlineCreatePage'));
const OnlineJoinPage = React.lazy(() => import('./pages/OnlineJoinPage/OnlineJoinPage'));
const OnlineRoomPage = React.lazy(() => import('./pages/OnlineRoomPage/OnlineRoomPage'));
const QuickMatchPage = React.lazy(() => import('./pages/QuickMatchPage/QuickMatchPage'));
const PublicRoomsPage = React.lazy(() => import('./pages/PublicRoomsPage/PublicRoomsPage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage/LeaderboardPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage/ProfilePage'));
const BattlePassPage = React.lazy(() => import('./pages/BattlePassPage/BattlePassPage'));
const RankedSeasonPage = React.lazy(() => import('./pages/RankedSeasonPage/RankedSeasonPage'));
const DailyChallengePage = React.lazy(() => import('./pages/DailyChallengePage/DailyChallengePage'));
const ModManagerPage = React.lazy(() => import('./pages/ModManagerPage/ModManagerPage'));
const StatsDashboardPage = React.lazy(() => import('./pages/StatsDashboardPage/StatsDashboardPage'));
const StoryModePage = React.lazy(() => import('./pages/StoryModePage/StoryModePage'));
const TournamentPage = React.lazy(() => import('./pages/TournamentPage/TournamentPage'));
const MapEditorPage = React.lazy(() => import('./pages/MapEditorPage/MapEditorPage'));
const CommunityMapsPage = React.lazy(() => import('./pages/CommunityMapsPage/CommunityMapsPage'));
const CardEditorPage = React.lazy(() => import('./pages/CardEditorPage/CardEditorPage'));
const ScenarioEditorPage = React.lazy(() => import('./pages/ScenarioEditorPage/ScenarioEditorPage'));
const ReplayPage = React.lazy(() => import('./pages/ReplayPage/ReplayPage'));
const AIDemoPage = React.lazy(() => import('./pages/AIDemoPage/AIDemoPage'));
const FriendsPage = React.lazy(() => import('./pages/FriendsPage/FriendsPage'));
const AdminDashboardPage = React.lazy(() => import('./pages/AdminDashboardPage/AdminDashboardPage'));
const AnnouncementCenterPage = React.lazy(() => import('./pages/AnnouncementCenterPage/AnnouncementCenterPage'));
const GuildPage = React.lazy(() => import('./pages/GuildPage/GuildPage'));
const MailPage = React.lazy(() => import('./pages/MailPage/MailPage'));
const CollectionPage = React.lazy(() => import('./pages/CollectionPage/CollectionPage'));
const CodexPage = React.lazy(() => import('./pages/CodexPage/CodexPage'));
const AchievementPage = React.lazy(() => import('./pages/AchievementPage/AchievementPage'));
const ReportBlockPage = React.lazy(() => import('./pages/ReportBlockPage/ReportBlockPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage/LoginPage'));
const GmPanelPage = React.lazy(() => import('./pages/GmPanelPage/GmPanelPage'));
const SocialCenterPage = React.lazy(() => import('./pages/SocialCenterPage/SocialCenterPage'));
const SpectatePage = React.lazy(() => import('./pages/SpectatePage/SpectatePage'));
const LuckyWheelPage = React.lazy(() => import('./pages/LuckyWheelPage/LuckyWheelPage'));
const GachaPage = React.lazy(() => import('./pages/GachaPage/GachaPage'));

const RoutesComponent = () => {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <Suspense fallback={<PageSkeleton cardCount={3} />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="local-setup" element={<LocalSetupPage />} />
              <Route path="ai-setup" element={<AISetupPage />} />
              <Route path="mode-select" element={<ModeSelectPage />} />
              <Route path="game" element={<GamePage />} />
              <Route path="online/create" element={<OnlineCreatePage />} />
              <Route path="online/join" element={<OnlineJoinPage />} />
              <Route path="quick-match" element={<QuickMatchPage />} />
              <Route path="online/rooms" element={<PublicRoomsPage />} />
              <Route path="online/room/:code" element={<OnlineRoomPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="battlepass" element={<BattlePassPage />} />
              <Route path="ranked" element={<RankedSeasonPage />} />
              <Route path="daily-challenge" element={<DailyChallengePage />} />
              <Route path="mods" element={<ModManagerPage />} />
              <Route path="stats" element={<StatsDashboardPage />} />
              <Route path="story" element={<StoryModePage />} />
              <Route path="tournament" element={<TournamentPage />} />
              <Route path="map-editor" element={<MapEditorPage />} />
              <Route path="community-maps" element={<CommunityMapsPage />} />
              <Route path="card-editor" element={<CardEditorPage />} />
              <Route path="scenario-editor" element={<ScenarioEditorPage />} />
              <Route path="replay" element={<ReplayPage />} />
              <Route path="ai-demo" element={<AIDemoPage />} />
              <Route path="friends" element={<FriendsPage />} />
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="announcements" element={<AnnouncementCenterPage />} />
              <Route path="guild" element={<GuildPage />} />
              <Route path="social" element={<SocialCenterPage />} />
              <Route path="spectate" element={<SpectatePage />} />
              <Route path="mail" element={<MailPage />} />
              <Route path="collection" element={<CollectionPage />} />
              <Route path="codex" element={<CodexPage />} />
              <Route path="achievements" element={<AchievementPage />} />
              <Route path="report-block" element={<ReportBlockPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="gm-panel" element={<GmPanelPage />} />
              <Route path="lucky-wheel" element={<LuckyWheelPage />} />
              <Route path="gacha" element={<GachaPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default RoutesComponent;
