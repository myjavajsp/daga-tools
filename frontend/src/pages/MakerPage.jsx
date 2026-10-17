import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MakerPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />
      <main className="wrap py-8">
        {/* Page Header */}
        <div className="phead">
          <h1>表情包制作</h1>
          <span className="note">选择模板制作你的专属表情包</span>
        </div>

        {/* Content */}
        <div className="card p-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">😊</div>
            <p className="text-ink-2 mb-6">选择模板开始制作</p>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
              {['😊', '😂', '🤔', '😎', '🥳', '😭', '🤗', '😡', '😱', '🥰', '😴', '🤮'].map((emoji, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-paper rounded-card flex items-center justify-center text-3xl hover:bg-surface-2 cursor-pointer transition-colors"
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-surface rounded-card p-4 border border-line text-center">
            <div className="text-2xl font-bold text-accent">500+</div>
            <div className="text-xs text-ink-3 mt-1">热门表情</div>
          </div>
          <div className="bg-surface rounded-card p-4 border border-line text-center">
            <div className="text-2xl font-bold text-accent">50+</div>
            <div className="text-xs text-ink-3 mt-1">精选模板</div>
          </div>
          <div className="bg-surface rounded-card p-4 border border-line text-center">
            <div className="text-2xl font-bold text-accent">10万+</div>
            <div className="text-xs text-ink-3 mt-1">每日创作</div>
          </div>
          <div className="bg-surface rounded-card p-4 border border-line text-center">
            <div className="text-2xl font-bold text-success">免费</div>
            <div className="text-xs text-ink-3 mt-1">无广告</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
