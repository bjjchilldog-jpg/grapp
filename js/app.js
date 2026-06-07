
// ==========================================
// 1.5 GYM BRANDING IMPORT LOGIC
// ==========================================
function checkGymImport() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('gym_import')) {
        var b64 = urlParams.get('gym_import');
        try {
            var payloadStr = decodeURIComponent(escape(atob(b64)));
            var payload = JSON.parse(payloadStr);
            
            if(payload.primary) safeSet('grapp_color_primary', payload.primary);
            if(payload.accent) safeSet('grapp_color_accent', payload.accent);
            if(payload.bg) safeSet('grapp_color_bg', payload.bg);
            if(payload.appbg) safeSet('grapp_color_appbg', payload.appbg);
            if(payload.logo_url) safeSet('grapp_custom_logo_url', payload.logo_url);
            if(payload.logo_pos) safeSet('grapp_custom_logo_pos', payload.logo_pos);
            if(payload.logo_size) safeSet('grapp_custom_logo_size', payload.logo_size);
            
            if (payload.links && Array.isArray(payload.links)) {
                for(let i=0; i<payload.links.length; i++) {
                    safeSet('grapp_cl'+(i+1)+'_name', payload.links[i].n || '');
                    safeSet('grapp_cl'+(i+1)+'_url', payload.links[i].u || '');
                }
            }
            
            // Success alert
            let isEn = safeGet('grapp_lang', 'de') === 'en';
            alert(isEn ? "Gym Setup successfully imported! The app is now branded." : "Gym-Setup erfolgreich geladen! Die App ist jetzt gebrandet.");
            
            // Clean URL
            if (window.history && window.history.replaceState) {
                var newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
            
            // Force reload to apply everything cleanly
            window.location.reload();
            
        } catch(e) {
            alert("Import fehlgeschlagen. Der Link ist ungültig oder beschädigt.");
        }
    }
}

// Führe direkt beim Laden aus
checkGymImport();


// ==========================================
// 1. SAFE STORAGE WRAPPER (DSGVO & STORAGE PROTECTION)
// ==========================================
var storageWarningShown = false;


function safeGet(key, defaultVal) {
    try {
        var val = localStorage.getItem(key);
        if (!val) return defaultVal;
        // Backwards compatibility for old raw strings saved before safeSet
        try {
            return JSON.parse(val);
        } catch (parseError) {
            return val; // Return raw string if JSON.parse fails
        }
    } catch(e) {
        if(!storageWarningShown) { 
            var w = document.getElementById('storageWarning');
            if(w) w.style.display = 'block'; 
            storageWarningShown = true; 
        }
        return defaultVal;
    }
}

function safeSet(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch(e) {
        if(!storageWarningShown) { 
            var w = document.getElementById('storageWarning');
            if(w) w.style.display = 'block'; 
            storageWarningShown = true; 
        }
    }
}

