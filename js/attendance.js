// ============================================================================
// GRAPP - ATTENDANCE & QR SCANNER ENGINE (Inkl. Datenübertragung)
// ============================================================================

function initAttendanceView() {
    const role = safeGet('grapp_user_role', 'student');
    const studentBox = document.getElementById('studentAttendanceBox');
    const coachBox = document.getElementById('coachAttendanceBox');

    if (role === 'coach') {
        if (studentBox) studentBox.style.display = 'none';
        if (coachBox) coachBox.style.display = 'block';
        
        renderAttendanceList();
        // Das neue Coach-Dashboard (U18 & Geburtstage) laden
        if (typeof renderCoachAthleteDatabase === 'function') renderCoachAthleteDatabase();
    } else {
        if (studentBox) studentBox.style.display = 'block';
        if (coachBox) coachBox.style.display = 'none';
        
        generateStudentQR();
    }
}

// ----------------------------------------------------------------------------
// DER SCHÜLER: QR-Code inkl. medizinischer Daten & Geburtsdatum generieren
// ----------------------------------------------------------------------------
function generateStudentQR() {
    const qrContainer = document.getElementById('qrCodeContainer');
    if (!qrContainer) return;
    qrContainer.innerHTML = "";

    const name = safeGet('grapp_user_name', '');
    if (!name) {
        qrContainer.innerHTML = "<p style='color:#e74c3c; font-size:12px; font-weight:bold;'>⚠️ Bitte trage zuerst deinen Namen im 'GYM PROFIL' ein, um deinen Ausweis zu generieren!</p>";
        return;
    }

    const memberId = safeGet('grapp_member_id', '').trim();
    let qrData;

    if (memberId) {
        // GARDEROBENKARTE LOGIC: If Member ID is set, only transmit the ID.
        qrData = `GRAPP-TICKET-${memberId}`;
    } else {
        // FIRST VISIT LOGIC: Only transmit Name & Belt. No medical data!
        const payload = {
            name: name,
            belt: safeGet('grapp_user_belt', 'White'),
            sport: currentSport
        };
        qrData = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    }

    setTimeout(() => {
        new QRCode(qrContainer, {
            text: qrData,
            width: 200,
            height: 200,
            colorDark: "#ffffff", // Dark Mode tauglich
            colorLight: "#000000"
        });
    }, 50);
}

// ----------------------------------------------------------------------------
// DER COACH: Scanner, Google Webhook & SiFa-Datenbank Trigger
// ----------------------------------------------------------------------------
let html5QrcodeScanner = null;

function startScanner() {
    const qrReader = document.getElementById('qr-reader');
    if (!qrReader) return;

    // Toggle-Funktion: Wenn an, dann ausmachen
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().then(() => {
            html5QrcodeScanner = null;
            // Memory Cleanup (Copilot Fix) - remove dangling listeners by recreating the node
            const clone = qrReader.cloneNode(true);
            qrReader.parentNode.replaceChild(clone, qrReader);
            clone.innerHTML = "";
            document.getElementById('btnScanAthletes').innerHTML = '<span class="icon">📸</span> SCHÜLER SCANNEN';
        }).catch(err => console.log("Cleanup Error", err));
        return;
    }

    document.getElementById('btnScanAthletes').innerHTML = '<span class="icon">✖</span> SCANNER BEENDEN';

    // Initialisiere die Kamera
    html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

function onScanSuccess(decodedText, decodedResult) {
    try {
        let data;
        let isTicket = false;
        
        if (decodedText.startsWith("GRAPP-TICKET-")) {
            const memberId = decodedText.replace("GRAPP-TICKET-", "");
            data = { 
                name: `ID: ${memberId}`,
                belt: "N/A",
                sport: "Ticket"
            };
            isTicket = true;
        } else {
            let payloadStr = decodedText;
            try {
                payloadStr = decodeURIComponent(escape(atob(decodedText)));
            } catch(e) {}
            data = JSON.parse(payloadStr);
            if (!data.name || data.type === "grapp_gym_setup") throw new Error("Kein Athleten-Code");
        }

        let list = safeGet('grapp_attendance_today', []);
        
        // Doppel-Scan-Schutz für den aktuellen Tag
        const alreadyScanned = list.some(item => item.name === data.name);

        if (!alreadyScanned) {
            const now = new Date();
            data.time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
            data.date = now.toLocaleDateString('de-DE');
            
            // 1. Speichern in der lokalen "Heute da"-Liste
            list.push(data);
            safeSet('grapp_attendance_today', list);
            
            // 2. PRO-FEATURE: Google Sheets Webhook triggern
            if (typeof sendAttendeeToWebhook === 'function') sendAttendeeToWebhook(data);
            
            // 3. SICHERHEITS-UPDATE: Die Athleten-Datenbank des Coaches updaten!
            if (typeof saveScannedAthleteToCoachDb === 'function') saveScannedAthleteToCoachDb(data);

            // UI updaten
            renderAttendanceList();
            
            // Haptisches, akustisches und visuelles Feedback
            if ("vibrate" in navigator) navigator.vibrate(200);
            
            // Piepton generieren (Web Audio API)
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.value = 880; // Tonhöhe (A5)
                gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.1);
            } catch(e) { console.log("Audio feedback disabled"); }

            let safeName = (typeof escapeHTML === 'function') ? escapeHTML(data.name || '') : data.name;
            showToast(`✅ ${safeName} eingecheckt!`, "success");
        } else {
            let safeName = (typeof escapeHTML === 'function') ? escapeHTML(data.name || '') : data.name;
            showToast(`⚠️ ${safeName} ist bereits erfasst.`, "warning");
        }

    } catch (e) {
        console.error("Scan-Fehler:", e);
        showToast("❌ Ungültiger QR-Code.", "error");
    }
}

