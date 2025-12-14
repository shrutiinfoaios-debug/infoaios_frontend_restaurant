export const CallGirlAvatar = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-visible">
      <div className="relative w-full max-w-[280px] aspect-square">
        {/* Background Blob */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 dark:from-pink-900/20 dark:via-rose-900/20 dark:to-orange-900/20 rounded-[45%_55%_60%_40%/50%_60%_40%_50%] animate-blob-morph"></div>
        </div>

        {/* Main Character Container */}
        <div className="relative w-full h-full flex items-center justify-center">
          
          {/* Girl Character */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[20%] z-20">
            {/* Head with better proportions */}
            <div className="relative animate-phone-tilt">
              {/* Face - More oval shape */}
              <div className="w-20 h-24 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900 rounded-[50%_50%_48%_48%] relative">
                {/* Hair - Top bun/ponytail */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-200 dark:to-slate-300 rounded-[50%_50%_45%_45%] z-10"></div>
                
                {/* Side Ponytail */}
                <div className="absolute top-0 right-0 z-20">
                  <div className="w-8 h-14 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-200 dark:to-slate-300 rounded-[60%_40%_50%_50%] rotate-12 animate-ponytail-sway origin-top"></div>
                  {/* Hair Tie */}
                  <div className="absolute top-1 left-1 w-4 h-2.5 bg-gradient-to-r from-rose-400 to-rose-500 dark:from-rose-600 dark:to-rose-700 rounded-full"></div>
                </div>

                {/* Eyes - closed/content look */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-30">
                  <div className="w-5 h-1.5 bg-slate-800 dark:bg-slate-200 rounded-full"></div>
                  <div className="w-5 h-1.5 bg-slate-800 dark:bg-slate-200 rounded-full"></div>
                </div>

                {/* Nose */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1 h-1.5 bg-amber-300 dark:bg-amber-700 rounded-full opacity-40"></div>

                {/* Smiling Mouth - talking animation */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 w-3 h-2 border-b-2 border-slate-800 dark:border-slate-200 rounded-b-full animate-mouth-talk"></div>

                {/* Blush */}
                <div className="absolute top-10 left-1 w-3 h-2 bg-rose-300 dark:bg-rose-800 rounded-full opacity-50"></div>
                <div className="absolute top-10 right-1 w-3 h-2 bg-rose-300 dark:bg-rose-800 rounded-full opacity-50"></div>
              </div>

              {/* Body - Striped Shirt */}
              <div className="relative mt-1">
                {/* Torso with Stripes */}
                <div className="w-24 h-16 bg-white dark:bg-slate-100 rounded-t-2xl overflow-hidden relative">
                  {/* Horizontal Red Stripes */}
                  <div className="absolute top-1 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-rose-500 dark:from-rose-600 dark:to-rose-700"></div>
                  <div className="absolute top-5 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-rose-500 dark:from-rose-600 dark:to-rose-700"></div>
                  <div className="absolute top-9 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-rose-500 dark:from-rose-600 dark:to-rose-700"></div>
                  <div className="absolute top-13 left-0 right-0 h-2 bg-gradient-to-r from-rose-400 to-rose-500 dark:from-rose-600 dark:to-rose-700"></div>
                </div>

                {/* Left Arm - Resting */}
                <div className="absolute left-[-6px] top-3 w-5 h-12 bg-gradient-to-b from-white to-rose-50 dark:from-slate-100 dark:to-rose-100 rounded-full rotate-[-10deg] overflow-hidden origin-top">
                  {/* Stripe on arm */}
                  <div className="absolute top-2 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-rose-500 dark:from-rose-600 dark:to-rose-700"></div>
                  {/* Hand */}
                  <div className="absolute bottom-0 left-0 w-4 h-4 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900 rounded-full"></div>
                </div>

                {/* Right Arm - Holding Phone to ear */}
                <div className="absolute right-[-6px] top-3 w-5 h-12 bg-gradient-to-b from-white to-rose-50 dark:from-slate-100 dark:to-rose-100 rounded-full rotate-[40deg] overflow-hidden origin-top">
                  {/* Stripe on arm */}
                  <div className="absolute top-2 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 to-rose-500 dark:from-rose-600 dark:to-rose-700"></div>
                  {/* Hand */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-800 dark:to-amber-900 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Phone held to ear with ringing animation */}
            <div className="absolute top-6 right-[-8px] z-30 animate-phone-ring">
              <div className="relative w-7 h-12 bg-gradient-to-b from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-lg border-2 border-blue-700 dark:border-blue-300 shadow-lg rotate-12">
                {/* Phone Screen glow */}
                <div className="absolute inset-0.5 bg-gradient-to-b from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-800 rounded-md">
                  {/* Call indicator - pulsing */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <div className="w-0.5 h-1 bg-green-400 dark:bg-green-300 rounded-full animate-pulse"></div>
                    <div className="w-0.5 h-1.5 bg-green-400 dark:bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-0.5 h-1 bg-green-400 dark:bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
                {/* Ringing waves */}
                <div className="absolute -top-1 -right-1 w-3 h-3 border-2 border-blue-400 dark:border-blue-300 rounded-full animate-ping"></div>
              </div>
            </div>

            {/* Laptop in front */}
            <div className="absolute top-[70px] left-1/2 -translate-x-1/2 z-10">
              {/* Laptop base */}
              <div className="relative w-20 h-10 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-t-lg border-2 border-slate-400 dark:border-slate-500 shadow-lg" style={{ transform: 'perspective(150px) rotateX(45deg)' }}>
                {/* Keyboard */}
                <div className="absolute inset-1 grid grid-cols-8 gap-0.5">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-[1px]"></div>
                  ))}
                </div>
              </div>
              {/* Laptop screen */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-18 h-12 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-200 dark:to-slate-300 rounded-lg border-2 border-slate-700 dark:border-slate-400 shadow-lg">
                {/* Screen content */}
                <div className="absolute inset-1 bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-300 dark:from-blue-600 dark:via-cyan-700 dark:to-blue-700 rounded-md overflow-hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 p-1">
                    <div className="w-6 h-0.5 bg-white/40 dark:bg-white/20 rounded-full"></div>
                    <div className="w-5 h-0.5 bg-white/40 dark:bg-white/20 rounded-full"></div>
                    <div className="w-6 h-0.5 bg-white/40 dark:bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Chat Bubbles - Restaurant conversation */}
          <div className="absolute top-[8%] left-[5%] z-25 animate-chat-bubble-1">
            <div className="relative bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-2.5 py-1.5 rounded-lg rounded-tl-none shadow-lg max-w-[85px]">
              <p className="text-[7px] font-medium leading-tight">Taking customer call...</p>
              <div className="absolute top-0 left-0 w-0 h-0 border-r-[6px] border-r-slate-800 dark:border-r-slate-200 border-b-[6px] border-b-transparent"></div>
            </div>
          </div>

          <div className="absolute top-[5%] right-[2%] z-24 animate-chat-bubble-2">
            <div className="relative bg-primary text-primary-foreground px-2.5 py-1.5 rounded-lg rounded-tr-none shadow-lg max-w-[70px]">
              <p className="text-[7px] font-medium leading-tight">AI: How can I help?</p>
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[6px] border-l-primary border-b-[6px] border-b-transparent"></div>
            </div>
          </div>

          <div className="absolute top-[22%] right-[8%] z-23 animate-chat-bubble-3">
            <div className="relative bg-rose-500 dark:bg-rose-600 text-white px-2.5 py-1 rounded-lg rounded-tr-none shadow-md max-w-[65px]">
              <p className="text-[6px] leading-tight">Table booking?</p>
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[5px] border-l-rose-500 dark:border-l-rose-600 border-b-[5px] border-b-transparent"></div>
            </div>
          </div>

          {/* Desk surface */}
          <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[95%] h-2 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-full shadow-xl z-5"></div>
        </div>

        {/* Floating Restaurant Icons */}
        <div className="absolute top-[15%] right-[2%] text-xl animate-float-icon-1">
          🍕
        </div>
        <div className="absolute bottom-[25%] left-[2%] text-lg animate-float-icon-2">
          ☕
        </div>
        <div className="absolute top-[25%] left-[5%] text-base animate-float-icon-3">
          🍔
        </div>
      </div>

      <style>{`
        @keyframes blob-morph {
          0%, 100% {
            border-radius: 45% 55% 60% 40% / 50% 60% 40% 50%;
          }
          25% {
            border-radius: 55% 45% 40% 60% / 60% 50% 60% 40%;
          }
          50% {
            border-radius: 50% 50% 50% 50% / 45% 55% 45% 55%;
          }
          75% {
            border-radius: 40% 60% 55% 45% / 55% 45% 55% 45%;
          }
        }

        @keyframes float-scene {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes float-tooltip {
          0%, 100% {
            transform: translate(-50%, 0px);
          }
          50% {
            transform: translate(-50%, -3px);
          }
        }

        @keyframes ponytail-sway {
          0%, 100% {
            transform: rotate(12deg);
          }
          50% {
            transform: rotate(8deg);
          }
        }

        @keyframes blink-eyes {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes phone-tilt {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-2deg);
          }
        }

        @keyframes phone-wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-3deg);
          }
        }

        @keyframes mouth-talk {
          0%, 100% {
            transform: translate(-50%, 0) scaleY(1);
          }
          50% {
            transform: translate(-50%, 0) scaleY(0.7);
          }
        }

        @keyframes chat-bubble-1 {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          20%, 80% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-5px) scale(0.9);
          }
        }

        @keyframes phone-ring {
          0%, 100% {
            transform: rotate(12deg);
          }
          25% {
            transform: rotate(8deg) translateX(-1px);
          }
          75% {
            transform: rotate(16deg) translateX(1px);
          }
        }

        @keyframes chat-bubble-3 {
          0%, 40% {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          60%, 95% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-5px) scale(0.9);
          }
        }

        .animate-phone-ring {
          animation: phone-ring 1s ease-in-out infinite;
        }

        .animate-chat-bubble-3 {
          animation: chat-bubble-3 5s ease-in-out infinite 1s;
        }

        @keyframes float-icon-1 {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes float-icon-2 {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-12px) rotate(-5deg);
          }
        }

        @keyframes float-icon-3 {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.1);
          }
        }

        .animate-blob-morph {
          animation: blob-morph 8s ease-in-out infinite;
        }

        .animate-float-scene {
          animation: float-scene 3s ease-in-out infinite;
        }

        .animate-float-tooltip {
          animation: float-tooltip 2s ease-in-out infinite;
        }

        .animate-ponytail-sway {
          animation: ponytail-sway 2s ease-in-out infinite;
        }

        .animate-blink-eyes {
          animation: blink-eyes 4s ease-in-out infinite;
        }

        .animate-phone-tilt {
          animation: phone-tilt 2s ease-in-out infinite;
        }

        .animate-phone-wave {
          animation: phone-wave 1.5s ease-in-out infinite;
        }

        .animate-mouth-talk {
          animation: mouth-talk 0.8s ease-in-out infinite;
        }

        .animate-chat-bubble-1 {
          animation: chat-bubble-1 4s ease-in-out infinite;
        }

        .animate-chat-bubble-2 {
          animation: chat-bubble-2 4s ease-in-out infinite 0.5s;
        }

        .animate-float-icon-1 {
          animation: float-icon-1 3s ease-in-out infinite;
        }

        .animate-float-icon-2 {
          animation: float-icon-2 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .animate-float-icon-3 {
          animation: float-icon-3 2.8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .clip-path-vneck {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
};
