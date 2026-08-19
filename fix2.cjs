const fs = require('fs');
const file = 'resources/js/Pages/Public/Landing.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the start of the Category Rail section
const railStart = content.indexOf('{/* Category Rail (Phase 21) - Scrolling Orbs with Container */}');
if (railStart === -1) {
    console.log('railStart not found');
    process.exit(1);
}

// Keep everything before railStart
const newContent = content.substring(0, railStart) + `{/* Category Rail (Phase 21) - Scrolling Orbs with Container */}
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
                                    
                                    const isActive = mapFilters.id_bencana === bencana.id_bencana;
                                    
                                    // Placeholder static count (e.g. 5)
                                    const reportCount = 5;

                                    return (
                                        <div key={\`\${bencana.id_bencana}-\${index}\`} className="flex flex-col items-center gap-1.5 snap-center shrink-0">
                                            <button
                                                onClick={() => {
                                                    const newId = isActive ? '' : bencana.id_bencana;
                                                    const newFilters = { ...mapFilters, id_bencana: newId };
                                                    setMapFilters(newFilters);
                                                    setFormFilters(newFilters);
                                                    setIsInfoBencanaOpen(false);
                                                    setIsFilterOpen(false);
                                                    setIsContactOpen(false);
                                                    setIsBasemapOpen(false);
                                                    setIsAffectedAreaOpen(!!newId);
                                                }}
                                                onMouseMove={(e) => setTooltip({ show: true, text: bencana.nama_bencana, x: e.clientX, y: e.clientY })}
                                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                className={\`shrink-0 group backdrop-blur-xl p-3 sm:p-3.5 rounded-full shadow-md border flex items-center justify-center transition-all duration-300 \${isActive ? \`\${activeBorder} \${activeBg} ring-2 ring-offset-2 ring-offset-transparent \${activeBorder.replace('border-', 'ring-')} scale-110\` : 'bg-white/80 dark:bg-[#1a1a1a]/80 border-white/40 dark:border-slate-700/50 hover:bg-white dark:hover:bg-[#222]'}\`}
                                            >
                                                <Icon size={20} className={\`shrink-0 transition-transform duration-300 \${activeColor} \${isActive ? '' : 'group-hover:scale-110'}\`} />
                                            </button>
                                            <span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded-full \${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 backdrop-blur-sm shadow-sm'}\`}>
                                                {reportCount}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </marquee>
                    </div>
                </div>
            </div>

        </PublicLayout>
    );
}
`;

fs.writeFileSync(file, newContent);
console.log('Fixed successfully!');
