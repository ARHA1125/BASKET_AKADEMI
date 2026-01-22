import { Users } from 'lucide-react';
import Image from "next/image";

interface Stats {
  spd: number;
  dri: number;
  sho: number;
  def: number;
  pas: number;
  phy: number;
}

interface PlayerCardProps {
  name: string;
  position: string;
  ovr: string;
  stats: Stats;
  image?: string;
}

export const PlayerCard = ({ name, position, ovr, stats, image, theme = 'gold' }: PlayerCardProps & { theme?: 'gold' | 'dark' | 'light' }) => {
    const themes = {
        gold: "from-yellow-100 via-yellow-50 to-yellow-200 border-yellow-400",
        dark: "from-slate-800 via-slate-700 to-slate-900 border-slate-600 text-white",
        light: "from-white via-gray-50 to-gray-100 border-gray-300 text-gray-800"
    };

    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    const subTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`relative w-full max-w-[240px] mx-auto bg-gradient-to-b ${themes[theme]} rounded-t-2xl rounded-b-3xl border-2 shadow-xl overflow-hidden p-3 transform transition-transform hover:scale-105 duration-300`}>

      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      

      <div className="relative flex justify-between items-start mb-2">
        <div className="flex flex-col items-center">
          <span className={`text-3xl font-black ${textColor} leading-none`}>{ovr}</span>
          <span className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-widest`}>{position}</span>
        </div>
        <div className="w-8 h-5 bg-red-600 rounded shadow-sm border border-white/50"></div>
      </div>


      <div className={`relative w-28 h-28 mx-auto -mt-2 mb-2 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full border-4 ${theme === 'dark' ? 'border-slate-500' : 'border-white'} shadow-lg flex items-center justify-center overflow-hidden`}>
         {image ? <Image src={image} alt={name} fill className="object-cover" /> : <Users size={48} className="text-gray-400" />}
      </div>


      <div className={`relative text-center border-b-2 ${theme === 'dark' ? 'border-slate-500/30' : 'border-yellow-400/30'} pb-1 mb-2`}>
        <h3 className={`font-black ${textColor} uppercase tracking-tight text-lg truncate`}>{name}</h3>
      </div>


      <div className="relative grid grid-cols-2 gap-x-4 gap-y-1 px-2">
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${subTextColor}`}>SPD</span>
          <span className={`font-black ${textColor}`}>{stats.spd}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${subTextColor}`}>DRI</span>
          <span className={`font-black ${textColor}`}>{stats.dri}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${subTextColor}`}>SHO</span>
          <span className={`font-black ${textColor}`}>{stats.sho}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${subTextColor}`}>DEF</span>
          <span className={`font-black ${textColor}`}>{stats.def}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${subTextColor}`}>PAS</span>
          <span className={`font-black ${textColor}`}>{stats.pas}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs font-bold ${subTextColor}`}>PHY</span>
          <span className={`font-black ${textColor}`}>{stats.phy}</span>
        </div>
      </div>
    </div>
  );
};
