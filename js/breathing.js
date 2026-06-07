// ==========================================
// GRAPP MAT SURVIVAL - BREATHING MODULE
// ==========================================

let activeBreathTimer = null;
let activeBreathInterval = null;
let currentBreathModule = null;
let audioContext = null;
let mediaStream = null;
let strobeInterval = null;

// ==========================================
// 1. GATEKEEPER & TAB LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Check Gatekeeper
    if (safeGet('grapp_breathing_accepted', false)) {
        let gk = document.getElementById('matSurvivalGatekeeper');
        if (gk) gk.style.display = 'none';
    }
});

function acceptBreathingGatekeeper() {
    safeSet('grapp_breathing_accepted', true);
    document.getElementById('matSurvivalGatekeeper').style.display = 'none';
}

function updateBreathingViewBySport() {
    let sportCategory = 'grappling';
    if (window.currentSport === 'kickboxen' || window.currentSport === 'fitness') sportCategory = 'striking';
    else if (window.currentSport === 'mma') sportCategory = 'mma';
    
    let cards = document.querySelectorAll('.breathing-card');
    cards.forEach(card => {
        let sports = card.getAttribute('data-sport').split(' ');
        if (sports.includes(sportCategory)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ==========================================
// 2. ACTIVE VIEW MANAGEMENT
// ==========================================
const MODULE_CONFIGS = {
    'deep_water': { title: 'The Deep Water Protocol', desc: 'Blood Choke Simulation. Atme 50% aus und halte.' },
    'guillotine': { title: 'Guillotine Simulator', desc: 'Airway Crush. "Sipping" trainieren unter isometrischem Druck.' },
    'pressure_escape': { title: 'The Pressure Escape', desc: 'Negative Pressure Blind Hold. Nach vollem Ausatmen (100%) Luft anhalten.' },
    'corner_reset_box': { title: 'The Corner Reset', desc: 'Box-Breathing (4-4-4-4) zur Pulskontrolle.' },
    'impact_reset': { title: 'The Impact Reset', desc: 'Solar Plexus Schock Erste Hilfe. 2 kurze Sniffs, 1 langes Ausatmen.' },
    'adrenaline_dump': { title: 'Adrenaline Dump', desc: 'Wim Hof Style. Freihändig via Mikrofon.' },
    'corner_reset_high': { title: 'Corner Reset (High Intensity)', desc: 'Aggressiver Pacer für 60s Ringpause.' },
    'cage_wall': { title: 'Cage-Wall Drill', desc: 'Vorbelastung, gefolgt von Deep Water Hold.' }
};

function openBreathingActive(moduleId) {
    currentBreathModule = moduleId;
    let config = MODULE_CONFIGS[moduleId];
    if(!config) return;

    document.getElementById('activeBreathTitle').innerText = config.title;
    document.getElementById('activeBreathDesc').innerText = config.desc;
    
    // Reset UI
    document.getElementById('breathUI').innerHTML = '';
    document.getElementById('cognitiveDisturber').style.display = 'none';
    document.getElementById('stressorSelection').style.display = 'block';
    document.getElementById('btnBreathAction').style.display = 'block';
    
    switchView('view-breathing-active');
}

function abortBreathModule() {
    clearTimeout(activeBreathTimer);
    clearInterval(activeBreathInterval);
    clearInterval(strobeInterval);
    document.getElementById('strobeOverlay').classList.remove('strobe-active');
    
    // Stop Audio Context & Mic
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
        audioContext = null;
    }

    switchView('view-breathing-hub');
}

function startBreathModule() {
    document.getElementById('stressorSelection').style.display = 'none';
    document.getElementById('btnBreathAction').style.display = 'none';
    
    let stressor = document.getElementById('activeStressor').value;
    if (stressor === '30s') {
        runStressor(30);
    } else if (stressor === '60s') {
        runStressor(60);
    } else {
        executeModuleLogic();
    }
}

function runStressor(seconds) {
    let ui = document.getElementById('breathUI');
    ui.innerHTML = `<div class="breathing-pacer pacer-impact breath-alert" style="color:white;">VORBELASTUNG</div>`;
    
    let left = seconds;
    activeBreathInterval = setInterval(() => {
        left--;
        ui.innerHTML = `<div class="breathing-pacer pacer-impact breath-alert" style="color:white;">${left}s</div>`;
        if (left <= 0) {
            clearInterval(activeBreathInterval);
            executeModuleLogic();
        }
    }, 1000);
}

// ==========================================
// 3. CORE BREATHING ENGINE
// ==========================================
function executeModuleLogic() {
    let ui = document.getElementById('breathUI');
    ui.innerHTML = '';

    if (currentBreathModule === 'deep_water' || currentBreathModule === 'pressure_escape') {
        runBlindHold(currentBreathModule);
    } else if (currentBreathModule === 'corner_reset_box') {
        runBoxBreathing();
    } else if (currentBreathModule === 'impact_reset') {
        runImpactReset();
    } else if (currentBreathModule === 'adrenaline_dump') {
        runAdrenalineDump();
    } else if (currentBreathModule === 'guillotine') {
        ui.innerHTML = `<div style="text-align:center;"><p style="font-size:18px; color:orange;">Presse die Zähne aufeinander.</p><p style="margin-top:20px;">Ziehe die Luft kontrolliert in winzigen "Sips" ein. Simuliere starken Druck auf die Kehle.</p></div>`;
        startStopwatch(ui);
    } else if (currentBreathModule === 'corner_reset_high') {
        runHighIntensityPacer();
    } else if (currentBreathModule === 'cage_wall') {
        runCageWallDrill();
    }
}

function startStopwatch(uiElement, prefix = "Zeit:") {
    let sec = 0;
    uiElement.innerHTML += `
        <div id="sw_display" style="font-size:40px; font-weight:bold; margin-top:20px; color:#fff;">0:00</div>
        <button id="btnStopHold" class="btn btn-red" style="width:100%; padding:20px; font-size:20px; margin-top:20px; background:#e74c3c; border:none;" onclick="stopHoldStopwatch()">💥 ATEM GELÖST (STOPP)</button>
        <div id="holdResultBox" style="display:none; margin-top:20px;">
            <p style="color:#2ecc71; font-weight:bold; font-size:16px;">Erfasst! Wie lief es?</p>
            <button class="btn btn-white" style="width:100%; padding:15px; font-size:14px; margin-top:10px;" onclick="saveHoldResult()">💾 ZEIT LOGGEN & BEENDEN</button>
        </div>
    `;
    let disp = document.getElementById('sw_display');
    window.currentHoldSeconds = 0;
    
    activeBreathInterval = setInterval(() => {
        sec++;
        window.currentHoldSeconds = sec;
        let m = Math.floor(sec / 60);
        let s = sec % 60;
        disp.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
}

window.stopHoldStopwatch = function() {
    clearInterval(activeBreathInterval);
    document.getElementById('btnStopHold').style.display = 'none';
    
    let sec = window.currentHoldSeconds;
    let weight = document.getElementById('activeWeight') ? document.getElementById('activeWeight').value : 'mid';
    let stressor = document.getElementById('activeStressor') ? document.getElementById('activeStressor').value : 'none';
    
    // Kalibrierung (Gamification)
    let scoreSec = sec;
    // Schwergewichte verbrennen O2 deutlich schneller
    if (weight === 'heavy') scoreSec = sec * 1.25; 
    if (weight === 'light') scoreSec = sec * 0.9;
    
    // Vorbelastung (Wer schon 60s max output hatte, für den sind 30s Hold extrem)
    if (stressor === '30s') scoreSec = scoreSec * 1.5;
    if (stressor === '60s') scoreSec = scoreSec * 2.0;

    let rank = ""; let color = ""; let desc = "";
    if (scoreSec < 45) {
        rank = "🚨 PANIK-ZONE"; color = "#e74c3c";
        desc = "Dein Gehirn verbraucht Sauerstoff zu schnell. Fokussiere dich darauf, den Herzschlag künstlich zu senken.";
    } else if (scoreSec < 75) {
        rank = "🟡 SURVIVOR"; color = "#f1c40f";
        desc = "Mittelmaß. Du überlebst einen Standard-Würger, aber unter echtem Adrenalin wird es sehr knapp.";
    } else if (scoreSec < 105) {
        rank = "🔵 ADVANCED"; color = "#3498db";
        desc = "Gut! Du hast eine starke Kontrolle über deinen Panikreflex erlernt.";
    } else if (scoreSec < 150) {
        rank = "🟣 ELITE"; color = "#9b59b6";
        desc = "Außergewöhnlich. Selbst wenn es komplett dunkel wird, bleibst du Herr der Lage.";
    } else {
        rank = "🦈 DEEP WATER MASTER"; color = "#2ecc71";
        desc = "Weltklasse. Du bist das Monster unter der Oberfläche. Niemand submittet dich so leicht.";
    }
    
    window.currentHoldRank = rank;

    document.getElementById('holdResultBox').innerHTML = `
        <h3 style="color:${color}; margin-top:0;">${rank}</h3>
        <p style="font-size:30px; font-weight:bold; margin:10px 0;">${sec}s</p>
        <p style="font-size:12px; color:#ccc;">${desc}</p>
        <button class="btn btn-white" style="width:100%; padding:15px; font-size:14px; margin-top:15px;" onclick="saveHoldResult()">💾 ZEIT LOGGEN & BEENDEN</button>
    `;
    
    document.getElementById('holdResultBox').style.display = 'block';
    let strobe = document.getElementById('strobeOverlay');
    if(strobe) strobe.classList.remove('strobe-active');
};

window.saveHoldResult = function() {
    let sec = window.currentHoldSeconds;
    let rank = window.currentHoldRank || '';
    let log = safeGet('sgnTrainingLog', []);
    log.unshift({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        goals: `Mat Survival (${currentBreathModule}): ${sec}s Hold [${rank}]`,
        good: 'Nervensystem reguliert (Stresskontrolle)',
        bad: '',
        checks: ['M'], // Mindset Check
        position: 'Mat Survival Module',
        video: '',
        photo: ''
    });
    safeSet('sgnTrainingLog', log);
    alert(`Stark! ${sec} Sekunden (${rank}) wurden erfolgreich in dein Trainingslog eingetragen.`);
    abortBreathModule();
};

function runBlindHold(type) {
    let ui = document.getElementById('breathUI');
    let prepTime = 3;
    ui.innerHTML = `<div class="breathing-pacer" id="pacerCircle">Macht dich bereit...</div>`;
    let circle = document.getElementById('pacerCircle');

    activeBreathInterval = setInterval(() => {
        prepTime--;
        circle.innerText = prepTime;
        if (prepTime <= 0) {
            clearInterval(activeBreathInterval);
            startManualCalibration(type);
        }
    }, 1000);
}

function startManualCalibration(type) {
    let ui = document.getElementById('breathUI');
    ui.innerHTML = `
        <h4 style="color:#3498db;">LUNGEN-KALIBRIERUNG</h4>
        <p style="font-size:12px; color:#ccc; margin-bottom:20px;">Halte den Button gedrückt, solange du einatmest (Volumen-Messung).</p>
        <button id="btnCalibrateInhale" class="btn btn-red" style="width:100%; padding:30px; font-size:24px; background:#3498db; border:none; border-radius:10px;">👇 PRESS & HOLD: INHALE</button>
    `;
    
    let btnIn = document.getElementById('btnCalibrateInhale');
    let inhaleStart = 0;
    
    let handleInhaleStart = (e) => {
        e.preventDefault();
        inhaleStart = Date.now();
        btnIn.innerText = "🌬️ EINATMEN...";
        btnIn.style.background = "#2ecc71";
    };
    
    let handleInhaleEnd = (e) => {
        e.preventDefault();
        if(inhaleStart === 0) return; // Prevent double trigger
        let duration = Date.now() - inhaleStart;
        inhaleStart = 0;
        window.lastInhaleDuration = duration;
        
        let targetExhale = type === 'deep_water' ? "50% EXHALE" : "100% EXHALE";
        
        ui.innerHTML = `
            <h4 style="color:#e74c3c;">LUNGEN-KALIBRIERUNG (IN: ${(duration/1000).toFixed(1)}s)</h4>
            <p style="font-size:12px; color:#ccc; margin-bottom:20px;">Halte gedrückt, bis du ${targetExhale} erreicht hast.</p>
            <button id="btnCalibrateExhale" class="btn btn-red" style="width:100%; padding:30px; font-size:24px; background:#e74c3c; border:none; border-radius:10px;">👇 PRESS & HOLD: EXHALE</button>
        `;
        
        let btnEx = document.getElementById('btnCalibrateExhale');
        let exhaleStart = 0;
        
        let handleExhaleStart = (e) => {
            e.preventDefault();
            exhaleStart = Date.now();
            btnEx.innerText = "💨 AUSATMEN...";
            btnEx.style.background = "#c0392b";
        };
        
        let handleExhaleEnd = (e) => {
            e.preventDefault();
            if(exhaleStart === 0) return;
            exhaleStart = 0;
            
            // Start the actual hold
            ui.innerHTML = `<div class="breathing-pacer pacer-hold" id="pacerCircle">HOLD</div>`;
            checkCognitiveDisturber();
            startStopwatch(ui);
        };
        
        btnEx.addEventListener('mousedown', handleExhaleStart);
        btnEx.addEventListener('touchstart', handleExhaleStart);
        btnEx.addEventListener('mouseup', handleExhaleEnd);
        btnEx.addEventListener('touchend', handleExhaleEnd);
    };
    
    btnIn.addEventListener('mousedown', handleInhaleStart);
    btnIn.addEventListener('touchstart', handleInhaleStart);
    btnIn.addEventListener('mouseup', handleInhaleEnd);
    btnIn.addEventListener('touchend', handleInhaleEnd);
}

// ---- Modul: Box Breathing ----
function runBoxBreathing() {
    let ui = document.getElementById('breathUI');
    ui.innerHTML = `
        <div class="breathing-pacer" id="pacerCircle"></div>
        <div id="bbProgress" style="text-align:center; margin-top:20px; color:#aaa; font-size:14px;">Phase 1 / 30</div>
        <button id="btnAbortBB" class="btn btn-dark" style="width:100%; margin-top:30px; padding:15px;" onclick="abortBoxBreathing()">❌ VORZEITIG ABBRECHEN</button>
    `;
    let circle = document.getElementById('pacerCircle');
    let progress = document.getElementById('bbProgress');
    let phases = [
        { text: "IN", class: "pacer-inhale" },
        { text: "HOLD", class: "pacer-hold" },
        { text: "OUT", class: "pacer-exhale" },
        { text: "HOLD", class: "" }
    ];
    let step = 0;
    let totalSteps = 0;
    let maxSteps = 30; // 30 * 4s = 120s (2 minutes)
    
    window.abortBoxBreathing = function() {
        clearInterval(activeBreathInterval);
        showBoxBreathingResult(false, totalSteps);
    };

    function showBoxBreathingResult(success, stepsCompleted) {
        let color = success ? "#2ecc71" : "#e74c3c";
        let title = success ? "✅ 2 MINUTEN GESCHAFFT!" : "❌ ABGEBROCHEN";
        let desc = success ? "Hervorragend. Du hast deinen Puls erfolgreich unter Kontrolle gebracht." : "Du hast den Reset vorzeitig abgebrochen. Nächstes Mal schaffst du die vollen 2 Minuten!";
        
        window.currentHoldSeconds = stepsCompleted * 4;
        window.currentHoldRank = success ? "ERFOLGREICH" : "ABGEBROCHEN";
        
        ui.innerHTML = `
            <div id="holdResultBox" style="display:block; margin-top:20px;">
                <h3 style="color:${color}; margin-top:0;">${title}</h3>
                <p style="font-size:30px; font-weight:bold; margin:10px 0;">${stepsCompleted} Phasen</p>
                <p style="font-size:12px; color:#ccc;">${desc}</p>
                <button class="btn btn-white" style="width:100%; padding:15px; font-size:14px; margin-top:15px;" onclick="saveHoldResult()">💾 INS TAGEBUCH LOGGEN</button>
                <button class="btn btn-dark" style="width:100%; padding:15px; font-size:14px; margin-top:10px;" onclick="abortBreathModule()">ZURÜCK</button>
            </div>
        `;
    }
    
    function nextPhase() {
        if (totalSteps >= maxSteps) {
            clearInterval(activeBreathInterval);
            showBoxBreathingResult(true, totalSteps);
            return;
        }
        
        circle.className = "breathing-pacer " + phases[step].class;
        circle.innerText = phases[step].text;
        progress.innerText = `Phase ${totalSteps + 1} / ${maxSteps}`;
        
        step = (step + 1) % 4;
        totalSteps++;
    }
    
    nextPhase();
    activeBreathInterval = setInterval(nextPhase, 4000);
}

// ---- Modul: Impact Reset ----
function runImpactReset() {
    let ui = document.getElementById('breathUI');
    ui.innerHTML = `<div class="breathing-pacer breath-alert pacer-impact" id="pacerCircle">SNIFF SNIFF</div>`;
    let circle = document.getElementById('pacerCircle');
    let inSniff = true;
    
    activeBreathInterval = setInterval(() => {
        if(inSniff) {
            circle.innerText = "LOOONG OUT";
            circle.classList.remove('pacer-impact', 'breath-alert');
            circle.classList.add('pacer-exhale');
            inSniff = false;
            activeBreathTimer = setTimeout(() => {
                circle.classList.remove('pacer-exhale');
                circle.classList.add('pacer-impact', 'breath-alert');
                circle.innerText = "SNIFF SNIFF";
                inSniff = true;
            }, 3000);
        }
    }, 4000);
}

// ---- Modul: Adrenaline Dump (Web Audio API) ----
async function runAdrenalineDump() {
    let ui = document.getElementById('breathUI');
    ui.innerHTML = `<div id="micStatus" style="color:#f1c40f;">Mikrofon-Freigabe benötigt...</div>`;
    
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        ui.innerHTML = `<div class="breathing-pacer" id="pacerCircle" style="font-size:20px;">KALIBRIERUNG<br><span style="font-size:12px;">(Bitte ruhig sein)</span></div>`;
        
        let frames = 0;
        let totalVol = 0;
        
        // 5 Seconds Noise Floor Calibration
        let calibInterval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            let sum = dataArray.reduce((a, b) => a + b, 0);
            let avg = sum / bufferLength;
            totalVol += avg;
            frames++;
        }, 100);

        setTimeout(() => {
            clearInterval(calibInterval);
            let noiseFloor = totalVol / frames;
            let threshold = noiseFloor + 15; // Mindestens X über Grundrauschen
            
            ui.innerHTML = `<div class="breathing-pacer pacer-inhale" id="pacerCircle">LOS!<br>TIEF ATMEN</div>`;
            let breathCount = 0;
            let canCount = true;
            let isHolding = false;
            
            activeBreathInterval = setInterval(() => {
                if(isHolding) return;
                
                analyser.getByteFrequencyData(dataArray);
                let sum = dataArray.reduce((a, b) => a + b, 0);
                let avg = sum / bufferLength;
                
                let circle = document.getElementById('pacerCircle');
                // Optisches Feedback an Lautstärke gekoppelt
                let scale = 1 + (avg / 100);
                if (circle) circle.style.transform = `scale(${Math.min(scale, 1.8)})`;
                
                if (avg > threshold && canCount) {
                    breathCount++;
                    canCount = false;
                    setTimeout(() => { canCount = true; }, 1200); // Debounce
                    
                    if (breathCount >= 30) {
                        isHolding = true;
                        ui.innerHTML = `<div class="breathing-pacer pacer-hold" id="pacerCircle">EXHALE & HOLD</div>`;
                        startStopwatch(ui);
                    } else {
                        if(circle) circle.innerHTML = `${breathCount} / 30`;
                    }
                }
            }, 100);
            
        }, 5000);
        
    } catch (err) {
        ui.innerHTML = `<div style="color:#e74c3c;">Fehler beim Zugriff auf das Mikrofon. Bitte Berechtigungen prüfen!</div>`;
        console.error(err);
    }
}

// ---- Modul: High Intensity Pacer ----
function runHighIntensityPacer() {
    let ui = document.getElementById('breathUI');
    ui.innerHTML = `<div class="breathing-pacer pacer-inhale" id="pacerCircle">IN (2s)</div>`;
    let circle = document.getElementById('pacerCircle');
    let isIn = true;
    
    activeBreathInterval = setInterval(() => {
        if(isIn) {
            circle.className = "breathing-pacer pacer-exhale";
            circle.innerText = "OUT (2s)";
        } else {
            circle.className = "breathing-pacer pacer-inhale";
            circle.innerText = "IN (2s)";
        }
        isIn = !isIn;
    }, 2000);
}

// ---- Modul: Cage Wall Drill ----
function runCageWallDrill() {
    runStressor(60); // Striking Vorbelastung
    // executeModuleLogic handles fallback to Deep Water after stressor if we tweak logic,
    // but right now startBreathModule resets. Let's override currentBreathModule.
    currentBreathModule = 'deep_water';
}

// ==========================================
// 4. COGNITIVE DISTURBER
// ==========================================
function checkCognitiveDisturber() {
    let belt = document.getElementById('instructorBelt').value;
    if (belt === 'purple') {
        // Activate Strobe
        document.getElementById('strobeOverlay').classList.add('strobe-active');
        
        // Inject Question
        let cd = document.getElementById('cognitiveDisturber');
        cd.style.display = 'block';
        
        let questions = [
            { q: "Was ist die effektivste Defense gegen den RNC, während du unter Druck bist?", a: ["Kinn runter", "Arm strecken", "Base drehen"], correct: 0 },
            { q: "Wo platzierst du den Frame bei einer Knee-on-Belly?", a: ["Am Hals", "Am Knie & Hüfte", "Am Boden"], correct: 1 }
        ];
        let rand = questions[Math.floor(Math.random() * questions.length)];
        
        document.getElementById('cogQuestion').innerText = rand.q;
        let ansHTML = "";
        rand.a.forEach((ans, idx) => {
            ansHTML += `<button class="btn btn-dark" onclick="solveCognitive(${idx === rand.correct})">${ans}</button>`;
        });
        document.getElementById('cogAnswers').innerHTML = ansHTML;
    }
}

function solveCognitive(isCorrect) {
    if (isCorrect) {
        document.getElementById('strobeOverlay').classList.remove('strobe-active');
        document.getElementById('cognitiveDisturber').innerHTML = `<h4 style="color:#2ecc71;">KORREKT! Ruhig weiter atmen.</h4>`;
    } else {
        document.getElementById('cogQuestion').innerText = "FALSCH! Strobe bleibt an. Denk nach!";
        document.getElementById('cogQuestion').style.color = "#e74c3c";
    }
}

// Instructor mode removed, integrated into Camp Planner
