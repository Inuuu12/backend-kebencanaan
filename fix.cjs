const fs = require('fs');
const file = 'resources/js/Pages/Public/Landing.jsx';
let content = fs.readFileSync(file, 'utf8');

const detailKejadianIndex = content.indexOf('Detail Kejadian');
const corruptStart = content.indexOf('const isActive = mapFilters.id_bencana === bencana.id_bencana', detailKejadianIndex);

const headerEnd = content.indexOf('</div>', detailKejadianIndex) + 6;
        
const correctUI = `
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-700">{selectedReport.type}</span>
                            <span className={\`px-2 py-1 rounded-lg text-[10px] font-bold capitalize \${
                                selectedReport.status.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-700' :
                                selectedReport.status.toLowerCase() === 'handling' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }\`}>
                                {selectedReport.status}
                            </span>
                        </div>
                        
                        <h4 className="font-extrabold text-sm mb-2 text-slate-900 leading-tight">{selectedReport.title}</h4>
                        
                        <div className="flex items-start gap-2 text-slate-500 text-xs mb-4">
                            <MapPin size={14} className="shrink-0 mt-0.5 text-red-500" />
                            <span>{selectedReport.location_name || 'Lokasi tidak diketahui'}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Rail (Phase 21) - Scrolling Orbs with Container */}
            <div className="absolute bottom-6 left-0 right-0 z-[400] pointer-events-none px-4 sm:px-8">
                <div className="pointer-events-auto w-full max-w-5xl mx-auto bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-slate-700/50 rounded-2xl p-2 sm:p-3 shadow-lg flex flex-col sm:flex-row items-center gap-2 sm:gap-4 overflow-hidden">
                    
                    {/* 2-Word Label */}
                    <div className="shrink-0 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm border border-white/50 dark:border-slate-700/50 flex items-center justify-center">
                        <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            Total Kejadian
                        </span>
                    </div>

                    {/* Marquee Area */}
                    <div className="w-full overflow-hidden">
                        <marquee scrollamount="5" onMouseOver={(e) => e.target.stop()} onMouseOut={(e) => e.target.start()} className="w-full h-[74px] sm:h-[80px]">
                            <div className="inline-flex items-center gap-4 sm:gap-6 py-2 px-2 h-full">
                                {bencanaList.length > 0 && bencanaList.map((bencana, index) => {
                                    const n = bencana.nama_bencana.toLowerCase();
                                    let Icon = AlertTriangle;
                                    let activeColor = 'text-slate-600';
                                    let activeBorder = 'border-slate-500';
                                    let activeBg = 'bg-slate-50';
                                    
                                    if (n === 'banjir') { 
                                        Icon = Droplets; activeColor = 'text-blue-600'; activeBorder = 'border-blue-500'; activeBg = 'bg-blue-50 dark:bg-blue-900/30';
                                    } else if (n === 'tsunami') { 
                                        Icon = Waves; activeColor = 'text-teal-600'; activeBorder = 'border-teal-500'; activeBg = 'bg-teal-50 dark:bg-teal-900/30';
                                    } else if (n === 'kebakaran') { 
                                        Icon = Flame; activeColor = 'text-orange-600'; activeBorder = 'border-orange-500'; activeBg = 'bg-orange-50 dark:bg-orange-900/30';
                                    } else if (n === 'angin puting beliung') { 
                                        Icon = Wind; activeColor = 'text-cyan-600'; activeBorder = 'border-cyan-500'; activeBg = 'bg-cyan-50 dark:bg-cyan-900/30';
                                    } else if (n === 'gempa bumi') { 
                                        Icon = Activity; activeColor = 'text-rose-600'; activeBorder = 'border-rose-500'; activeBg = 'bg-rose-50 dark:bg-rose-900/30';
                                    } else if (n === 'tanah longsor') { 
                                        Icon = TrendingDown; activeColor = 'text-amber-800'; activeBorder = 'border-amber-700'; activeBg = 'bg-amber-100 dark:bg-amber-900/40';
                                    } else if (n === 'gunung meletus') { 
                                        Icon = Mountain; activeColor = 'text-red-600'; activeBorder = 'border-red-500'; activeBg = 'bg-red-50 dark:bg-red-900/30';
                                    } else if (n === 'kekeringan') { 
                                        Icon = Sun; activeColor = 'text-yellow-600'; activeBorder = 'border-yellow-500'; activeBg = 'bg-yellow-50 dark:bg-yellow-900/30';
                                    }
                                    
`;
        
content = content.substring(0, headerEnd) + '\n' + correctUI + content.substring(corruptStart);
fs.writeFileSync(file, content);
console.log('Fixed successfully!');
