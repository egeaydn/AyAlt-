"use client";

import { MessageCircle } from "lucide-react";

export interface PostCardProps {
  id: string;
  content: string;
  mood?: string;
  nickname: string;
  repliesCount: number;
  createdAt: Date;
  onClick?: () => void;
}

export function PostCard({ id, content, repliesCount, createdAt, onClick }: PostCardProps) {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}dk önce`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}s önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}g önce`;
  };

  return (
    <div 
      className="group relative glass-card rounded-[22px] p-6 overflow-hidden w-full
                 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/10 cursor-pointer flex flex-col"
      onClick={onClick || (() => window.location.href = `/post/${id}`)}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-teal-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="mb-5 flex-1 relative z-10">
        <p className="text-gray-200 leading-[1.7] whitespace-pre-wrap wrap-break-word text-[15px] font-normal tracking-[0.015em] line-clamp-6 group-hover:text-white transition-colors duration-300">
          {content}
        </p>
      </div>

      <div className="flex items-center justify-between text-gray-500 text-[13px] mt-auto font-medium relative z-10 border-t border-white/5 pt-3">
        <span className="group-hover:text-gray-400 transition-colors">{getTimeAgo(createdAt)}</span>
        
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 group-hover:text-teal-400 transition-all duration-300">
          <MessageCircle className="w-[15px] h-[15px] stroke-[2px]" />
          {repliesCount > 0 && <span>{repliesCount}</span>}
        </div>
      </div>
    </div>
  );
}
