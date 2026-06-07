// --- LOGBUCH & ANALYSE ---
function suggestFromRadar() {
    var stats = safeGet('sgnRadarStats_' + currentSport, { top: 5, bot: 5, wre: 5, sub: 5, car: 5 });
    var lowestStat = { key: '', val: 11 }; 
    for(var k in stats) { if(stats[k] < lowestStat.val) { lowestStat.val = stats[k]; lowestStat.key = k; } }
    var suggestion = sportConfig[currentSport].radar[0]; 
    if(lowestStat.key === 'top') suggestion = sportConfig[currentSport].radar[0] + " Fokus";
    else if(lowestStat.key === 'sub') suggestion = sportConfig[currentSport].radar[1] + " Fokus";
    else if(lowestStat.key === 'bot') suggestion = sportConfig[currentSport].radar[2] + " Fokus";
    else if(lowestStat.key === 'car') suggestion = sportConfig[currentSport].radar[3] + " Fokus";
    else if(lowestStat.key === 'wre') suggestion = sportConfig[currentSport].radar[4] + " Fokus";
    setGoal(suggestion);
}

function setGoal(txt) { 
    var input = document.getElementById('logGoals'); 
    if(input.value !== "" && !input.value.includes(txt)) input.value += ", " + txt; 
    else input.value = txt; 
}

var currentCheck = { E: false, M: false, T1: false, T2: false, T3: false }; 
function toggleCheck(key) { 
    currentCheck[key] = !currentCheck[key]; 
    document.getElementById('chk_' + key).classList.toggle('active'); 
}

var currentPhotoData = null; 
function previewPhoto(event) { 
    var file = event.target.files[0]; 
    if(!file) return; 
    var reader = new FileReader(); 
    reader.onload = function(e) { 
        var img = new Image(); 
        img.onload = function() { 
            var canvas = document.createElement('canvas'); 
            var scale = Math.min(800 / img.width, 1); 
            canvas.width = img.width * scale; 
            canvas.height = img.height * scale; 
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height); 
            currentPhotoData = canvas.toDataURL('image/jpeg', 0.6); 
            document.getElementById('logPhotoPreview').src = currentPhotoData; 
            document.getElementById('logPhotoPreview').style.display = 'block'; 
        }; 
        img.src = e.target.result; 
    }; 
    reader.readAsDataURL(file); 
}

function updateDashboard(history) {
    document.getElementById('dashTotalClasses').innerText = history.length;
    var totalChecks = 0; var activeChecks = 0;
    history.forEach(function(h) { 
        totalChecks += 5; 
        if(h.checks) {
            if(h.checks.E) activeChecks++; if(h.checks.M) activeChecks++; 
            if(h.checks.T1) activeChecks++; if(h.checks.T2) activeChecks++; if(h.checks.T3) activeChecks++; 
        }
    });
    document.getElementById('dashScore').innerText = (totalChecks > 0 ? Math.round((activeChecks / totalChecks) * 100) : 0) + "%";
}

// Convert common video URLs to embeddable iframes
function getEmbedUrl(url) {
    if (!url) return null;
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
    return url; // Fallback, might not be embeddable directly
}

function saveTrainingLog() {
    var dateVal = document.getElementById('logDate').value || new Date().toISOString().split('T')[0];
    var goals = document.getElementById('logGoals').value; 
    var position = document.getElementById('logPosition').value;
    var goodVal = document.getElementById('logGood').value;
    var badVal = document.getElementById('logBad').value;
    var videoUrl = document.getElementById('logVideoUrl').value;

    var logData = { 
        id: Date.now(), sport: currentSport, date: dateVal, goals: goals || "Basics", 
        checks: Object.assign({}, currentCheck), 
        oneGood: goodVal, oneBad: badVal,
        position: position, image: currentPhotoData,
        video: videoUrl
    };
    var allHistory = safeGet('sgnTrainingLog', []); 
    allHistory.unshift(logData);
    safeSet('sgnTrainingLog', allHistory);

    // Reset Form
    document.getElementById('logGoals').value = ""; document.getElementById('logGood').value = ""; document.getElementById('logBad').value = "";
    document.getElementById('logVideoUrl').value = "";
    document.getElementById('logPosition').selectedIndex = 0; 
    document.getElementById('logPhotoPreview').style.display = "none"; 
    document.getElementById('logPhotoInput').value = ""; 
    currentPhotoData = null;
    for(var key in currentCheck) { currentCheck[key] = false; document.getElementById('chk_'+key).classList.remove('active'); }
    document.getElementById('evalBox').style.display = "none"; 
    
    switchView('view-menu'); 
}

