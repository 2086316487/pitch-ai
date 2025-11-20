import React from 'react';

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description, color }) => {
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-500`}></div>
      <div className="relative h-full p-8 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col items-center text-center hover:transform hover:-translate-y-1 transition-all duration-300">
        <div className="mb-4 p-3 bg-white/5 rounded-xl text-white ring-1 ring-white/10">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
