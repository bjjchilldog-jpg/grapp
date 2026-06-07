// ==========================================
// 1. BASIS-LOGIK & LIZENZSCHLÜSSEL-PRÜFUNG
// ==========================================

function isUserPro() {
    return localStorage.getItem('grapp_pro_status') === 'true';
}

// Verschleierte Blackbox inkl. Namens-Hash, Geburtsdatum und Quersumme
function _0x4a2f(_0x2b1) {
    let _0xN = document.getElementById('profName');
    let _0xD = document.getElementById('profBirthdate');
    if(!_0xN || !_0xN.value.trim() || !_0xD || !_0xD.value) return -1; // -1 = Daten fehlen
    
    // Name Hash
    let _0xS = _0xN.value.trim().toLowerCase();
    let _0xH = 0;
    for(let i=0; i<_0xS.length; i++) _0xH = (_0xH * 31 + _0xS.charCodeAt(i)) % 9000;
    _0xH += 1000;

    // Datum Formatieren
    let _0xDate = new Date(_0xD.value);
    let _0xDS = String(_0xDate.getDate()).padStart(2, '0') + String(_0xDate.getMonth() + 1).padStart(2, '0') + String(_0xDate.getFullYear()).slice(-2);
    
    // Quersumme bilden
    let _0xC = _0xDS + _0xH;
    let _0xSum = 0;
    for(let _0xX of _0xC) _0xSum += parseInt(_0xX);
    let _0xCheck = _0xSum % 10;

    // Erwarteten Key bauen
    let _0xFinal = String.fromCharCode(83,71,78) + "-" + _0xDS + "-" + _0xH + "-" + _0xCheck;
    
    return _0x2b1 === _0xFinal;
}

function checkProKey() {
    const keyInput = document.getElementById('proKeyInput');
    const feedback = document.getElementById('proKeyFeedback');
    if (!keyInput || !feedback) return;

    const inputKey = keyInput.value.trim().toUpperCase();
    const validKeys = ["SGN2026", "MATTENKULTUR", "TEAMCHASER", "PRO92318"];
    
    let isValid = false;
    let checkResult = null;

    if (validKeys.includes(inputKey)) {
        isValid = true;
    } else {
        checkResult = _0x4a2f(inputKey);
        if (checkResult === true) isValid = true;
    }

    if (isValid) {
        localStorage.setItem('grapp_pro_status', 'true');
        feedback.style.color = "#2ecc71";
        feedback.innerHTML = "⭐ PRO STATUS ERFOLGREICH AKTIVIERT! OSS!";
        setTimeout(() => { location.reload(); }, 1200);
    } else {
        feedback.style.color = "#e74c3c";
        if (checkResult === -1) {
            feedback.innerHTML = "❌ Bitte trage oben erst Name und Geburtsdatum ein!";
        } else {
            feedback.innerHTML = "❌ Ungültiger Schlüssel oder er passt nicht zu deinen Stammdaten.";
        }
    }
}


// ==========================================
// 2. JUGENDSCHUTZ (U18) & ELTERN-VALIDIERUNG
// ==========================================

function copyParentPhoneToEmergency() {
    const parentPhone = document.getElementById('profParentPhone')?.value;
    const emergencyInput = document.getElementById('profEmergencyPhone');
    if (parentPhone && emergencyInput) {
        emergencyInput.value = parentPhone;
        saveProfile();
        alert("✅ Eltern-Telefonnummer als primären Notfallkontakt übernommen!");
    } else {
        alert("Bitte trage zuerst eine Telefonnummer der Eltern ein.");
    }
}

function checkAgeAndU18Logic() {
    const birthdateInput = document.getElementById('profBirthdate')?.value;
    const u18Box = document.getElementById('profileU18Box');
    if (!birthdateInput || !u18Box) return 0;

    const birthDate = new Date(birthdateInput);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18 && age >= 0) {
        u18Box.style.display = 'block';
    } else {
        u18Box.style.display = 'none';
    }
    return age;
}