function loadTrainingLogs() {
    var allHistory = safeGet('sgnTrainingLog', []); 
    var history = allHistory.filter(function(h) { return h.sport === currentSport || !h.sport; }); 
    var html = ""; updateDashboard(history);

    history.forEach(function(h) {
        var goodChecks = ""; var badChecks = "";
        if(h.checks) {
            if(h.checks.E) goodChecks += "💦 "; else badChecks += "💦 ";
            if(h.checks.M) goodChecks += "🧠 "; else badChecks += "🧠 ";
            if(h.checks.T1) goodChecks += "⏱️ "; else badChecks += "⏱️ ";
            if(h.checks.T2) goodChecks += "🤝 "; else badChecks += "🤝 ";
            if(h.checks.T3) goodChecks += "🥋 "; else badChecks += "🥋 ";
        }

        var imgHtml = h.image ? "<img src='" + h.image + "' style='max-width:100%; border-radius:6px; margin-top:8px;'>" : "";
        
        var videoHtml = "";
        if(h.video) {
            var embedUrl = getEmbedUrl(h.video);
            if(embedUrl.includes('youtube') || embedUrl.includes('vimeo') || embedUrl.includes('drive')) {
                videoHtml = "<div class='video-wrapper'><iframe src='" + embedUrl + "' frameborder='0' allowfullscreen></iframe></div>";
            } else {
                videoHtml = "<a href='" + h.video + "' target='_blank' class='btn-sm btn-sm-cal' style='display:inline-block; margin-top:10px;'>▶️ VIDEO ÖFFNEN</a>";
            }
        }

        html += "<div class='card'>";
        html += "<strong>" + h.date + "</strong><span style='font-size:12px; color:#aaa;'>🎯 <span data-en='Focus: '>Fokus: </span>" + h.goals + " | 🧭 <span data-en='Pos: '>Pos: </span>" + h.position + "</span>";
        
        html += "<div style='background:#111; padding:8px; border-radius:4px; margin-top:8px; border:1px solid #333; font-size:14px;'>";
        html += "<span style='color:#2ecc71' data-en='🟢 Stable: '>🟢 Stabil: " + (goodChecks || "-") + "</span><br>";
        html += "<span style='color:#e74c3c' data-en='🔴 Failure: '>🔴 Ausfall: " + (badChecks || "-") + "</span>";
        html += "</div>";

        if(h.oneGood) html += "<div style='margin-top:8px; font-size:12px; color:#2ecc71;'><strong>ONE GOOD:</strong> " + h.oneGood + "</div>";
        if(h.oneBad) html += "<div style='margin-top:4px; font-size:12px; color:#e74c3c;'><strong>ONE BAD:</strong> " + h.oneBad + "</div>";
        
        html += imgHtml + videoHtml;
        html += "<div style='margin-top:10px;'><button class='btn-sm btn-sm-share' onclick='shareLog(" + h.id + ")'>📲 TEILEN</button><button class='btn-sm btn-sm-red' onclick='deleteLog(" + h.id + ")'>LÖSCHEN</button></div></div>";
    });
    document.getElementById('logList').innerHTML = html || "<p style='color:#888; font-size:12px;'>Noch keine Einheiten geloggt.</p>";
}

