import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MakerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-pink-500 to-rose-500"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">表情包制作</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-3">选择模板制作你的专属表情包</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">😊</div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">选择模板开始制作</p>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
              {['😊', '😂', '🤔', '😎', '🥳', '😭', '🤗', '😡', '😱', '🥰', '😴', '🤮'].map((emoji, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-3xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">500+</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">热门表情</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">50+</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">精选模板</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">10万+</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">每日创作</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">免费</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">无广告</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