function sendParentalVerificationWhatsApp() {
    const studentName = document.getElementById('profName').value;
    const parentName = document.getElementById('profParentName').value;
    const birthdate = document.getElementById('profBirthdate').value;

    if (!studentName || !parentName || !birthdate) {
        alert("Bitte fülle Name, Geburtsdatum und den Namen der Eltern vollständig aus!");
        return;
    }

    const formattedDate = new Date(birthdate).toLocaleDateString('de-DE');
    let msg = `*🛡️ ELTERN-BESTÄTIGUNG & EINVERSTÄNDNIS (GrAPP)*\n\n`;
    msg += `Hiermit bestätige ich (*${parentName}*), als Erziehungsberechtigte/r, dass mein Kind *${studentName}* (Geb. ${formattedDate}) am Trainings-, Sparrings- und Turnierbetrieb teilnehmen darf.\n\n`;
    msg += `Die in der App hinterlegten medizinischen Notfalldaten sind korrekt. Ich bestätige den Erhalt der Datenschutzerklärung.\n\n`;
    msg += `📱 _Gesendet vom verifizierten Smartphone der Eltern._`;

    const coachPhone = localStorage.getItem('grapp_coach_phone') || "4917631096222";
    window.open(`https://wa.me/${coachPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function callCoachForVerification() {
    const studentName = document.getElementById('profName').value;
    const parentName = document.getElementById('profParentName').value;
    
    if (!studentName || !parentName) {
        alert("Bitte fülle zumindest den Namen deines Kindes und deinen eigenen Namen aus, bevor du anrufst!");
        return;
    }

    const coachPhone = localStorage.getItem('grapp_coach_phone') || "4917631096222";
    alert(`Bitte übergebe das Handy jetzt an deine Eltern.\n\nLiebe Eltern, bitte gebt dem Coach am Telefon kurz das mündliche Go für ${studentName}.`);
    window.location.href = `tel:+${coachPhone}`;
}

// ==========================================
// 3. WHITE-LABELING (LOGO-UPLOAD & CO.)
// ==========================================

function handleLogoUpload(event) {
    if (!isUserPro()) {
        showProFeatureNotice("Eigenes Gym-Logo Upload");
        event.target.value = ""; 
        return;
    }

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const base64String = e.target.result;
            localStorage.setItem('grapp_custom_logo_url', base64String);
            alert("✅ Gym-Logo erfolgreich gespeichert! Starte die App neu, um es zu sehen.");
            // Custom Links
            for(let i=1; i<=3; i++) {
                let ln = document.getElementById('cl'+i+'_name');
                let lu = document.getElementById('cl'+i+'_url');
                if(ln && lu) {
                    safeSet('grapp_cl'+i+'_name', ln.value.trim());
                    safeSet('grapp_cl'+i+'_url', lu.value.trim());
                }
            }
            if (typeof applyGymTheme === 'function') applyGymTheme();
        } catch (error) {
            console.error("Storage Error:", error);
            alert("⚠️ Das Bild ist zu groß für den lokalen Speicher. Bitte nutze ein komprimiertes Bild.");
        }
    };
    reader.readAsDataURL(file);
}

function toggleCoachFields() {
    const role = document.getElementById('profRole').value;
    const coachFields = document.getElementById('coachFields');
    const surveyMethodBox = document.getElementById('surveyMethodBox');
    const kioskButtonBox = document.getElementById('kioskButtonBox');
    
    if (role === 'coach') {
        if (coachFields) coachFields.style.display = 'block';
        if (surveyMethodBox) surveyMethodBox.style.display = 'block';
        if (kioskButtonBox) kioskButtonBox.style.display = 'block';
    } else {
        if (coachFields) coachFields.style.display = 'none';
        if (surveyMethodBox) surveyMethodBox.style.display = 'none';
        if (kioskButtonBox) kioskButtonBox.style.display = 'none';
    }
    
    const methodSelect = document.getElementById('profSurveyMethod');
    const warningBox = document.getElementById('surveyWarningBox');
    if (methodSelect && warningBox) {
        warningBox.style.display = (methodSelect.value === 'disabled') ? 'block' : 'none';
    }
}

// ==========================================
// 4. DATENSICHERUNG & PRO-VERRIEGELUNG
// ==========================================

function saveProfile() {
    // Stammdaten & Medizin
    if (!isUserPro()) {
        safeSet('grapp_user_name', document.getElementById('profName')?.value || "");
        safeSet('grapp_user_gender', document.getElementById('profGender')?.value || "m");
        safeSet('grapp_user_birthdate', document.getElementById('profBirthdate')?.value || "");
    }
    safeSet('grapp_user_address', document.getElementById('profAddress')?.value || "");
    safeSet('grapp_user_own_phone', document.getElementById('profOwnPhone')?.value || "");
    safeSet('grapp_user_phone', document.getElementById('profEmergencyPhone')?.value || "");
    safeSet('grapp_user_bloodtype', document.getElementById('profBloodType')?.value || "Unbekannt");
    safeSet('grapp_user_medication', document.getElementById('profMedication')?.value || "");
    safeSet('grapp_parent_name', document.getElementById('profParentName')?.value || "");
    safeSet('grapp_parent_phone', document.getElementById('profParentPhone')?.value || "");

    // Rolle & Setup
    safeSet('grapp_user_role', document.getElementById('profRole')?.value || "student");
    const sport = window.currentSport || "bjj";
    safeSet('grapp_user_belt_' + sport, document.getElementById('profBelt')?.value || "White");
    safeSet('grapp_user_belt_date_' + sport, document.getElementById('profBeltDate')?.value || "");
    safeSet('grapp_survey_method', document.getElementById('profSurveyMethod')?.value || "google");
    safeSet('grapp_survey_window', document.getElementById('profSurveyWindow')?.value || "2");

    // Pro-Check: Logo-URL
    const logoUrlInput = document.getElementById('profLogoUrl');
    if (logoUrlInput && logoUrlInput.value.trim() !== "") {
        if (isUserPro()) {
            safeSet('grapp_custom_logo_url', logoUrlInput.value.trim());
            let posEl = document.getElementById('profLogoPos');
            let sizeEl = document.getElementById('profLogoSize');
            if (posEl) safeSet('grapp_custom_logo_pos', posEl.value);
            if (sizeEl) safeSet('grapp_custom_logo_size', sizeEl.value);
        } else {
            logoUrlInput.value = "";
            showProFeatureNotice("Gym-Logo via URL");
            localStorage.removeItem('grapp_custom_logo_pos');
            localStorage.removeItem('grapp_custom_logo_size');
        }
    }

    // Pro-Check: App Farbschema
    const primaryColorInput = document.getElementById('profColorPrimary');
    const accentColorInput = document.getElementById('profColorAccent');
    const bgColorInput = document.getElementById('profColorBg');
    const appBgColorInput = document.getElementById('profColorAppBg');
    if (primaryColorInput && accentColorInput) {
        if (isUserPro()) {
            safeSet('grapp_color_primary', primaryColorInput.value);
            safeSet('grapp_color_accent', accentColorInput.value);
            if(bgColorInput) safeSet('grapp_color_bg', bgColorInput.value);
            if(appBgColorInput) safeSet('grapp_color_appbg', appBgColorInput.value);
            if (typeof applyGymTheme === 'function') applyGymTheme();
        } else {
            primaryColorInput.value = "#e74c3c";
            accentColorInput.value = "#3498db";
            localStorage.removeItem('grapp_color_primary');
            localStorage.removeItem('grapp_color_accent');
            if(bgColorInput) bgColorInput.value = "#000000";
            localStorage.removeItem('grapp_color_bg');
            if(appBgColorInput) appBgColorInput.value = "#1a1a1a";
            localStorage.removeItem('grapp_color_appbg');
            for(let i=1; i<=3; i++) {
                localStorage.removeItem('grapp_cl'+i+'_name');
                localStorage.removeItem('grapp_cl'+i+'_url');
                let ln = document.getElementById('cl'+i+'_name');
                let lu = document.getElementById('cl'+i+'_url');
                if(ln) ln.value = "";
                if(lu) lu.value = "";
            }
        }
    }

    // Pro-Check: Google Sheets Webhook Link
    const webhookInput = document.getElementById('profWebhookUrl');
    if (webhookInput && webhookInput.value.trim() !== "") {
        if (isUserPro()) {
            safeSet('grapp_webhook_url', webhookInput.value.trim());
        } else {
            webhookInput.value = "";
            showProFeatureNotice("Google Sheets Live-Synchronisation");
        }
    }

    // Coach Settings
    safeSet('grapp_coach_phone', document.getElementById('profCoachPhone')?.value || "");
    const affPhone = document.getElementById('profAffiliatePhone')?.value || "";
    safeSet('grapp_affiliate_phone', affPhone);
    const affBox = document.getElementById('affiliateFeedbackBox');
    if (affBox) affBox.style.display = affPhone ? 'block' : 'none';
    
    safeSet('grapp_form_id', document.getElementById('profFormId')?.value || "");
    safeSet('grapp_wa_group', document.getElementById('profWaGroup')?.value || "");
    safeSet('grapp_waiver_text', document.getElementById('profWaiverText')?.value || "");
    safeSet('grapp_waiver_webhook', document.getElementById('profWaiverWebhook')?.value || "");
    safeSet('grapp_remote_consent_text', document.getElementById('profRemoteConsentText')?.value || "");
    
    // Custom Links sichern
    for (let i = 1; i <= 3; i++) {
        safeSet(`grapp_cl${i}_name`, document.getElementById(`cl${i}_name`)?.value || "");
        safeSet(`grapp_cl${i}_url`, document.getElementById(`cl${i}_url`)?.value || "");
    }
}

function toggleTrainingDay(day) {
    let days = safeGet('grapp_training_days', []);
    if (days.includes(day)) {
        days = days.filter(d => d !== day);
    } else {
        days.push(day);
    }
    safeSet('grapp_training_days', days);
    
    // UI Update
    const btn = document.getElementById('day_' + day);
    if (btn) {
        if (days.includes(day)) {
            btn.style.backgroundColor = "#f1c40f";
            btn.style.color = "#000";
        } else {
            btn.style.backgroundColor = "#333";
            btn.style.color = "#fff";
        }
    }
}

function loadProfileData() {
    // Stammdaten & Medizin
    if(document.getElementById('profName')) document.getElementById('profName').value = safeGet('grapp_user_name', "");
    if(document.getElementById('profGender')) document.getElementById('profGender').value = safeGet('grapp_user_gender', "m");
    if(document.getElementById('profAddress')) document.getElementById('profAddress').value = safeGet('grapp_user_address', "");
    if(document.getElementById('profOwnPhone')) document.getElementById('profOwnPhone').value = safeGet('grapp_user_own_phone', "");
    if(document.getElementById('profEmergencyPhone')) document.getElementById('profEmergencyPhone').value = safeGet('grapp_user_phone', "");
    if(document.getElementById('profBirthdate')) document.getElementById('profBirthdate').value = safeGet('grapp_user_birthdate', "");
    if(document.getElementById('profBloodType')) document.getElementById('profBloodType').value = safeGet('grapp_user_bloodtype', "Unbekannt");
    if(document.getElementById('profMedication')) document.getElementById('profMedication').value = safeGet('grapp_user_medication', "");
    if(document.getElementById('profParentName')) document.getElementById('profParentName').value = safeGet('grapp_parent_name', "");
    if(document.getElementById('profParentPhone')) document.getElementById('profParentPhone').value = safeGet('grapp_parent_phone', "");

    // Rolle & Setup
    if(document.getElementById('profRole')) document.getElementById('profRole').value = safeGet('grapp_user_role', "student");
    const sport = window.currentSport || "bjj";
    const defaultBelt = safeGet('grapp_user_belt', "White");
    const defaultDate = safeGet('grapp_user_belt_date', "");
    if(document.getElementById('profBelt')) document.getElementById('profBelt').value = safeGet('grapp_user_belt_' + sport, defaultBelt);
    if(document.getElementById('profBeltDate')) document.getElementById('profBeltDate').value = safeGet('grapp_user_belt_date_' + sport, defaultDate);
    if(document.getElementById('profSurveyMethod')) document.getElementById('profSurveyMethod').value = safeGet('grapp_survey_method', "google");
    if(document.getElementById('profSurveyWindow')) document.getElementById('profSurveyWindow').value = safeGet('grapp_survey_window', "2");

    // Coach Settings
    if(document.getElementById('profCoachPhone')) document.getElementById('profCoachPhone').value = safeGet('grapp_coach_phone', "");
    if(document.getElementById('profAffiliatePhone')) document.getElementById('profAffiliatePhone').value = safeGet('grapp_affiliate_phone', "");
    if(document.getElementById('profFormId')) document.getElementById('profFormId').value = safeGet('grapp_form_id', "");
    if(document.getElementById('profWebhookUrl')) document.getElementById('profWebhookUrl').value = safeGet('grapp_webhook_url', "");
    if(document.getElementById('profWaGroup')) document.getElementById('profWaGroup').value = safeGet('grapp_wa_group', "");
    if(document.getElementById('profWaiverText')) document.getElementById('profWaiverText').value = safeGet('grapp_waiver_text', "");
    if(document.getElementById('profWaiverWebhook')) document.getElementById('profWaiverWebhook').value = safeGet('grapp_waiver_webhook', "");
    if(document.getElementById('profRemoteConsentText')) document.getElementById('profRemoteConsentText').value = safeGet('grapp_remote_consent_text', "");
    
    // Show/Hide Affiliate Box in Feedback View
    const affPhone = safeGet('grapp_affiliate_phone', "");
    const affBox = document.getElementById('affiliateFeedbackBox');
    if (affBox) {
        affBox.style.display = affPhone ? 'block' : 'none';
    }

    // Theme & Links
    if(document.getElementById('profColorPrimary')) document.getElementById('profColorPrimary').value = safeGet('grapp_color_primary', "#e74c3c");
    if(document.getElementById('profColorAccent')) document.getElementById('profColorAccent').value = safeGet('grapp_color_accent', "#3498db");
    if(document.getElementById('profColorBg')) document.getElementById('profColorBg').value = safeGet('grapp_color_bg', "#000000");
    
    if(document.getElementById('profColorPrimaryTxt') && document.getElementById('profColorPrimary')) document.getElementById('profColorPrimaryTxt').value = document.getElementById('profColorPrimary').value;
    if(document.getElementById('profColorAccentTxt') && document.getElementById('profColorAccent')) document.getElementById('profColorAccentTxt').value = document.getElementById('profColorAccent').value;
    if(document.getElementById('profColorBgTxt') && document.getElementById('profColorBg')) document.getElementById('profColorBgTxt').value = document.getElementById('profColorBg').value;
    if(document.getElementById('profColorAppBg')) document.getElementById('profColorAppBg').value = safeGet('grapp_color_appbg', "#1a1a1a");
    if(document.getElementById('profColorAppBgTxt') && document.getElementById('profColorAppBg')) document.getElementById('profColorAppBgTxt').value = document.getElementById('profColorAppBg').value;
    
    // Custom Links
    for(let i=1; i<=3; i++) {
        let ln = document.getElementById('cl'+i+'_name');
        let lu = document.getElementById('cl'+i+'_url');
        if(ln) ln.value = safeGet('grapp_cl'+i+'_name', '');
        if(lu) lu.value = safeGet('grapp_cl'+i+'_url', '');
    }
    
    if(document.getElementById('profLogoUrl')) document.getElementById('profLogoUrl').value = safeGet('grapp_custom_logo_url', "");

    for (let i = 1; i <= 3; i++) {
        if(document.getElementById(`cl${i}_name`)) document.getElementById(`cl${i}_name`).value = safeGet(`grapp_cl${i}_name`, "");
        if(document.getElementById(`cl${i}_url`)) document.getElementById(`cl${i}_url`).value = safeGet(`grapp_cl${i}_url`, "");
    }

    // Trainingstage laden
    let days = safeGet('grapp_training_days', []);
    [0, 1, 2, 3, 4, 5, 6].forEach(day => {
        const btn = document.getElementById('day_' + day);
        if (btn) {
            if (days.includes(day)) {
                btn.style.backgroundColor = "#f1c40f";
                btn.style.color = "#000";
            } else {
                btn.style.backgroundColor = "#333";
                btn.style.color = "#fff";
            }
        }
    });

    // ==========================================
    // NEU: DIE STAMMDATEN-VERRIEGELUNG (ANTI-SHARING)
    // ==========================================
    if (isUserPro()) {
        const nameInput = document.getElementById('profName');
        const dateInput = document.getElementById('profBirthdate');
        const genderSelect = document.getElementById('profGender');
        
        if (nameInput) {
            nameInput.readOnly = true;
            nameInput.style.backgroundColor = "#1a1a1a";
            nameInput.style.color = "#888";
            nameInput.style.border = "1px solid #f1c40f";
        }
        if (dateInput) {
            dateInput.readOnly = true;
            dateInput.style.backgroundColor = "#1a1a1a";
            dateInput.style.color = "#888";
            dateInput.style.border = "1px solid #f1c40f";
        }
        if (genderSelect) {
            genderSelect.disabled = true;
            genderSelect.style.backgroundColor = "#1a1a1a";
            genderSelect.style.color = "#888";
            genderSelect.style.border = "1px solid #f1c40f";
        }
        
        // Hinweis einblenden, damit der Nutzer nicht denkt, die App sei kaputt
        if (!document.getElementById('proLockHint') && nameInput) {
            const hint = document.createElement('div');
            hint.id = 'proLockHint';
            hint.innerHTML = "🔒 <i>Stammdaten sind durch die aktive Pro-Lizenz fest verriegelt. Bei Namensänderung bitte den Coach für einen Reset kontaktieren.</i>";
            hint.style.fontSize = "10px";
            hint.style.color = "#f1c40f";
            hint.style.marginTop = "4px";
            nameInput.parentNode.insertBefore(hint, nameInput.nextSibling);
        }
    }

    checkAgeAndU18Logic();
    toggleCoachFields();
}

function contactHeadcoach() {
    const affiliatePhone = safeGet('grapp_affiliate_phone', "");
    if (!affiliatePhone) return;
    
    // Clean phone number
    let safePhone = affiliatePhone.replace(/\+/g, '').replace(/\s/g, '');
    if(safePhone.startsWith('0')) safePhone = '49' + safePhone.substring(1);
    
    const studentName = safeGet('grapp_user_name', 'Ein Schüler');
    const msg = `Hallo, ich bin ${studentName} und habe ein vertrauliches oder technisches Anliegen. Hast du kurz Zeit für mich?`;
    
    let wUrl = "https://wa.me/" + safePhone + "?text=" + encodeURIComponent(msg);
    window.open(wUrl, '_blank');
}

// ==========================================
// 6. WAIVER / HAFTUNGSAUSSCHLUSS LOGIC
// ==========================================

let signaturePadContext = null;
let isDrawingSignature = false;

function initSignatureCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Resize canvas to match display size for correct touch coordinates
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#e74c3c"; // Grapp Red
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch Events
    canvas.addEventListener('touchstart', startDrawing, {passive: false});
    canvas.addEventListener('touchmove', draw, {passive: false});
    canvas.addEventListener('touchend', stopDrawing);
}

function getPos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    let clientX = evt.clientX;
    let clientY = evt.clientY;
    
    if(evt.touches && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    }
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function startDrawing(e) {
    e.preventDefault();
    isDrawingSignature = true;
    const pos = getPos(e.target, e);
    const ctx = e.target.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
    if (!isDrawingSignature) return;
    e.preventDefault();
    const pos = getPos(e.target, e);
    const ctx = e.target.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawingSignature = false;
}

function clearSignature(canvasId) {
    const canvas = document.getElementById(canvasId || 'signatureCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function clearKioskSignature() {
    clearSignature('kioskSignatureCanvas');
}

function openWaiverModal() {
    document.getElementById('waiverModal').style.display = 'block';
    document.getElementById('waiverActions').style.display = 'block';
    document.getElementById('waiverExportActions').style.display = 'none';
    
    let rawText = safeGet('grapp_waiver_text', "");
    if (!rawText) {
        rawText = "Hiermit bestätige ich, dass ich am Probetraining auf eigene Gefahr teilnehme. Mir ist bewusst, dass [SPORTART] ein Vollkontakt-Sport ist und Verletzungsrisiken birgt. Ich versichere, dass ich sportgesund bin und keine ansteckenden Krankheiten (inkl. Hauterkrankungen) habe.";
    }
    
    // Replace Sport placeholder
    const sportName = window.currentSport ? window.currentSport.toUpperCase() : "KAMPFSPORT";
    const coachName = safeGet('grapp_user_name', 'Coach');
    const coachPhone = safeGet('grapp_user_own_phone', '');
    
    const finalText = rawText.replace(/\[SPORTART\]/gi, sportName)
                             .replace(/\[COACH\]/gi, coachName)
                             .replace(/\[TELEFON\]/gi, coachPhone);
    
    document.getElementById('waiverTextDisplay').innerText = finalText;
    
    setTimeout(() => {
        initSignatureCanvas('signatureCanvas');
        clearSignature();
    }, 100);
}

function closeWaiverModal() {
    document.getElementById('waiverModal').style.display = 'none';
}

function saveWaiver() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL('image/png');
    
    // Basic check if canvas is empty (a fully empty canvas dataURL is roughly ~20-30 bytes depending on browser)
    // We just check length to prevent completely empty submissions
    if (signatureData.length < 100) {
        alert("Bitte unterschreibe das Dokument!");
        return;
    }
    
    const waiverText = document.getElementById('waiverTextDisplay').innerText;
    const timestamp = new Date().toLocaleString('de-DE');
    
    const waiverObj = {
        text: waiverText,
        signature: signatureData,
        date: timestamp
    };
    
    safeSet('grapp_signed_waiver', waiverObj);
    
    document.getElementById('waiverActions').style.display = 'none';
    document.getElementById('waiverExportActions').style.display = 'block';
    
    const webhookUrl = safeGet('grapp_waiver_webhook', "");
    if(webhookUrl && webhookUrl.trim() !== "") {
        document.getElementById('btnWaiverWebhookContainer').style.display = 'block';
    } else {
        document.getElementById('btnWaiverWebhookContainer').style.display = 'none';
    }
}

function exportWaiverWhatsApp() {
    const waiver = safeGet('grapp_signed_waiver');
    if (!waiver) return;
    
    const studentName = document.getElementById('profName').value || "Ein neuer Schüler";
    const coachPhone = safeGet('grapp_coach_phone', "4917631096222");
    
    let msg = `*📝 WAIVER UNTERSCHRIEBEN*\n\n`;
    msg += `Student: *${studentName}*\n`;
    msg += `Datum: ${waiver.date}\n\n`;
    msg += `_Haftungsausschluss wurde in der GrAPP akzeptiert und digital signiert._\n`;
    
    window.open(`https://wa.me/${coachPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function exportWaiverWebhook() {
    const waiver = safeGet('grapp_signed_waiver');
    if (!waiver) return;
    
    const webhookUrl = safeGet('grapp_waiver_webhook', "");
    if(!webhookUrl) {
        alert("Kein Webhook konfiguriert.");
        return;
    }
    
    const btn = document.querySelector('#btnWaiverWebhookContainer button');
    if (btn) btn.innerText = "Sende...";
    
    const payload = {
        studentName: document.getElementById('profName').value || "Unbekannt",
        studentPhone: document.getElementById('profEmergencyPhone').value || "Keine",
        studentEmail: "", // Falls in Zukunft nötig
        waiverDate: waiver.date,
        waiverText: waiver.text,
        signatureBase64: waiver.signature
    };
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => {
        if(res.ok || res.type === 'opaque') {
            alert("Erfolgreich an das Vereinssystem übertragen!");
            if (btn) btn.innerText = "✅ GESENDET";
        } else {
            alert("Fehler beim Senden. Bitte kontaktiere den Coach.");
            if (btn) btn.innerText = "☁️ AN VEREINSSYSTEM SENDEN";
        }
    }).catch(err => {
        // Many webhooks (like Zapier) fail CORS but the request actually goes through. We catch it gracefully.
        console.warn("CORS or network issue during webhook call:", err);
        alert("Webhook angesteuert. (Ggf. CORS Fehler im Browser, aber Request ist meist raus).");
        if (btn) btn.innerText = "✅ (GESENDET)";
    });
}