// ==========================================
// 2. MULTI-SPORT CONFIGURATION
// ==========================================
const sportConfig = {
    bjj: {
        radar: ["Top Game", "Subs", "Guard", "Cardio", "Wrestling"],
        goals: ["10 Sek Top Control", "Attack to Sweep", "Guard Retention", "Sub Defense", "Grip Fight"],
        positions: ["Keins", "Half Guard", "Mount / Back", "Side Control", "Guard"],
        gfActive: true, rulesActive: true,
        rules: [ {val:'ibjjf', text:'IBJJF (Grappling)'}, {val:'grappling_industries', text:'Grappling Industries (Round Robin)'} ],
        gfHTML: `<div class="gf-section"><h3 data-en="BODY TYPE">KÖRPERBAU</h3><label class="gf-checkbox"><input type="checkbox" id="gf_massig"> <span data-en="Massive / Powerful">Massig / Kraftvoll</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_gross"> <span data-en="Tall / Long">Groß / Lang</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_gelenkig"> <span data-en="Flexible">Gelenkig</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_kurzbeine"> <span data-en="Short, stocky legs">Kurze, stämmige Beine</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_schwerbeine"> <span data-en="Heavy Base">Schwere Base</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_flexober"> <span data-en="Flexible Torso">Flexibler Rumpf</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_zierlich"> <span data-en="Small / Petite">Klein / Zierlich</span></label></div><div class="gf-section" style="border-left-color:#e74c3c;"><h3 data-en="LIMITS">LIMITS</h3><label class="gf-checkbox"><input type="checkbox" id="gf_ruecken"> <span data-en="Back / Neck">Rücken / Nacken</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_knie"> <span data-en="Knee Joints">Kniegelenke</span></label></div><div class="gf-section" style="border-left-color:#3498db;"><h3 data-en="PREFERENCES & SKILLS">VORLIEBEN & SKILLS</h3><label class="gf-checkbox"><input type="checkbox" id="gf_top"> <span data-en="Top Game">Top-Game</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_scramble"> <span data-en="Scrambles">Scrambles</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_safe"> <span data-en="Risk-Averse">Risikoscheu</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_grip"> <span data-en="Iron Grip">Eiserner Griff</span></label></div>`
    },
    mma: {
        radar: ["Striking", "Submissions", "Wrestling", "Cardio", "Ground & Pound"],
        goals: ["Takedown Defense", "Kombination zu Takedown", "Wall Walk / Cage", "Schaden aus der Guard", "Käfigkontrolle"],
        positions: ["Keins", "Käfigwand / Seile", "Open Mat", "Ground & Pound (Top/Bot)", "Clinch"],
        gfActive: true, rulesActive: true,
        rules: [ {val:'ufc_unified', text:'UFC / Unified Rules (Pro)'}, {val:'immaf', text:'IMMAF (Amateur MMA)'} ],
        gfHTML: `<div class="gf-section"><h3 data-en="BODY TYPE">KÖRPERBAU</h3><label class="gf-checkbox"><input type="checkbox" id="gf_mma_kraft"> <span data-en="Massive / Powerful">Massig / Kraftvoll</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_mma_reich"> <span data-en="Tall / Reach">Groß / Reichweite</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_mma_ringer"> <span data-en="Wrestler Build (Compact)">Ringerstatur (Kompakt)</span></label></div><div class="gf-section" style="border-left-color:#e74c3c;"><h3 data-en="LIMITS">LIMITS</h3><label class="gf-checkbox"><input type="checkbox" id="gf_mma_kinn"> <span data-en="Chin (Prone to KOs)">Kinn (Anfällig für KOs)</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_mma_knie"> <span data-en="Knee Joints">Kniegelenke</span> (Wenig Kicks)</label></div><div class="gf-section"><h3 data-en="PREFERENCES">VORLIEBEN</h3><label class="gf-checkbox"><input type="checkbox" id="gf_mma_stand"> <span data-en="Standup / Striker">Standup / Striker</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_mma_boden"> <span data-en="Grappling / GnP">Grappling / GnP</span></label></div>`
    },
    kickboxen: {
        radar: ["Box-Technik", "Kicking", "Footwork", "Cardio", "Defense"],
        goals: ["Hände oben halten", "Distanz wahren", "Kombinationen (3+)", "Kopfbewegung", "Lowkicks checken"],
        positions: ["Keins", "In-Fight", "Out-Fight", "Ecken / Seile"],
        gfActive: true, rulesActive: true,
        rules: [ {val:'iska', text:'Glory / K-1 Rules'}, {val:'wako', text:'WAKO (Amateur Kickboxen)'} ],
        gfHTML: `<div class="gf-section"><h3>ATTRIBUTE</h3><label class="gf-checkbox"><input type="checkbox" id="gf_kb_kraft"> Harte Schlagkraft</label><label class="gf-checkbox"><input type="checkbox" id="gf_kb_reichweite"> Große Reichweite</label><label class="gf-checkbox"><input type="checkbox" id="gf_kb_schnell"> Schnell / Explosiv</label></div><div class="gf-section" style="border-left-color:#e74c3c;"><h3 data-en="LIMITS">LIMITS</h3><label class="gf-checkbox"><input type="checkbox" id="gf_kb_schulter"> Schulter (Deckung schwer)</label><label class="gf-checkbox"><input type="checkbox" id="gf_kb_knie"> Knieprobleme (Wenig Kicks)</label></div><div class="gf-section"><h3>STIL / VORLIEBEN</h3><label class="gf-checkbox"><input type="checkbox" id="gf_kb_aggro"> Vorwärts / Aggressiv</label><label class="gf-checkbox"><input type="checkbox" id="gf_kb_konter"> Abwartend / Konter</label><label class="gf-checkbox"><input type="checkbox" id="gf_kb_mobil"> Viel Beinarbeit</label></div>`
    },
    judo: {
        radar: ["Tachi-waza", "Ne-waza", "Kumi-kata", "Cardio", "Dynamik"],
        goals: ["Kuzushi (Gleichgewicht)", "Griffkampf dominieren", "Kombinationen", "Bodenübergang", "Sauber fallen"],
        positions: ["Keins", "Stand (Tachi-waza)", "Boden (Ne-waza)", "Turtle"],
        gfActive: true, rulesActive: true,
        rules: [ {val:'ijf', text:'IJF (Judo)'} ],
        gfHTML: `<div class="gf-section"><h3 data-en="BODY TYPE">KÖRPERBAU</h3><label class="gf-checkbox"><input type="checkbox" id="gf_ju_gross"> <span data-en="Tall / Long">Groß / Lang</span>e Beine</label><label class="gf-checkbox"><input type="checkbox" id="gf_ju_klein"> Klein / Kompakt</label><label class="gf-checkbox"><input type="checkbox" id="gf_ju_kraft"> Kraftvoll</label></div><div class="gf-section" style="border-left-color:#e74c3c;"><h3 data-en="LIMITS">LIMITS</h3><label class="gf-checkbox"><input type="checkbox" id="gf_ju_ruecken"> <span data-en="Back / Neck">Rücken / Nacken</span></label><label class="gf-checkbox"><input type="checkbox" id="gf_ju_knie"> <span data-en="Knee Joints">Kniegelenke</span></label></div><div class="gf-section"><h3 data-en="PREFERENCES">VORLIEBEN</h3><label class="gf-checkbox"><input type="checkbox" id="gf_ju_tachi"> Tachi-Waza (Stand)</label><label class="gf-checkbox"><input type="checkbox" id="gf_ju_newaza"> Ne-Waza (Boden)</label><label class="gf-checkbox"><input type="checkbox" id="gf_ju_konter"> Konterwürfe</label></div>`
    },
    fitness: {
        radar: ["Kraftausdauer", "Speed", "Koordination", "Cardio", "Mindset"],
        goals: ["Pulsbereich halten", "Technik Fokus", "Durchbeißen", "Mobility verbessern", "Stressabbau"],
        positions: ["Keins", "Sandsack", "Pratzen", "Zirkel", "Schattenboxen"],
        gfActive: false, rulesActive: false, rules: []
    }
};

