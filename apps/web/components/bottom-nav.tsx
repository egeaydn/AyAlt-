"use client";

import { Home, Plus, Shuffle } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BottomNav({ onOpenShareAction }: { onOpenShareAction: () => void }) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = [
    { name: "Akış", path: "/", icon: Home },
    { name: "Paylaş", action: onOpenShareAction, icon: Plus },
    { name: "Rastgele", path: "/random", icon: Shuffle }
  ];

  useEffect(() => {
    if (pathname === '/random') setActiveIndex(2);
    else if (pathname === '/') setActiveIndex(0);
  }, [pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
      <div className="mx-auto flex justify-center pb-8 px-4 w-full">
        <div className="relative flex items-center bg-[#0d0f14]/80 backdrop-blur-2xl p-1.5 rounded-full border border-white/5 shadow-2xl pointer-events-auto">
          
          {/* Sliding target background */}
          <div 
            className="absolute top-1.5 bottom-1.5 w-[110px] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <div className="w-full h-full bg-white/8 rounded-full" />
          </div>

          {tabs.map((tab, idx) => {
            const isActive = activeIndex === idx;
            const content = (
              <>
                <tab.icon className="w-4 h-4" />
                <span className="text-[13.5px] font-medium tracking-wide">{tab.name}</span>
              </>
            );
            
            const className = `relative z-10 flex items-center justify-center gap-2 w-[110px] h-[44px] rounded-full transition-colors duration-300 ${
              isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`;

            if (tab.action) {
              return (
                <button key={tab.name} onClick={tab.action} className={className}>
                  {content}
                </button>
              );
            }

            return (
              <Link key={tab.name} href={tab.path!} onClick={() => setActiveIndex(idx)} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