// Custom Toast Notification (Non-blocking)
let lastToastTime = 0;
function showToast(msg, type = "success") {
    // Verhindere Spam (Cooldown von 2 Sekunden für Toasts)
    if (Date.now() - lastToastTime < 2000) return;
    lastToastTime = Date.now();

    const toast = document.createElement('div');
    toast.innerHTML = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = type === "error" ? '#e74c3c' : (type === "warning" ? '#f39c12' : '#2ecc71');
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.zIndex = '9999';
    toast.style.fontWeight = 'bold';
    toast.style.fontSize = '14px';
    toast.style.textAlign = 'center';
    toast.style.animation = 'fadeIn 0.3s ease';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => document.body.removeChild(toast), 500);
    }, 3000);
}

function onScanFailure(error) {
    // Wird still ignoriert, da der Scanner 10x pro Sekunde feuert, bis er ein klares Bild hat
}

function renderAttendanceList() {
    const list = safeGet('grapp_attendance_today', []);
    const container = document.getElementById('attendanceList');
    if (!container) return;

    let html = "";
    list.forEach(item => {
        let safeName = (typeof escapeHTML === 'function') ? escapeHTML(item.name || '') : item.name;
        let safeSport = (typeof escapeHTML === 'function') ? escapeHTML((item.sport || '').toUpperCase()) : (item.sport || '').toUpperCase();
        let safeBelt = (typeof escapeHTML === 'function') ? escapeHTML(item.belt || '') : item.belt;
        html += `<div style="padding:10px; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center; background:#161616;">
            <div>
                <strong style="color:#fff; font-size:14px;">${safeName}</strong>
                <div style="font-size:11px; color:#888;">${safeSport} | ${safeBelt}</div>
            </div>
            <div style="color:#3498db; font-size:12px; font-weight:bold;">${item.time}</div>
        </div>`;
    });

    container.innerHTML = html || "<p style='color:#888; font-size:12px; padding:10px; text-align:center;'>Noch niemand eingecheckt.</p>";
}

function clearAttendanceList() {
    if (confirm("Möchtest du die heutige Check-In-Liste wirklich leeren? (Gescannte Schüler bleiben in deiner Athleten-Akte gespeichert!)")) {
        safeSet('grapp_attendance_today', []);
        renderAttendanceList();
    }
}

// ----------------------------------------------------------------------------
// COACH SELF-CHECK-IN
// ----------------------------------------------------------------------------
function coachSelfCheckIn() {
    const name = safeGet('grapp_user_name', 'Coach');
    const belt = safeGet('grapp_user_belt', 'Black');
    
    let list = safeGet('grapp_attendance_today', []);
    const alreadyScanned = list.some(item => item.name === name);
    
    if (!alreadyScanned) {
        const now = new Date();
        const data = {
            name: name,
            belt: belt,
            sport: typeof currentSport !== 'undefined' ? currentSport : 'BJJ',
            time: now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            date: now.toLocaleDateString('de-DE')
        };
        
        list.push(data);
        safeSet('grapp_attendance_today', list);
        
        if (typeof sendAttendeeToWebhook === 'function') sendAttendeeToWebhook(data);
        
        renderAttendanceList();
        showToast("✅ Du hast dich selbst eingecheckt!", "success");
    } else {
        showToast("⚠️ Du bist heute schon eingecheckt.", "warning");
    }
}

// ----------------------------------------------------------------------------
// SETUP CODES: Verknüpfung von Gym (Coach) und Schüler (WhatsApp / Google Forms)
// ----------------------------------------------------------------------------

function showCoachSetupQR() {
    const qrContainer = document.getElementById('coachSetupQR');
    if (!qrContainer) return;
    
    if (qrContainer.style.display === 'block') {
        qrContainer.style.display = 'none';
        return;
    }

    qrContainer.innerHTML = "";
    
    // Die Links aus den Coach-Einstellungen verpacken
    const payload = {
        type: "grapp_gym_setup",
        formId: safeGet('grapp_form_id', ''),
        waGroup: safeGet('grapp_wa_group', '')
    };

    new QRCode(qrContainer, {
        text: JSON.stringify(payload),
        width: 200,
        height: 200,
        colorDark: "#ffffff",
        colorLight: "#000000"
    });
    
    qrContainer.style.display = 'block';
}

let setupScanner = null;

function startGymQRScanner() {
    const reader = document.getElementById('student-qr-reader');
    if (!reader) return;

    if (setupScanner) {
        setupScanner.clear();
        setupScanner = null;
        reader.style.display = 'none';
        return;
    }

    reader.style.display = 'block';
    setupScanner = new Html5QrcodeScanner("student-qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
    
    setupScanner.render((decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            
            if (data.type === "grapp_gym_setup") {
                if(data.formId) safeSet('grapp_form_id', data.formId);
                if(data.waGroup) safeSet('grapp_wa_group', data.waGroup);
                
                alert("✅ Gym erfolgreich verknüpft! Das Teamklima-Feedback und der WhatsApp-Chat sind nun eingerichtet.");
                
                // Scanner sofort ausschalten
                setupScanner.clear();
                setupScanner = null;
                reader.style.display = 'none';
            } else {
                throw new Error("Falscher Typ");
            }
        } catch(e) {
            alert("❌ Ungültiger Setup-Code. Zeigt dein Coach wirklich den Gym-Link-Code?");
        }
    }, () => {});
}