var currentSport = "bjj";

// ==========================================
// 3. INIT & SETUP
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    try {
        var today = new Date().toISOString().split('T')[0];
        if(document.getElementById('logDate')) document.getElementById('logDate').value = today;
        if(typeof loadProfileData === 'function') loadProfileData();
        
        var savedLang = safeGet('grapp_lang', 'de');
        var langDropdown = document.getElementById('globalLang');
        if(langDropdown) { langDropdown.value = savedLang; }
        changeLanguage();
        
        changeSport(); 
        if(typeof applyGymTheme === 'function') applyGymTheme();
        if(typeof checkSmartReminder === 'function') checkSmartReminder();
        if(typeof checkSurveyReminder === 'function') checkSurveyReminder();
        if(typeof updateDynamicGreeting === 'function') updateDynamicGreeting();
        
        if(typeof renderHallOfFame === 'function') renderHallOfFame();
        
        // Reliable JS Landscape Detection
        function checkOrientation() {
            if (window.innerWidth > window.innerHeight) {
                document.body.classList.add('js-landscape');
            } else {
                document.body.classList.remove('js-landscape');
            }
        }
        window.addEventListener('resize', checkOrientation);
        window.addEventListener('orientationchange', checkOrientation);
        checkOrientation(); // init
        
        // Remote Consent Checker (Executed securely after DOM is fully loaded)
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('remote_sign')) {
            var childName = urlParams.get('child') || "";
            var cPhone = urlParams.get('coach') || "";
            var cHook = urlParams.get('hook') || "";
            
            if (cPhone) safeSet('grapp_coach_phone', cPhone);
            if (cHook) safeSet('grapp_waiver_webhook', cHook);
            
            setTimeout(() => {
                if (typeof switchView === 'function') switchView('view-manifest');
                setTimeout(() => {
                    if (typeof openKioskMode === 'function') {
                        openKioskMode();
                        if (childName) {
                            var kioskNameEl = document.getElementById('kioskName');
                            if (kioskNameEl) {
                                kioskNameEl.value = childName;
                                kioskNameEl.readOnly = true; 
                            }
                        }
                    }
                }, 300);
            }, 500);
            
            if (window.history && window.history.replaceState) {
                var newUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
        
    } catch(e) { console.warn("Init Error", e); }
});

