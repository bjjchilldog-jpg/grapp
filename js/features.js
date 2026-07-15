// --- BASIC TECHNIKEN (VIDEO BIBLIOTHEK) ---
// ============================================================================
// GRAPP - CORE FEATURES & LOGIC ENGINE
// Developed by Martin Kremmel - Team Submission Grappling Neumarkt
// ============================================================================

// ==========================================
// SECTION 1: BASIC VIDEOS / VIDEO BIBLIOTHEK
// ==========================================

function addBasicVideo() {
    var title = document.getElementById('basicVideoName').value;
    var url = document.getElementById('basicVideoUrl').value;
    if(!title || !url) return alert("Bitte Titel und URL eingeben!");
    
    var vids = safeGet('sgnBasicVideos_' + currentSport, []);
    vids.push({ id: Date.now(), title: title, url: url });
    safeSet('sgnBasicVideos_' + currentSport, vids);
    
    document.getElementById('basicVideoName').value = "";
    document.getElementById('basicVideoUrl').value = "";
    loadBasicVideos();
}

function loadBasicVideos() {
    var vids = safeGet('sgnBasicVideos_' + currentSport, []);
    var html = "";
    vids.forEach(function(v) {
        var embedUrl = getEmbedUrl(v.url) || v.url;
        var videoHtml = "";
        if(embedUrl.includes('youtube') || embedUrl.includes('vimeo') || embedUrl.includes('drive')) {
            videoHtml = "<div class='video-wrapper' style='margin-bottom:10px;'><iframe src='" + embedUrl + "' frameborder='0' allowfullscreen></iframe></div>";
        } else {
            videoHtml = "<a href='" + v.url + "' target='_blank' class='btn-sm btn-sm-cal' style='display:inline-block; margin-bottom:10px;'>▶️ VIDEO ÖFFNEN</a>";
        }
        
        html += "<div style='background:#222; padding:10px; border-radius:6px; margin-bottom:10px;'>";
        html += "<div style='display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;'>";
        html += "<strong style='color:#fff; font-size:14px CONTAINER;'>" + v.title + "</strong>";
        html += "<button class='btn-sm btn-sm-red' style='margin:0; padding:5px 8px;' onclick='deleteBasicVideo(" + v.id + ")'>X</button>";
        html += "</div>";
        html += videoHtml;
        html += "</div>";
    });
    
    var listEl = document.getElementById('basicVideosList');
    if(listEl) listEl.innerHTML = html || "<p style='font-size:12px; color:#888;'><span data-en='No basic techniques added yet.'>Noch keine Basic Techniken hinterlegt.</span></p>";
}

function deleteBasicVideo(id) {
    var vids = safeGet('sgnBasicVideos_' + currentSport, []);
    vids = vids.filter(function(v) { return v.id !== id; });
    safeSet('sgnBasicVideos_' + currentSport, vids);
    loadBasicVideos();
}

// Hilfsfunktion zur Ermittlung von Embedding-Schnittstellen
function getEmbedUrl(url) {
    if (!url) return "";
    var videoId;
    if (url.includes('youtube.com/watch') || url.includes('m.youtube.com/watch')) {
        videoId = url.split('v=')[1];
        if (videoId) {
            var ampersandPosition = videoId.indexOf('&');
            if(ampersandPosition != -1) videoId = videoId.substring(0, ampersandPosition);
            return 'https://www.youtube.com/embed/' + videoId;
        }
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1];
        var questionPosition = videoId.indexOf('?');
        if(questionPosition != -1) videoId = videoId.substring(0, questionPosition);
        return 'https://www.youtube.com/embed/' + videoId;
    } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1];
        var questionPosition = videoId.indexOf('?');
        if(questionPosition != -1) videoId = videoId.substring(0, questionPosition);
        return 'https://www.youtube.com/embed/' + videoId;
    } else if (url.includes('vimeo.com/')) {
        videoId = url.split('vimeo.com/')[1];
        return 'https://player.vimeo.com/video/' + videoId;
    } else if (url.includes('drive.google.com/file/d/')) {
        videoId = url.split('/d/')[1].split('/')[0];
        return 'https://drive.google.com/file/d/' + videoId + '/preview';
    }
    return url;
}

// ==========================================
// SECTION 2: GAMEFINDER 2.0 BIOMECHANIK ENGINE
// ==========================================

function calculateGamefinder() {
    var results = [];
    if (currentSport === 'bjj') {
        var p = { 
            massig: document.getElementById('gf_massig')?.checked || false, 
            gross: document.getElementById('gf_gross')?.checked || false, 
            gelenkig: document.getElementById('gf_gelenkig')?.checked || false, 
            ruecken: document.getElementById('gf_ruecken')?.checked || false, 
            knie: document.getElementById('gf_knie')?.checked || false, 
            top: document.getElementById('gf_top')?.checked || false, 
            scramble: document.getElementById('gf_scramble')?.checked || false, 
            safe: document.getElementById('gf_safe')?.checked || false,
            kurzbeine: document.getElementById('gf_kurzbeine')?.checked || false,
            schwerbeine: document.getElementById('gf_schwerbeine')?.checked || false,
            flexober: document.getElementById('gf_flexober')?.checked || false,
            grip: document.getElementById('gf_grip')?.checked || false,
            zierlich: document.getElementById('gf_zierlich')?.checked || false
        };
        results.push({ name: "Pressure Passing / Top Game", score: (p.massig*2 + p.top*2 + p.schwerbeine - p.scramble + p.safe - p.zierlich), danger: p.ruecken });
        results.push({ name: "Guard Retention / Triangle", score: (p.gross*2 + p.gelenkig*2 - p.top + p.flexober), danger: p.ruecken });
        results.push({ name: "Leglocks / Ashi Garami", score: (p.scramble*2 - p.top + p.flexober), danger: p.knie });
        results.push({ name: "Wrestling / Takedowns", score: (p.scramble*2 + p.massig + p.schwerbeine - p.safe), danger: p.knie });
        
        // NEW GUARDS & STYLES
        results.push({ name: "Deep Half Guard", score: (p.kurzbeine*2 + p.schwerbeine*2 + p.safe*2 - p.gelenkig - p.scramble), danger: false });
        results.push({ name: "Spider / Lasso Guard", score: (p.grip*3 + p.gross*2 + p.zierlich*2 - p.kurzbeine - p.top), danger: p.ruecken });
        results.push({ name: "Knee Shield / Z-Guard", score: (p.safe*2 + p.gross + p.flexober - p.top), danger: false });
        results.push({ name: "Butterfly / X-Guard", score: (p.kurzbeine*2 + p.scramble*2 + p.schwerbeine - p.gross), danger: p.knie });
        results.push({ name: "Sneaky Attacks / Ginger Snap", score: (p.zierlich*3 + p.gelenkig*2 + p.scramble - p.massig - p.schwerbeine), danger: false });
    } else if (currentSport === 'kickboxen') {
        var p2 = { schnell: document.getElementById('gf_kb_schnell').checked, reichweite: document.getElementById('gf_kb_reichweite').checked, kraft: document.getElementById('gf_kb_kraft').checked, knie: document.getElementById('gf_kb_knie').checked, schulter: document.getElementById('gf_kb_schulter').checked, aggro: document.getElementById('gf_kb_aggro').checked, konter: document.getElementById('gf_kb_konter').checked, mobil: document.getElementById('gf_kb_mobil').checked };
        results.push({ name: "Peek-a-Boo (Mike Tyson Style)", score: (p2.kraft*2 + p2.aggro*2 - p2.reichweite*2 - p2.mobil), danger: p2.schulter });
        results.push({ name: "Out-Fighter (Sniper)", score: (p2.reichweite*2 + p2.konter*2 + p2.mobil*2 - p2.aggro), danger: false });
        results.push({ name: "Dutch-Style Kickboxing", score: (p2.kraft*2 + p2.aggro*2), danger: p2.knie });
        results.push({ name: "Point-Fighter / Karate-Stance", score: (p2.schnell*2 + p2.mobil*2 + p2.konter*2), danger: p2.knie });
    } else if (currentSport === 'judo') {
        var p3 = { gross: document.getElementById('gf_ju_gross').checked, klein: document.getElementById('gf_ju_klein').checked, kraft: document.getElementById('gf_ju_kraft').checked, ruecken: document.getElementById('gf_ju_ruecken').checked, knie: document.getElementById('gf_ju_knie').checked, tachi: document.getElementById('gf_ju_tachi').checked, newaza: document.getElementById('gf_ju_newaza').checked, konter: document.getElementById('gf_ju_konter').checked };
        results.push({ name: "Drop-Throws (Seoi-Nage)", score: (p3.klein*3 + p3.tachi*2 - p3.gross*2), danger: p3.knie });
        results.push({ name: "Uchi-Mata / Harai-Goshi", score: (p3.gross*2 + p3.kraft*2 + p3.tachi*2), danger: p3.ruecken });
        results.push({ name: "Ashi-Waza (Fußwürfe / Konter)", score: (p3.gross*2 + p3.konter*3 + p3.tachi), danger: false });
        results.push({ name: "Ne-Waza Specialist (Boden)", score: (p3.newaza*3 - p3.tachi), danger: false });
    } else if (currentSport === 'mma') {
        var p4 = { kraft: document.getElementById('gf_mma_kraft').checked, reichweite: document.getElementById('gf_mma_reich').checked, ringer: document.getElementById('gf_mma_ringer').checked, kinn: document.getElementById('gf_mma_kinn').checked, knie: document.getElementById('gf_mma_knie').checked, stand: document.getElementById('gf_mma_stand').checked, boden: document.getElementById('gf_mma_boden').checked };
        results.push({ name: "Sprawl & Brawl (Striker mit TDD)", score: (p4.reichweite*2 + p4.stand*3 - p4.boden), danger: p4.kinn });
        results.push({ name: "Ground & Pound (Khabib Style)", score: (p4.kraft*2 + p4.ringer*2 + p4.boden*2 - p4.stand), danger: p4.knie });
        results.push({ name: "Submission Specialist (Oliveira)", score: (p4.boden*3 + p4.stand - p4.kraft), danger: false });
        results.push({ name: "Clinch Fighter / Dirty Boxing", score: (p4.kraft*2 + p4.ringer*2 + p4.stand*2), danger: p4.kinn });
    }

    results.sort(function(a,b) { return b.score - a.score; });
    var goodHtml = ""; var badHtml = "";
    results.forEach(function(r, index) {
        if(index < 2 && !r.danger) goodHtml += "<div class='gf-good'>+ " + r.name + "</div>";
        if(r.danger || r.score < -1) badHtml += "<div class='gf-bad'>- " + r.name + "</div>";
    });
    document.getElementById('gf-good-list').innerHTML = goodHtml || "<div style='color:#ccc'>Keine perfekte Übereinstimmung, spiel Basics!</div>";
    document.getElementById('gf-bad-list').innerHTML = badHtml || "<div style='color:#ccc'>Alles im grünen Bereich für dich.</div>";
    document.getElementById('gf-result-box').style.display = "block";
}

