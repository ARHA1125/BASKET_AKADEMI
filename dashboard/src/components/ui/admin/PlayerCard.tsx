import { Users, Star } from 'lucide-react';
import Image from "next/image";

import { Stats } from '@/types/admin';

interface PlayerCardProps {
  name: string;
  position: string;
  ovr: string;
  rating?: number;
  stats?: Stats;
  image?: string;
  subtitle?: string;
  flagLabel?: string;
  size?: 'full' | 'medium' | 'mini';
  theme?: 'gold' | 'dark' | 'light';
}

export const PlayerCard = ({ name, position, ovr, rating = 0, image, subtitle, flagLabel = 'ID', size = 'full', theme = 'gold' }: PlayerCardProps) => {
    const themes = {
        gold: "from-yellow-100 via-yellow-50 to-yellow-200 border-yellow-400",
        dark: "from-slate-800 via-slate-700 to-slate-900 border-slate-600 text-white",
        light: "from-white via-gray-50 to-gray-100 border-gray-300 text-gray-800"
    };

    const sizeStyles = {
      full: {
        maxWidth: 'max-w-[240px]',
        padding: 'p-3',
        ovr: 'text-3xl',
        pos: 'text-xs',
        photo: 'w-28 h-28',
        icon: 48,
        title: 'text-lg',
        starSize: 20,
        flag: 'min-w-[32px] px-2 py-0.5 text-[10px]',
      },
      medium: {
        maxWidth: 'max-w-[180px]',
        padding: 'p-2.5',
        ovr: 'text-2xl',
        pos: 'text-[10px]',
        photo: 'w-20 h-20',
        icon: 36,
        title: 'text-sm',
        starSize: 16,
        flag: 'min-w-[28px] px-1.5 py-0.5 text-[9px]',
      },
      mini: {
        maxWidth: 'max-w-[120px]',
        padding: 'p-2',
        ovr: 'text-xl',
        pos: 'text-[9px]',
        photo: 'w-14 h-14',
        icon: 24,
        title: 'text-xs',
        starSize: 12,
        flag: 'min-w-[24px] px-1 py-0.5 text-[8px]',
      },
    } as const;

    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const subTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-500';
    const currentSize = sizeStyles[size];

    const renderStars = () => {
      const activeStars = rating > 0 ? Math.round(rating) : Math.round(Number(ovr));
      return (
        <div className="flex justify-center items-center gap-0.5 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={currentSize.starSize}
              className={
                star <= activeStars
                  ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                  : "fill-black/10 text-black/20 dark:fill-white/10 dark:text-white/20"
              }
            />
          ))}
        </div>
      );
    };

  return (
    <div className={`relative w-full ${currentSize.maxWidth} mx-auto bg-gradient-to-b ${themes[theme]} rounded-t-2xl rounded-b-3xl border-2 shadow-[0_10px_25px_rgba(0,0,0,0.12)] overflow-hidden ${currentSize.padding} transform transition-transform hover:scale-105 duration-300`}>

      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      

      <div className="relative flex justify-between items-start mb-2">
        <div className="flex flex-col items-center">
          <span className={`${currentSize.ovr} font-black ${textColor} leading-none`}>{ovr}</span>
          <span className={`${currentSize.pos} font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-widest`}>{position}</span>
        </div>
        <div className={`${currentSize.flag} rounded bg-red-600 text-center font-black text-white shadow-sm border border-white/50`}>{flagLabel}</div>
      </div>


      <div className={`relative ${currentSize.photo} mx-auto -mt-2 mb-2 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full border-4 ${theme === 'dark' ? 'border-slate-500' : 'border-white'} shadow-lg flex items-center justify-center overflow-hidden`}>
         {image ? <Image src={image} alt={name} fill className="object-cover" /> : <Users size={currentSize.icon} className="text-gray-400" />}
      </div>


      <div className={`relative text-center border-b-2 ${theme === 'dark' ? 'border-slate-500/30' : 'border-yellow-400/30'} pb-1 mb-2`}>
        <h3 className={`font-black ${textColor} uppercase tracking-tight ${currentSize.title} truncate`}>{name}</h3>
        {subtitle ? <p className={`mt-1 text-[10px] font-medium uppercase tracking-wider ${subTextColor}`}>{subtitle}</p> : null}
      </div>


      <div className="relative px-2">
        {renderStars()}
      </div>
    </div>
  );
};