// ==========================================
// 3.5 HALL OF FAME RENDER LOGIC
// ==========================================
function renderHallOfFame() {
    let container = document.getElementById('hall-of-fame-container');
    if (!container || typeof grappSupporters === 'undefined' || grappSupporters.length === 0) return;
    
    let html = `<div class="hof-section">
                    <h3 class="hof-title" data-en="🏆 HALL OF FAME">🏆 HALL OF FAME</h3>`;
                    
    // Group by belt
    let redBelts = grappSupporters.filter(s => s.belt === 'red');
    let coralBelts = grappSupporters.filter(s => s.belt === 'coral');
    let others = grappSupporters.filter(s => ['black', 'brown', 'purple', 'blue', 'white'].includes(s.belt));
    
    // Sort others: Black -> White
    const beltOrder = { 'black': 1, 'brown': 2, 'purple': 3, 'blue': 4, 'white': 5 };
    others.sort((a, b) => beltOrder[a.belt] - beltOrder[b.belt]);

    // Red Belts (Hero)
    redBelts.forEach(s => {
        let linkWrapperStart = s.link ? `<a href="${s.link}" target="_blank" style="text-decoration:none; display:block;">` : '';
        let linkWrapperEnd = s.link ? `</a>` : '';
        let logoHtml = s.logo ? `<img src="${s.logo}" alt="${s.name}">` : '';
        
        html += `${linkWrapperStart}
                 <div class="hof-hero-red">
                    ${logoHtml}
                    <div class="hof-name">🔴 ${s.name}</div>
                    ${s.slogan ? `<div class="hof-slogan">"${s.slogan.replace(/\n/g, '<br>')}"</div>` : ''}
                 </div>
                 ${linkWrapperEnd}`;
    });

    // Coral Belts (Grid)
    if (coralBelts.length > 0) {
        html += `<div class="hof-coral-grid">`;
        coralBelts.forEach(s => {
            let linkWrapperStart = s.link ? `<a href="${s.link}" target="_blank" style="text-decoration:none;">` : '';
            let linkWrapperEnd = s.link ? `</a>` : '';
            let logoHtml = s.logo ? `<img src="${s.logo}" alt="${s.name}">` : '';
            
            html += `${linkWrapperStart}
                     <div class="hof-card-coral">
                        ${logoHtml}
                        <div class="hof-name">🪸 ${s.name}</div>
                     </div>
                     ${linkWrapperEnd}`;
        });
        html += `</div>`;
    }

    // Other Belts (List)
    if (others.length > 0) {
        html += `<div class="hof-list">`;
        const beltIcons = { 'black': '⚫', 'brown': '🟤', 'purple': '🟣', 'blue': '🔵', 'white': '⚪' };
        
        others.forEach(s => {
            let linkHtml = (s.belt === 'black' && s.link) ? `<a href="${s.link}" target="_blank" style="color:#3498db; font-size:12px; margin-left:10px;">🔗 Link</a>` : '';
            
            html += `<div class="hof-list-item hof-${s.belt}">
                        <div class="hof-list-header">
                            <span class="hof-list-name">${beltIcons[s.belt]} ${s.name}</span>
                            ${linkHtml}
                        </div>
                        ${(s.belt === 'black' || s.belt === 'brown') && s.quote ? `<div class="hof-list-quote">"${s.quote}"</div>` : ''}
                     </div>`;
        });
        html += `</div>`;
    }

    // CTA Button
    html += `<div style="margin-top: 25px; text-align: center; border-top: 1px solid #333; padding-top: 15px;">
                <p style="font-size: 12px; color: #aaa; margin-bottom: 10px;">Unterstütze die Entwicklung der App und sichere dir deinen Platz auf der Matte:</p>
                <a href="#" class="btn btn-red" style="text-decoration:none; display:inline-block;" onclick="switchView('view-about'); return false;">JETZT SPONSOR WERDEN</a>
             </div>`;

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================
// 4. SPORT-SPECIFIC LOGIC
// ==========================================
function changeSport() {
    currentSport = document.getElementById('globalSport').value;
    var cfg = sportConfig[currentSport];
    
    // Update profile data UI to reflect sport-specific values (like belt)
    if(typeof loadProfileData === 'function') loadProfileData();

    if(document.getElementById('lbl_top')) document.getElementById('lbl_top').innerText = cfg.radar[0];
    if(document.getElementById('lbl_sub')) document.getElementById('lbl_sub').innerText = cfg.radar[1];
    if(document.getElementById('lbl_bot')) document.getElementById('lbl_bot').innerText = cfg.radar[2];
    if(document.getElementById('lbl_car')) document.getElementById('lbl_car').innerText = cfg.radar[3];
    if(document.getElementById('lbl_wre')) document.getElementById('lbl_wre').innerText = cfg.radar[4];

    var goalsHtml = ""; 
    cfg.goals.forEach(function(g) { goalsHtml += "<span class='goal-chip' onclick='setGoal(\""+g+"\")'>"+g+"</span>"; }); 
    if(document.getElementById('goalChipsBox')) document.getElementById('goalChipsBox').innerHTML = goalsHtml;
    
    var posHtml = ""; 
    cfg.positions.forEach(function(p) { posHtml += "<option value='"+p+"'>"+p+"</option>"; }); 
    if(document.getElementById('logPosition')) document.getElementById('logPosition').innerHTML = posHtml;

    if (!cfg.gfActive) {
        if(document.getElementById('btnGamefinder')) document.getElementById('btnGamefinder').style.display = "none";
        if(document.getElementById('btnRules')) document.getElementById('btnRules').style.display = "none";
        if(document.getElementById('btnCampText')) document.getElementById('btnCampText').innerText = "HEALTH PLANER";
        if(document.getElementById('campTitle')) document.getElementById('campTitle').innerText = "HEALTH & BODY RECOMP";
        if(document.getElementById('campDaysLabel')) document.getElementById('campDaysLabel').innerText = "Tage bis zum Ziel:";
        if(document.getElementById('weightLossBox')) document.getElementById('weightLossBox').style.display = "none"; 
    } else {
        if(document.getElementById('btnGamefinder')) document.getElementById('btnGamefinder').style.display = "flex";
        if(document.getElementById('btnRules')) document.getElementById('btnRules').style.display = "flex";
        if(document.getElementById('btnCampText')) document.getElementById('btnCampText').innerText = "FIGHT CAMP";
        if(document.getElementById('campTitle')) document.getElementById('campTitle').innerText = "FIGHT CAMP PLANER";
        if(document.getElementById('campDaysLabel')) document.getElementById('campDaysLabel').innerText = "Tage bis zur Waage:";
        if(document.getElementById('weightLossBox')) document.getElementById('weightLossBox').style.display = "block";
        if(document.getElementById('gf-dynamic-content')) document.getElementById('gf-dynamic-content').innerHTML = cfg.gfHTML;
    }

    var tpBox = document.getElementById('trainingPlanBox');
    if (tpBox) tpBox.style.display = "none"; 
    
    if(typeof loadRadar === 'function') loadRadar();
    if(typeof updateRoleUI === 'function') updateRoleUI(); 

    if (typeof initRulesView === 'function') {
        initRulesView();
    }
    
    if (typeof updateBreathingViewBySport === 'function') {
        updateBreathingViewBySport();
    }
} 

function changeLanguage() {
    var langSelect = document.getElementById('globalLang');
    if(!langSelect) return;
    var lang = langSelect.value;
    safeSet('grapp_lang', lang);
    
    document.querySelectorAll('[data-en]').forEach(el => {
        if (!el.hasAttribute('data-de')) {
            el.setAttribute('data-de', el.innerHTML); // using innerHTML to preserve spans/icons if any, wait, innerText was used before.
        }
        if (lang === 'en') {
            el.innerHTML = el.getAttribute('data-en');
        } else {
            el.innerHTML = el.getAttribute('data-de');
        }
    });

    document.querySelectorAll('[data-en-ph]').forEach(el => {
        if (!el.hasAttribute('data-de-ph')) {
            el.setAttribute('data-de-ph', el.getAttribute('placeholder') || "");
        }
        if (lang === 'en') {
            el.setAttribute('placeholder', el.getAttribute('data-en-ph'));
        } else {
            el.setAttribute('placeholder', el.getAttribute('data-de-ph'));
        }
    });
    
    updateDynamicGreeting();
}

// ==========================================
// 5. CENTRAL APP NAVIGATION
// ==========================================
function switchView(id, isPop = false) {
    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) { views[i].classList.remove('active'); }
    var viewObj = document.getElementById(id);
    if(viewObj) viewObj.classList.add('active');
    
    if (!isPop) {
        window.history.pushState({ view: id }, '', '#' + id);
    }
    
    // Robust class for fullscreen timer (fallback for browsers without :has support)
    if(id === 'view-timer') {
        document.body.classList.add('timer-fullscreen-active');
    } else {
        document.body.classList.remove('timer-fullscreen-active');
        document.body.classList.remove('force-landscape');
    }
    
    // Automatische Dateiträger beim Rendern triggern
    if(id === 'view-log' && typeof loadTrainingLogs === 'function') loadTrainingLogs();
    if(id === 'view-rules' && typeof updateRules === 'function') updateRules();
    if(id === 'view-events' && typeof loadEvents === 'function') loadEvents();
    if(id === 'view-radar' && typeof loadRadar === 'function') loadRadar();
    
    if(id === 'view-menu' && typeof checkSmartReminder === 'function') { 
        checkSmartReminder(); 
        if(typeof checkSurveyReminder === 'function') checkSurveyReminder(); 
        if(typeof updateDynamicGreeting === 'function') updateDynamicGreeting();
    }
    
    if(id === 'view-stretching' && typeof loadStretchingPlan === 'function') loadStretchingPlan();
    if(id === 'view-gamefinder' && typeof loadBasicVideos === 'function') loadBasicVideos();
    if(id === 'view-attendance' && typeof initAttendanceView === 'function') initAttendanceView();
    if(id === 'view-breathing-hub' && typeof updateBreathingViewBySport === 'function') updateBreathingViewBySport();
    
    // WhatsApp Crew-Link & Custom Links
    if(id === 'view-shop') {
        var waLink = safeGet('grapp_wa_group', ''); // Harmonisierter Pro-Key
        var card = document.getElementById('teamWaGroupCard');
        var btn = document.getElementById('btnJoinWaGroup');
        if(waLink && card && btn) {
            card.style.display = 'block';
            btn.onclick = function() { window.open(waLink, '_blank'); };
        } else if(card) {
            card.style.display = 'none';
        }
        if(typeof renderCustomLinks === 'function') renderCustomLinks();
    }

    // NEU: Wenn die Corner Info geöffnet wird, Profildaten reibungslos injizieren
    if (id === 'view-manifest') {
        if (typeof loadCornerInfo === 'function') {
            loadCornerInfo();
        }
    }
    
    // Falls beim Klick aufs Profil Aktualisierungen stattfinden sollen
    if (id === 'view-profile') {
        if(typeof toggleCoachFields === 'function') toggleCoachFields();
    }
    
    if (id === 'view-about') {
        if(typeof renderGiroCode === 'function') renderGiroCode();
    }
}

