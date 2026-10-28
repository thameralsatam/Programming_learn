import { Language } from './types';

export const translations = {
  de: {
    brandName: 'Studio Lab',
    tagline: 'Web-Entwicklungsumgebung',
    projects: 'Projekte',
    myProjects: 'Meine Projekte',
    newProject: 'Neues Projekt',
    projectNamePlaceholder: 'Projektname...',
    createProjectTitle: 'Neues Projekt erstellen',
    renameProjectTitle: 'Projekt umbenennen',
    deleteProjectTitle: 'Projekt löschen',
    deleteProjectConfirm: 'Möchten Sie dieses Projekt wirklich unwiderruflich löschen?',
    noProjects: 'Keine Projekte vorhanden. Erstellen Sie Ihr erstes Projekt!',
    
    // Explorer
    explorer: 'Explorer',
    files: 'Dateien',
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
    
    // Actions
    save: 'Speichern',
    saved: 'Gespeichert',
    unsaved: 'Nicht gespeichert',
    exportProject: 'Projekt exportieren (ZIP)',
    importProject: 'Projekt importieren',
    importConfirmTitle: 'Projekt importieren',
    importConfirmText: 'Das Importieren überschreibt vorhandene Dateien mit gleichem Namen. Fortfahren?',
    formatCode: 'Code formatieren',
    shortcuts: 'Tastenkombinationen',
    runPreview: 'Vorschau aktualisieren',
    refresh: 'Aktualisieren',
    clear: 'Leeren',
    copy: 'Kopieren',
    rename: 'Umbenennen',
    delete: 'Löschen',
    duplicate: 'Duplizieren',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    create: 'Erstellen',
    close: 'Schließen',
    
    // Layouts & Views
    layout: 'Layout',
    layoutSplitH: 'Geteilt (Horizontal)',
    layoutSplitV: 'Geteilt (Vertikal)',
    layoutEditorOnly: 'Nur Editor',
    layoutPreviewOnly: 'Nur Vorschau',
    
    // Devices
    deviceResponsive: 'Responsiv (100%)',
    deviceDesktop: 'Desktop (1200px)',
    deviceTablet: 'Tablet (768px)',
    deviceMobile: 'Mobil (375px)',
    
    // Editor status
    editor: 'Editor',
    preview: 'Live-Vorschau',
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
    shortcutNewFile: 'Neue Datei',
    shortcutQuickOpen: 'Befehlspalette / Suche',

    // Mobile Navigation
    mobileCode: 'Code',
    mobilePreview: 'Vorschau',
    mobileFiles: 'Dateien',
    moreActions: 'Menü',

    // Dashboard
    dashboardTitle: 'Meine Projekte',
    dashboardSubtitle: 'Erstelle, verwalte und bearbeite deine Web-Projekte',
    backToDashboard: 'Projekte',
    openProject: 'Projekt öffnen',
    searchProjects: 'Projekte durchsuchen...',
    filesCount: 'Dateien',
    lastEdited: 'Bearbeitet',
    optionsMenu: 'Optionen',
    workspace: 'Arbeitsbereich',
    layoutOptions: 'Layout & Ansicht',
    projectActions: 'Projekt-Aktionen',

    // Console
    noLogs: 'Keine Konsolenausgaben vorhanden.',
    logsCount: 'Meldungen',
  },
  en: {
    brandName: 'Studio Lab',
    tagline: 'Web Development Environment',
    projects: 'Projects',
    myProjects: 'My Projects',
    newProject: 'New Project',
    projectNamePlaceholder: 'Project name...',
    createProjectTitle: 'Create New Project',
    renameProjectTitle: 'Rename Project',
    deleteProjectTitle: 'Delete Project',
    deleteProjectConfirm: 'Are you sure you want to permanently delete this project?',
    noProjects: 'No projects yet. Create your first project!',
    
    // Explorer
    explorer: 'Explorer',
    files: 'Files',
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
    
    // Actions
    save: 'Save',
    saved: 'Saved',
    unsaved: 'Unsaved',
    exportProject: 'Export Project (ZIP)',
    importProject: 'Import Project',
    importConfirmTitle: 'Import Project',
    importConfirmText: 'Importing will merge or overwrite files with matching names. Continue?',
    formatCode: 'Format Code',
    shortcuts: 'Keyboard Shortcuts',
    runPreview: 'Update Preview',
    refresh: 'Refresh',
    clear: 'Clear',
    copy: 'Copy',
    rename: 'Rename',
    delete: 'Delete',
    duplicate: 'Duplicate',
    cancel: 'Cancel',
    confirm: 'Confirm',
    create: 'Create',
    close: 'Close',
    
    // Layouts & Views
    layout: 'Layout',
    layoutSplitH: 'Split (Horizontal)',
    layoutSplitV: 'Split (Vertical)',
    layoutEditorOnly: 'Editor Only',
    layoutPreviewOnly: 'Preview Only',
    
    // Devices
    deviceResponsive: 'Responsive (100%)',
    deviceDesktop: 'Desktop (1200px)',
    deviceTablet: 'Tablet (768px)',
    deviceMobile: 'Mobile (375px)',
    
    // Editor status
    editor: 'Editor',
    preview: 'Live Preview',
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
    shortcutNewFile: 'New file',
    shortcutQuickOpen: 'Command palette / Search',

    // Mobile Navigation
    mobileCode: 'Code',
    mobilePreview: 'Preview',
    mobileFiles: 'Files',
    moreActions: 'Menu',

    // Dashboard
    dashboardTitle: 'My Projects',
    dashboardSubtitle: 'Create, manage, and edit your web projects',
    backToDashboard: 'Projects',
    openProject: 'Open Project',
    searchProjects: 'Search projects...',
    filesCount: 'Files',
    lastEdited: 'Edited',
    optionsMenu: 'Options',
    workspace: 'Workspace',
    layoutOptions: 'Layout & View',
    projectActions: 'Project Actions',

    // Console
    noLogs: 'No console logs yet.',
    logsCount: 'Messages',
  },
  ar: {
    brandName: 'Studio Lab',
    tagline: 'بيئة تطوير الويب',
    projects: 'المشاريع',
    myProjects: 'مشاريعي',
    newProject: 'مشروع جديد',
    projectNamePlaceholder: 'اسم المشروع...',
    createProjectTitle: 'إنشاء مشروع جديد',
    renameProjectTitle: 'إعادة تسمية المشروع',
    deleteProjectTitle: 'حذف المشروع',
    deleteProjectConfirm: 'هل أنت متأكد من حذف هذا المشروع نهائياً؟',
    noProjects: 'لا توجد مشاريع حتى الآن. أنشئ مشروعك الأول!',
    
    // Explorer
    explorer: 'الملفات',
    files: 'الملفات',
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
    
    // Actions
    save: 'حفظ',
    saved: 'تم الحفظ',
    unsaved: 'غير محفوظ',
    exportProject: 'تصدير المشروع (ZIP)',
    importProject: 'استيراد مشروع',
    importConfirmTitle: 'استيراد مشروع',
    importConfirmText: 'سيتم دمج أو استبدال الملفات ذات الأسماء المتطابقة. متابعة؟',
    formatCode: 'تنسيق الشيفرة',
    shortcuts: 'اختصارات لوحة المفاتيح',
    runPreview: 'تحديث المعاينة',
    refresh: 'تحديث',
    clear: 'مسح',
    copy: 'نسخ',
    rename: 'إعادة تسمية',
    delete: 'حذف',
    duplicate: 'تكرار',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    create: 'إنشاء',
    close: 'إغلاق',
    
    // Layouts & Views
    layout: 'توزيع الشاشة',
    layoutSplitH: 'انقسام أفقي',
    layoutSplitV: 'انقسام عمودي',
    layoutEditorOnly: 'المحرر فقط',
    layoutPreviewOnly: 'المعاينة فقط',
    
    // Devices
    deviceResponsive: 'مرن (100%)',
    deviceDesktop: 'حاسوب (1200px)',
    deviceTablet: 'لوحي (768px)',
    deviceMobile: 'هاتف (375px)',
    
    // Editor status
    editor: 'المحرر',
    preview: 'المعاينة المباشرة',
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
    shortcutNewFile: 'ملف جديد',
    shortcutQuickOpen: 'لوحة الأوامر / البحث',

    // Mobile Navigation
    mobileCode: 'الشيفرة',
    mobilePreview: 'المعاينة',
    mobileFiles: 'الملفات',
    moreActions: 'خيارات',

    // Dashboard
    dashboardTitle: 'مشاريعي',
    dashboardSubtitle: 'إنشاء وإدارة وتطوير مشاريع الويب الخاصة بك',
    backToDashboard: 'المشاريع',
    openProject: 'فتح المشروع',
    searchProjects: 'البحث في المشاريع...',
    filesCount: 'ملفات',
    lastEdited: 'آخر تعديل',
    optionsMenu: 'الخيارات',
    workspace: 'مساحة العمل',
    layoutOptions: 'توزيع الشاشة والعرض',
    projectActions: 'إجراءات المشروع',

    // Console
    noLogs: 'لا توجد سجلات حتى الآن.',
    logsCount: 'رسائل',
  }
};

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('studio_lab_lang');
    if (saved === 'de' || saved === 'en' || saved === 'ar') {
      return saved;
    }
    const navLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (navLang.startsWith('ar')) {
      return 'ar';
    }
    if (navLang.startsWith('de')) {
      return 'de';
    }
    if (navLang.startsWith('en')) {
      return 'en';
    }
    // Default to German if no match
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