function evaluateMyGame() {
    var allHistory = safeGet('sgnTrainingLog', []); 
    var history = allHistory.filter(function(h) { return h.sport === currentSport || !h.sport; });
    if (history.length < 2) return alert("Logge erst 2-3 Einheiten in dieser Sportart!");
    
    var chkCounts = {E:0, M:0, T1:0, T2:0, T3:0};
    var errCounts = {E:0, M:0, T1:0, T2:0, T3:0};

    history.forEach(function(h) { 
        if(h.checks) {
            if(h.checks.E) chkCounts.E++; else errCounts.E++; 
            if(h.checks.M) chkCounts.M++; else errCounts.M++; 
            if(h.checks.T1) chkCounts.T1++; else errCounts.T1++; 
            if(h.checks.T2) chkCounts.T2++; else errCounts.T2++; 
            if(h.checks.T3) chkCounts.T3++; else errCounts.T3++; 
        }
    });
    
    var checkNames = {E: "Einsatz 💦", M: "Mindset 🧠", T1: "Cardio ⏱️", T2: "Teamgeist 🤝", T3: "Technik 🥋"};
    
    var topChecks = Object.keys(chkCounts).sort(function(a,b) { return chkCounts[b] - chkCounts[a]; });
    var topErrors = Object.keys(errCounts).filter(function(k) { return errCounts[k] > 0; }).sort(function(a,b) { return errCounts[b] - errCounts[a]; });

    var html = "<h3 style='color:#3498db; margin-top:0;'>📊 TRAININGS-DATEN ANALYSE</h3>";
    
    var bestCheck = topChecks[0]; 
    html += "<strong style='color:#2ecc71; font-size:16px;'>🟢 STABILE SYSTEME (STÄRKEN):</strong><br><span style='color:#ccc; font-size:13px; display:block; margin-bottom:15px; margin-top:5px;'>Dein verlässlichster Parameter ist aktuell <b>" + checkNames[bestCheck] + "</b> (" + chkCounts[bestCheck] + "x positiv).</span>";
    
    html += "<strong style='color:#e74c3c; font-size:16px;'>🔴 SYSTEMAUSFÄLLE (TURBULEN):</strong><br>";
    if(topErrors.length === 0) {
        html += "<span style='color:#ccc; font-size:13px; display:block; margin-top:5px;'>Alle Systeme laufen konstant auf 100%. Perfekt!</span>";
    } else {
        html += "<ul style='color:#ccc; font-size:13px; padding-left:15px; margin-top:5px;'>";
        for(var i=0; i<Math.min(3, topErrors.length); i++) {
            html += "<li style='margin-bottom:12px;'><b>" + checkNames[topErrors[i]] + "</b> (" + errCounts[topErrors[i]] + "x ausgefallen)</li>";
        }
        html += "</ul>";
    }

    html += "<h4 style='color:#fff; margin-top:20px; border-top:1px solid #333; padding-top:15px;'>📈 PERFORMANCE TREND</h4>";
    html += "<p style='font-size:11px; color:#888; margin-top:0;'>Check-Score deiner letzten 10 Einheiten</p>";
    html += "<canvas id='trendCanvas' width='300' height='120' style='width:100%; background:#111; border-radius:6px; border:1px solid #333;'></canvas>";

    html += "<h4 style='color:#fff; margin-top:20px; border-top:1px solid #333; padding-top:15px;'>🧠 TAGEBUCH (MINDSET JOURNEY)</h4>";
    html += "<div style='max-height:200px; overflow-y:auto; font-size:12px; color:#aaa; background:#111; padding:10px; border-radius:6px; margin-bottom:10px; border:1px solid #333;'>";
    
    var journeyLogs = history.slice(0, 10); 
    var hasDebriefs = false;
    journeyLogs.forEach(function(l) {
        if(l.oneGood || l.oneBad) {
            hasDebriefs = true;
            html += "<div style='margin-bottom:10px; border-bottom:1px dotted #333; padding-bottom:5px;'>";
            html += "<strong style='color:#fff;'>" + l.date + "</strong><br>";
            if(l.oneGood) html += "<span style='color:#2ecc71'>🟢 Trainingserfolg: " + l.oneGood + "</span><br>";
            if(l.oneBad) html += "<span style='color:#e74c3c'>🔴 Entwicklungsfeld: " + l.oneBad + "</span>";
            html += "</div>";
        }
    });
    if(!hasDebriefs) html += "<i>Noch kein Tagebuch geführt.</i>";
    html += "</div>";

    html += "<button class='btn-sm btn-sm-share' style='width:100%; padding:12px; font-size:12px; margin-bottom:15px;' onclick='shareMindsetJourney()'>📲 TAGEBUCH EXPORTIEREN</button>";
    html += "<button class='btn-sm btn-sm-red' style='width:100%; padding:12px; font-size:14px;' onclick='document.getElementById(\"evalBox\").style.display=\"none\"'>SCHLIESSEN</button>";
    
    document.getElementById('evalBox').innerHTML = html; 
    document.getElementById('evalBox').style.display = "block";

    setTimeout(function() { drawTrendChart(history); }, 100);
}