window.addEventListener('popstate', function(event) {
    if (event.state && event.state.view) {
        // Prevent pushState when popping
        const id = event.state.view;
        var views = document.querySelectorAll('.view');
        for (var i = 0; i < views.length; i++) { views[i].classList.remove('active'); }
        var viewObj = document.getElementById(id);
        if(viewObj) viewObj.classList.add('active');
        if(id === 'view-timer') document.body.classList.add('timer-fullscreen-active');
        else { document.body.classList.remove('timer-fullscreen-active'); document.body.classList.remove('force-landscape'); }
    } else {
        switchView('view-menu', true);
    }
});

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, function(tag) {
        const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
        return charsToReplace[tag] || tag;
    });
}

// ==========================================
// 6. VISUAL BRANDING & THEME HANDLING
// ==========================================
function applyGymTheme() {
    // Greift direkt auf die harmonisierten Pro-Schlüssel aus der profile.js zu
    var primaryColor = safeGet('grapp_color_primary', '#e74c3c');
    var accentColor = safeGet('grapp_color_accent', '#3498db');
    var bgColor = safeGet('grapp_color_bg', '#000000');
    var appBgColor = safeGet('grapp_color_appbg', '#1a1a1a');
    var appContainer = document.querySelector('.app-container');
    var logoUrl = safeGet('grapp_custom_logo_url', '');
    
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.body.style.backgroundColor = bgColor;
        if(appContainer) appContainer.style.backgroundColor = appBgColor;
    
    var logoEl = document.querySelector('.header-logo');
    var splashProBox = document.getElementById('pro-splash-logo-box');
    var splashDefBox = document.getElementById('default-splash-logo-box');
    var splashGymLogo = document.getElementById('splash-gym-logo');

    if (logoUrl) {
        // Splash Screen
        if(splashProBox) splashProBox.style.display = "block";
        if(splashDefBox) splashDefBox.style.display = "none";
        if(splashGymLogo) splashGymLogo.src = logoUrl;
        
        // Header Logo
        if (logoEl) {
            let logoPos = safeGet('grapp_custom_logo_pos', 'left');
            let logoSize = safeGet('grapp_custom_logo_size', '40');
            
            logoEl.innerHTML = `<img src="${logoUrl}" alt="Team Logo" style="max-height: ${logoSize}px; vertical-align: middle;">`;
            
            if (logoPos === 'center') {
                logoEl.style.position = 'absolute';
                logoEl.style.left = '50%';
                logoEl.style.transform = 'translateX(-50%)';
            } else {
                logoEl.style.position = 'relative';
                logoEl.style.left = '0';
                logoEl.style.transform = 'none';
            }
        }
    } else {
        // Fallback Splash
        if(splashProBox) splashProBox.style.display = "none";
        if(splashDefBox) splashDefBox.style.display = "block";
        
        // Fallback Header
        if (logoEl) {
            logoEl.innerHTML = `GrAPP<span>.</span>`;
            logoEl.style.position = 'relative';
            logoEl.style.left = '0';
            logoEl.style.transform = 'none';
        }
    }
}