// ==========================================
// SECTION 3: SKILL RADAR ENGINE & CANVAS DIAGRAM
// ==========================================

function updateRadarSl(key) { document.getElementById('val_' + key).innerText = document.getElementById('sl_' + key).value; }

function saveRadar() {
    var stats = { top: parseInt(document.getElementById('sl_top').value), bot: parseInt(document.getElementById('sl_bot').value), wre: parseInt(document.getElementById('sl_wre').value), sub: parseInt(document.getElementById('sl_sub').value), car: parseInt(document.getElementById('sl_car').value) };
    safeSet('sgnRadarStats_' + currentSport, stats);
    document.getElementById('radarSliders').style.display = 'none';
    loadRadar();
}

function loadRadar() {
    var stats = safeGet('sgnRadarStats_' + currentSport, { top: 5, bot: 5, wre: 5, sub: 5, car: 5 });
    ['top', 'bot', 'wre', 'sub', 'car'].forEach(function(k) { 
        var sl = document.getElementById('sl_' + k);
        var val = document.getElementById('val_' + k);
        if(sl) sl.value = stats[k]; 
        if(val) val.innerText = stats[k]; 
    });
    var total = stats.top + stats.bot + stats.wre + stats.sub + stats.car;
    var overScore = document.getElementById('radarOverallScore');
    if(overScore) overScore.innerText = Math.round((total / 50) * 100) + "/100";

    var lowestStat = { key: '', val: 11 };
    var labels = sportConfig[currentSport].radar;
    var dict = { top: labels[0], sub: labels[1], bot: labels[2], car: labels[3], wre: labels[4] };
    
    var maxVal = 0;
    for(var k in stats) { 
        if(stats[k] < lowestStat.val) { lowestStat.val = stats[k]; lowestStat.key = k; } 
        if(stats[k] > maxVal) { maxVal = stats[k]; }
    }
    
    var fb = "";
    if (lowestStat.val === maxVal) {
        fb = "<span data-en='You currently have no major weaknesses. Your game is really balanced! Find focal points and keep working on them!'>Du hast aktuell keine Schwerpunkt-Baustellen. Dein Game ist richtig ausgeglichen! Suche dir Schwerpunkte und arbeite weiter daran!</span><br><br>";
    } else {
        fb = "Deine größte Baustelle ist aktuell <strong>" + dict[lowestStat.key] + "</strong>. <br><br>";
        if (currentSport === 'bjj') {
            if(lowestStat.key === 'top') fb += "💡 Tipp: Fokus auf Pressure Passing und die 10-Sekunden Regel!";
            else if(lowestStat.key === 'bot') fb += "💡 Tipp: Arbeite an Guard Retention und Attack to Sweep Setups.";
            else if(lowestStat.key === 'wre') fb += "💡 Tipp: Ohne Takedowns kein Kampf. Zwing dich im Sparring im Stand anzufangen.";
            else if(lowestStat.key === 'sub') fb += "💡 Tipp: Deine Kontrolle ist gut, aber du finisht nicht. Isolation vor Attacke!";
            else if(lowestStat.key === 'car') fb += "💡 Tipp: Einteilung ist alles. Sparring Runden bewusst nur defensiv atmen.";
        } else if (currentSport === 'mma') {
            if(lowestStat.key === 'top') fb += "💡 Tipp: Head-Movement und Kombinationen statt Einzelschläge.";
            else if(lowestStat.key === 'bot') fb += "💡 Tipp: Wall-Walks und Takedown-Defense üben!";
            else fb += "💡 Tipp: Sprich deinen Coach darauf an!";
        } else {
            fb += "💡 Tipp: Setze dir diesen Punkt als Ziel im nächsten Training!";
        }
    }
    var fbEl = document.getElementById('radarFeedback');
    if(fbEl) fbEl.innerHTML = fb;
    drawRadarChart([stats.top, stats.sub, stats.bot, stats.car, stats.wre], labels);
}

