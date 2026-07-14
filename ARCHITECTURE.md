# GrAPP – Architecture & Security Overview

**Target Audience:** Software Developers, IT Security Auditors, and Tech-Savvy Team Members.

Willkommen im Repository der **GrAPP**! Dieses Dokument dient als technischer Leitfaden, um die Architektur-Entscheidungen, das Datenmodell und die Sicherheitskonzepte der App transparent zu erklären. 

Wir begrüßen Code-Reviews und Audits ausdrücklich. Dieses Dokument soll dir helfen, dich im Codebase zurechtzufinden und den speziellen Use-Case der App zu verstehen.

---

## 1. Das Konzept: Offline-First & Serverless
Die GrAPP ist **keine** klassische Client-Server-Applikation. Sie wurde bewusst als **Serverless Progressive Web App (PWA)** konzipiert. 

**Warum?**
* **Zero-Cost-Scaling:** Die App wird ehrenamtlich für BJJ- und Kampfsport-Gyms bereitgestellt. Durch den Verzicht auf eigene Backend-Infrastruktur und Datenbanken fallen keine monatlichen Serverkosten an.
* **Datenschutz by Design:** Wo keine zentrale Datenbank existiert, kann keine zentrale Datenbank gehackt werden. Es gibt kein Risiko für einen Massen-Leak von Nutzerdaten.

**Tech-Stack:**
* 100% Vanilla JavaScript (ES6+), HTML5, CSS3.
* Hosting über **GitHub Pages** (Statische Dateien).
* Keine Build-Tools (Webpack/Vite), kein Framework (React/Angular) – für maximale Einfachheit und Langlebigkeit des Codes.

---

## 2. Datenhaltung & Storage-Modell
Alle nutzergenerierten Daten (Trainingslogs, medizinische Notizen, Geburtsdatum, Profilname) verbleiben **ausschließlich lokal auf dem Endgerät** des Nutzers.

* Wir nutzen den **Browser `localStorage`** als persistente Datenbank.
* **Sicherheit:** Der LocalStorage unterliegt der strikten Same-Origin-Policy (SOP) moderner Browser. Keine andere App oder Website kann diese Daten auslesen. 
* Eine Verschlüsselung des LocalStorage via JavaScript (z.B. AES mit im Client hartcodiertem Key) wurde als reines *Security-by-Obscurity*-Konzept bewertet und verworfen, da es keinen echten Mehrwert gegen physischen Gerätezugriff bietet.
* Speicherlimits werden geschont, indem große Objekte (wie Profilbilder oder Gym-Logos) vor dem Speichern via HTML5 Canvas runterskaliert und stark komprimiert werden (max. 200x200px, JPEG-Qualität 0.7).

---

## 3. Datenübertragung & Netzwerk (Check-In)
Das Kernfeature der App ist das Einchecken im Gym. Um die Datensicherheit und Privatsphäre beim Scannen zu maximieren, wurde das Konzept des Austauschs von medizinischen Notfalldaten ("Corner Info") komplett verworfen.

**Der optische Handshake (QR-Code):**
Anstatt Daten über das Internet zu synchronisieren, generiert die App des Schülers einen QR-Code für den Check-In.
* **Erster Besuch (Basis-Daten):** Wenn noch keine Mitglieds-ID im Profil hinterlegt ist, überträgt der QR-Code lediglich Name, Gürtel und Sportart (base64-encodiert).
* **Garderobenkarten-Prinzip (Zero-Data):** Sobald der Athlet seine Mitglieds-ID (z.B. 42) in sein Profil einträgt, überträgt der QR-Code *nur noch* diesen String (als `GRAPP-TICKET-42`). Sensible Daten verlassen das Gerät ab diesem Zeitpunkt nicht mehr.
* **Schutz gegen Dritt-Scanner:** Wer den QR-Code eines Mitglieds mit einer normalen iPhone-Kamera scannt, sieht lediglich die anonyme ID. Die Zuordnung der ID zum echten Athleten erfolgt sicher und ausschließlich beim Coach.

**Der Webhook (Optional):**
Lediglich die App des *Coaches* baut nach erfolgreichem Scan eine aktive Netzwerkverbindung auf. Die Anwesenheitsdaten (oder die gescannte ID) werden via `fetch()` (POST) an eine Google Form / ein Google Sheet gesendet. Dies ist das einzige Backend-System, auf das die App zugreift.

---

## 4. Implementierte Sicherheitsmaßnahmen (Security)

1. **XSS Protection (Cross-Site-Scripting):**
   Da wir kein Backend haben, das Inputs sanitizen kann, erfolgt die Maskierung streng beim Rendering. Alle dynamischen Ausgaben – sowohl aus dem LocalStorage als auch potenziell bösartige Inputs via QR-Scanner (Name, Gürtel, Sportart) – werden konsequent durch eine globale `escapeHTML()` Funktion (in `app.js`) geschleust. Dadurch sind Reflected-XSS-Angriffe über manipulierte QR-Payloads ausgeschlossen.
2. **HTTPS Enforcement:**
   Ein Skript in der `index.html` erzwingt den Redirect auf `https://`. Über GitHub Pages ist TLS/SSL ohnehin Standard.
3. **Subresource Integrity (SRI):**
   Die wenigen externen CDNs (z.B. `html5-qrcode` und `qrcodejs`) sind mit kryptografischen SRI-Hashes (`integrity="..."`) abgesichert, um Manipulationen durch Drittserver auszuschließen.
4. **Memory Management (DOM Cleanup):**
   Um Memory Leaks und überhängende Event-Listener durch die Kamera-API zu vermeiden, wird der DOM-Node des Scanners bei Deaktivierung hart geklont und ersetzt (`cloneNode(true)`), was den Garbage Collector bei der Freigabe der Hardware-Ressourcen unterstützt.

---

## 5. Kontakt & Contribution
Wenn dir bei deinem Audit Schwachstellen auffallen oder du Architektur-Verbesserungen vorschlagen möchtest: Wir setzen Feedback extrem schnell um! Erstelle gerne einen Pull Request oder ein Issue direkt hier im Repository.

Vielen Dank fürs Reviewen und für deinen Beitrag zur Sicherheit der Kampfsport-Community! 🥋
