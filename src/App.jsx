                        onClick={() => setSelectedMode(m.id)}
                        className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${
                          selectedMode === m.id ? clayBtnActive : 'hover:opacity-70'
                        }`}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">Bahasa</label>
                  <div className={`grid grid-cols-2 gap-1 p-1.5 rounded-[24px] ${theme === 'dark' ? 'bg-[#0f172a] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]' : 'bg-[#e2e8f0] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06)]'}`}>
                    <button
                      onClick={() => setPromptLanguage('ID')}
                      className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${
                        promptLanguage === 'ID' ? clayBtnActive : 'hover:opacity-70'
                      }`}
                    >
                      ID
                    </button>
                    <button
                      onClick={() => setPromptLanguage('EN')}
                      className={`text-xs py-3 rounded-[20px] transition-all font-semibold ${
                        promptLanguage === 'EN' ? clayBtnActive : 'hover:opacity-70'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <textarea
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ketik ide besarmu di sini... (Contoh: Bikin poster kopi yang estetik)"
                  rows={4}
                  className={`w-full p-6 text-lg font-medium resize-none ${clayInput}`}
                />

                <button
                  onClick={() => handleGenerate()}
                  disabled={isAnalyzing}
                  className={`w-full py-5 text-lg ${clayBtnPrimary} disabled:opacity-50`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Memproses Keajaiban...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      <span>Eksekusi Prompt!</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {analysisResult && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                <div className="lg:col-span-8 space-y-6">
                  <div className={`p-6 sm:p-8 ${clayCard}`}>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
                      <h3 className="font-bold text-xl flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-orange-500" /> Output Sempurna
                      </h3>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <button
                          onClick={handleCopyPrompt}
                          className={`flex-1 sm:flex-initial px-6 py-3 text-sm ${isCopied ? clayBtnActive : clayBtnPrimary}`}
                        >
                          {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          {isCopied ? 'Tersalin!' : 'Copy Prompt'}
                        </button>
                        <button
                          onClick={() => toggleFavorite({ title: inputQuery, prompt: editablePrompt, category: analysisResult.category })}
                          className={`px-4 py-3 ${clayPill} hover:scale-105 active:scale-95 transition-transform`}
                        >
                          <Star className={`w-5 h-5 ${isCurrentFavorite ? 'fill-orange-500 text-orange-500' : 'text-slate-500'}`} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={editablePrompt}
                      onChange={(e) => setEditablePrompt(e.target.value)}
                      rows={12}
                      className={`w-full p-6 text-sm font-mono leading-relaxed ${clayInput}`}
                    />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  
                  {analysisResult.placeholders && analysisResult.placeholders.length > 0 && (
                    <div className={`p-6 ${clayCard}`}>
                      <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <Pencil className="w-5 h-5 text-orange-500" /> Sesuaikan Variabel
                      </h4>
                      <div className="space-y-5">
                        {analysisResult.placeholders.map((ph, idx) => (
                          <div key={idx} className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 pl-2">{ph.label}</label>
                            <input
                              type="text"
                              value={placeholderValues[ph.tag] || ''}
                              onChange={(e) => handlePlaceholderChange(ph.tag, e.target.value)}
                              className={`w-full ${clayInput}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
