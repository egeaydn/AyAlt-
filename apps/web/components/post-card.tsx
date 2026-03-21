"use client";

import { MessageCircle } from "lucide-react";

export interface PostCardProps {
  id: string;
  content: string;
  mood?: string;
  nickname: string;
  repliesCount: number;
  createdAt: Date;
}

export function PostCard({ id, content, repliesCount, createdAt }: PostCardProps) {
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
      className="group relative bg-(--bg-card) rounded-[18px] p-5 
                 border border-(--border-subtle) hover:bg-(--bg-card-hover) w-full h-full
                 transition-colors duration-300 cursor-pointer flex flex-col"
      onClick={() => window.location.href = `/post/${id}`}
    >
      <div className="mb-5 flex-1">
        <p className="text-[#cbd5e1] leading-[1.6] whitespace-pre-wrap text-[14px] font-normal tracking-[0.015em]">
          {content}
        </p>
      </div>

      <div className="flex items-center justify-between text-[#64748b] text-[12px] mt-auto font-medium">
        <span>{getTimeAgo(createdAt)}</span>
        
        <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
          <MessageCircle className="w-[14px] h-[14px] stroke-[2px]" />
          {repliesCount > 0 && <span>{repliesCount}</span>}
        </div>
      </div>
    </div>
  );
}