function updateDynamicGreeting() {
    var greetingEl = document.getElementById('dynamicGreeting');
    if(!greetingEl) return;
    
    var lang = safeGet('grapp_lang', 'de');
    var gender = safeGet('grapp_user_gender', 'm');
    
    var defaultName = 'Kämpfer';
    if (lang === 'en') defaultName = 'Warrior';
    else if (gender === 'f') defaultName = 'Kämpferin';
    else if (gender === 'd') defaultName = 'Kämpfer*in';
    
    var name = safeGet('grapp_user_name', ''); 
    if(!name || name.trim() === '') name = defaultName;
    
    var firstName = name.split(' ')[0];
    
    var logs = safeGet('sgnTrainingLog', []);
    var now = Date.now();
    var oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    var logsThisWeek = logs.filter(function(l) { return (now - new Date(l.date).getTime()) < oneWeekMs; });
    
    var greeting = "";
    if (lang === 'en') {
        if (logsThisWeek.length >= 3) greeting = `Hi ${firstName}! Strong streak 🔥`;
        else if (logsThisWeek.length > 0) greeting = `Hi ${firstName}! Keep it up 👊`;
        else greeting = `The mats are calling, ${firstName}! 🥋`;
    } else {
        if (logsThisWeek.length >= 3) greeting = `Hi ${firstName}! Starker Lauf aktuell 🔥`;
        else if (logsThisWeek.length > 0) greeting = `Hi ${firstName}! Bleib dran 👊`;
        else greeting = `Die Matte ruft, ${firstName}! 🥋`;
    }
    
    greetingEl.innerText = greeting;
}

