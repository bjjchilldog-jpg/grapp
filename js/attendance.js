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

    // SICHERHEITS-UPDATE: Wir packen die SiFa-Daten mit in den Payload!
    // So hat der Coach beim Scannen sofort alle Notfalldaten auf dem Schirm.
    const payload = {
        name: name,
        belt: safeGet('grapp_user_belt', 'White'),
        sport: currentSport,
        birthdate: safeGet('grapp_corner_birthdate', safeGet('grapp_user_birthdate', '')),
        medication: safeGet('grapp_corner_medication', ''),
        emergencyPhone: safeGet('grapp_user_phone', safeGet('grapp_corner_parent_phone', ''))
    };

    const qrData = JSON.stringify(payload);

    new QRCode(qrContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#ffffff", // Dark Mode tauglich
        colorLight: "#000000",
        correctLevel: QRCode.CorrectLevel.L
    });
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
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
        qrReader.innerHTML = "";
        document.getElementById('btnScanAthletes').innerHTML = '<span class="icon">📸</span> SCHÜLER SCANNEN';
        return;
    }

    document.getElementById('btnScanAthletes').innerHTML = '<span class="icon">✖</span> SCANNER BEENDEN';

    // Initialisiere die Kamera
    html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
}

function onScanSuccess(decodedText, decodedResult) {
    try {
        const data = JSON.parse(decodedText);
        
        // Anti-Fake Check: Ist das wirklich ein GrAPP Code?
        if (!data.name || data.type === "grapp_gym_setup") throw new Error("Kein Athleten-Code");

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

            alert(`✅ ${data.name} erfolgreich eingecheckt!`);
        } else {
            alert(`⚠️ ${data.name} ist heute bereits eingecheckt.`);
        }

    } catch (e) {
        console.error("Scan-Fehler:", e);
        alert("❌ Ungültiger QR-Code. Dieser Code stammt nicht von einem Athleten-Profil.");
    }

    // Komfort-Funktion: Scanner nach erfolgreichem Scan direkt wieder zuklappen, spart Akku
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
        document.getElementById('btnScanAthletes').innerHTML = '<span class="icon">📸</span> SCHÜLER SCANNEN';
    }
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
        html += `<div style="padding:10px; border-bottom:1px solid #222; display:flex; justify-content:space-between; align-items:center; background:#161616;">
            <div>
                <strong style="color:#fff; font-size:14px;">${item.name}</strong>
                <div style="font-size:11px; color:#888;">${item.sport.toUpperCase()} | ${item.belt}</div>
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