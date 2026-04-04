"use client";

import { useEffect, useState } from "react";
import { supabase, getAuthorId } from "../../lib/supabase";
import { PollCard } from "@/components/poll-card";
import { CreatePollModal } from "@/components/create-poll-modal";
import { Plus } from "lucide-react";

export default function PollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const author_id = getAuthorId();

      // Anketleri çek
      const { data: pollsData, error: pollsError } = await supabase
        .from("polls")
        .select(`
          *,
          poll_options (*),
          poll_votes (id, author_id)
        `)
        .order("created_at", { ascending: false });
        
      if (pollsError) throw pollsError;
      
      if (pollsData) {
        const mappedPolls = pollsData.map((item: any) => {
          const userVoted = item.poll_votes?.some((v: any) => v.author_id === author_id);
          return {
            id: item.id,
            question: item.question,
            totalVotes: item.total_votes || 0,
            options: item.poll_options || [],
            hasVotedProp: userVoted,
            createdAt: new Date(item.created_at),
          };
        });
        setPolls(mappedPolls);
      }
    } catch (err: any) {
      console.error("Anketler çekilirken hata:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();

    const handlePollCreated = () => {
      fetchPolls();
    };

    window.addEventListener("pollCreated", handlePollCreated);
    return () => window.removeEventListener("pollCreated", handlePollCreated);
  }, []);

  return (
    <div>
      <div className="relative min-h-screen w-full flex flex-col items-center">
        <header className="relative z-10 w-full pt-16 pb-10 px-4 sm:px-6">
          <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="animate-float">
              <h1 className="text-4xl sm:text-5xl font-bold text-gradient-premium mb-3 tracking-tight">
                Topluluk Anketleri
              </h1>
              <p className="text-[#cbd5e1] text-[15px] font-medium tracking-wide">
                Düşünceni belirt, kalabalığın nabzını tut.
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 glass-card hover:scale-105 text-[--teal-accent] px-5 py-3 rounded-2xl transition-all duration-300 font-semibold text-sm shadow-lg shadow-teal-500/10 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Anket Oluştur</span>
            </button>
          </div>
        </header>

        <main className="relative z-10 w-full pb-32 px-4 sm:px-6">
          {loading ? (
            <div className="w-full max-w-5xl mx-auto text-center py-20 text-[--teal-accent] flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-indigo-500/30 border-t-teal-400 rounded-full animate-spin border-4" />
              <span className="animate-pulse-soft font-medium">Anketler yükleniyor...</span>
            </div>
          ) : polls.length > 0 ? (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  {...poll}
                  onVote={() => {}} 
                />
              ))}
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto text-center py-20 text-white/50 glass-card rounded-2xl">
              <p className="text-lg font-medium">Henüz hiçbir anket açılmamış.</p>
              <p className="mt-2 text-sm">İlk soran sen ol!</p>
            </div>
          )}
        </main>
      </div>

      <CreatePollModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