// ==========================================
// 7. PROBETRAINING KIOSK-MODUS
// ==========================================

function openKioskMode() {
    // Reset fields
    document.getElementById('kioskName').value = "";
    document.getElementById('kioskBirthdate').value = "";
    document.getElementById('kioskEmergencyPhone').value = "";
    document.getElementById('kioskParentName').value = "";
    document.getElementById('kioskParentPhone').value = "";
    document.getElementById('kioskParentPhone2').value = "";
    document.getElementById('kioskU18Box').style.display = "none";
    
    // Reset buttons/export views
    document.getElementById('kioskActions').style.display = 'block';
    document.getElementById('kioskExportActions').style.display = 'none';
    
    // Load text
    let rawText = safeGet('grapp_waiver_text', "");
    if (!rawText) {
        rawText = "Hiermit bestätige ich, dass ich am Probetraining auf eigene Gefahr teilnehme. Mir ist bewusst, dass [SPORTART] ein Vollkontakt-Sport ist und Verletzungsrisiken birgt. Ich versichere, dass ich sportgesund bin und keine ansteckenden Krankheiten (inkl. Hauterkrankungen) habe.";
    }
    const sportName = window.currentSport ? window.currentSport.toUpperCase() : "KAMPFSPORT";
    const coachName = safeGet('grapp_user_name', 'Coach');
    const coachPhone = safeGet('grapp_user_own_phone', '');
    
    const finalText = rawText.replace(/\[SPORTART\]/gi, sportName)
                             .replace(/\[COACH\]/gi, coachName)
                             .replace(/\[TELEFON\]/gi, coachPhone);
    const displayEl = document.getElementById('kioskWaiverTextDisplay');
    if (displayEl) displayEl.innerText = finalText;

    document.getElementById('kioskModal').style.display = 'block';
    
    // Initialize Canvas after modal is visible (so width can be calculated)
    setTimeout(() => {
        initSignatureCanvas('kioskSignatureCanvas');
        clearKioskSignature();
    }, 100);
}

