"use client";

import { PostCard } from "@/components/post-card";
import { PostDetailModal } from "@/components/post-detail-modal";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Page() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const mappedPosts = data.map((item: any) => ({
          id: item.id,
          content: item.content,
          mood: item.mood,
          nickname: "Anonim",
          repliesCount: item.replies_count || 0,
          createdAt: new Date(item.created_at),
        }));
        setPosts(mappedPosts);
      }
    } catch (err) {
      console.error("Gönderiler çekilirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const handlePostCreated = () => {
      fetchPosts();
    };

    window.addEventListener("postCreated", handlePostCreated);
    return () => window.removeEventListener("postCreated", handlePostCreated);
  }, []);

  return (
    <div>
      <div className="relative min-h-screen w-full flex flex-col items-center">
        <header className="relative z-10 w-full pt-16 pb-12 px-4 sm:px-6">
          <div className="w-full max-w-5xl mx-auto text-center animate-float flex flex-col items-center">
            <div className="relative w-24 h-24 mb-6 rounded-full overflow-hidden shadow-[0_0_20px_rgba(45,212,191,0.3)] border border-white/10 ring-2 ring-white/5">
              <img src="/logo.png" alt="AyAltı Logo" className="object-cover w-full h-full" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-premium mb-4 tracking-tight drop-shadow-sm">
              Uykusuz Değilsin
            </h1>
            <p className="text-gray-300 text-base md:text-lg font-medium tracking-wide">
              Uykuyu Unutmuş Bir İnsana İyi Geceler Diyemezsin
            </p>
          </div>
        </header>

        <main className="relative z-10 w-full pb-32 px-4 sm:px-6">
          {loading ? (
            <div className="w-full max-w-5xl mx-auto text-center py-20 text-[--teal-accent] flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-indigo-500/30 border-t-teal-400 rounded-full animate-spin border-4" />
              <span className="animate-pulse-soft font-medium">Dertler yükleniyor...</span>
            </div>
          ) : posts.length > 0 ? (
            <div className="w-full max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="break-inside-avoid">
                  <PostCard {...post} onClick={() => setSelectedPost(post)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto text-center py-24 glass-card rounded-3xl">
              <p className="text-xl font-medium text-white mb-2">Henüz hiçbir dert girilmemiş.</p>
              <p className="text-gray-400">İlk içini döken sen ol!</p>
            </div>
          )}
        </main>
      </div>

      <PostDetailModal 
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
      />
    </div>
  );
}
