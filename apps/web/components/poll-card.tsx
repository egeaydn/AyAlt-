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
    <div className="glass-card rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1">
      <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400 leading-snug mb-5">
        {question}
      </h3>

      <div className="space-y-3">
        {localOptions.map((opt) => {
          const percentage = totalVotes > 0 ? Math.round((opt.votes_count / totalVotes) * 100) : 0;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={hasVoted || isVoting}
              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                hasVoted 
                  ? "border-transparent bg-white/5 cursor-default" 
                  : "border-white/10 hover:border-teal-400/50 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(45,212,191,0.2)] cursor-pointer group"
              }`}
            >
              {hasVoted && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-teal-500/30 to-indigo-500/30 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              <div className="relative z-10 flex justify-between items-center text-[15px]">
                <span className={`font-medium transition-colors ${
                  hasVoted ? 'text-gray-300' : 'text-gray-100 group-hover:text-white'
                }`}>
                  {opt.option_text}
                </span>
                {hasVoted && (
                  <span className="text-teal-300 font-bold tracking-wide">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 text-sm flex items-center justify-between">
        <span className="text-gray-400">{totalVotes} Oy</span>
        {hasVoted && <span className="text-teal-400 font-medium py-1 px-3 bg-teal-400/10 rounded-full text-xs">Oy kullandın</span>}
      </div>
    </div>
  );
}
