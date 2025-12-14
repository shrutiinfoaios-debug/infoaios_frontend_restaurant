export const AIRobotAnimation = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center perspective-1000">
      <div className="robot-container animate-float">
        {/* Robot Head */}
        <div className="relative">
          {/* Main Head */}
          <div className="w-32 h-32 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-3xl shadow-2xl relative animate-pulse-glow border-4 border-primary-glow/30">
            {/* Eyes */}
            <div className="absolute top-8 left-6 flex gap-6">
              <div className="w-6 h-6 bg-white rounded-full shadow-lg animate-blink">
                <div className="w-3 h-3 bg-primary rounded-full absolute top-1.5 left-1.5 animate-eye-move"></div>
              </div>
              <div className="w-6 h-6 bg-white rounded-full shadow-lg animate-blink animation-delay-200">
                <div className="w-3 h-3 bg-primary rounded-full absolute top-1.5 left-1.5 animate-eye-move animation-delay-200"></div>
              </div>
            </div>
            
            {/* Antenna */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <div className="w-1.5 h-8 bg-gradient-to-t from-primary to-primary-glow rounded-full">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-glow rounded-full animate-ping"></div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-glow rounded-full"></div>
              </div>
            </div>

            {/* Mouth/Display */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-8 bg-white/90 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="flex gap-1">
                <div className="w-1.5 h-4 bg-primary rounded-full animate-wave"></div>
                <div className="w-1.5 h-6 bg-primary rounded-full animate-wave animation-delay-100"></div>
                <div className="w-1.5 h-5 bg-primary rounded-full animate-wave animation-delay-200"></div>
                <div className="w-1.5 h-7 bg-primary rounded-full animate-wave animation-delay-300"></div>
                <div className="w-1.5 h-4 bg-primary rounded-full animate-wave animation-delay-400"></div>
              </div>
            </div>
          </div>

          {/* Ears/Side panels */}
          <div className="absolute top-12 -left-4 w-3 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-l-xl shadow-lg"></div>
          <div className="absolute top-12 -right-4 w-3 h-12 bg-gradient-to-bl from-primary to-primary/70 rounded-r-xl shadow-lg"></div>
        </div>



        {/* Restaurant Elements */}
        <div className="absolute -right-8 top-4 animate-spin-slow">
          <div className="w-8 h-8 bg-gradient-to-br from-chart-2 to-chart-2/70 rounded-lg shadow-lg flex items-center justify-center text-xl">
            🍕
          </div>
        </div>
        
        <div className="absolute -left-8 top-8 animate-spin-slow animation-delay-500">
          <div className="w-8 h-8 bg-gradient-to-br from-chart-3 to-chart-3/70 rounded-lg shadow-lg flex items-center justify-center text-xl">
            🍔
          </div>
        </div>

        <div className="absolute -right-6 bottom-4 animate-bounce-slow">
          <div className="w-6 h-6 bg-gradient-to-br from-primary-glow to-primary rounded-full shadow-lg"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotateY(0deg);
          }
          50% {
            transform: translateY(-20px) rotateY(5deg);
          }
        }

        @keyframes blink {
          0%, 90%, 100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }

        @keyframes eye-move {
          0%, 100% {
            transform: translate(1.5px, 1.5px);
          }
          25% {
            transform: translate(2px, 1.5px);
          }
          50% {
            transform: translate(1.5px, 2px);
          }
          75% {
            transform: translate(1px, 1.5px);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.8);
          }
          50% {
            transform: scaleY(1.2);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.4), 0 0 40px rgba(255, 107, 53, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.3);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-blink {
          animation: blink 4s ease-in-out infinite;
        }

        .animate-eye-move {
          animation: eye-move 3s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};
