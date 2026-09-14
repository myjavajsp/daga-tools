import React from 'react';
import { Routes, Route } from 'react-router-dom';

// 前台页面
import HomePage from './pages/HomePage';
import MusicPage from './pages/MusicPage';
import MemePage from './pages/MemePage';
import MakerPage from './pages/MakerPage';
import HotPage from './pages/HotPage';
import MbtiTestPage from './pages/MbtiTestPage';
import ToolsPage from './pages/ToolsPage';
import ToolDetailPage from './pages/ToolDetailPage';
import VideoParserPage from './pages/VideoParserPage';
import AIToolsPage from './pages/AIToolsPage';
import ScreenRecorderPage from './pages/ScreenRecorderPage';
import AboutPage from './pages/AboutPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import RecommendPage from './pages/RecommendPage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import M3u8PlayerPage from './pages/M3u8PlayerPage';
import Mp4PlayerPage from './pages/Mp4PlayerPage';
import TestsPage from './pages/TestsPage';
import MemesPage from './pages/MemesPage';
import VisitorsPage from './pages/VisitorsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import ClickEventsPage from './pages/ClickEventsPage';
import ParseRecordsPage from './pages/ParseRecordsPage';
import M3u8RecordsPage from './pages/M3u8RecordsPage';
import ToolUsagePage from './pages/ToolUsagePage';
import PushPage from './pages/PushPage';
import CategoriesPage from './pages/CategoriesPage';
import MonitorPage from './pages/MonitorPage';
import ArticlesManagePage from './pages/ArticlesManagePage';
import NotFoundPage from './pages/NotFoundPage';

// 后台页面
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import InterfacesManage from './pages/admin/InterfacesManage';
import AdsManage from './pages/admin/AdsManage';
import LinksManage from './pages/admin/LinksManage';
import SettingsManage from './pages/admin/SettingsManage';
import GuideManage from './pages/admin/GuideManage';
import FaqManage from './pages/admin/FaqManage';

export default function App() {
  return (
    <Routes>
      {/* 前台页面 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/meme" element={<MemePage />} />
      <Route path="/maker" element={<MakerPage />} />
      <Route path="/parser" element={<VideoParserPage />} />
      <Route path="/m3u8" element={<M3u8PlayerPage />} />
      <Route path="/mp4" element={<Mp4PlayerPage />} />
      <Route path="/hot" element={<HotPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="/tools/:toolKey" element={<ToolDetailPage />} />
      <Route path="/screen-recorder" element={<ScreenRecorderPage />} />
      <Route path="/ai" element={<AIToolsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/recommend" element={<RecommendPage />} />
      <Route path="/recommend/:slug" element={<RecommendPage />} />
      <Route path="/article/:slug" element={<ArticleDetailPage />} />
      <Route path="/articles" element={<ArticleListPage />} />
      <Route path="/mbti" element={<MbtiTestPage />} />
      <Route path="/mbti/:type" element={<MbtiTestPage />} />
      <Route path="/tests" element={<TestsPage />} />
      <Route path="/tests/:slug" element={<TestsPage />} />
      <Route path="/tests/:slug/:code" element={<TestsPage />} />
      <Route path="/memes" element={<MemesPage />} />
      <Route path="/visitors" element={<VisitorsPage />} />
      <Route path="/submissions" element={<SubmissionsPage />} />
      <Route path="/click-events" element={<ClickEventsPage />} />
      <Route path="/parse-records" element={<ParseRecordsPage />} />
      <Route path="/m3u8-records" element={<M3u8RecordsPage />} />
      <Route path="/tool-usage" element={<ToolUsagePage />} />
      <Route path="/push" element={<PushPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/monitor" element={<MonitorPage />} />
      <Route path="/articles-manage" element={<ArticlesManagePage />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />

      {/* 后台登录 */}
      <Route path="/6n1x5ltwujr5/login" element={<AdminLogin />} />

      {/* 后台管理 */}
      <Route path="/6n1x5ltwujr5" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="interfaces" element={<InterfacesManage />} />
        <Route path="ads" element={<AdsManage />} />
        <Route path="links" element={<LinksManage />} />
        <Route path="settings" element={<SettingsManage />} />
        <Route path="guide" element={<GuideManage />} />
        <Route path="faq" element={<FaqManage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="submissions" element={<SubmissionsPage />} />
        <Route path="click-events" element={<ClickEventsPage />} />
        <Route path="parse-records" element={<ParseRecordsPage />} />
        <Route path="m3u8-records" element={<M3u8RecordsPage />} />
        <Route path="tool-usage" element={<ToolUsagePage />} />
        <Route path="push" element={<PushPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="monitor" element={<MonitorPage />} />
        <Route path="articles" element={<ArticlesManagePage />} />
      </Route>
    </Routes>
  );
}