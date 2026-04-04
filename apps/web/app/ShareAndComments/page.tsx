"use client";

import { MessageCircle, Clock, MoreHorizontal, PieChart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, getAuthorId } from "../../lib/supabase";
import { PostDetailModal } from "@/components/post-detail-modal";
import { PollCard } from "@/components/poll-card";

export default function ShareAndCommentsPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "polls">("posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const fetchMyPosts = async () => {
    try {
      const authorId = getAuthorId();
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", authorId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      if (data) {
        setPosts(data.map((item: any) => ({
          id: item.id,
          content: item.content,
          mood: item.mood,
          nickname: "Anonim",
          repliesCount: item.replies_count || 0,
          createdAt: new Date(item.created_at),
        })));
      }
    } catch (err) {
      console.error("Gönderiler çekilirken hata:", err);
    }
  };

  const fetchMyComments = async () => {
    try {
      const authorId = getAuthorId();
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("author_id", authorId)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      if (data) {
        setComments(data.map((item: any) => ({
          id: item.id,
          content: item.content,
          postId: item.post_id,
          createdAt: new Date(item.created_at),
        })));
      }
    } catch (err) {
      console.error("Yorumlar çekilirken hata:", err);
    }
  };

  const fetchMyPolls = async () => {
    try {
      const authorId = getAuthorId();
      const { data, error } = await supabase
        .from("polls")
        .select(`*, poll_options(*), poll_votes(id, author_id)`)
        .eq("author_id", authorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setPolls(data.map((item: any) => ({
          id: item.id,
          question: item.question,
          totalVotes: item.total_votes || 0,
          options: item.poll_options || [],
          hasVotedProp: item.poll_votes?.some((v: any) => v.author_id === authorId),
          createdAt: new Date(item.created_at),
        })));
      }
    } catch (err) {
      console.error("Anketlerim çekilirken hata:", err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchMyPosts(), fetchMyComments(), fetchMyPolls()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();

    const handleCreated = () => {
      loadAllData();
    };

    window.addEventListener("postCreated", handleCreated);
    window.addEventListener("pollCreated", handleCreated);
    return () => {
      window.removeEventListener("postCreated", handleCreated);
      window.removeEventListener("pollCreated", handleCreated);
    };
  }, []);

  const handleCommentClick = async (postId: string) => {
    try {
      const { data, error } = await supabase.from("posts").select("*").eq("id", postId).single();
      if (data) {
        setSelectedPost({
          id: data.id,
          content: data.content,
          mood: data.mood,
          nickname: "Anonim",
          repliesCount: data.replies_count || 0,
          createdAt: new Date(data.created_at),
        });
      }
    } catch (err) {
      console.error("Gönderi çekilemedi:", err);
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  return (
    <div>
      <div className="relative min-h-screen w-full flex flex-col items-center">
        <header className="relative z-10 w-full pt-16 pb-8 px-4 sm:px-6">
          <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="animate-float">
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-premium mb-2 tracking-tight">
                Paylaşımların ve Yorumların
              </h1>
              <p className="text-[#cbd5e1] text-[15px] font-medium tracking-wide">
                İçini döktüğün ve yanıtladığın her şey burada saklı.
              </p>
            </div>
            
            <div className="flex bg-white/5 glass-card border-none rounded-full p-1.5 self-start sm:self-center">
              <button
                onClick={() => setActiveTab("posts")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "posts" 
                    ? "bg-linear-to-r from-teal-500/20 to-indigo-500/20 text-white shadow-md border border-white/10" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Paylaşımlar <span className="opacity-70 text-xs ml-1">({posts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("comments")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "comments" 
                    ? "bg-linear-to-r from-teal-500/20 to-indigo-500/20 text-white shadow-md border border-white/10" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Yorumlar <span className="opacity-70 text-xs ml-1">({comments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("polls")}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "polls" 
                    ? "bg-linear-to-r from-teal-500/20 to-indigo-500/20 text-white shadow-md border border-white/10" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Anketler <span className="opacity-70 text-xs ml-1">({polls.length})</span>
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10 w-full pb-32 pt-8 px-4 sm:px-6">
          {loading ? (
            <div className="w-full max-w-4xl mx-auto text-center py-20 text-[--teal-accent] flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-indigo-500/30 border-t-teal-400 rounded-full animate-spin border-4" />
              <span className="animate-pulse-soft font-medium">Yükleniyor...</span>
            </div>
          ) : activeTab === "posts" ? (
            posts.length > 0 ? (
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 text-left">
                {posts.map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => setSelectedPost(post)}
                    className="group relative glass-card rounded-2xl p-5 sm:p-7 
                               flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start 
                               transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-teal-500/30 via-indigo-500/50 to-transparent group-hover:from-teal-400 group-hover:via-indigo-400 transition-all duration-300" />
                    
                    <div className="flex-1 min-w-0 w-full pl-2">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {post.mood && (
                          <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#334155]/50 border border-[#475569]/30 text-[#e2e8f0]">
                            {post.mood}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-[12.5px] text-[#64748b] ml-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{getTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      
                      <p className="text-[#cbd5e1] leading-[1.65] whitespace-pre-wrap break-all text-[14.5px] font-normal tracking-[0.015em] sm:line-clamp-3">
                        {post.content}
                      </p>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-(--border-subtle) sm:border-none pt-3 sm:pt-0 mt-2 sm:mt-0">
                      <div className="flex items-center gap-2 sm:bg-black/20 sm:border sm:border-white/5 sm:px-3 sm:py-2 rounded-xl text-[#94a3b8] group-hover:text-white transition-colors duration-200">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-[13px] font-medium">{post.repliesCount} Yanıt</span>
                      </div>
                      
                      <div className="hidden sm:flex mt-3 p-1.5 rounded-full hover:bg-white/10 text-[#64748b] transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto text-center py-20 glass-card rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/10 glow">
                  <MoreHorizontal className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Henüz Bir Şey Paylaşmadın</h3>
                <p className="text-gray-400 text-[15px] max-w-md mx-auto leading-relaxed">
                  Ana sayfadaki paylaş menüsünü kullanarak içini döktüğün her şey burada listelenecek.
                </p>
              </div>
            )
          ) : activeTab === "comments" ? (
            comments.length > 0 ? (
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-5 text-left">
                {comments.map((comment) => (
                  <div 
                    key={comment.id} 
                    onClick={() => handleCommentClick(comment.postId)}
                    className="group relative glass-card rounded-2xl p-5 sm:p-7 
                               flex flex-col gap-3 
                               transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-indigo-500/30 via-teal-500/50 to-transparent group-hover:from-indigo-400 group-hover:via-teal-400 transition-all duration-300" />
                    
                    <div className="flex items-center gap-2 text-[12.5px] text-[#64748b] mb-1 pl-2">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{getTimeAgo(comment.createdAt)}</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/5 text-[10px] uppercase tracking-wider text-[#cbd5e1]">Gönderiyi Gör</span>
                    </div>
                    
                    <p className="text-[#cbd5e1] leading-[1.65] whitespace-pre-wrap break-all text-[14.5px] font-normal tracking-[0.015em] pl-2">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto text-center py-20 glass-card rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/10 glow">
                  <MessageCircle className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Henüz Kimseye Yorum Yapmadın</h3>
                <p className="text-gray-400 text-[15px] max-w-md mx-auto leading-relaxed">
                  Ana sayfadaki gönderilere tıklayarak fikirlerini anonim olarak paylaşabilirsin.
                </p>
              </div>
            )
          ) : activeTab === "polls" ? (
            polls.length > 0 ? (
              <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 text-left">
                {polls.map((poll) => (
                  <PollCard key={poll.id} {...poll} onVote={() => {}} />
                ))}
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto text-center py-20 glass-card rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/10 glow">
                  <PieChart className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Henüz Bir Anket Başlatmadın</h3>
                <p className="text-gray-400 text-[15px] max-w-md mx-auto leading-relaxed">
                  Anketler sayfasından veya alt menüdeki oluştur butonunu kullanarak ilk anketini oluşturabilirsin.
                </p>
              </div>
            )
          ) : null}
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