function drawTrendChart(history) {
    var canvas = document.getElementById('trendCanvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    var recentLogs = history.slice(0, 10).reverse(); 
    if(recentLogs.length < 2) return;

    var w = canvas.width; var h = canvas.height; var padding = 20;
    var stepX = (w - padding*2) / (recentLogs.length - 1);
    
    ctx.strokeStyle = "#222"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padding, padding); ctx.lineTo(w-padding, padding); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padding, h/2); ctx.lineTo(w-padding, h/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padding, h-padding); ctx.lineTo(w-padding, h-padding); ctx.stroke();

    ctx.beginPath(); ctx.strokeStyle = "#3498db"; ctx.lineWidth = 3;
    
    recentLogs.forEach(function(l, i) {
        var checks = 0;
        if(l.checks) {
            if(l.checks.E) checks++; if(l.checks.M) checks++; 
            if(l.checks.T1) checks++; if(l.checks.T2) checks++; if(l.checks.T3) checks++;
        }
        var scorePerc = checks / 5; 
        var x = padding + i * stepX;
        var y = h - padding - (scorePerc * (h - padding*2));
        
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        ctx.fillStyle = "#fff"; ctx.fillRect(x-3, y-3, 6, 6);
    });
    ctx.stroke();
}

function shareMindsetJourney() {
    var logs = safeGet('sgnTrainingLog', []).filter(function(l) { return l.sport === currentSport; }).slice(0, 10);
    var msg = "✈️ *TRAININGSTAGEBUCH (" + currentSport.toUpperCase() + ")*\nMein persönliches Debriefing:\n\n";
    var hasData = false;
    logs.forEach(function(l) {
        if(l.oneGood || l.oneBad) {
            hasData = true;
            msg += "📅 *" + l.date + "*\n";
            if(l.oneGood) msg += "🟢 Trainingserfolg: " + l.oneGood + "\n";
            if(l.oneBad) msg += "🔴 Entwicklungsfeld: " + l.oneBad + "\n";
            msg += "----------\n";
        }
    });
    if(!hasData) return alert("Du hast noch kein Log geführt!");
    if (navigator.share) { navigator.share({ title: "Trainingstagebuch", text: msg }).catch(function(err){ console.log(err); }); } 
    else { window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank"); }
}

function deleteLog(id) { 
    if(confirm("Diesen Log-Eintrag wirklich löschen?")) {
        var allHistory = safeGet('sgnTrainingLog', []); 
        allHistory = allHistory.filter(function(h) { return h.id !== id; }); 
        safeSet('sgnTrainingLog', allHistory); 
        loadTrainingLogs(); 
    }
}
    
function shareLog(id) { 
    var allHistory = safeGet('sgnTrainingLog', []); 
    var log = allHistory.find(function(h) { return h.id === id; }); 
    if(!log) return; 
    var checkStr = ""; 
    if(log.checks) {
        if(log.checks.E) checkStr += "💦 Einsatz "; if(log.checks.M) checkStr += "🧠 Mindset "; if(log.checks.T1) checkStr += "⏱️ Cardio "; if(log.checks.T2) checkStr += "🤝 Teamgeist "; if(log.checks.T3) checkStr += "🥋 Technik "; 
    }
    var shareText = "✈️ *TRAININGS-LOG* (" + log.date + ")\n\n🎯 *Fokus:* " + log.goals + "\n🧭 *Position:* " + log.position + "\n📊 *Performance:* " + (checkStr || "Keine") + "\n\n"; 
    if(log.oneGood) shareText += "🟢 *Trainingserfolg:* " + log.oneGood + "\n";
    if(log.oneBad) shareText += "🔴 *Entwicklungsfeld:* " + log.oneBad + "\n";
    if(log.video) shareText += "🎬 *Video:* " + log.video + "\n";
    
    if (navigator.share) { navigator.share({ title: 'Trainings-Log', text: shareText }).catch(function(err){ console.log('Share failed', err); }); } 
    else { window.open("https://wa.me/?text=" + encodeURIComponent(shareText), "_blank"); } 
}