// ==========================================
// 7. BACKUP, EXPORT & SYNC INTERFACES
// ==========================================
function exportData() { 
    var data = { 
        log: safeGet('sgnTrainingLog', []), 
        radar: safeGet('sgnRadarStats_' + currentSport, {top:5, bot:5, wre:5, sub:5, car:5}), 
        stretchProgress: safeGet('sgnStretchProgress', []), 
        stretchNotes: safeGet('sgnStretchNotes', {}),
        trainingDays: safeGet('grapp_training_days', []),
        // Sichert sowohl das alte Format als auch die neuen harmonisierten Keys, damit nichts verloren geht!
        profile: {
            name: safeGet('grapp_user_name', safeGet('profName', '')),
            address: safeGet('grapp_user_address', safeGet('sgnProf_Address', '')),
            phone: safeGet('grapp_user_phone', safeGet('sgnFB_Phone', '')),
            coachPhone: safeGet('grapp_coach_phone', ''),
            webhookUrl: safeGet('grapp_webhook_url', ''),
            waGroup: safeGet('grapp_wa_group', ''),
            proStatus: safeGet('grapp_pro_status', 'false')
        }
    }; 
    var blob = new Blob([JSON.stringify(data)], { type: "application/json" }); 
    var url = URL.createObjectURL(blob); 
    var a = document.createElement("a"); 
    a.href = url; 
    a.download = "GrApp_Backup.json"; 
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a); 
    URL.revokeObjectURL(url); 
}

