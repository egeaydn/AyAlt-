"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase, getAuthorId } from "../lib/supabase";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePollModal({ isOpen, onClose }: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["Evet", "Hayır"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const handleUpdateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleShare = async () => {
    const validOptions = options.filter(opt => opt.trim() !== "");
    if (!question.trim() || validOptions.length < 2) return;
    
    setIsSubmitting(true);
    const author_id = getAuthorId();
    
    // 1. Anketi oluştur
    const { data: pollData, error: pollError } = await supabase
      .from("polls")
      .insert([{ question: question.trim(), author_id }])
      .select()
      .single();

    if (pollError || !pollData) {
      console.error("Anket oluşturma hatası:", pollError);
      alert("Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
      setIsSubmitting(false);
      return;
    }
    
    // 2. Seçenekleri oluştur
    const optionsToInsert = validOptions.map(opt => ({
      poll_id: pollData.id,
      option_text: opt.trim()
    }));

    const { error: optionsError } = await supabase
      .from("poll_options")
      .insert(optionsToInsert);

    setIsSubmitting(false);

    if (optionsError) {
      console.error("Seçenek oluşturma hatası:", optionsError);
    }
    
    // Formu temizle ve kapat
    setQuestion("");
    setOptions(["Evet", "Hayır"]);
    onClose();
    
    // Anket listesini yenile
    window.dispatchEvent(new Event("pollCreated"));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl mx-4 mb-24 sm:mb-0 bg-[var(--bg-card)] backdrop-blur-xl 
                      rounded-3xl border border-[var(--border-subtle)] shadow-[0_0_50px_rgba(125,211,252,0.2)]
                      animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
              Topluluğa Sor
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Anonim bir anket oluşturarak fikirleri al.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] 
                       hover:bg-[var(--bg-card-hover)] rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ne sormak istiyorsun?"
            className="w-full bg-[var(--bg-midnight)]/50 text-[var(--text-primary)] text-lg
                       placeholder:text-[var(--text-muted)] rounded-2xl p-4 border border-[var(--border-subtle)]
                       focus:border-[var(--accent-moon)]/50 focus:outline-none focus:ring-2 
                       focus:ring-[var(--accent-moon)]/20 transition-all font-medium"
          />

          <div>
            <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Seçenekler</p>
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    placeholder={`Seçenek ${idx + 1}`}
                    className="flex-1 bg-[var(--bg-midnight)]/50 text-[var(--text-primary)]
                               placeholder:text-[var(--text-muted)] rounded-xl p-3 text-sm border border-[var(--border-subtle)]
                               focus:border-[var(--accent-moon)]/50 focus:outline-none transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(idx)}
                      className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                onClick={handleAddOption}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                Seçenek Ekle
              </button>
            )}
          </div>

          <button
            onClick={handleShare}
            disabled={!question.trim() || options.filter(o => o.trim()).length < 2 || isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-[var(--accent-moon)] to-[var(--accent-glow)]
                       text-[var(--bg-midnight)] font-semibold rounded-2xl
                       shadow-[0_0_25px_rgba(125,211,252,0.3)] hover:shadow-[0_0_35px_rgba(125,211,252,0.4)]
                       hover:scale-[1.02] transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? "Oluşturuluyor..." : "Anket Başlat"}
          </button>
        </div>
      </div>
    </div>
  );
}