function closeKioskMode() {
    document.getElementById('kioskModal').style.display = 'none';
}

function checkKioskAgeLogic() {
    const birthdateInput = document.getElementById('kioskBirthdate')?.value;
    const u18Box = document.getElementById('kioskU18Box');
    if (!birthdateInput || !u18Box) return 0;

    const birthDate = new Date(birthdateInput);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    if (age < 18 && age >= 0) {
        u18Box.style.display = 'block';
    } else {
        u18Box.style.display = 'none';
    }
    return age;
}

function copyKioskParentPhone() {
    const parentPhone = document.getElementById('kioskParentPhone').value;
    if (parentPhone) {
        document.getElementById('kioskEmergencyPhone').value = parentPhone;
    }
}

function sendRemoteConsentLink(numIndex) {
    const studentName = document.getElementById('kioskName').value;
    
    let parentPhone = "";
    if (numIndex === 1) {
        parentPhone = document.getElementById('kioskParentPhone').value;
    } else {
        parentPhone = document.getElementById('kioskParentPhone2').value;
    }
    
    if (!studentName || !parentPhone) {
        alert(`Bitte Vor- und Nachname des Schülers sowie die WhatsApp-Nummer für Kontakt ${numIndex} eintragen!`);
        return;
    }
    
    let rawText = safeGet('grapp_remote_consent_text', "");
    if (!rawText || rawText.startsWith("Hallo, dein Kind") || rawText.indexOf("Bei Rückfragen") === -1 || rawText.indexOf("[SPORTART]") === -1) {
        rawText = "Sehr geehrte:r [ELTERN], Ihr Kind [SCHÜLER] steht gerade bei uns im Gym und möchte am [SPORTART]-Probetraining teilnehmen. Da es noch nicht volljährig ist, benötigen wir dringend die Unterschrift. Ich würde Sie bitten, hier digital zu unterschreiben, dass Sie einverstanden sind. Bei Rückfragen stehe ich unter [TELEFON] zur Verfügung. Beste Grüße, [COACH]";
    }
    
    const appUrl = window.location.href.split('?')[0]; 
    const coachPhoneURL = safeGet('grapp_user_own_phone', safeGet('grapp_coach_phone', ""));
    const hookUrl = safeGet('grapp_waiver_webhook', "");
    const signUrl = appUrl + `?remote_sign=true&child=${encodeURIComponent(studentName)}&coach=${encodeURIComponent(coachPhoneURL)}&hook=${encodeURIComponent(hookUrl)}`;
    
    const coachName = safeGet('grapp_user_name', 'Dein Coach');
    const parentName = document.getElementById('kioskParentName').value || 'Elternteil';
    const coachPhone = safeGet('grapp_user_own_phone', '_____');
    const sportName = window.currentSport ? window.currentSport.toUpperCase() : "KAMPFSPORT";
    
    let msg = rawText.replace(/\[SCHÜLER\]/gi, studentName)
                     .replace(/\[ELTERN\]/gi, parentName)
                     .replace(/\[COACH\]/gi, coachName)
                     .replace(/\[TELEFON\]/gi, coachPhone)
                     .replace(/\[SPORTART\]/gi, sportName);
                     
    msg += `\n\nBitte klicke auf diesen Link, lies den Haftungsausschluss und unterschreibe digital:\n${signUrl}`;
    
    // We open WhatsApp with the parent's phone number directly
    const cleanPhone = parentPhone.replace(/\+/g, '').replace(/\s/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function saveKioskWaiver() {
    const studentName = document.getElementById('kioskName').value;
    if (!studentName) {
        alert("Bitte trage zumindest deinen Namen ein.");
        return;
    }
    
    const age = checkKioskAgeLogic();
    if (age >= 0 && age < 18) {
        const pName = document.getElementById('kioskParentName').value;
        const pPhone = document.getElementById('kioskParentPhone').value;
        if (!pName || !pPhone) {
            alert("Du bist unter 18. Bitte trage die Daten deiner Eltern ein!");
            return;
        }
    }

    const canvas = document.getElementById('kioskSignatureCanvas');
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL('image/png');
    
    if (signatureData.length < 100) {
        alert("Bitte unterschreibe das Dokument!");
        return;
    }
    
    const waiverText = document.getElementById('kioskWaiverTextDisplay').innerText;
    const timestamp = new Date().toLocaleString('de-DE');
    
    const waiverObj = {
        text: waiverText,
        signature: signatureData,
        date: timestamp,
        studentName: studentName,
        studentPhone: document.getElementById('kioskEmergencyPhone').value || "Keine"
    };
    
    // Store in global variable or session storage to not pollute the coach's local storage permanently
    window.kioskWaiverTemp = waiverObj;
    
    document.getElementById('kioskActions').style.display = 'none';
    document.getElementById('kioskExportActions').style.display = 'block';
    
    const webhookUrl = safeGet('grapp_waiver_webhook', "");
    if(webhookUrl && webhookUrl.trim() !== "") {
        document.getElementById('kioskBtnWaiverWebhookContainer').style.display = 'block';
    } else {
        document.getElementById('kioskBtnWaiverWebhookContainer').style.display = 'none';
    }
}

function exportKioskWaiverWhatsApp() {
    const waiver = window.kioskWaiverTemp;
    if (!waiver) return;
    
    const coachPhone = safeGet('grapp_coach_phone', "4917631096222");
    
    let msg = `*📝 WAIVER UNTERSCHRIEBEN*\n\n`;
    msg += `Student: *${waiver.studentName}*\n`;
    msg += `Datum: ${waiver.date}\n\n`;
    msg += `_Haftungsausschluss wurde beim Probetraining akzeptiert und digital signiert._\n`;
    
    window.open(`https://wa.me/${coachPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

function exportKioskWaiverWebhook() {
    const waiver = window.kioskWaiverTemp;
    if (!waiver) return;
    
    const webhookUrl = safeGet('grapp_waiver_webhook', "");
    if(!webhookUrl) {
        alert("Kein Webhook konfiguriert.");
        return;
    }
    
    const btn = document.querySelector('#kioskBtnWaiverWebhookContainer button');
    if (btn) btn.innerText = "Sende...";
    
    const payload = {
        studentName: waiver.studentName,
        studentPhone: waiver.studentPhone,
        studentEmail: "",
        waiverDate: waiver.date,
        waiverText: waiver.text,
        signatureBase64: waiver.signature
    };
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(res => {
        if(res.ok || res.type === 'opaque') {
            alert("Erfolgreich an das Vereinssystem übertragen!");
            if (btn) btn.innerText = "✅ GESENDET";
        } else {
            alert("Fehler beim Senden. Bitte kontaktiere den Coach.");
            if (btn) btn.innerText = "☁️ AN VEREINSSYSTEM SENDEN";
        }
    }).catch(err => {
        console.warn("CORS or network issue during webhook call:", err);
        alert("Webhook angesteuert. (Ggf. CORS Fehler im Browser, aber Request ist meist raus).");
        if (btn) btn.innerText = "✅ (GESENDET)";
    });
}

function shareGymBranding() {
    if (!isUserPro()) {
        alert("Dies ist ein Pro-Feature für Gym-Owner.");
        return;
    }
    
    // Sammle alle relevanten Branding-Daten
    var payload = {
        primary: safeGet('grapp_color_primary', ''),
        accent: safeGet('grapp_color_accent', ''),
        bg: safeGet('grapp_color_bg', ''),
        appbg: safeGet('grapp_color_appbg', ''),
        logo_url: safeGet('grapp_custom_logo_url', ''),
        logo_pos: safeGet('grapp_custom_logo_pos', 'left'),
        logo_size: safeGet('grapp_custom_logo_size', '40'),
        links: []
    };
    
    for(let i=1; i<=3; i++) {
        payload.links.push({
            n: safeGet('grapp_cl'+i+'_name', ''),
            u: safeGet('grapp_cl'+i+'_url', '')
        });
    }
    
    try {
        var base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
        var shareUrl = window.location.origin + window.location.pathname + "?gym_import=" + base64Data;
        
        var msg = "Lade das offizielle Gym-Setup für unsere App:\n" + shareUrl;
        
        if (navigator.share) {
            navigator.share({
                title: 'Unser Gym App Setup',
                text: 'Klick hier, um unser Logo und unsere Team-Links in deiner App zu laden!',
                url: shareUrl
            }).catch((err) => {
                copyToClipboardFallback(msg, "Einladungs-Link in die Zwischenablage kopiert!");
            });
        } else {
            copyToClipboardFallback(msg, "Einladungs-Link in die Zwischenablage kopiert! Schick ihn in eure WhatsApp-Gruppe.");
        }
    } catch(e) {
        alert("Fehler beim Generieren des Links: " + e.message);
    }
}

function copyToClipboardFallback(text, successMsg) {
    var tempInput = document.createElement("textarea");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert(successMsg);
}

// ==========================================
// 8. GAMIFICATION: SHARING & REFERRALS
// ==========================================

function updateReferralLink() {
    let nameInput = document.getElementById('profName');
    let linkInput = document.getElementById('referralLinkInput');
    if(!linkInput || !nameInput) return;
    
    let name = nameInput.value.trim();
    if(name === "") {
        linkInput.value = "Bitte trage oben erst deinen Profilnamen ein.";
    } else {
        let baseUrl = window.location.href.split('?')[0].split('#')[0];
        linkInput.value = baseUrl + "?ref=" + encodeURIComponent(name);
    }
}

function shareReferralLink() {
    let linkInput = document.getElementById('referralLinkInput');
    if(!linkInput || !linkInput.value || linkInput.value.includes("Bitte trage")) {
        alert("Bitte trage zuerst deinen Namen im Profil (GYM PROFIL & SETUP) ein!");
        return;
    }
    
    let url = linkInput.value;
    let shareText = "Komm auf die Matte! Nutz meinen Link für die GrAPP:";
    
    if (navigator.share) {
        navigator.share({
            title: 'GrAPP Training',
            text: shareText,
            url: url
        }).catch(err => console.log("Share cancelled or failed", err));
    } else {
        copyToClipboardFallback(shareText + " " + url, "Link kopiert! Du kannst ihn jetzt in WhatsApp einfügen.");
    }
}

function showReferralQRCode() {
    let linkInput = document.getElementById('referralLinkInput');
    if(!linkInput || !linkInput.value || linkInput.value.includes("Bitte trage")) {
        alert("Bitte trage zuerst deinen Namen im Profil (GYM PROFIL & SETUP) ein!");
        return;
    }
    
    let qrBox = document.getElementById('referralQrBox');
    let qrImg = document.getElementById('referralQrImg');
    
    if(qrBox.style.display === 'block') {
        qrBox.style.display = 'none';
    } else {
        let url = encodeURIComponent(linkInput.value);
        qrImg.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${url}&choe=UTF-8`;
        qrBox.style.display = 'block';
    }
}

// Hook into name changes and initial load
document.addEventListener("DOMContentLoaded", () => {
    updateReferralLink();
    const nameInput = document.getElementById('profName');
    if(nameInput) {
        nameInput.addEventListener('input', updateReferralLink);
        nameInput.addEventListener('change', updateReferralLink);
    }
});

// ==========================================
// 9. GAMIFICATION: TROPHÄEN REGAL (AUDIBLE STYLE)
// ==========================================

const GAMIFICATION_THRESHOLDS = {
    checkins: [10, 100, 300, 500, 1000],
    referrals: [1, 3, 5, 10, 20],
    modules: [1, 5, 10, 15, 20]
};

const BELT_COLORS = ["#ffffff", "#2980b9", "#8e44ad", "#8b4513", "#111111"];
const BELT_NAMES = ["Weiß", "Blau", "Lila", "Braun", "Schwarz"];

function renderTrophies() {
    const shelf = document.getElementById('trophyShelf');
    if(!shelf) return;
    
    // Get test values
    let checkins = parseInt(document.getElementById('testCheckins').value) || 0;
    let referrals = parseInt(document.getElementById('testReferrals').value) || 0;
    let modules = parseInt(document.getElementById('testModules').value) || 0;
    
    let html = "";
    let blackCount = 0;
    
    // Checkins
    let cLevel = 0;
    for(let i=0; i<5; i++) {
        let isUnlocked = checkins >= GAMIFICATION_THRESHOLDS.checkins[i];
        if(isUnlocked) cLevel = i + 1;
        if(isUnlocked && i === 4) blackCount++;
        html += buildShield("Matten-Junkie", BELT_NAMES[i], BELT_COLORS[i], isUnlocked, checkins, GAMIFICATION_THRESHOLDS.checkins[i]);
    }
    
    // Referrals
    let rLevel = 0;
    for(let i=0; i<5; i++) {
        let isUnlocked = referrals >= GAMIFICATION_THRESHOLDS.referrals[i];
        if(isUnlocked) rLevel = i + 1;
        if(isUnlocked && i === 4) blackCount++;
        html += buildShield("Team-Builder", BELT_NAMES[i], BELT_COLORS[i], isUnlocked, referrals, GAMIFICATION_THRESHOLDS.referrals[i]);
    }
    
    // Modules
    let mLevel = 0;
    for(let i=0; i<5; i++) {
        let isUnlocked = modules >= GAMIFICATION_THRESHOLDS.modules[i];
        if(isUnlocked) mLevel = i + 1;
        if(isUnlocked && i === 4) blackCount++;
        html += buildShield("Mastermind", BELT_NAMES[i], BELT_COLORS[i], isUnlocked, modules, GAMIFICATION_THRESHOLDS.modules[i]);
    }
    
    // Coral Patch (2 Blacks)
    let coralUnlocked = blackCount >= 2;
    html += buildShield("CORAL PATCH", "Meta", "repeating-linear-gradient(45deg, #e74c3c, #e74c3c 10px, #111 10px, #111 20px)", coralUnlocked, blackCount, 2, "2x Schwarz erreicht");
    
    // Red Patch (3 Blacks)
    let redUnlocked = blackCount >= 3;
    html += buildShield("RED PATCH", "Endgame", "#e74c3c", redUnlocked, blackCount, 3, "3x Schwarz erreicht");
    
    shelf.innerHTML = html;
    
    // Master Glow Logic
    let wrapper = document.getElementById('gamificationProfileWrapper');
    if(wrapper) {
        if(redUnlocked) {
            wrapper.style.boxShadow = "0 0 30px rgba(231, 76, 60, 0.8)";
            wrapper.style.border = "2px solid #e74c3c";
        } else if(coralUnlocked) {
            wrapper.style.boxShadow = "0 0 20px rgba(231, 76, 60, 0.4)";
            wrapper.style.border = "2px solid #555";
        } else {
            wrapper.style.boxShadow = "none";
            wrapper.style.border = "none";
        }
    }
}

function buildShield(title, subtitle, bg, isUnlocked, current, target, customProgressText) {
    let opacity = isUnlocked ? "1" : "0.2";
    let filter = isUnlocked ? "grayscale(0%)" : "grayscale(100%)";
    let border = isUnlocked ? "2px solid #f1c40f" : "2px solid #555";
    let textColor = (bg === "#ffffff") ? "#111" : "#fff";
    
    let progressText = customProgressText ? customProgressText : `Dir fehlen noch ${target - current}`;
    let alertMsg = isUnlocked ? `Du hast dieses Patch erreicht!` : `Noch nicht erreicht. ${progressText}`;
    
    // For complex backgrounds like gradients
    let bgStyle = bg.includes('gradient') ? `background: ${bg};` : `background-color: ${bg};`;
    
    return `
        <div style="min-width: 80px; height: 100px; border-radius: 10px; ${bgStyle} border: ${border}; opacity: ${opacity}; filter: ${filter}; display:flex; flex-direction:column; justify-content:center; align-items:center; cursor:pointer; transition: all 0.3s; position:relative;" onclick="alert('${title} (${subtitle})\\n\\n${alertMsg}')">
            <span style="color: ${textColor}; font-weight: 900; font-size:10px; text-align:center; text-transform:uppercase;">${title}</span>
            <span style="color: ${textColor}; font-size:9px; margin-top:5px; background: rgba(0,0,0,0.3); padding:2px 5px; border-radius:4px;">${subtitle}</span>
            ${!isUnlocked ? `<div style="position:absolute; bottom:5px; width:80%; height:4px; background:#333; border-radius:2px; overflow:hidden;"><div style="width:${Math.min(100, (current/target)*100)}%; height:100%; background:#f1c40f;"></div></div>` : ''}
        </div>
    `;
}

// Initial render
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(renderTrophies, 500);
});