function importData(event) { 
    var file = event.target.files[0]; 
    if(!file) return; 
    var reader = new FileReader(); 
    reader.onload = function(e) { 
        try { 
            var data = JSON.parse(e.target.result); 
            if(data.log) safeSet('sgnTrainingLog', data.log); 
            if(data.radar) safeSet('sgnRadarStats_' + currentSport, data.radar); 
            if(data.stretchProgress) safeSet('sgnStretchProgress', data.stretchProgress); 
            if(data.stretchNotes) safeSet('sgnStretchNotes', data.stretchNotes); 
            if(data.trainingDays) safeSet('grapp_training_days', data.trainingDays);
            if(data.profile) {
                // Schreibt die Daten sauber in beide Key-Strukturen zurück
                safeSet('grapp_user_name', data.profile.name);
                safeSet('profName', data.profile.name);
                safeSet('grapp_user_address', data.profile.address);
                safeSet('sgnProf_Address', data.profile.address);
                safeSet('grapp_user_phone', data.profile.phone);
                safeSet('sgnFB_Phone', data.profile.phone);
                
                if(data.profile.coachPhone) safeSet('grapp_coach_phone', data.profile.coachPhone);
                if(data.profile.webhookUrl) safeSet('grapp_webhook_url', data.profile.webhookUrl);
                if(data.profile.waGroup) safeSet('grapp_wa_group', data.profile.waGroup);
                if(data.profile.proStatus) safeSet('grapp_pro_status', data.profile.proStatus);
            }
            alert("✅ Backup erfolgreich geladen!"); 
            window.location.reload(); 
        } catch(err) { 
            alert("❌ Fehler beim Import der Backup-Datei!"); 
        } 
    }; 
    reader.readAsText(file); 
    event.target.value = ""; 
}

// ==========================================
// 8. VOICE RECOGNITION INTERFACES
// ==========================================
function startDictation(inputId) {
    if (window.hasOwnProperty('webkitSpeechRecognition') || window.hasOwnProperty('SpeechRecognition')) {
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = navigator.language || "de-DE";
        
        var inputEl = document.getElementById(inputId);
        if(!inputEl) return;
        
        var originalBg = inputEl.style.backgroundColor;
        var originalPlaceholder = inputEl.placeholder;
        
        inputEl.style.backgroundColor = "#531"; 
        inputEl.placeholder = "Höre zu... (Sprechen) 🎤";
        
        recognition.onresult = function(e) {
            var text = e.results[0][0].transcript;
            var currentVal = inputEl.value;
            inputEl.value = currentVal ? currentVal + " " + text : text;
            recognition.stop();
        };
        
        recognition.onerror = function(e) {
            recognition.stop();
            inputEl.style.backgroundColor = originalBg;
            inputEl.placeholder = originalPlaceholder;
            if(e.error !== 'no-speech') {
                alert("Diktierfunktion Fehler: " + e.error);
            }
        };
        
        recognition.onend = function() {
            inputEl.style.backgroundColor = originalBg;
            inputEl.placeholder = originalPlaceholder;
        };
        
        recognition.start();
    } else {
        alert("Dein Browser unterstützt diese Diktierfunktion leider nicht direkt. Bitte nutze stattdessen das Mikrofon-Symbol auf der Tastatur deines Handys.");
    }
}

function toggleTheme() {
    let isLight = document.body.classList.toggle('light-mode');
    safeSet('grapp_light_mode', isLight);
    
    let btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerText = isLight ? "☀️" : "🌙";
    
    if (isLight) {
        document.body.style.backgroundColor = "";
        if(appContainer) appContainer.style.backgroundColor = "";
    } else {
        var bgColor = safeGet('grapp_color_bg', '#000000');
        var appBgColor = safeGet('grapp_color_appbg', '#1a1a1a');
        document.body.style.backgroundColor = bgColor;
        var container = document.querySelector('.app-container');
        if(container) container.style.backgroundColor = appBgColor;
    }
}
