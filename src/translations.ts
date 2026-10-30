import { Language } from './types';

export const translations = {
  de: {
    brandName: 'Studio Lab',
    projects: 'Projekte',
    newProject: 'Neues Projekt',
    projectNamePlaceholder: 'Projektname...',
    createProjectTitle: 'Neues Projekt erstellen',
    renameProjectTitle: 'Projekt umbenennen',
    deleteProjectTitle: 'Projekt löschen',
    deleteProjectConfirm: 'Möchten Sie dieses Projekt wirklich unwiderruflich löschen?',
    
    // Explorer
    explorer: 'Explorer',
    newFile: 'Neue Datei',
    newFolder: 'Neuer Ordner',
    fileNamePlaceholder: 'z.B. index.html',
    folderNamePlaceholder: 'z.B. assets',
    createFileTitle: 'Neue Datei anlegen',
    createFolderTitle: 'Neuen Ordner anlegen',
    renameItemTitle: 'Element umbenennen',
    deleteItemTitle: 'Element löschen',
    deleteItemConfirm: 'Möchten Sie dieses Element wirklich löschen?',
    collapseSidebar: 'Sidebar einklappen',
    expandSidebar: 'Sidebar ausklappen',
    emptyFolder: 'Ordner ist leer',
    noFilesFound: 'Keine Dateien geöffnet',
    moveTo: 'Verschieben nach…',
    moveToTitle: 'Element verschieben',
    rootFolder: 'Hauptverzeichnis',
    nameExists: 'Dieser Name existiert hier bereits',
    nameInvalid: 'Ungültiger Name (kein / oder \\)',
    deleteFolderWarning: 'Der gesamte Inhalt des Ordners wird ebenfalls gelöscht.',
    
    // Actions
    saved: 'Gespeichert',
    unsaved: 'Nicht gespeichert',
    exportProject: 'Projekt exportieren (ZIP)',
    importProject: 'Projekt importieren',
    formatCode: 'Code formatieren',
    shortcuts: 'Tastenkombinationen',
    refresh: 'Aktualisieren',
    clear: 'Leeren',
    rename: 'Umbenennen',
    delete: 'Löschen',
    duplicate: 'Duplizieren',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    create: 'Erstellen',
    close: 'Schließen',
    screenshot: 'Screenshot speichern',
    screenshotFailed: 'Screenshot fehlgeschlagen',
    openNewWindow: 'In neuem Tab öffnen',
    copy: 'Kopieren',
    copyAll: 'Alles kopieren',
    
    // Layouts & Views
    layoutSplitH: 'Geteilt (Horizontal)',
    layoutSplitV: 'Geteilt (Vertikal)',
    layoutEditorOnly: 'Nur Editor',
    layoutPreviewOnly: 'Nur Vorschau',
    
    // Devices
    deviceResponsive: 'Responsiv',
    deviceDesktop: 'Desktop',
    deviceTablet: 'Tablet',
    deviceMobile: 'Mobil',
    
    // Editor status
    console: 'Konsole',
    line: 'Zeile',
    col: 'Spalte',
    chars: 'Zeichen',
    noFileOpen: 'Keine Datei ausgewählt',
    selectFileHint: 'Wählen Sie eine Datei aus dem Explorer aus oder erstellen Sie eine neue.',
    
    // Shortcuts list
    shortcutSave: 'Projekt speichern',
    shortcutFormat: 'Code formatieren',
    shortcutToggleSidebar: 'Explorer ein-/ausblenden',

    // Mobile Navigation
    mobileCode: 'Code',
    mobilePreview: 'Vorschau',
    mobileFiles: 'Dateien',

    // Dashboard
    dashboardTitle: 'Meine Projekte',
    dashboardSubtitle: 'Erstelle, verwalte und bearbeite deine Web-Projekte',
    backToDashboard: 'Projekte',
    openProject: 'Projekt öffnen',
    searchProjects: 'Projekte durchsuchen...',
    filesCount: 'Dateien',
    optionsMenu: 'Optionen',
    workspace: 'Arbeitsbereich',
    layoutOptions: 'Layout & Ansicht',

    // Console
    noLogs: 'Keine Konsolenausgaben vorhanden.',
    consoleAll: 'Alle',
    consoleErrors: 'Fehler',
    consoleWarnings: 'Warnungen',
    consoleInfo: 'Info',
  },
  en: {
    brandName: 'Studio Lab',
    projects: 'Projects',
    newProject: 'New Project',
    projectNamePlaceholder: 'Project name...',
    createProjectTitle: 'Create New Project',
    renameProjectTitle: 'Rename Project',
    deleteProjectTitle: 'Delete Project',
    deleteProjectConfirm: 'Are you sure you want to permanently delete this project?',
    
    // Explorer
    explorer: 'Explorer',
    newFile: 'New File',
    newFolder: 'New Folder',
    fileNamePlaceholder: 'e.g. index.html',
    folderNamePlaceholder: 'e.g. assets',
    createFileTitle: 'Create New File',
    createFolderTitle: 'Create New Folder',
    renameItemTitle: 'Rename Item',
    deleteItemTitle: 'Delete Item',
    deleteItemConfirm: 'Are you sure you want to delete this item?',
    collapseSidebar: 'Collapse sidebar',
    expandSidebar: 'Expand sidebar',
    emptyFolder: 'Folder is empty',
    noFilesFound: 'No files open',
    moveTo: 'Move to…',
    moveToTitle: 'Move item',
    rootFolder: 'Root',
    nameExists: 'This name already exists here',
    nameInvalid: 'Invalid name (no / or \\)',
    deleteFolderWarning: 'All contents of the folder will be deleted too.',
    
    // Actions
    saved: 'Saved',
    unsaved: 'Unsaved',
    exportProject: 'Export Project (ZIP)',
    importProject: 'Import Project',
    formatCode: 'Format Code',
    shortcuts: 'Keyboard Shortcuts',
    refresh: 'Refresh',
    clear: 'Clear',
    rename: 'Rename',
    delete: 'Delete',
    duplicate: 'Duplicate',
    cancel: 'Cancel',
    confirm: 'Confirm',
    create: 'Create',
    close: 'Close',
    screenshot: 'Save screenshot',
    screenshotFailed: 'Screenshot failed',
    openNewWindow: 'Open in new tab',
    copy: 'Copy',
    copyAll: 'Copy all',
    
    // Layouts & Views
    layoutSplitH: 'Split (Horizontal)',
    layoutSplitV: 'Split (Vertical)',
    layoutEditorOnly: 'Editor Only',
    layoutPreviewOnly: 'Preview Only',
    
    // Devices
    deviceResponsive: 'Responsive',
    deviceDesktop: 'Desktop',
    deviceTablet: 'Tablet',
    deviceMobile: 'Mobile',
    
    // Editor status
    console: 'Console',
    line: 'Line',
    col: 'Col',
    chars: 'Chars',
    noFileOpen: 'No file selected',
    selectFileHint: 'Select a file from the explorer or create a new one.',
    
    // Shortcuts list
    shortcutSave: 'Save project',
    shortcutFormat: 'Format code',
    shortcutToggleSidebar: 'Toggle explorer',

    // Mobile Navigation
    mobileCode: 'Code',
    mobilePreview: 'Preview',
    mobileFiles: 'Files',

    // Dashboard
    dashboardTitle: 'My Projects',
    dashboardSubtitle: 'Create, manage, and edit your web projects',
    backToDashboard: 'Projects',
    openProject: 'Open Project',
    searchProjects: 'Search projects...',
    filesCount: 'Files',
    optionsMenu: 'Options',
    workspace: 'Workspace',
    layoutOptions: 'Layout & View',

    // Console
    noLogs: 'No console logs yet.',
    consoleAll: 'All',
    consoleErrors: 'Errors',
    consoleWarnings: 'Warnings',
    consoleInfo: 'Info',
  },
  ar: {
    brandName: 'Studio Lab',
    projects: 'المشاريع',
    newProject: 'مشروع جديد',
    projectNamePlaceholder: 'اسم المشروع...',
    createProjectTitle: 'إنشاء مشروع جديد',
    renameProjectTitle: 'إعادة تسمية المشروع',
    deleteProjectTitle: 'حذف المشروع',
    deleteProjectConfirm: 'هل أنت متأكد من حذف هذا المشروع نهائياً؟',
    
    // Explorer
    explorer: 'الملفات',
    newFile: 'ملف جديد',
    newFolder: 'مجلد جديد',
    fileNamePlaceholder: 'مثال: index.html',
    folderNamePlaceholder: 'مثال: assets',
    createFileTitle: 'إنشاء ملف جديد',
    createFolderTitle: 'إنشاء مجلد جديد',
    renameItemTitle: 'إعادة تسمية العنصر',
    deleteItemTitle: 'حذف العنصر',
    deleteItemConfirm: 'هل أنت متأكد من حذف هذا العنصر؟',
    collapseSidebar: 'طي الشريط الجانبي',
    expandSidebar: 'توسيع الشريط الجانبي',
    emptyFolder: 'المجلد فارغ',
    noFilesFound: 'لا توجد ملفات مفتوحة',
    moveTo: 'نقل إلى…',
    moveToTitle: 'نقل العنصر',
    rootFolder: 'المجلد الرئيسي',
    nameExists: 'هذا الاسم موجود مسبقاً هنا',
    nameInvalid: 'اسم غير صالح (بدون / أو \\)',
    deleteFolderWarning: 'سيتم حذف كل محتويات المجلد أيضاً.',
    
    // Actions
    saved: 'تم الحفظ',
    unsaved: 'غير محفوظ',
    exportProject: 'تصدير المشروع (ZIP)',
    importProject: 'استيراد مشروع',
    formatCode: 'تنسيق الشيفرة',
    shortcuts: 'اختصارات لوحة المفاتيح',
    refresh: 'تحديث',
    clear: 'مسح',
    rename: 'إعادة تسمية',
    delete: 'حذف',
    duplicate: 'تكرار',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    create: 'إنشاء',
    close: 'إغلاق',
    screenshot: 'حفظ لقطة شاشة',
    screenshotFailed: 'فشل التقاط الصورة',
    openNewWindow: 'فتح في تبويب جديد',
    copy: 'نسخ',
    copyAll: 'نسخ الكل',
    
    // Layouts & Views
    layoutSplitH: 'انقسام أفقي',
    layoutSplitV: 'انقسام عمودي',
    layoutEditorOnly: 'المحرر فقط',
    layoutPreviewOnly: 'المعاينة فقط',
    
    // Devices
    deviceResponsive: 'مرن',
    deviceDesktop: 'حاسوب',
    deviceTablet: 'لوحي',
    deviceMobile: 'هاتف',
    
    // Editor status
    console: 'لوحة التحكم',
    line: 'سطر',
    col: 'عمود',
    chars: 'حرف',
    noFileOpen: 'لم يتم اختيار أي ملف',
    selectFileHint: 'اختر ملفاً من مستعرض الملفات أو أنشئ ملفاً جديداً.',
    
    // Shortcuts list
    shortcutSave: 'حفظ المشروع',
    shortcutFormat: 'تنسيق الشيفرة',
    shortcutToggleSidebar: 'إظهار/إخفاء مستعرض الملفات',

    // Mobile Navigation
    mobileCode: 'الشيفرة',
    mobilePreview: 'المعاينة',
    mobileFiles: 'الملفات',

    // Dashboard
    dashboardTitle: 'مشاريعي',
    dashboardSubtitle: 'إنشاء وإدارة وتطوير مشاريع الويب الخاصة بك',
    backToDashboard: 'المشاريع',
    openProject: 'فتح المشروع',
    searchProjects: 'البحث في المشاريع...',
    filesCount: 'ملفات',
    optionsMenu: 'الخيارات',
    workspace: 'مساحة العمل',
    layoutOptions: 'توزيع الشاشة والعرض',

    // Console
    noLogs: 'لا توجد سجلات حتى الآن.',
    consoleAll: 'الكل',
    consoleErrors: 'أخطاء',
    consoleWarnings: 'تحذيرات',
    consoleInfo: 'معلومات',
  }
};

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('studio_lab_lang');
    if (saved === 'de' || saved === 'en' || saved === 'ar') return saved;

    const navLangs = [
      navigator.language,
      ...(Array.isArray(navigator.languages) ? navigator.languages : [])
    ].filter(Boolean);

    for (const l of navLangs) {
      const lower = l.toLowerCase();
      if (lower.startsWith('de')) return 'de';
      if (lower.startsWith('ar')) return 'ar';
      if (lower.startsWith('en')) return 'en';
    }

    // Fallback if browser uses a language not supported by the app
    return 'de';
  } catch {
    return 'de';
  }
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem('studio_lab_lang', lang);
  } catch (err) {
    console.error('Failed to save language preference', err);
  }
}