function drawRadarChart(scores, labels) {
    var canvas = document.getElementById('radarCanvas'); 
    if(!canvas) return;
    var ctx = canvas.getContext('2d'); 
    ctx.clearRect(0, 0, 300, 300);
    var centerX = 150, centerY = 150, radius = 90;
    ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
    for(var j=1; j<=5; j++) { ctx.beginPath(); for(var i=0; i<5; i++) { var angle = -Math.PI/2 + (2 * Math.PI * i / 5); var x = centerX + Math.cos(angle) * (radius/5 * j); var y = centerY + Math.sin(angle) * (radius/5 * j); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.closePath(); ctx.stroke(); }
    ctx.fillStyle = "#aaa"; ctx.font = "bold 10px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for(var i=0; i<5; i++) { var angle = -Math.PI/2 + (2 * Math.PI * i / 5); var x = centerX + Math.cos(angle) * radius; var y = centerY + Math.sin(angle) * radius; ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(x,y); ctx.stroke(); var lx = centerX + Math.cos(angle) * (radius + 25); var ly = centerY + Math.sin(angle) * (radius + 20); ctx.fillText(labels[i], lx, ly); }
    ctx.fillStyle = "rgba(231, 76, 60, 0.4)"; ctx.strokeStyle = "#e74c3c"; ctx.lineWidth = 2; ctx.beginPath();
    for(var i=0; i<5; i++) { var angle = -Math.PI/2 + (2 * Math.PI * i / 5); var val = scores[i] / 10; var x = centerX + Math.cos(angle) * (radius * val); var y = centerY + Math.sin(angle) * (radius * val); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); ctx.fillRect(x-2, y-2, 4, 4); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
}

// ==========================================
// SECTION 4: FIGHT CAMP PLANER ENGINE
// ==========================================

function calculateCamp() {
    var days = parseInt(document.getElementById('campDays').value); var curWtRaw = parseFloat(document.getElementById('campCurWt').value); var tarWtRaw = parseFloat(document.getElementById('campTarWt').value);
    var unit = document.getElementById('campUnit') ? document.getElementById('campUnit').value : 'kg';
    var isLbs = unit === 'lbs';
    var curWt = isLbs ? curWtRaw / 2.20462 : curWtRaw;
    var tarWt = isLbs ? tarWtRaw / 2.20462 : tarWtRaw; var freq = parseFloat(document.getElementById('campFreq').value); var dietType = document.getElementById('campDietType').value; var dietFocus = document.getElementById('campDiet').value; var volumeType = parseInt(document.getElementById('campVolume').value);
    if(!days || !curWt || !tarWt) return alert("Bitte alle Felder ausfüllen!"); if(curWt - tarWt <= 0) return alert("Du bist schon im Limit!");
    
    var totalLoss = curWt - tarWt; var bmr = 24 * curWt; var tdee = Math.round(bmr * freq);
    var maxSafeFatLoss = (curWt * 0.01) * (days / 7); var fatToLose = 0; var waterCut = 0;

    if (currentSport === 'fitness') { fatToLose = totalLoss; waterCut = 0; } 
    else { if (totalLoss <= maxSafeFatLoss) { waterCut = Math.min(totalLoss * 0.2, 2.0); fatToLose = totalLoss - waterCut; } else { fatToLose = maxSafeFatLoss; waterCut = totalLoss - fatToLose; } }

    var isDanger = false; var warningText = "";
    if (waterCut > curWt * 0.07) { isDanger = true; warningText += "⚠️ <strong>LEBENSGEFAHR:</strong> Zu hoher Water Cut (>7% des Körpergewichts). Kämpfe eine Klasse höher! Organversagen möglich.<br>"; waterCut = curWt * 0.07; fatToLose = totalLoss - waterCut; } else if (waterCut > curWt * 0.05) { warningText += "⚠️ <strong>WARNUNG:</strong> Hoher Water-Cut (über 5%). Performance-Einbruch und Nierenstress drohen.<br>"; } else if (waterCut > curWt * 0.03) { warningText += "ℹ️ Moderater Water-Cut. Achte auf Elektrolyt-Balance und Rehydration.<br>"; }
    if (currentSport === 'fitness' && fatToLose > maxSafeFatLoss) { isDanger = true; warningText += "⚠️ <strong>UNREALISTISCH:</strong> Du versuchst zu viel Fett in zu kurzer Zeit abzunehmen. Muskelabbau droht!<br>"; fatToLose = maxSafeFatLoss; }

    var dailyDeficit = Math.round((fatToLose * 7700) / days); var targetKcal = tdee - dailyDeficit;
    if (targetKcal < (bmr * 0.8)) { isDanger = true; warningText += "⚠️ <strong>HUNGER-MODUS:</strong> Defizit zu hoch (unter Grundumsatz).<br>"; targetKcal = Math.round(bmr * 0.8); }

    var alertBox = document.getElementById('campAlertBox'); if (warningText !== "") { alertBox.innerHTML = warningText; alertBox.style.display = "block"; alertBox.style.backgroundColor = isDanger ? "#600" : "#860"; alertBox.style.color = "#fff"; } else { alertBox.style.display = "none"; }

    var pMultiplier = (dietType === 'vegan' || dietType === 'vegetarisch') ? 2.5 : 2.2;
    var pGrams = Math.round(curWt * pMultiplier); var fGrams = Math.round(curWt * 0.9); var pKcal = pGrams * 4; var fKcal = fGrams * 9; var cKcal = targetKcal - pKcal - fKcal;
    if (dietFocus === 'lowcarb') { cKcal = 50 * 4; fKcal = targetKcal - pKcal - cKcal; fGrams = Math.max(Math.round(fKcal / 9), 0); }
    var cGrams = Math.max(Math.round(cKcal / 4), 0);

    var dietTips = "";
    if(dietType === 'vegan') dietTips += "🌱 Vegan: Proteinquellen mixen! "; if(dietType === 'vegetarisch') dietTips += "🥚 Veggie: Magerquark/Eiklar nutzen. "; if(dietType === 'pescetarisch') dietTips += "🐟 Pescetarisch: Lachs ist top für Gelenke. "; if(dietType === 'omnivor') dietTips += "🥩 Omnivor: Rotes Fleisch meiden. ";
    if(volumeType >= 4) dietTips += "<br>🥬 Sättigung: Viel Spinat/Brokkoli für Volumen."; else if(volumeType <= 2) dietTips += "<br>🥜 Leicht: Nüsse/Öle helfen auf Kalorien zu kommen.";

    document.getElementById('outTDEE').innerText = tdee + " kcal"; document.getElementById('outTargetKcal').innerText = targetKcal + " kcal"; document.getElementById('outProtein').innerText = pGrams + " g"; document.getElementById('outFatGrams').innerText = fGrams + " g"; document.getElementById('outCarbs').innerText = cGrams + " g";
    
    if (currentSport === 'fitness') { document.getElementById('outWater').innerText = "-"; 
    let outUnitFit = isLbs ? " lbs" : " kg";
    let flOutFit = isLbs ? fatToLose * 2.20462 : fatToLose;
    document.getElementById('outFat').innerText = flOutFit.toFixed(1) + outUnitFit;
     document.getElementById('outPhases').innerHTML = "<div class='camp-phase'><strong>HEALTH PHASE</strong>Ziehe dein Defizit gesund durch. Kein Wasserentzug! <br><br>" + dietTips + "</div>"; } 
    else { 
    let outUnit = isLbs ? " lbs" : " kg";
    let wcOut = isLbs ? waterCut * 2.20462 : waterCut;
    let flOut = isLbs ? fatToLose * 2.20462 : fatToLose;
    document.getElementById('outWater').innerText = wcOut.toFixed(1) + outUnit + " (Wasser/Water)"; 
    document.getElementById('outFat').innerText = flOut.toFixed(1) + outUnit + " (Fett/Fat)";
     var phasesHtml = "<p style='font-size:12px; color:#aaa; margin-top:0;'>" + dietTips + "</p>"; if(days > 28) phasesHtml += "<div class='camp-phase'><strong>PHASE 1: BASE CAMP (>4 Wochen)</strong>Diät strikt halten.</div><div class='camp-phase'><strong>PHASE 2: SHARPENING (2-4 Wochen)</strong>Intensität hoch.</div><div class='camp-phase'><strong>PHASE 3: TAPERING (Letzte Woche)</strong>Fight-Week (Water Loading) starten.</div>"; else phasesHtml += "<div class='camp-phase'><strong>AKUT-CAMP</strong>Wenig Zeit! Fettverbrennung maximieren.</div>"; document.getElementById('outPhases').innerHTML = phasesHtml; }
    document.getElementById('campResultBox').style.display = "block";
}

function generateTrainingPlan() {
    var days = parseInt(document.getElementById('campDays').value);
    if(!days) return alert("Bitte berechne zuerst den Fight Camp Planer!");
    
    var freqVal = parseFloat(document.getElementById('campFreq').value);
    var sessionsPerWeek = 3; if(freqVal === 1.55) sessionsPerWeek = 4; else if(freqVal === 1.75) sessionsPerWeek = 6;

    var radar = safeGet('sgnRadarStats_' + currentSport, { top: 5, bot: 5, wre: 5, sub: 5, car: 5 });
    var lowestStat = { key: 'car', val: 11 };
    for(var k in radar) { if(radar[k] < lowestStat.val) { lowestStat.val = radar[k]; lowestStat.key = k; } }

    var woche = []; var weakFocus = "";
    if (currentSport === 'bjj' || currentSport === 'judo') {
        if(lowestStat.key === 'car') weakFocus = "Kraftausdauer: HIIT / Tabata (z.B. Airdyne Bike), Kettlebell Swings.";
        else if(lowestStat.key === 'wre' || lowestStat.key === 'top') weakFocus = "Maximalkraft: Kreuzheben, Squats, Core-Stabilität.";
        else weakFocus = "Mobility & Isometrics: Hüftbeuger stretchen, statisches Halten (Planks).";
    } else {
        if(lowestStat.key === 'car') weakFocus = "Roadwork: 5km Läufe, Seilspringen, Schattenboxen mit Gewichten.";
        else if(lowestStat.key === 'top') weakFocus = "Schulter-Ausdauer: Battle Ropes, Medizinball-Slams, Push-Ups.";
        else weakFocus = "Beinkraft: Plyometrische Jumps, Lunges, Core.";
    }

    var isGrappling = (currentSport === 'bjj' || currentSport === 'judo');

    woche.push({ tag: "Montag", typ: "Klasse ("+currentSport.toUpperCase()+")", detail: "Fokus auf Technik & leichtes Sparring.", breathing: "Box Breathing (4-4-4-4)", stretch: "Hüfte & Beine" });
    woche.push({ tag: "Dienstag", typ: "S&C (Kraft & Kondition)", detail: weakFocus, breathing: isGrappling ? "Deep Water Protocol" : "Impact Reset", stretch: "Oberkörper & Schultern" });
    
    if(sessionsPerWeek >= 4) {
        woche.push({ tag: "Mittwoch", typ: "Klasse ("+currentSport.toUpperCase()+")", detail: "Hartes Sparring / Wettkampf-Pacing.", breathing: isGrappling ? "Guillotine Simulator" : "Adrenaline Dump (Mic)", stretch: "Full Body Flow" });
        woche.push({ tag: "Donnerstag", typ: "Active Recovery", detail: "Leichtes Cardio, Mobility, Foam Rolling.", breathing: "Box Breathing (4-4-4-4)", stretch: "Langer Spagat-Fokus" });
    }
    if(sessionsPerWeek >= 6) {
        woche.push({ tag: "Freitag", typ: "Klasse ("+currentSport.toUpperCase()+")", detail: "Drills & Situational Sparring.", breathing: isGrappling ? "Pressure Escape" : "High Intensity Pacer", stretch: "Nacken & Rücken" });
        woche.push({ tag: "Samstag", typ: "Open Mat / Cross-Training", detail: "Ausprobieren, Schwachstellen testen.", breathing: "Cage-Wall Drill (mit Vorbelastung)", stretch: "Cool Down Flow" });
        woche.push({ tag: "Sonntag", typ: "Rest Day", detail: "Komplette Erholung. Meal Prep.", breathing: "Max Breath Hold Test (Bestzeit checken!)", stretch: "Rest" });
    } else { 
        woche.push({ tag: "Wochenende", typ: "Open Mat oder Rest", detail: "Je nach Körpergefühl.", breathing: "Max Breath Hold Test", stretch: "Flexibility Test" }); 
    }

    var keys = ['top', 'sub', 'bot', 'car', 'wre'];
    var labelIndex = keys.indexOf(lowestStat.key);
    var radarLabel = sportConfig[currentSport].radar[labelIndex];

    var html = "<div class='card' style='border-left-color:#3498db;'><h3>📅 DEIN TRAININGSPLAN</h3><p style='font-size:12px; color:#aaa; margin-top:0;'>Automatisch generiert basierend auf deiner Schwachstelle <strong>(" + radarLabel + ")</strong>.</p>";
    var waText = "Mein GrAPP Fight Camp Plan:\n\n";
    
    woche.forEach(function(w) { 
        html += "<div class='plan-day'><strong>" + w.tag + " - " + w.typ + "</strong>";
        html += "<span style='display:block; margin-top:5px;'>🎯 " + w.detail + "</span>";
        if(w.breathing) html += "<span style='display:block; color:#8e44ad; font-size:11px; margin-top:3px;'>🫁 Mat Survival: " + w.breathing + "</span>";
        if(w.stretch) html += "<span style='display:block; color:#2ecc71; font-size:11px; margin-top:3px;'>🧘‍♂️ Stretch: " + w.stretch + "</span>";
        html += "</div>";
        
        waText += `*${w.tag}* - ${w.typ}\n🎯 ${w.detail}\n`;
        if(w.breathing) waText += `🫁 Mat Survival: ${w.breathing}\n`;
        if(w.stretch) waText += `🧘‍♂️ Stretch: ${w.stretch}\n`;
        waText += "\n";
    });
    
    var waUrl = "https://wa.me/?text=" + encodeURIComponent(waText);
    html += `<button class="btn btn-red" style="margin-top:15px; background:#2ecc71; border:none; width:100%; font-size:14px; padding:12px;" onclick="window.open('${waUrl}', '_blank')"><span class="icon">💬</span> PLAN PER WHATSAPP TEILEN</button>`;
    html += "</div>";

    document.getElementById('trainingPlanBox').innerHTML = html; document.getElementById('trainingPlanBox').style.display = "block";
}

// ==========================================
// SECTION 5: SMART ROUND TIMER ENGINE
// ==========================================

var rTimerInt; var isWorking = false; var currentRound = 1; var totalRounds = 3; var timeLeft = 0; var workTime = 0; var restTime = 0;
let timerAudioCtx = null;
let expectedEndTime = 0;
let wakeLock = null;
let warningBeeped = false;

function playTimerBeep(freq = 800, duration = 0.3) {
    try {
        if (!timerAudioCtx) {
            timerAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (timerAudioCtx.state === 'suspended') {
            timerAudioCtx.resume();
        }
        const osc = timerAudioCtx.createOscillator();
        const gainNode = timerAudioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, timerAudioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, timerAudioCtx.currentTime);
        
        osc.connect(gainNode);
        gainNode.connect(timerAudioCtx.destination);
        
        osc.start();
        osc.stop(timerAudioCtx.currentTime + duration);
    } catch(e) {
        console.warn("Audio Context failed", e);
    }
}

function setTimer(w, r, rounds) { document.getElementById('t-work').value = w; document.getElementById('t-rest').value = r; document.getElementById('t-rounds').value = rounds; }

async function startRoundTimer() { 
    workTime = Math.floor(parseFloat(document.getElementById('t-work').value) * 60); restTime = Math.floor(parseFloat(document.getElementById('t-rest').value) * 60); totalRounds = parseInt(document.getElementById('t-rounds').value); 
    if(workTime <= 0) return; document.getElementById('btnTimerStart').style.display = 'none'; document.getElementById('btnTimerStop').style.display = 'block'; currentRound = 1; isWorking = true; timeLeft = workTime; updateRDisplay(); 
    
    // Init Audio on user interaction
    playTimerBeep(1000, 0.1);
    
    // Request WakeLock to prevent screen from turning off automatically
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch(err) { console.log("WakeLock denied", err); }

    expectedEndTime = Date.now() + (timeLeft * 1000);
    warningBeeped = false;

    // Use 250ms interval to precisely catch seconds even if browser throttles background to 1s
    rTimerInt = setInterval(function() { 
        let now = Date.now();
        let remaining = Math.ceil((expectedEndTime - now) / 1000);
        
        // Prevent negative jumps
        if (remaining < 0) remaining = 0;
        
        if (timeLeft !== remaining) {
            timeLeft = remaining;
            updateRDisplay();
        }
        
        if(timeLeft === 10 && isWorking && !warningBeeped) {
            if("vibrate" in navigator) navigator.vibrate([100, 50, 100]); 
            playTimerBeep(600, 0.2); // 10 second warning beep
            warningBeeped = true;
        }
        
        if(timeLeft <= 0) { 
            if("vibrate" in navigator) navigator.vibrate([500, 200, 500]); 
            playTimerBeep(800, 0.5); // End of round/rest beep
            
            if(isWorking) { 
                if(currentRound >= totalRounds) { stopRoundTimer(); document.getElementById('timerDisplay').innerText = "DONE!"; return; } 
                isWorking = false; timeLeft = restTime; 
            } else { 
                isWorking = true; currentRound++; timeLeft = workTime; 
            } 
            expectedEndTime = Date.now() + (timeLeft * 1000); 
            warningBeeped = false;
            updateRDisplay(); 
        } 
    }, 250); 
}

function stopRoundTimer() { 
    clearInterval(rTimerInt); 
    document.getElementById('btnTimerStart').style.display = 'block'; 
    document.getElementById('btnTimerStop').style.display = 'none'; 
    document.getElementById('timerBox').style.borderColor = "#333"; 
    document.getElementById('timerDisplay').classList.remove("timer-rest-mode"); 
    if (wakeLock) { wakeLock.release().then(() => { wakeLock = null; }); }
}

function updateRDisplay() { var m = Math.floor(timeLeft / 60); var s = timeLeft % 60; document.getElementById('timerDisplay').innerText = String(m).padStart(2,'0')+":"+String(s).padStart(2,'0'); if(isWorking) { document.getElementById('roundDisplay').innerText = "RUNDE " + currentRound + " / " + totalRounds; document.getElementById('phaseDisplay').innerText = "FIGHT!"; document.getElementById('phaseDisplay').style.color = "#e74c3c"; document.getElementById('timerBox').style.borderColor = "#e74c3c"; document.getElementById('timerDisplay').classList.remove("timer-rest-mode"); } else { document.getElementById('roundDisplay').innerText = "PAUSE"; document.getElementById('phaseDisplay').innerText = "BREATHE"; document.getElementById('phaseDisplay').style.color = "#ffffff"; document.getElementById('timerBox').style.borderColor = "#ffffff"; document.getElementById('timerDisplay').classList.add("timer-rest-mode"); } }

// ==========================================
// SECTION 6: KALENDER & EVENTS (ICS EXPORT)
// ==========================================

function addEvent() { var name = document.getElementById('evName').value; var date = document.getElementById('evDate').value; var level = document.getElementById('evLevel').value; if(!name || !date) return alert("Bitte Name und Datum angeben!"); var events = safeGet('sgnEvents', []); events.push({ id: Date.now(), name: name, date: date, level: level }); safeSet('sgnEvents', events); document.getElementById('evName').value = ""; loadEvents(); }
function loadEvents() { 
    var events = safeGet('sgnEvents', []); 
    events.sort(function(a,b) { return new Date(a.date) - new Date(b.date); }); 
    var html = ""; 
    events.forEach(function(e) { 
        html += "<div class='card'><strong>" + e.name + "</strong><br><span style='font-size:11px; color:#aaa;'>📅 " + e.date + " | 🎚️ " + e.level + "</span><div style='margin-top:10px; display:flex; gap:5px; flex-wrap:wrap;'>";
        html += "<button class='btn-sm btn-sm-cal' onclick='exportICS(\"" + e.name + "\", \"" + e.date + "\")' data-en='📅 ICS'>📅 EXPORT</button>";
        html += "<button class='btn-sm btn-sm-cal' onclick='exportEventWA(\"" + e.name + "\", \"" + e.date + "\", \"" + e.level + "\")' style='background:#25D366; border-color:#25D366; color:#fff;'>📲 UMFRAGE STARTEN</button>";
        html += "<button class='btn-sm btn-sm-red' onclick='deleteEvent(" + e.id + ")'>X</button>";
        html += "</div></div>"; 
    }); 
    document.getElementById('eventList').innerHTML = html || "<p style='color:#888; font-size:12px;' data-en='No events planned.'>Keine Events geplant.</p>"; 
}
function deleteEvent(id) { var events = safeGet('sgnEvents', []); events = events.filter(function(e) { return e.id !== id; }); safeSet('sgnEvents', events); loadEvents(); }
function exportICS(name, dateStr) { var dp = dateStr.split('-'); var dtStart = dp[0]+dp[1]+dp[2]+"T090000Z"; var dtEnd = dp[0]+dp[1]+dp[2]+"T170000Z"; var icsMSG = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SGN Basecamp//DE\nBEGIN:VEVENT\nDTSTART:" + dtStart + "\nDTEND:" + dtEnd + "\nSUMMARY:[SGN Turnier] " + name + "\nEND:VEVENT\nEND:VCALENDAR"; var blob = new Blob([icsMSG], { type: 'text/calendar;charset=utf-8' }); var link = document.createElement('a'); link.href = window.URL.createObjectURL(blob); link.setAttribute('download', name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.ics'); document.body.appendChild(link); link.click(); document.body.removeChild(link); }
function exportEventWA(name, dateStr, level) {
    const groupLink = safeGet('grapp_wa_group', "");
    let msg = `🏆 *EVENT:* ${name}\n📅 *Datum:* ${dateStr}\n🥋 *Level:* ${level}\n\nWer ist dabei? Bitte antwortet hierauf oder nutzt die WhatsApp-Umfragefunktion!`;
    if(groupLink) {
        window.open("https://wa.me/?text=" + encodeURIComponent(msg), '_blank');
    } else {
        window.open("https://wa.me/?text=" + encodeURIComponent(msg), '_blank');
    }
}

// ==========================================
// SECTION 7: ADVANCED AND REPAIRED RULEBOOKS
// ==========================================

const GRAPP_RULEBOOK = {
    bjj: {
        ibjjf: {
            name: "IBJJF (International BJJ Federation)",
            adult: {
                White: "5 Min Matchzeit. Nur gerader Fußhebel (Straight Ankle Lock) erlaubt. Keine Sprung-Guard (Jump Guard), keine Wristlocks, keine Heel Hooks, kein Reaping, keine Kneebars/Toe Holds/Slicers.",
                Blue: "6 Min Matchzeit. Wristlocks und Sprung-Guard erlaubt. Beinhebel-Einschränkungen bleiben bestehen (nur gerader Fußhebel).",
                Purple: "7 Min Matchzeit. Technische Reife gefordert. Keine Beinhebel außer gerader Fußhebel im Gi.",
                Brown: "8 Min Matchzeit. Slicers (Bicep/Calf) sowie Toe Holds und Kneebars erlaubt. Keine Heel Hooks im Gi.",
                Black: "10 Min Matchzeit. Volles Regelwerk offen. Im No-Gi sind Heel Hooks/Reaping teils freigegeben."
            },
            kids: { Keine: "2-4 Min Matchzeit. Absolutes Verbot von Hebeln auf die Halswirbelsäule (z.B. Guillotine ohne Arm) und Guard-Jumping." }
        },
        grappling_industries: {
            name: "Grappling Industries (Round Robin)",
            adult: {
                White: "5 Min Matchzeit. Punkte-Format mit Round Robin (Jeder gegen Jeden!). Verboten: Alle Fußhebel (außer gerader Fußhebel im No-Gi), keine Wristlocks, kein Slamming.",
                Blue: "5 Min Matchzeit. Wristlocks erlaubt. Guillotines mit Achsel-Einschluss voll zulässig. Keine Heel Hooks / Toe Holds.",
                Purple: "5 Min Matchzeit. Im Gi: Keine Heel Hooks. Im No-Gi: HEEL HOOKS & REAPING VOLL ERLAUBT ab Purple!",
                Brown: "5 Min Matchzeit. Im Gi: Alle Submissions außer Heel Hooks. Im No-Gi: Maximales Regelwerk offen.",
                Black: "5 Min Matchzeit. Volles Submission-Format entsprechend der Gi / No-Gi Division."
            },
            kids: { Keine: "4 Min Matchzeit. Faires Round-Robin System. Kein Guard-Jumping, keine Fußhebel, keine Guillotines im Stand." }
        },
        adcc: {
            name: "ADCC (Submission Fighting World Federation)",
            adult: {
                White: "6 Min Matchzeit. No-Gi. Punkte erst in der zweiten Hälfte. Heel Hooks und Kneebars in Beginner/Intermediate verboten.",
                Blue: "6 Min Matchzeit. Intermediate. Kneebars und Toe Holds oft erlaubt, Heel Hooks noch verboten (je nach ADCC Open).",
                Purple: "8 Min Matchzeit. Advanced/Pro. Alle Beinhebel (inkl. Heel Hooks) legal. Neck Cranks erlaubt.",
                Brown: "8 Min Matchzeit. Volles Pro Regelwerk. Keine Strafen für Guard Pulling ohne Kontakt.",
                Black: "10 Min Matchzeit (20 Min Finale). Volles Regelwerk. Punkte ab 5 Minuten. Strenge Strafen für Passivität (Guard-Pulling = Minus-Punkt)."
            },
            kids: { Keine: "Streng angepasstes Regelwerk. Keine Spine Cranks, keine Heel Hooks, kein Guard-Jumping." }
        },
        ebi: {
            name: "EBI (Eddie Bravo Invitational)",
            adult: {
                White: "Sub-Only ohne Punkte. Bei Unentschieden: EBI-Overtime (Spiderweb oder Seatbelt/Back Control).",
                Blue: "Sub-Only ohne Punkte. EBI-Overtime entscheidet bei Zeitlimit.",
                Purple: "Sub-Only ohne Punkte. Heel Hooks erlaubt.",
                Brown: "Sub-Only. Volles Regelwerk.",
                Black: "10 Min Matchzeit. Bei Draw: 3 Runden EBI-Overtime. Kürzeste Escape-Zeit gewinnt, falls keine Sub."
            },
            kids: { Keine: "Sub-Only, modifizierte Erlaubnisse (Keine Rotations-Beinhebel)." }
        },
        cji: {
            name: "CJI (Craig Jones Invitational)",
            adult: {
                White: "3x5 Min. The Alley (Schräge Wände). 10-Point Must System (wie MMA).",
                Blue: "3x5 Min. The Alley. 10-Point Must System.",
                Purple: "3x5 Min. The Alley. 10-Point Must System.",
                Brown: "3x5 Min (Finale 5x5 Min). The Alley. 10-Point Must System.",
                Black: "3x5 Min (Finale 5x5 Min). The Alley. 10-Point Must System. Submissions beenden den Kampf vorzeitig."
            },
            kids: { Keine: "Turnier-Konzept primär für Pros, aber angepasste Jugendregeln möglich." }
        },
        naga: {
            name: "NAGA (North American Grappling Association)",
            adult: {
                White: "Novice/Beginner. No Heel Hooks. Keine Scissor Takedowns.",
                Blue: "Intermediate. Kneebars und Toe Holds erlaubt, Heel Hooks verboten.",
                Purple: "Expert. Volles Regelwerk inkl. Heel Hooks.",
                Brown: "Expert. Volles Regelwerk.",
                Black: "Expert. Volles Regelwerk. Oft getrennt nach Gi und No-Gi."
            },
            kids: { Keine: "Kinder und Teenager dürfen keine Neck Cranks oder Beinhebel anwenden." }
        }
    },
    mma: {
        ufc_unified: {
            name: "UFC / Unified Rules (Profis)",
            adult: { Keine: "3x5 Min (Titelkämpfe 5x5 Min). Ellenbogen zum Kopf uneingeschränkt erlaubt (12-to-6 seit 2024 legal). Knie/Kicks zum Kopf nur gegen stehende Gegner. Grounded Fighter: Ein Kämpfer gilt als am Boden, sobald ein anderes Körperteil als Hände oder Fußsohlen den Boden berührt. Hände allein auf dem Boden = NICHT grounded (Regeländerung)." },
            kids: { Keine: "Jugend-MMA: Absolutes Verbot von jeglichen Wirkungstreffern (Schläge/Kicks) zum Kopf! Fokus auf Takedowns und Grappling." }
        },
        immaf: {
            name: "IMMAF (Amateure / Meisterschaften)",
            adult: {
                White: "3x3 Min Matchzeit. Ellenbogenschläge zum Kopf im Stand und am Boden strikt verboten! Knie zum Kopf verboten. Schienbeinschützer verpflichtend.",
                Blue: "Advanced Amateur Format. Strenges medizinisches Monitoring, keine Nackenhebel ohne Armeinschluss.",
                Purple: "Turnier-Standard der Amateure. Keine Wirkungstreffer zum Kopf am Boden.",
                Brown: "Elite-Amateur Level. Ellenbogenverbot bleibt zum Schutz vor Cuts bestehen.",
                Black: "Internationaler IMMAF-Championship-Standard."
            },
            kids: { Keine: "Absolutes Verbot von Kopftreffern. Schutzausrüstung maximal (Kopfschutz, Schienbein, Westen)." }
        }
    },
    kickboxen: {
        iska: {
            name: "Glory / K-1 Rules",
            adult: { Keine: "3x3 Min. Kicks zu allen Ebenen (inkl. Lowkicks) sowie Boxschläge und Knie zum Körper/Kopf erlaubt. Clinchen extrem eingeschränkt: Nur ein direktes Knie im Clinch erlaubt, danach muss sofort getrennt werden. Keine Würfe, keine Ellenbogen." },
            kids: { Keine: "Jugend K-1: Streng kontrollierter Leichtkontakt oder Semikontakt ohne harte Wirkungstreffer zum Kopf." }
        },
        wako: {
            name: "WAKO (Amateur-Weltverband)",
            adult: {
                White: "Vollkontakt (Full Contact): Nur Tritte oberhalb der Gürtellinie erlaubt. Keine Lowkicks, keine Knieaktionen.",
                Blue: "Low Kick Division: Tritte auf die Oberschenkel (Lowkicks) erlaubt. Keine Knie, kein Clinch.",
                Purple: "K-1 Style (Amateure): Lowkicks und Knie zum Körper und Kopf erlaubt. Begrenztes Clinchen für direktes Knie. Schienbeinschützer und Kopfschutz Pflicht.",
                Brown: "A-Klasse Turnierformat nach offiziellen WAKO-Amateurrichtlinien.",
                Black: "Meisterschafts-Standard. Fokus auf technischer Präzision."
            },
            kids: { Keine: "Jugend-WAKO: Strenges Verbot von K0-Treffen. Fokus auf Point-Fighting oder kontrolliertem Leichtkontakt." }
        }
    },
    judo: {
        ijf: {
            name: "IJF (Wettkampf-Judo)",
            adult: { Keine: "4 Min Kampfzeit, bei Gleichstand: Golden Score (Verlängerung ohne Zeitlimit, Sudden Death). Wertungen: Ippon (direkter Sieg), Waza-ari (2× = Ippon), Yuko (seit 2024 wieder eingeführt, kleinste Wertung). Greifen an die Beine im Stand verboten. Kansetsu-waza (nur Ellenbogenhebel) und Würger (Shime-waza) erlaubt." },
            kids: { Keine: "Hebel und Würger in den jungen Altersklassen (U12) streng reglementiert bzw. verboten." }
        }
    }
};

function initRulesView() {
    const sportSelect = document.getElementById('globalSport')?.value || 'bjj';
    const ruleSportSelect = document.getElementById('ruleSport');
    if (!ruleSportSelect) return;

    ruleSportSelect.innerHTML = "";

    if (GRAPP_RULEBOOK[sportSelect]) {
        for (var fed in GRAPP_RULEBOOK[sportSelect]) {
            ruleSportSelect.options.add(new Option(GRAPP_RULEBOOK[sportSelect][fed].name, fed));
        }
    }
    
    // Custom Rulesets
    var customRules = safeGet('sgnCustomRulesets_' + sportSelect, {});
    for (var fedId in customRules) {
        ruleSportSelect.options.add(new Option("⭐ " + customRules[fedId].name, "custom_" + fedId));
    }
    
    handleAgeChange();
    if (typeof initSurveyQuestions === 'function') initSurveyQuestions();
}

function handleSportChange() { initRulesView(); }

function handleAgeChange() {
    const age = document.getElementById('ruleAge')?.value || 'adult';
    const beltSelect = document.getElementById('ruleBelt');
    const beltWrapper = document.getElementById('wrapperRuleBelt');
    if (!beltSelect) return;

    // Ausblenden der Gürtelauswahl bei Sportarten ohne Gurtsystem im Wettkampf
    if (currentSport !== 'bjj' && beltWrapper) {
        beltWrapper.style.display = 'none';
    } else if (beltWrapper) {
        beltWrapper.style.display = 'block';
    }

    beltSelect.innerHTML = "";

    if (age === 'kids') {
        beltSelect.options.add(new Option("Kids / Jugend (Alle Klassen)", "Keine"));
    } else {
        beltSelect.options.add(new Option("White / Beginner", "White"));
        beltSelect.options.add(new Option("Blue / Intermediate", "Blue"));
        beltSelect.options.add(new Option("Purple / Advanced", "Purple"));
        beltSelect.options.add(new Option("Brown / Elite", "Brown"));
        beltSelect.options.add(new Option("Black Belt / Master", "Black"));
    }
    updateRules();
}

function updateRules() {
    const sport = document.getElementById('globalSport')?.value || 'bjj';
    const federation = document.getElementById('ruleSport')?.value || 'ibjjf';
    const age = document.getElementById('ruleAge')?.value || 'adult';
    const belt = document.getElementById('ruleBelt')?.value || 'White';
    const resultBox = document.getElementById('rulesResult');

    if (!resultBox) return;

    try {
        let text = "";
        if (federation.startsWith('custom_')) {
            var fedId = federation.replace('custom_', '');
            var customRules = safeGet('sgnCustomRulesets_' + sport, {});
            text = customRules[fedId]?.[age]?.[belt] || "Keine Regel-Spezifikation gefunden.";
        } else {
            text = GRAPP_RULEBOOK[sport][federation][age][belt];
        }
        
        let lang = document.getElementById('langSelect') ? document.getElementById('langSelect').value : 'de';
        if (lang === 'en' && text) {
            text = text.replace(/5 Min Matchzeit\. Nur gerader Fußhebel \(Straight Ankle Lock\) erlaubt\. Keine Sprung-Guard \(Jump Guard\), keine Wristlocks, keine Heel Hooks, kein Reaping, keine Kneebars\/Toe Holds\/Slicers\./g, "5 Min match time. Only straight ankle lock allowed. No jump guard, no wristlocks, no heel hooks, no reaping, no kneebars/toe holds/slicers.");
        }

        resultBox.innerHTML = text ? `<strong data-en="Rule Specification:">Regel-Spezifikation:</strong><br><br>${text}` : "<span data-en='No specific rules found for this selection.'>Keine spezifischen Regeln für diese Auswahl hinterlegt.</span>";
    } catch (e) {
        resultBox.innerHTML = "Wähle oben den passenden Verband aus, um die Filterregeln anzuzeigen.";
    }
}

// ==========================================
// SECTION 8: JUGENDSCHUTZ & CORNER INFO SYSTEM
// ==========================================

function loadCornerInfo() {
    const name = localStorage.getItem('grapp_user_name') || "<span data-en='Not specified'>Nicht angegeben</span>";
    const address = localStorage.getItem('grapp_user_address') || "<span data-en='No address provided'>Keine Adresse hinterlegt</span>";
    const birthdate = localStorage.getItem('grapp_user_birthdate') || "<span data-en='Unknown'>Unbekannt</span>";
    const bloodType = localStorage.getItem('grapp_user_bloodtype') || "<span data-en='Unknown'>Unbekannt</span>";
    const meds = localStorage.getItem('grapp_user_medication') || "<span data-en='No restrictions provided'>Keine Einschränkungen hinterlegt</span>";
    const emergencyPhone = localStorage.getItem('grapp_user_phone') || "<span data-en='No number provided'>Keine Nummer hinterlegt</span>";
    
    let isU18 = false;
    if (birthdate && birthdate !== "<span data-en='Unknown'>Unbekannt</span>") {
        const birthDateObj = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = today.getMonth() - birthDateObj.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) age--;
        if (age < 18 && age > 0) isU18 = true;
    }
    
    let html = `<div style="margin-bottom:10px;"><strong>Name:</strong> ${name}</div>`;
    html += `<div style="margin-bottom:10px;"><strong>Adresse:</strong> ${address}</div>`;
    html += `<div style="margin-bottom:10px;"><strong>Geburtsdatum:</strong> ${birthdate}</div>`;
    html += `<div style="margin-bottom:10px;"><strong>Blutgruppe:</strong> ${bloodType}</div>`;
    html += `<div style="margin-bottom:10px;"><strong>Notfallkontakt:</strong> ${emergencyPhone}</div>`;
    html += `<div style="margin-bottom:10px; color:#e74c3c;"><strong>Medikamente/Allergien:</strong><br>${meds}</div>`;
    
    if (isU18) {
        const pName = localStorage.getItem('grapp_parent_name') || "<span data-en='Not specified'>Nicht angegeben</span>";
        const pPhone = localStorage.getItem('grapp_parent_phone') || "<span data-en='Not specified'>Nicht angegeben</span>";
        html += `<h4 style="color:#f1c40f; margin-top:20px; border-top:1px solid #333; padding-top:15px;">🛡️ U18 JUGENDSCHUTZ</h4>`;
        html += `<div style="margin-bottom:10px;"><strong>Elternteil:</strong> ${pName}</div>`;
        html += `<div style="margin-bottom:10px;"><strong>Eltern-Telefon:</strong> ${pPhone}</div>`;
    }
    
    const container = document.getElementById('manifestReadOnlyContent');
    if (container) container.innerHTML = html;
}

function exportCornerToCoach() {
    const name = localStorage.getItem('grapp_user_name');
    const blood = localStorage.getItem('grapp_user_bloodtype') || "<span data-en='Unknown'>Unbekannt</span>";
    const med = localStorage.getItem('grapp_user_medication') || "Keine Einschränkungen hinterlegt.";
    
    if(!name || name === "") {
        alert("Bitte trage zuerst deinen Namen im Profil ein!");
        return;
    }

    let message = `*📋 CORNER INFO & EMERGENCY - GRAPP*\n`;
    message += `• *Name:* ${name}\n`;
    message += `• *Blutgruppe:* ${blood}\n`;
    message += `• *Medizinisches:* ${med}\n`;

    const birthdate = localStorage.getItem('grapp_user_birthdate');
    let isU18 = false;
    if (birthdate) {
        const bDate = new Date(birthdate);
        let age = new Date().getFullYear() - bDate.getFullYear();
        if (new Date().getMonth() < bDate.getMonth() || (new Date().getMonth() === bDate.getMonth() && new Date().getDate() < bDate.getDate())) age--;
        if (age < 18 && age > 0) isU18 = true;
    }

    if (isU18) {
        const pName = localStorage.getItem('grapp_parent_name') || "<span data-en='Not specified'>Nicht angegeben</span>";
        const pPhone = localStorage.getItem('grapp_parent_phone') || "<span data-en='Not specified'>Nicht angegeben</span>";
        
        message += `\n*🚨 JUGENDSCHUTZ-EINVERSTÄNDNIS (U18):*\n`;
        message += `• *Erzieher:* ${pName}\n`;
        message += `• *Notfall-Tel:* ${pPhone}\n`;
        message += `• *Eltern-Signatur:* JA (Validiert)\n`;
    }

    const coachPhone = localStorage.getItem('grapp_coach_phone') || "4917631096222";
    window.open(`https://wa.me/${coachPhone}?text=${encodeURIComponent(message)}`, '_blank');
}


// ==========================================
// SECTION 9: TEAM-UMFRAGEN & PRO MONETARISIERUNG
// ==========================================

function triggerDonationNextSteps() {
    const modal = document.getElementById('thankYouModal');
    if (modal) modal.classList.add('active');
    
    const text = encodeURIComponent("Hi Martin, ich habe gerade über den GiroCode für die GrAPP gespendet! 🎉 Schickst du mir bei Gelegenheit meinen Pro-Schlüssel rüber? Danke dir! 💪🥋");
    const coachPhone = localStorage.getItem('grapp_coach_phone') || "4917631096222";
    
    setTimeout(() => {
        if (confirm("Möchtest du jetzt direkt deinen Pro-Schlüssel per WhatsApp bei Martin anfordern?")) {
            window.open(`https://wa.me/${coachPhone}?text=${text}`, '_blank');
        }
    }, 2000);
}

function renderGiroCode() {
    const container = document.getElementById('giroCodeBox');
    if (!container) return;
    
    // Check if it's already rendered to prevent duplicates
    if (container.innerHTML !== '') return;

    // EPC-QR-Code (GiroCode) Format
    // Line breaks are strictly \n
    const iban = "DE27760695530001040138";
    const name = "Martin Kremmel";
    const epcString = `BCD\n002\n1\nSCT\n\n${name}\n${iban}\nEUR\n\n\nGrAPP Support`;

    // Render using qrcodejs
    try {
        new QRCode(container, {
            text: epcString,
            width: 160,
            height: 160,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.M
        });
    } catch(e) {
        console.warn("QRCode JS not loaded or error rendering GiroCode");
    }
}

function closeThankYouModal() {
    document.getElementById('thankYouModal')?.classList.remove('active');
}

function openTeamSurvey() {
    const method = localStorage.getItem('grapp_survey_method') || 'google';
    const box = document.getElementById('surveyQuestionsBox');
    const submitBtn = document.querySelector('#view-survey .btn-red');

    if (method === 'disabled') {
        if(box) box.innerHTML = "<div style='background:rgba(231,76,60,0.10); border-left:4px solid #e74c3c; padding:18px; color:#ccc; font-size:13px; line-height:1.6; border-radius:0 8px 8px 0;'><span style='font-size:22px; display:block; margin-bottom:8px;'>📋</span><strong style='color:#e74c3c; font-size:14px;'>Team-Umfrage derzeit deaktiviert</strong><br><br>Dein Gym hat die anonyme Team-Umfrage derzeit deaktiviert. Bitte wende dich bei Feedback oder Problemen direkt an deinen Headcoach.<br><br><span style='font-size:11px; color:#888;'>Du kannst alternativ jederzeit den Bereich <strong>Crew Feedback</strong> nutzen, um einen strukturierten Bericht einzureichen.</span></div>";
        if(submitBtn) submitBtn.style.display = 'none';
    } else if (method === 'google') {
        const formUrl = localStorage.getItem('grapp_form_id');
        if (formUrl) {
            window.open(formUrl, '_blank');
            localStorage.setItem('grapp_last_survey_date', Date.now());
            switchView('view-menu');
            return;
        } else {
            alert("Es wurde noch kein Google Forms Link vom Coach hinterlegt.");
            return;
        }
    } else {
        initSurveyQuestions();
        if(submitBtn) submitBtn.style.display = 'block';
    }
    switchView('view-survey');
}

function initSurveyQuestions() {
    const container = document.getElementById('surveyQuestionsBox');
    if (!container) return;
    
    const questions = [
        "Ich fühle mich in meinem Team respektiert und wertgeschätzt.",
        "Ich kann Fehler machen, ohne dafür ausgelacht oder herabgesetzt zu werden.",
        "Mein Coach achtet auf meine körperlichen Grenzen und Verletzungen.",
        "Die Trainingsintensität wird an das Level der Teilnehmer angepasst.",
        "Ich habe das Gefühl, dass auf Hygiene (Matte, Kleidung) geachtet wird.",
        "Probleme oder Konflikte im Team werden offen und konstruktiv geklärt.",
        "Es gibt keinen ungesunden Druck, verletzt oder krank trainieren zu müssen.",
        "Die Trainingsinhalte bauen logisch aufeinander auf.",
        "Ich weiß, was von mir als Schüler erwartet wird.",
        "Feedback vom Coach ist hilfreich und sachlich.",
        "Neue Trainingspartner werden gut ins Team integriert.",
        "Das Sparring findet in einer kontrollierten und sicheren Atmosphäre statt.",
        "Ich traue mich, meinem Coach Fragen zu stellen.",
        "Grenzüberschreitungen werden vom Gym-Leader nicht toleriert.",
        "Ich gehe nach dem Training meistens mit einem positiv Gefühl nach Hause."
    ];
    
    let html = "";
    questions.forEach((q, i) => {
        html += `<div style="margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
            <p style="font-size:13px; color:#fff; margin-bottom:5px;"><strong>Frage ${i+1}:</strong> ${q}</p>
            <div style="display:flex; justify-content:space-between; gap:5px;">`;
        for(let val=1; val<=5; val++) {
            html += `<label style="font-size:11px; text-align:center; color:#aaa; cursor:pointer; text-transform:none; font-weight:normal;">
                <input type="radio" name="survey_q_${i}" value="${val}" style="margin-bottom:3px;"><br>${val}
            </label>`;
        }
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

function submitSurvey() {
    const feedbackText = document.getElementById('surveyFeedback').value;
    const nameText = document.getElementById('surveyName').value || "Anonym";
    const contactChecked = document.getElementById('surveyContact').checked ? "JA" : "NEIN";
    const coachPhone = localStorage.getItem('grapp_coach_phone');
    
    if(!coachPhone) {
        alert("Dein Gym hat keine Telefonnummer für das Feedback hinterlegt.");
        return;
    }
    
    let report = `*GrAPP KLIMA-FEEDBACK*\n`;
    report += `• *Absender:* ${nameText}\n`;
    report += `• *Kontakt gewünscht:* ${contactChecked}\n\n`;
    report += `*Antworten (Skala 1-5):*\n`;
    
    let allAnswered = true;
    for (let i = 0; i < 15; i++) {
        const radios = document.getElementsByName(`survey_q_${i}`);
        let checkedValue = null;
        for (let r = 0; r < radios.length; r++) {
            if (radios[r].checked) { checkedValue = radios[r].value; break; }
        }
        if(!checkedValue) allAnswered = false;
        report += `• F${i+1}: ${checkedValue || "X"}\n`;
    }
    
    if(!allAnswered && !confirm("Du hast nicht alle Fragen beantwortet. Trotzdem absenden?")) return;
    if (feedbackText) report += `\n*Freitext Feedback:*\n${feedbackText}\n`;
    
    window.open(`https://wa.me/${coachPhone}?text=${encodeURIComponent(report)}`, '_blank');
    
    localStorage.setItem('grapp_last_survey_date', Date.now());
    
    // Reset Form
    document.getElementById('surveyFeedback').value = "";
    if(document.getElementById('surveyName')) document.getElementById('surveyName').value = "";
    if(document.getElementById('surveyContact')) document.getElementById('surveyContact').checked = false;
    switchView('view-menu');
}

function checkSurveyReminder() {
    var method = localStorage.getItem('grapp_survey_method') || 'google';
    var banner = document.getElementById('surveyReminder');
    
    if (method === 'disabled') {
        if(banner) banner.style.display = 'none';
        return;
    }

    var installDate = safeGet('sgnAppInstallDate', 0);
    var now = Date.now();
    if(!installDate) {
        installDate = now;
        safeSet('sgnAppInstallDate', installDate);
    }
    
    var lastSurveyDate = safeGet('grapp_last_survey_date', 0);
    var cycleMs = 180 * 24 * 60 * 60 * 1000; 
    var windowWeeks = parseInt(localStorage.getItem('grapp_survey_window') || "2"); 
    var windowMs = windowWeeks * 7 * 24 * 60 * 60 * 1000;
    
    var isActive = false;
    var cyclesPassed = Math.floor((now - installDate) / cycleMs);
    var currentCycleStart = installDate + (cyclesPassed * cycleMs);
    
    if (cyclesPassed > 0 && now >= currentCycleStart && now <= currentCycleStart + windowMs) {
        if (lastSurveyDate < currentCycleStart) isActive = true;
    }
    
    if (safeGet('debugForceSurveyFlag', false)) isActive = true;
    
    if (isActive) {
        if(banner) banner.style.display = 'block';
        if ("Notification" in window && Notification.permission === "granted") {
            var notifiedCycle = safeGet('sgnSurveyNotifiedCycle', -1);
            if(notifiedCycle !== cyclesPassed || safeGet('debugForceSurveyFlag', false)) {
                new Notification("🧠 Team Umfrage fällig!", { body: "Es ist Zeit für das halbjährliche Klima-Feedback." });
                safeSet('sgnSurveyNotifiedCycle', cyclesPassed);
                safeSet('debugForceSurveyFlag', false);
            }
        }
    } else {
        if(banner) banner.style.display = 'none';
    }
}

function debugForceSurvey() {
    safeSet('debugForceSurveyFlag', true);
    checkSurveyReminder();
    alert("🛠️ Debug-Modus: Umfrage-Banner erzwungen! Gehe zurück zum Hauptmenü.");
}

// ==========================================
// SECTION 10: CREW FEEDBACK & DEBRIEFING (AVIATION)
// ==========================================

function toggleFbIdentity() {
    const identities = document.getElementsByName('fbIdentity');
    const contactBox = document.getElementById('fbContactBox');
    if (!contactBox) return;
    
    let selectedValue = 'anonym';
    for (let i = 0; i < identities.length; i++) {
        if (identities[i].checked) { selectedValue = identities[i].value; break; }
    }
    contactBox.style.display = (selectedValue === 'anonym') ? 'none' : 'block';
}

function sendCrewFeedback() {
    const urgency = document.getElementById('fbUrgency').value;
    const category = document.getElementById('fbCategory').value;
    const problem = document.getElementById('fbProblem').value.trim();
    const solution = document.getElementById('fbSolution').value.trim();
    
    if (!problem || !solution) { alert("Bitte fülle Beobachtung und Lösungsvorschlag aus!"); return; }
    
    const identities = document.getElementsByName('fbIdentity');
    let identityType = 'anonym';
    for (let i = 0; i < identities.length; i++) {
        if (identities[i].checked) { identityType = identities[i].value; break; }
    }
    
    const contactData = document.getElementById('fbContactData')?.value || "Keine Kontaktdaten";
    
    let report = `*GrAPP CREW FEEDBACK*\n`;
    report += `• *Priorität:* ${urgency}\n`;
    report += `• *Kategorie:* ${category}\n\n`;
    report += `*Beobachtung:*\n${problem}\n\n`;
    report += `*Lösungsvorschlag:*\n${solution}\n\n`;
    report += `*Meldungsart:* ${identityType.toUpperCase()}\n`;
    
    if (identityType !== 'anonym') report += `• *Kontakt:* ${contactData}\n`;
    
    const coachPhone = localStorage.getItem('grapp_coach_phone') || "4917631096222";
    window.open(`https://wa.me/${coachPhone}?text=${encodeURIComponent(report)}`, '_blank');
}

// ==========================================
// SECTION 11: HYPERBOLIC STRETCHING PROGRAMM
// ==========================================

var currentStretchId = "";

function loadStretchingPlan() {
    var progress = safeGet('sgnStretchProgress', []);
    var html = "";
    var totalSessions = 0;

    for(var w = 1; w <= 4; w++) {
        html += "<div class='card' style='border-left-color: #e74c3c;'>";
        let wTitle = "WOCHE " + w + (w === 4 ? " (ADVANCED)" : "");
        let wTitleEn = "WEEK " + w + (w === 4 ? " (ADVANCED)" : "");
        html += "<h3 style='margin-top:5px;' data-en='" + wTitleEn + "'>" + wTitle + "</h3>";
        html += "<div style='display:flex; gap:5px; margin-top:10px;'>";
        
        for(var d = 1; d <= 4; d++) {
            var sessionId = "w" + w + "_d" + d;
            var isDone = progress.includes(sessionId);
            if(isDone) totalSessions++;
            
            var bg = isDone ? "#2ecc71" : "#333";
            var color = isDone ? "#000" : "#fff";
            
            let tagTxt = isDone ? "✅" : "Tag " + d; let tagTxtEn = isDone ? "✅" : "Day " + d; html += "<button class='btn-sm' style='flex:1; padding:12px 5px; background:" + bg + "; color:" + color + "; border:none; border-radius:4px; font-weight:bold; cursor:pointer;' onclick='openStretchModal(" + w + ", " + d + ", \"" + sessionId + "\")'><span data-en='" + tagTxtEn + "'>" + tagTxt + "</span></button>";
        }
        html += "</div></div>";
    }

    var stretchWeekEl = document.getElementById('stretchingWeeks');
    if(stretchWeekEl) stretchWeekEl.innerHTML = html;
    var stretchProgEl = document.getElementById('stretchProgress');
    if(stretchProgEl) stretchProgEl.innerText = totalSessions + "/16" + (totalSessions === 16 ? " ✅" : "");
    if (document.getElementById('globalLang') && document.getElementById('globalLang').value === 'en') changeLanguage();
}

function openStretchModal(w, d, id) {
    currentStretchId = id;
    var progress = safeGet('sgnStretchProgress', []);
    var notes = safeGet('sgnStretchNotes', {});
    var isDone = progress.includes(id);

    document.getElementById('modalStretchTitle').setAttribute('data-en', "WEEK " + w + " - DAY " + d);
    document.getElementById('modalStretchTitle').innerText = "WOCHE " + w + " - TAG " + d;
    document.getElementById('modalStretchNotes').value = notes[id] || "";

    var html = "<strong style='color:#3498db;'>1. WARM-UP (10-15 Min)</strong><ul style='margin-top:5px; padding-left:20px; margin-bottom:15px;'><li>Gelenkrotationen</li><li>5 Min leichtes Cardio</li><li>Leichtes statisches Dehnen</li></ul>";
    html += "<strong style='color:#e74c3c;'>2. KRAFT (Spezifisch)</strong><ul style='margin-top:5px; padding-left:20px; margin-bottom:15px;'><li>Adductor Flies</li><li>Hamstring Curls</li></ul>";

    if(w < 4) {
        html += "<strong style='color:#2ecc71;'>3. HYPERBOLIC STRETCHES</strong><ul style='margin-top:5px; padding-left:20px; margin-bottom:15px;'><li>Erhöhter Adduktoren-Stretch</li><li>Hüftbeuger-Stretch</li><li>Erhöhter Beinbeuger-Stretch</li></ul>";
    } else {
        html += "<strong style='color:#2ecc71;'>3. ADVANCED STRETCHES</strong><ul style='margin-top:5px; padding-left:20px; margin-bottom:15px;'><li>Straddle Split (Advanced)</li><li>Front Split (Advanced)</li></ul>";
    }

    document.getElementById('modalStretchInfo').innerHTML = html;

    if(isDone) {
        document.getElementById('btnUncheckStretch').style.display = "block";
        document.getElementById('btnSaveStretch').innerText = "BEMERKUNG AKTUALISIEREN";
    } else {
        document.getElementById('btnUncheckStretch').style.display = "none";
        document.getElementById('btnSaveStretch').innerText = "ABHAKEN & SPEICHERN";
    }

    document.getElementById('stretchModal').style.display = "flex";
}

function closeStretchModal() { document.getElementById('stretchModal').style.display = "none"; }

function saveStretchSession() {
    var progress = safeGet('sgnStretchProgress', []);
    var notes = safeGet('sgnStretchNotes', {});

    if(!progress.includes(currentStretchId)) progress.push(currentStretchId);
    notes[currentStretchId] = document.getElementById('modalStretchNotes').value;

    safeSet('sgnStretchProgress', progress);
    safeSet('sgnStretchNotes', notes);

    closeStretchModal();
    loadStretchingPlan();
}

function uncheckStretchSession() {
    var progress = safeGet('sgnStretchProgress', []);
    var index = progress.indexOf(currentStretchId);
    if(index > -1) {
        progress.splice(index, 1);
        safeSet('sgnStretchProgress', progress);
    }
    closeStretchModal();
    loadStretchingPlan();
}

// ==========================================
// SECTION 12: HOOKS & SYNC INTERFACES (PRO)
// ==========================================

function sendAttendeeToWebhook(studentData) {
    if (!isUserPro()) {
        alert("System-Check: Pro-Status nicht aktiv! Senden blockiert.");
        console.log("Sync übersprungen: Google Sheets Echtzeitübertragung ist ein Pro-Feature.");
        return;
    }
    const webhookUrl = localStorage.getItem('grapp_webhook_url');
    if (!webhookUrl) {
        alert("System-Check: Kein Webhook Link im Profil gefunden!");
        return;
    }
    
    alert("System-Check: Sende Daten an Google! Link startet mit: " + webhookUrl.substring(0, 45) + "...");

    fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
    })
    .then(() => console.log("Live-Tracking: Erfolgreich an Google Sheets übertragen."))
    .catch(err => console.error("Webhook Error:", err));
}

function processTeamFeedbackAutomation() {
    if (!isUserPro()) return null;
    return {
        timestamp: new Date().toISOString(),
        status: "Bereit für automatische Feedback-Aggregation"
    };
}

function renderCustomLinks() {
    var box = document.getElementById('dynamicLinksBox');
    if(!box) return;
    
    // Versuche, die 3 konfigurierbaren Pro-Links dynamisch einzulesen
    var html = '';
    var hasValidLinks = false;
    
    for(let i=1; i<=3; i++) {
        var name = localStorage.getItem(`grapp_cl${i}_name`);
        var url = localStorage.getItem(`grapp_cl${i}_url`);
        if(name && url) {
            html += `<a href="${url}" target="_blank" class="btn btn-dark" style="border-left: 5px solid var(--accent-color);">🔗 ${name}</a>`;
            hasValidLinks = true;
        }
    }
    
    if(hasValidLinks) {
        box.innerHTML = html;
    } else {
        // Fallback Standard-Links
        box.innerHTML = `
            <a href="https://drive.google.com/drive/folders/10r-OPRRbqVRjCtOJFmZSs3ZIvra0yVPg" target="_blank" class="btn btn-white">🎬 DRIVE SEMINARE</a>
            <a href="https://campus.grofs.de/reg/kursseite/umgang-mit-stalking/" target="_blank" class="btn btn-red">🛡️ SELBSTVERTEIDIGUNG</a>
            <a href="https://chokeandchill.com/" target="_blank" class="btn btn-dark">🥋 CHOKE & CHILL</a>
        `;
    }
}

// ==========================================
// 15. CUSTOM RULESET EDITOR
// ==========================================
function toggleCustomRuleEditor() {
    var editor = document.getElementById('customRuleEditor');
    if (editor) {
        editor.style.display = (editor.style.display === 'none' || editor.style.display === '') ? 'block' : 'none';
        
        // Reset form if opening
        if (editor.style.display === 'block') {
            document.getElementById('cr_name').value = '';
            document.getElementById('cr_adult_white').value = '';
            document.getElementById('cr_adult_blue').value = '';
            document.getElementById('cr_adult_purple').value = '';
            document.getElementById('cr_adult_brown').value = '';
            document.getElementById('cr_adult_black').value = '';
            document.getElementById('cr_kids').value = '';
        }
    }
}

function saveCustomRule() {
    var sport = document.getElementById('globalSport')?.value || 'bjj';
    var name = document.getElementById('cr_name').value.trim();
    if (!name) {
        alert("Bitte gib einen Namen für das Regelwerk ein.");
        return;
    }
    
    var fedId = "gym_" + Date.now();
    var customRulesets = safeGet('sgnCustomRulesets_' + sport, {});
    
    customRulesets[fedId] = {
        name: name,
        adult: {
            White: document.getElementById('cr_adult_white').value.trim() || "Keine Regeln definiert.",
            Blue: document.getElementById('cr_adult_blue').value.trim() || "Keine Regeln definiert.",
            Purple: document.getElementById('cr_adult_purple').value.trim() || "Keine Regeln definiert.",
            Brown: document.getElementById('cr_adult_brown').value.trim() || "Keine Regeln definiert.",
            Black: document.getElementById('cr_adult_black').value.trim() || "Keine Regeln definiert."
        },
        kids: {
            Keine: document.getElementById('cr_kids').value.trim() || "Keine Regeln definiert."
        }
    };
    
    safeSet('sgnCustomRulesets_' + sport, customRulesets);
    alert("Regelwerk erfolgreich gespeichert!");
    toggleCustomRuleEditor();
    initRulesView();
    
    // Select the new rule
    var ruleSelect = document.getElementById('ruleSport');
    if (ruleSelect) {
        ruleSelect.value = "custom_" + fedId;
        handleSportChange();
    }
}

// Event-Listener Initialisierung beim Starten der Skriptumgebung
document.addEventListener("DOMContentLoaded", function() {
    initRulesView();
});

function updateCampUnitLabels() {
    let unit = document.getElementById('campUnit').value;
    let isEn = document.getElementById('globalLang') && document.getElementById('globalLang').value === 'en';
    
    let curLabel = document.getElementById('lblCurWt');
    let tarLabel = document.getElementById('lblTarWt');
    
    if (unit === 'lbs') {
        curLabel.innerText = isEn ? "Current (lbs)" : "Aktuell (lbs)";
        curLabel.setAttribute("data-en", "Current (lbs)");
        tarLabel.innerText = isEn ? "Target (lbs)" : "Ziel (lbs)";
        tarLabel.setAttribute("data-en", "Target (lbs)");
    } else {
        curLabel.innerText = isEn ? "Current (kg)" : "Aktuell (kg)";
        curLabel.setAttribute("data-en", "Current (kg)");
        tarLabel.innerText = isEn ? "Target (kg)" : "Ziel (kg)";
        tarLabel.setAttribute("data-en", "Target (kg)");
    }
}
window.updateCampUnitLabels = updateCampUnitLabels;
