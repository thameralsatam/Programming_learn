# Implementation Plan - Professionelles Studio Lab Redesign & Modularisierung

Umfassende Überarbeitung und Neugestaltung des Web-Entwicklungs- und HTML-Lernlabors zu einer modernen, minimalistischen und hochpräzisen Entwicklerumgebung im professionellen Dark-Look mit voller Unterstützung für **Deutsch (`de`)** und **Englisch (`en`)**, modularer Architektur und stabiler Ausführung.

---

## User Review Required

> [!IMPORTANT]
> **Sprachunterstützung**: Die Benutzeroberfläche und die Standardvorlagen werden vollständig auf **Deutsch** (Standard) und **Englisch** umgestellt. Beim ersten Laden wird die Browsersprache geprüft: Ist sie Deutsch oder Englisch, wird sie übernommen; andernfalls wird standardmäßig **Deutsch** aktiviert.
> 
> **Optisches Design & Anti-Slop**: Gemäß Ihren Vorgaben wird die Oberfläche vollkommen ruhig, dunkel und augenschonend gestaltet — ohne Emojis, ohne übertriebene Schlagschatten, mit aufeinander abgestimmten Abständen und einheitlichen Lucide-SVG-Symbolen.

---

## Proposed Changes

### 1. Bereinigung & modulare Dateistruktur

Der monolithische Zustand von `src/App.tsx` (~2550 Zeilen) wird in klar strukturierte, wartbare Module zerlegt:

- **`src/types/index.ts`**:
  - Typdefinitionen für Projekte (`Project`), Dateibaum-Knoten (`FileNode`), Layout-Modi (`LayoutMode`: Horizontal Split, Vertical Split, Editor Only, Preview Only), Geräteansichten (`DeviceMode`: Responsive, Desktop, Tablet, Mobile) und Modals.

- **`src/translations.ts`**:
  - Vollständige Übersetzung aller Begriffe, Hinweistexte, Dialoge, Tastaturkürzel und Menüeinträge auf **Deutsch (`de`)** und **Englisch (`en`)**.
  - Intelligente Initialerkennung:
    1. Gespeicherte Einstellung im `localStorage`.
    2. Wenn nicht vorhanden: Auslesen von `navigator.language`.
    3. Bei `de*` -> Deutsch, bei `en*` -> Englisch, bei allen anderen Sprachen -> Deutsch (Priorität).

- **`src/templates/starterProject.ts`**:
  - Ein durchdachtes, sauberes und professionelles Starter-Projekt für HTML/CSS/JS:
    - Semantisches HTML5 (Header, Nav, Hero, Feature-Grid, Footer).
    - Modernes, minimalistisches CSS mit dezentem Dark-Theme, sauberen Schriften und CSS-Variablen.
    - Minimales, didaktisch wertvolles JavaScript (interaktiver Zähler und Theme-Feedback) ohne unnötigen Ballast.
    - Bereitgestellt auf Deutsch und Englisch je nach aktiver Sprache.

- **`src/components/Header.tsx`**:
  - Ruhige, millimetergenau abgestimmte Kopfzeile mit:
    - Minimalem Projekt-Titel & Status.
    - Schnellem Wechsel zwischen Projekten.
    - Layout-Umschalter (Horizontal Split, Vertikal, Nur Code, Nur Vorschau).
    - Sprachumschalter (DE / EN).
    - Aktionen: Projekt sichern (Export ZIP/JSON), Importieren, Tastaturkürzel.

- **`src/components/Sidebar.tsx`**:
  - Faltbarer Datei-Explorer mit präzisen Baumstrukturen:
    - Dateien anlegen, umbenennen, duplizieren, löschen.
    - Datei-Icons basierend auf Dateiendung (`.html`, `.css`, `.js`, `.json`).
    - Einklapp-Funktion per Klick oder Tastenkombination zur Maximierung des Arbeitsbereichs.

- **`src/components/EditorPane.tsx`**:
  - Integrierter Monaco Editor mit Tab-Leiste für geöffnete Dateien.
  - Sichere Worker-Initialisierung (resistent gegen Iframe-Sandbox-Ereignisse).
  - Formatierung, Schriftgrößen-Anpassung, Such- und Ersetzungsfunktionen.
  - Dezente Fußzeile mit Zeilen-/Spaltenanzeige und Dateityp.

- **`src/components/PreviewPane.tsx`**:
  - Sandboxed Live-Vorschau mit sofortiger Aktualisierung oder verzögertem Neuladen.
  - Geräte-Presets mit exakten Abmessungen:
    - Volle Breite (Responsive)
    - Desktop (1200px)
    - Tablet (768px)
    - Mobiltelefon (375px)
  - Schaltflächen für Neuladen, In neuem Tab öffnen (sicher) und Konsolen-Inspektor.

- **`src/components/Modals.tsx`**:
  - Ruhige, einheitliche Dialoge für:
    - Projekt erstellen / umbenennen / löschen.
    - Datei- und Ordneroperationen.
    - Tastaturkürzel-Übersicht.

---

### 2. Visuelles Design & Styling

- **Farbpalette & Kontraste**:
  - Hintergrund: Tiefes, mattes Dunkelgrau/Schwarz (`#0b0d11`).
  - Bedienflächen: Subtile Oberflächen (`#13171f`, `#1a1f2c`).
  - Rahmen: Feine 1px Haarlinien (`rgba(255, 255, 255, 0.08)`).
  - Akzente: Gedämpftes Studio-Blau (`#3b82f6`) für aktive Zustände, kein buntes Durcheinander.
- **Typografie**:
  - Headings & Navigation: Geordnet und ausgewogen mit `IBM Plex Sans`.
  - Code & Daten: `JetBrains Mono` mit `tabular-nums`.
- **Icons**:
  - Ausschließlich einheitliche Lucide-React SVG-Icons, semantisch passend ausgewählt und in einheitlicher 16px/18px Strichstärke.

---

## Verification Plan

### Automated Checks
- `lint_applet`: Überprüfung der TypeScript-Typen mit `tsc --noEmit`.
- `compile_applet`: Überprüfung des Produktions-Builds mit Vite (`npm run build`).

### Manual Verification
1. **Sprachenprüfung**:
   - Standard-Laden testen (Priorisierung Deutsch).
   - Manuelles Umschalten zwischen Deutsch und Englisch prüfen. Alle Bezeichnungen, Dialoge und Tooltips müssen übersetzt sein.
2. **Layout & Flexibilität**:
   - Datei-Explorer ein- und ausklappen.
   - Umschalten zwischen horizontalem Split, vertikalem Split, Vollbild-Editor und Vollbild-Vorschau.
   - Geräteansichten (Desktop, Tablet, Mobile) in der Vorschau testen.
3. **Funktionalität**:
   - Dateien erstellen, editieren, umbenennen und löschen.
   - Live-Aktualisierung der HTML/CSS/JS-Vorschau ohne Abstürze oder Konsolenfehler.
   - Export und Import von Projekten (ZIP / JSON).
