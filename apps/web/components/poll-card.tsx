"use client";

import { useState } from "react";
import { supabase, getAuthorId } from "../lib/supabase";

interface PollOption {
  id: string;
  option_text: string;
  votes_count: number;
}

interface PollCardProps {
  id: string;
  question: string;
  totalVotes: number;
  options: PollOption[];
  hasVotedProp: boolean;
  onVote: (pollId: string, optionId: string) => void;
}

export function PollCard({ id, question, totalVotes: initialTotalVotes, options, hasVotedProp, onVote }: PollCardProps) {
  const [hasVoted, setHasVoted] = useState(hasVotedProp);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [localOptions, setLocalOptions] = useState(options);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    const author_id = getAuthorId();

    const { error } = await supabase
      .from("poll_votes")
      .insert([{ poll_id: id, option_id: optionId, author_id }]);

    setIsVoting(false);

    if (error) {
      console.error("Oy verme hatası:", error);
      alert("Oy verilirken bir hata oluştu.");
      return;
    }

    setHasVoted(true);
    setTotalVotes((prev) => prev + 1);
    setLocalOptions((prev) =>
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, votes_count: opt.votes_count + 1 } : opt
      )
    );
    onVote(id, optionId);
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-[var(--border-strong)] transition-all duration-300">
      <h3 className="text-[var(--text-primary)] font-medium text-lg leading-snug mb-4">
        {question}
      </h3>

      <div className="space-y-3">
        {localOptions.map((opt) => {
          const percentage = totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted}
              className={`relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all ${
                hasVoted 
                  ? "border-[var(--border-subtle)] bg-[var(--bg-midnight)]/30 cursor-default" 
                  : "border-[var(--border-subtle)] hover:border-[var(--accent-moon)]/50 hover:bg-[var(--bg-midnight)]/50 cursor-pointer"
              }`}
            >
              {hasVoted && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-[var(--accent-moon)]/20 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative z-10 flex justify-between items-center text-sm">
                <span className={`font-medium ${hasVoted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                  {opt.option_text}
                </span>
                {hasVoted && (
                  <span className="text-[var(--text-muted)] text-xs font-semibold">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-[var(--text-muted)] flex items-center justify-between">
        <span>{totalVotes} Oy</span>
        {hasVoted && <span className="text-[var(--accent-moon)] font-medium">Oy kullandın</span>}
      </div>
    </div>
  );
}
