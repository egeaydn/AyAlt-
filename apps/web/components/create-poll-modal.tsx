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
      <div className="absolute inset-0 bg-black/60 shadow-none backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl mx-4 mb-24 sm:mb-0 glass-card
                      rounded-3xl shadow-[0_0_50px_rgba(45,212,191,0.15)]
                      animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
        
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400 mb-1">
              Topluluğa Sor
            </h2>
            <p className="text-[15px] text-gray-400">
              Anonim bir anket oluşturarak fikirleri al.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ne sormak istiyorsun?"
            className="w-full bg-black/20 text-white text-lg
                       placeholder:text-gray-500 rounded-2xl p-4 border border-white/10
                       focus:border-teal-500/50 focus:outline-none focus:ring-2 
                       focus:ring-teal-500/20 transition-all font-medium"
          />

          <div>
            <p className="text-sm text-gray-400 mb-3 font-medium">Seçenekler</p>
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdateOption(idx, e.target.value)}
                    placeholder={`Seçenek ${idx + 1}`}
                    className="flex-1 bg-black/20 text-white
                               placeholder:text-gray-500 rounded-xl p-3 text-[15px] border border-white/10
                               focus:border-teal-500/50 focus:outline-none transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(idx)}
                      className="p-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 5 && (
              <button
                onClick={handleAddOption}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-[15px] font-medium"
              >
                <Plus className="w-5 h-5" />
                Seçenek Ekle
              </button>
            )}
          </div>

          <button
            onClick={handleShare}
            disabled={!question.trim() || options.filter(o => o.trim()).length < 2 || isSubmitting}
            className="w-full py-4 bg-linear-to-r from-teal-500 to-indigo-500
                       text-white font-bold text-lg rounded-2xl
                       shadow-[0_0_25px_rgba(45,212,191,0.3)] hover:shadow-[0_0_35px_rgba(45,212,191,0.5)]
                       hover:scale-[1.02] transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
          >
            {isSubmitting ? "Oluşturuluyor..." : "Anket Başlat"}
          </button>
        </div>
      </div>
    </div>
  );
}
