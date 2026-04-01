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
        <header className="relative z-10 w-full pt-12 pb-8 px-6">
          <div className="w-full max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-white mb-2 tracking-wide opacity-90">
                Topluluk Anketleri
              </h1>
              <p className="text-[#94a3b8] text-[14px] font-medium tracking-wide">
                Düşünceni belirt, kalabalığın nabzını tut.
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--accent-moon)]/10 hover:bg-[var(--accent-moon)]/20 text-[var(--accent-moon)] px-4 py-2 rounded-xl transition-all font-medium text-sm border border-[var(--accent-moon)]/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Anket Oluştur</span>
            </button>
          </div>
        </header>

        <main className="relative z-10 w-full pb-32 px-6">
          {loading ? (
            <div className="w-full max-w-5xl mx-auto text-center py-10 opacity-60 text-white flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              Anketler yükleniyor...
            </div>
          ) : polls.length > 0 ? (
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
              {polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  {...poll}
                  onVote={() => {}} 
                />
              ))}
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto text-center py-10 opacity-60 text-white">
              Henüz hiçbir anket açılmamış. İlk soran sen ol!
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
