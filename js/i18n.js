// COMMLINK i18n dictionary.
// Keys are dot-paths (e.g. "panel.donate"). Missing values fall back to en.
// Some short visual indicators (L/R, OFF/ON, > COMMLINK_) are intentionally
// not localized — they're treated as iconography rather than copy.
window.I18N = {
  en: {
    tag: { app: 'DIALOG CONSTRUCTOR', glitch: 'DIALOG FORGER' },
    status: 'NETRUNNER ONLINE',
    panel: {
      contacts: 'CONTACTS',
      snapshots: 'SNAPSHOTS',
      themes: 'THEMES',
      messages: '// MESSAGES',
      preview: '// PREVIEW',
      config: '// CONFIG'
    },
    theme: { default: 'DEFAULT', bubblegum: 'BUBBLEGUM', gothic: 'GOTHIC', aztec: 'NEO_AZTEC', noir: 'NOIR', light: 'LIGHT', moreToCome: '// MORE TO COME' },
    field: {
      channelTop: 'Channel — Top',
      channelBottom: 'Channel — Bottom',
      choices: 'Choices',
      accent: 'Accent Color',
      fx: 'FX',
      bg: 'Background',
      bright: 'BRIGHT'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES', chromatic: 'RGB', vignette: 'VIGNETTE', frames: 'FRAMES', hide: 'HIDE' },
    btn: {
      addMessage: '+ MESSAGE',
      addSysMessage: '+ SYSTEM MESSAGE',
      clearAll: 'CLEAR ALL',
      add: '+ ADD',
      clear: 'CLEAR',
      savePng: '⬇ SAVE PNG',
      exportJson: '⬇ EXPORT',
      importJson: '⬆ IMPORT',
      avatar: 'AVATAR',
      paste: 'PASTE',
      recrop: 'RECROP',
      uploadImg: 'UPLOAD',
      load: 'LOAD'
    },
    placeholder: {
      contactName: 'Contact name...',
      snapshotName: 'snapshot name...',
      meta: 'e.g. //ENCRYPTED'
    },
    empty: {
      contacts: 'NO CONTACTS'
    },
    confirm: {
      import: 'Importing will replace your current state and contacts.\n\nIf you want to keep them, save a snapshot first.\n\nProceed?'
    },
    snapshot: { showExamples: 'SHOW EXAMPLES' },
    example: {
      meta: '//ENCRYPTED',
      messages: [
        { speaker: 'JOHNNY', body: 'Wake the fuck up, samurai. We have a city to burn.', side: 'left', time: '04:20' },
        { speaker: 'V', body: "Give me a sec. Head's still ringing.", side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: "Sending you the schematics — don't open them on public net.", side: 'left', time: '04:22' },
        { type: 'system', body: 'FILE TRANSFERRED' },
        { speaker: 'V', body: 'Got it. Heading to the drop now.', side: 'right', time: '04:23' }
      ],
      choices: ['Who am I meeting at the drop?', 'Stay in my head, Silverhand.']
    },
    toast: {
      noImageClipboard: 'NO IMAGE IN CLIPBOARD',
      clipboardBlocked: 'CLIPBOARD BLOCKED',
      maxMessages: 'MAX 99 MESSAGES',
      portraitLoaded: 'PORTRAIT LOADED',
      noPortrait: 'NO PORTRAIT',
      imgAttached: 'IMG ATTACHED',
      noImg: 'NO IMG',
      speakerRequired: 'SPEAKER REQUIRED',
      alreadySaved: '"{name}" ALREADY SAVED',
      storageFull: 'STORAGE FULL',
      contactAdded: '+ CONTACT "{name}"',
      loaded: 'LOADED "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: 'MESSAGES CLEARED',
      contactsCleared: 'CONTACTS CLEARED',
      nameRequired: 'NAME REQUIRED',
      saved: 'SAVED "{name}"',
      maxChoices: 'MAX 6 CHOICES',
      imgLoaded: 'IMG LOADED',
      noBgYet: 'NO BG YET',
      storageFullDelete: 'STORAGE FULL // DELETE SOME',
      pngExported: 'PNG EXPORTED',
      exportFailed: 'EXPORT FAILED',
      stateExported: 'STATE EXPORTED',
      stateImported: 'STATE IMPORTED',
      importFailed: 'IMPORT FAILED',
      snapshotDeleted: 'SNAPSHOT "{name}" DELETED'
    }
  },

  ru: {
    tag: { app: 'КОНСТРУКТОР ДИАЛОГОВ', glitch: 'ПОДДЕЛКА ДИАЛОГОВ' },
    status: 'НЕТРАННЕР В СЕТИ',
    panel: {
      contacts: 'КОНТАКТЫ',
      snapshots: 'СЛЕПКИ',
      themes: 'ТЕМЫ',
      messages: '// СООБЩЕНИЯ',
      preview: '// ПРОСМОТР',
      config: '// НАСТРОЙКИ'
    },
    theme: { default: 'СТАНДАРТ', bubblegum: 'БАБЛГАМ', gothic: 'ГОТИКА', aztec: 'НЕО_АЦТЕК', noir: 'НУАР', light: 'СВЕТЛАЯ', moreToCome: '// СКОРО ЕЩЁ' },
    field: {
      channelTop: 'Канал — Верх',
      channelBottom: 'Канал — Низ',
      choices: 'Варианты ответа',
      accent: 'Акцентный цвет',
      fx: 'ЭФФЕКТЫ',
      bg: 'Фон',
      bright: 'ЯРКОСТЬ'
    },
    fx: { glitch: 'ГЛИТЧ', scanlines: 'ПОЛОСЫ', chromatic: 'RGB', vignette: 'ВИНЬЕТКА', frames: 'РАМКИ', hide: 'СКРЫТЬ' },
    btn: {
      addMessage: '+ СООБЩЕНИЕ',
      addSysMessage: '+ СИСТ. СООБЩ.',
      clearAll: 'ОЧИСТИТЬ',
      add: '+ ДОБАВИТЬ',
      clear: 'ОЧИСТ.',
      savePng: '⬇ СОХРАНИТЬ PNG',
      exportJson: '⬇ ЭКСПОРТ',
      importJson: '⬆ ИМПОРТ',
      avatar: 'АВАТАР',
      paste: 'ВСТАВ.',
      recrop: 'ОБРЕЗАТЬ',
      uploadImg: 'ЗАГРУЗ.',
      load: 'ЗАГРУЗИТЬ'
    },
    placeholder: {
      contactName: 'Имя контакта...',
      snapshotName: 'имя слепка...',
      meta: 'напр. //ШИФР'
    },
    empty: {
      contacts: 'НЕТ КОНТАКТОВ'
    },
    confirm: {
      import: 'Импорт заменит текущее состояние и контакты.\n\nЕсли хочешь их сохранить, сначала сделай слепок.\n\nПродолжить?'
    },
    snapshot: { showExamples: 'ПОКАЗ. ПРИМЕРЫ' },
    example: {
      meta: '//ЗАШИФРОВАНО',
      messages: [
        { speaker: 'JOHNNY', body: 'Просыпайся, самурай. Нам город сжигать.', side: 'left', time: '04:20' },
        { speaker: 'V', body: 'Дай секунду. Голова ещё гудит.', side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: 'Скидываю схемы — не открывай в публичной сети.', side: 'left', time: '04:22' },
        { type: 'system', body: 'ФАЙЛ ПЕРЕДАН' },
        { speaker: 'V', body: 'Принял. Иду на точку.', side: 'right', time: '04:23' }
      ],
      choices: ['Кто меня встретит на месте?', 'Не теряйся, Сильверхэнд.']
    },
    toast: {
      noImageClipboard: 'НЕТ ИЗОБРАЖЕНИЯ В БУФЕРЕ',
      clipboardBlocked: 'БУФЕР ЗАБЛОКИРОВАН',
      maxMessages: 'МАКС 99 СООБЩЕНИЙ',
      portraitLoaded: 'АВАТАР ЗАГРУЖЕН',
      noPortrait: 'НЕТ АВАТАРА',
      imgAttached: 'ИЗО. ПРИКРЕПЛЕНО',
      noImg: 'НЕТ ИЗО.',
      speakerRequired: 'НУЖНО ИМЯ',
      alreadySaved: '"{name}" УЖЕ СОХРАНЁН',
      storageFull: 'ХРАНИЛИЩЕ ПЕРЕПОЛНЕНО',
      contactAdded: '+ КОНТАКТ "{name}"',
      loaded: 'ЗАГРУЖЕН "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: 'СООБЩЕНИЯ ОЧИЩЕНЫ',
      contactsCleared: 'КОНТАКТЫ ОЧИЩЕНЫ',
      nameRequired: 'НУЖНО ИМЯ',
      saved: 'СОХРАНЁН "{name}"',
      maxChoices: 'МАКС 6 ВАРИАНТОВ',
      imgLoaded: 'ИЗО. ЗАГРУЖЕНО',
      noBgYet: 'НЕТ ФОНА',
      storageFullDelete: 'ХРАНИЛИЩЕ ПЕРЕПОЛНЕНО // УДАЛИ ЧТО-ТО',
      pngExported: 'PNG ЭКСПОРТИРОВАН',
      exportFailed: 'ОШИБКА ЭКСПОРТА',
      stateExported: 'СОСТОЯНИЕ ЭКСПОРТИРОВАНО',
      stateImported: 'СОСТОЯНИЕ ИМПОРТИРОВАНО',
      importFailed: 'ОШИБКА ИМПОРТА',
      snapshotDeleted: 'СЛЕПОК "{name}" УДАЛЁН'
    }
  },

  fr: {
    tag: { app: 'CONSTRUCTEUR DE DIALOGUES', glitch: 'FALSIFIE DE DIALOGUES' },
    status: 'NETRUNNER EN LIGNE',
    panel: {
      contacts: 'CONTACTS',
      snapshots: 'SAUVEGARDES',
      themes: 'THÈMES',
      messages: '// MESSAGES',
      preview: '// APERÇU',
      config: '// CONFIG'
    },
    theme: { default: 'DÉFAUT', bubblegum: 'BUBBLEGUM', gothic: 'GOTHIQUE', aztec: 'NÉO_AZTÈQUE', noir: 'NOIR', light: 'CLAIR', moreToCome: '// BIENTÔT PLUS' },
    field: {
      channelTop: 'Canal — Haut',
      channelBottom: 'Canal — Bas',
      choices: 'Choix',
      accent: "Couleur d'accent",
      fx: 'FX',
      bg: 'Fond',
      bright: 'LUM.'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES', chromatic: 'RGB', vignette: 'VIGNETTE', frames: 'CADRES', hide: 'CACHER' },
    btn: {
      addMessage: '+ MESSAGE',
      addSysMessage: '+ MSG SYSTÈME',
      clearAll: 'TOUT EFFACER',
      add: '+ AJOUTER',
      clear: 'EFFACER',
      savePng: '⬇ ENREGISTRER PNG',
      exportJson: '⬇ EXPORTER',
      importJson: '⬆ IMPORTER',
      avatar: 'AVATAR',
      paste: 'COLLER',
      recrop: 'RECADRER',
      uploadImg: 'IMPORTER',
      load: 'CHARGER'
    },
    placeholder: {
      contactName: 'Nom du contact...',
      snapshotName: 'nom de la sauvegarde...',
      meta: 'ex. //CRYPTÉ'
    },
    empty: {
      contacts: 'AUCUN CONTACT'
    },
    confirm: {
      import: "L'importation va remplacer ton état actuel et tes contacts.\n\nSi tu veux les garder, sauvegarde d'abord un snapshot.\n\nContinuer ?"
    },
    snapshot: { showExamples: 'AFF. EXEMPLES' },
    example: {
      meta: '//CRYPTÉ',
      messages: [
        { speaker: 'JOHNNY', body: 'Réveille-toi, samouraï. On a une ville à brûler.', side: 'left', time: '04:20' },
        { speaker: 'V', body: "Donne-moi une seconde. J'ai la tête qui résonne encore.", side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: "Je t'envoie les schémas — ne les ouvre pas sur le réseau public.", side: 'left', time: '04:22' },
        { type: 'system', body: 'FICHIER TRANSFÉRÉ' },
        { speaker: 'V', body: 'Reçu. Je file au point de rendez-vous.', side: 'right', time: '04:23' }
      ],
      choices: ['Je rencontre qui sur place ?', 'Reste dans ma tête, Silverhand.']
    },
    toast: {
      noImageClipboard: 'AUCUNE IMG DANS LE PRESSE-PAPIERS',
      clipboardBlocked: 'PRESSE-PAPIERS BLOQUÉ',
      maxMessages: 'MAX 99 MESSAGES',
      portraitLoaded: 'PORTRAIT CHARGÉ',
      noPortrait: 'PAS DE PORTRAIT',
      imgAttached: 'IMG ATTACHÉE',
      noImg: "PAS D'IMG",
      speakerRequired: 'NOM REQUIS',
      alreadySaved: '"{name}" DÉJÀ SAUVEGARDÉ',
      storageFull: 'STOCKAGE PLEIN',
      contactAdded: '+ CONTACT "{name}"',
      loaded: 'CHARGÉ "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: 'MESSAGES EFFACÉS',
      contactsCleared: 'CONTACTS EFFACÉS',
      nameRequired: 'NOM REQUIS',
      saved: 'SAUVEGARDÉ "{name}"',
      maxChoices: 'MAX 6 CHOIX',
      imgLoaded: 'IMG CHARGÉE',
      noBgYet: 'PAS DE FOND',
      storageFullDelete: 'STOCKAGE PLEIN // SUPPRIMER',
      pngExported: 'PNG EXPORTÉ',
      exportFailed: 'ÉCHEC EXPORT',
      stateExported: 'ÉTAT EXPORTÉ',
      stateImported: 'ÉTAT IMPORTÉ',
      importFailed: 'ÉCHEC IMPORT',
      snapshotDeleted: 'SAUVEGARDE "{name}" SUPPRIMÉE'
    }
  },

  de: {
    tag: { app: 'DIALOG-KONSTRUKTOR', glitch: 'DIALOGFÄLSCHER' },
    status: 'NETRUNNER ONLINE',
    panel: {
      contacts: 'KONTAKTE',
      snapshots: 'SNAPSHOTS',
      themes: 'THEMEN',
      messages: '// NACHRICHTEN',
      preview: '// VORSCHAU',
      config: '// KONFIG'
    },
    theme: { default: 'STANDARD', bubblegum: 'BUBBLEGUM', gothic: 'GOTISCH', aztec: 'NEO_AZTEKISCH', noir: 'NOIR', light: 'HELL', moreToCome: '// MEHR FOLGT' },
    field: {
      channelTop: 'Kanal — Oben',
      channelBottom: 'Kanal — Unten',
      choices: 'Optionen',
      accent: 'Akzentfarbe',
      fx: 'FX',
      bg: 'Hintergrund',
      bright: 'HELL.'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES', chromatic: 'RGB', vignette: 'VIGNETTE', frames: 'RAHMEN', hide: 'AUSBL.' },
    btn: {
      addMessage: '+ NACHRICHT',
      addSysMessage: '+ SYS-NACHR.',
      clearAll: 'ALLES LÖSCHEN',
      add: '+ HINZU',
      clear: 'LÖSCHEN',
      savePng: '⬇ PNG SPEICHERN',
      exportJson: '⬇ EXPORT',
      importJson: '⬆ IMPORT',
      avatar: 'AVATAR',
      paste: 'EINFÜGEN',
      recrop: 'NEU ZUSCHN.',
      uploadImg: 'HOCHLADEN',
      load: 'LADEN'
    },
    placeholder: {
      contactName: 'Kontaktname...',
      snapshotName: 'Snapshot-Name...',
      meta: 'z.B. //CHIFFRIERT'
    },
    empty: {
      contacts: 'KEINE KONTAKTE'
    },
    confirm: {
      import: 'Der Import ersetzt deinen aktuellen Zustand und deine Kontakte.\n\nWenn du sie behalten willst, speichere zuerst einen Snapshot.\n\nFortfahren?'
    },
    snapshot: { showExamples: 'BSP. ZEIGEN' },
    example: {
      meta: '//CHIFFRIERT',
      messages: [
        { speaker: 'JOHNNY', body: 'Wach auf, Samurai. Wir haben eine Stadt zu verbrennen.', side: 'left', time: '04:20' },
        { speaker: 'V', body: "Gib mir 'ne Sekunde. Mein Kopf dröhnt noch.", side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: 'Schicke dir die Schemata — nicht im öffentlichen Netz öffnen.', side: 'left', time: '04:22' },
        { type: 'system', body: 'DATEI ÜBERTRAGEN' },
        { speaker: 'V', body: "Hab's. Bin unterwegs zum Treffpunkt.", side: 'right', time: '04:23' }
      ],
      choices: ['Wen treffe ich beim Drop?', 'Bleib in meinem Kopf, Silverhand.']
    },
    toast: {
      noImageClipboard: 'KEIN BILD IN ZWISCHENABLAGE',
      clipboardBlocked: 'ZWISCHENABLAGE BLOCKIERT',
      maxMessages: 'MAX 99 NACHRICHTEN',
      portraitLoaded: 'PORTRAIT GELADEN',
      noPortrait: 'KEIN PORTRAIT',
      imgAttached: 'BILD ANGEHÄNGT',
      noImg: 'KEIN BILD',
      speakerRequired: 'NAME ERFORDERLICH',
      alreadySaved: '"{name}" SCHON GESPEICHERT',
      storageFull: 'SPEICHER VOLL',
      contactAdded: '+ KONTAKT "{name}"',
      loaded: 'GELADEN "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: 'NACHRICHTEN GELÖSCHT',
      contactsCleared: 'KONTAKTE GELÖSCHT',
      nameRequired: 'NAME ERFORDERLICH',
      saved: 'GESPEICHERT "{name}"',
      maxChoices: 'MAX 6 OPTIONEN',
      imgLoaded: 'BILD GELADEN',
      noBgYet: 'KEIN HINTERGRUND',
      storageFullDelete: 'SPEICHER VOLL // LÖSCHE',
      pngExported: 'PNG EXPORTIERT',
      exportFailed: 'EXPORT FEHLGESCHL.',
      stateExported: 'ZUSTAND EXPORTIERT',
      stateImported: 'ZUSTAND IMPORTIERT',
      importFailed: 'IMPORT FEHLGESCHL.',
      snapshotDeleted: 'SNAPSHOT "{name}" GELÖSCHT'
    }
  },

  es: {
    tag: { app: 'CONSTRUCTOR DE DIÁLOGOS', glitch: 'FALSIFICADOR DE DIÁLOGOS' },
    status: 'NETRUNNER EN LÍNEA',
    panel: {
      contacts: 'CONTACTOS',
      snapshots: 'INSTANTÁNEAS',
      themes: 'TEMAS',
      messages: '// MENSAJES',
      preview: '// VISTA PREVIA',
      config: '// CONFIG'
    },
    theme: { default: 'POR DEFECTO', bubblegum: 'BUBBLEGUM', gothic: 'GÓTICO', aztec: 'NEO_AZTECA', noir: 'NOIR', light: 'CLARO', moreToCome: '// PRÓXIMAMENTE MÁS' },
    field: {
      channelTop: 'Canal — Arriba',
      channelBottom: 'Canal — Abajo',
      choices: 'Opciones',
      accent: 'Color de acento',
      fx: 'FX',
      bg: 'Fondo',
      bright: 'BRILLO'
    },
    fx: { glitch: 'GLITCH', scanlines: 'LÍNEAS', chromatic: 'RGB', vignette: 'VIÑETA', frames: 'MARCOS', hide: 'OCULTAR' },
    btn: {
      addMessage: '+ MENSAJE',
      addSysMessage: '+ MSG SISTEMA',
      clearAll: 'BORRAR TODO',
      add: '+ AÑADIR',
      clear: 'BORRAR',
      savePng: '⬇ GUARDAR PNG',
      exportJson: '⬇ EXPORTAR',
      importJson: '⬆ IMPORTAR',
      avatar: 'AVATAR',
      paste: 'PEGAR',
      recrop: 'RECORTAR',
      uploadImg: 'SUBIR',
      load: 'CARGAR'
    },
    placeholder: {
      contactName: 'Nombre del contacto...',
      snapshotName: 'nombre de instantánea...',
      meta: 'ej. //CIFRADO'
    },
    empty: {
      contacts: 'SIN CONTACTOS'
    },
    confirm: {
      import: 'La importación reemplazará tu estado actual y contactos.\n\nSi quieres conservarlos, guarda una instantánea primero.\n\n¿Continuar?'
    },
    snapshot: { showExamples: 'VER EJEMPLOS' },
    example: {
      meta: '//CIFRADO',
      messages: [
        { speaker: 'JOHNNY', body: 'Despierta, samurái. Tenemos una ciudad que quemar.', side: 'left', time: '04:20' },
        { speaker: 'V', body: 'Dame un segundo. La cabeza todavía me retumba.', side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: 'Te paso los esquemas — no los abras en red pública.', side: 'left', time: '04:22' },
        { type: 'system', body: 'ARCHIVO TRANSFERIDO' },
        { speaker: 'V', body: 'Recibido. Voy al punto de entrega.', side: 'right', time: '04:23' }
      ],
      choices: ['¿Con quién me veo en la entrega?', 'Quédate en mi cabeza, Silverhand.']
    },
    toast: {
      noImageClipboard: 'SIN IMG EN PORTAPAPELES',
      clipboardBlocked: 'PORTAPAPELES BLOQUEADO',
      maxMessages: 'MÁX 99 MENSAJES',
      portraitLoaded: 'AVATAR CARGADO',
      noPortrait: 'SIN AVATAR',
      imgAttached: 'IMG ADJUNTA',
      noImg: 'SIN IMG',
      speakerRequired: 'NOMBRE REQ.',
      alreadySaved: '"{name}" YA GUARDADO',
      storageFull: 'ALMACÉN LLENO',
      contactAdded: '+ CONTACTO "{name}"',
      loaded: 'CARGADO "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: 'MENSAJES BORRADOS',
      contactsCleared: 'CONTACTOS BORRADOS',
      nameRequired: 'NOMBRE REQ.',
      saved: 'GUARDADO "{name}"',
      maxChoices: 'MÁX 6 OPCIONES',
      imgLoaded: 'IMG CARGADA',
      noBgYet: 'SIN FONDO',
      storageFullDelete: 'ALMACÉN LLENO // BORRA ALGO',
      pngExported: 'PNG EXPORTADO',
      exportFailed: 'EXPORT FALLÓ',
      stateExported: 'ESTADO EXPORTADO',
      stateImported: 'ESTADO IMPORTADO',
      importFailed: 'IMPORT FALLÓ',
      snapshotDeleted: 'INSTANTÁNEA "{name}" BORRADA'
    }
  },

  it: {
    tag: { app: 'COSTRUTTORE DI DIALOGHI', glitch: 'FABBRO DI DIALOGHI' },
    status: 'NETRUNNER ONLINE',
    panel: {
      contacts: 'CONTATTI',
      snapshots: 'ISTANTANEE',
      themes: 'TEMI',
      messages: '// MESSAGGI',
      preview: '// ANTEPRIMA',
      config: '// CONFIG'
    },
    theme: { default: 'PREDEFINITO', bubblegum: 'BUBBLEGUM', gothic: 'GOTICO', aztec: 'NEO_AZTECO', noir: 'NOIR', light: 'CHIARO', moreToCome: '// ALTRI IN ARRIVO' },
    field: {
      channelTop: 'Canale — Sopra',
      channelBottom: 'Canale — Sotto',
      choices: 'Scelte',
      accent: "Colore d'accento",
      fx: 'FX',
      bg: 'Sfondo',
      bright: 'LUM.'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES', chromatic: 'RGB', vignette: 'VIGNETTE', frames: 'CORNICI', hide: 'NASCONDI' },
    btn: {
      addMessage: '+ MESSAGGIO',
      addSysMessage: '+ MSG SISTEMA',
      clearAll: 'CANCELLA TUTTO',
      add: '+ AGGIUNGI',
      clear: 'CANCELLA',
      savePng: '⬇ SALVA PNG',
      exportJson: '⬇ ESPORTA',
      importJson: '⬆ IMPORTA',
      avatar: 'AVATAR',
      paste: 'INCOLLA',
      recrop: 'RITAGLIA',
      uploadImg: 'CARICA',
      load: 'CARICA'
    },
    placeholder: {
      contactName: 'Nome contatto...',
      snapshotName: 'nome istantanea...',
      meta: 'es. //CRITTATO'
    },
    empty: {
      contacts: 'NESSUN CONTATTO'
    },
    confirm: {
      import: "L'importazione sostituirà lo stato e i contatti correnti.\n\nSe vuoi conservarli, salva prima un'istantanea.\n\nContinuare?"
    },
    snapshot: { showExamples: 'MOSTRA ESEMPI' },
    example: {
      meta: '//CRITTATO',
      messages: [
        { speaker: 'JOHNNY', body: 'Sveglia, samurai. Abbiamo una città da bruciare.', side: 'left', time: '04:20' },
        { speaker: 'V', body: 'Dammi un secondo. La testa ancora rimbomba.', side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: 'Ti mando gli schemi — non aprirli su rete pubblica.', side: 'left', time: '04:22' },
        { type: 'system', body: 'FILE TRASFERITO' },
        { speaker: 'V', body: 'Ricevuto. Vado al punto di consegna.', side: 'right', time: '04:23' }
      ],
      choices: ['Chi devo incontrare al drop?', 'Resta nella mia testa, Silverhand.']
    },
    toast: {
      noImageClipboard: 'NESSUNA IMG NEGLI APPUNTI',
      clipboardBlocked: 'APPUNTI BLOCCATI',
      maxMessages: 'MAX 99 MESSAGGI',
      portraitLoaded: 'AVATAR CARICATO',
      noPortrait: 'NESSUN AVATAR',
      imgAttached: 'IMG ALLEGATA',
      noImg: 'NESSUNA IMG',
      speakerRequired: 'NOME RICHIESTO',
      alreadySaved: '"{name}" GIÀ SALVATO',
      storageFull: 'ARCHIVIO PIENO',
      contactAdded: '+ CONTATTO "{name}"',
      loaded: 'CARICATO "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: 'MESSAGGI CANCELLATI',
      contactsCleared: 'CONTATTI CANCELLATI',
      nameRequired: 'NOME RICHIESTO',
      saved: 'SALVATO "{name}"',
      maxChoices: 'MAX 6 SCELTE',
      imgLoaded: 'IMG CARICATA',
      noBgYet: 'NESSUNO SFONDO',
      storageFullDelete: 'ARCHIVIO PIENO // CANCELLA',
      pngExported: 'PNG ESPORTATO',
      exportFailed: 'EXPORT FALLITO',
      stateExported: 'STATO ESPORTATO',
      stateImported: 'STATO IMPORTATO',
      importFailed: 'IMPORT FALLITO',
      snapshotDeleted: 'ISTANTANEA "{name}" CANCELLATA'
    }
  },

  ja: {
    tag: { app: 'ダイアログ コンストラクター', glitch: 'ダイアログ フォージャー' },
    status: 'ネットランナー オンライン',
    panel: {
      contacts: 'コンタクト',
      snapshots: '状態',
      themes: 'テーマ',
      messages: '// メッセージ',
      preview: '// プレビュー',
      config: '// 設定'
    },
    theme: { default: 'デフォルト', bubblegum: 'バブルガム', gothic: 'ゴシック', aztec: 'ネオアステカ', noir: 'ノワール', light: 'ライト', moreToCome: '// 続々登場予定' },
    field: {
      channelTop: 'チャネル — 上',
      channelBottom: 'チャネル — 下',
      choices: '選択肢',
      accent: 'アクセントカラー',
      fx: 'エフェクト',
      bg: '背景',
      bright: '明るさ'
    },
    fx: { glitch: 'グリッチ', scanlines: 'スキャンライン', chromatic: 'RGB', vignette: 'ビネット', frames: 'フレーム', hide: '非表示' },
    btn: {
      addMessage: '+ メッセージ',
      addSysMessage: '+ システム',
      clearAll: '全クリア',
      add: '+ 追加',
      clear: 'クリア',
      savePng: '⬇ PNG保存',
      exportJson: '⬇ エクスポート',
      importJson: '⬆ インポート',
      avatar: 'アバター',
      paste: 'ペースト',
      recrop: '再切抜',
      uploadImg: 'アップロード',
      load: 'ロード'
    },
    placeholder: {
      contactName: 'コンタクト名...',
      snapshotName: '状態名...',
      meta: '例: //暗号化'
    },
    empty: {
      contacts: 'コンタクトなし'
    },
    confirm: {
      import: 'インポートすると現在の状態とコンタクトが置き換えられます。\n\n保存したい場合は、まず状態を保存してください。\n\n続行しますか?'
    },
    snapshot: { showExamples: 'サンプル表示' },
    example: {
      meta: '//暗号化',
      messages: [
        { speaker: 'JOHNNY', body: '起きろ、サムライ。燃やすべき街がある。', side: 'left', time: '04:20' },
        { speaker: 'V', body: 'ちょっと待て。頭がまだ鳴ってる。', side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: '図面を送る—パブリックネットで開くな。', side: 'left', time: '04:22' },
        { type: 'system', body: 'ファイル転送完了' },
        { speaker: 'V', body: '了解。ドロップ地点へ向かう。', side: 'right', time: '04:23' }
      ],
      choices: ['ドロップで誰と会う?', '頭の中にいろ、シルバーハンド。']
    },
    toast: {
      noImageClipboard: 'クリップボードに画像なし',
      clipboardBlocked: 'クリップボードブロック',
      maxMessages: '最大99メッセージ',
      portraitLoaded: 'アバター読込完了',
      noPortrait: 'アバターなし',
      imgAttached: '画像添付',
      noImg: '画像なし',
      speakerRequired: '話者必須',
      alreadySaved: '"{name}" 既に保存済み',
      storageFull: 'ストレージ満杯',
      contactAdded: '+ コンタクト "{name}"',
      loaded: '読込 "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: 'メッセージクリア',
      contactsCleared: 'コンタクトクリア',
      nameRequired: '名前必須',
      saved: '保存 "{name}"',
      maxChoices: '最大6選択肢',
      imgLoaded: '画像読込完了',
      noBgYet: '背景未設定',
      storageFullDelete: 'ストレージ満杯 // 削除必要',
      pngExported: 'PNG出力完了',
      exportFailed: 'エクスポート失敗',
      stateExported: '状態エクスポート完了',
      stateImported: '状態インポート完了',
      importFailed: 'インポート失敗',
      snapshotDeleted: '状態 "{name}" 削除'
    }
  },

  zh: {
    tag: { app: '对话构造器', glitch: '对话伪造器' },
    status: '网络流浪者在线',
    panel: {
      contacts: '联系人',
      snapshots: '状态',
      themes: '主题',
      messages: '// 消息',
      preview: '// 预览',
      config: '// 配置'
    },
    theme: { default: '默认', bubblegum: '泡泡糖', gothic: '哥特', aztec: '新阿兹特克', noir: '黑色电影', light: '浅色', moreToCome: '// 更多即将推出' },
    field: {
      channelTop: '频道 — 上',
      channelBottom: '频道 — 下',
      choices: '选项',
      accent: '强调色',
      fx: '特效',
      bg: '背景',
      bright: '亮度'
    },
    fx: { glitch: '故障', scanlines: '扫描线', chromatic: 'RGB', vignette: '晕影', frames: '边框', hide: '隐藏' },
    btn: {
      addMessage: '+ 消息',
      addSysMessage: '+ 系统',
      clearAll: '全部清除',
      add: '+ 添加',
      clear: '清除',
      savePng: '⬇ 保存PNG',
      exportJson: '⬇ 导出',
      importJson: '⬆ 导入',
      avatar: '头像',
      paste: '粘贴',
      recrop: '重剪',
      uploadImg: '上传',
      load: '加载'
    },
    placeholder: {
      contactName: '联系人姓名...',
      snapshotName: '状态名...',
      meta: '例: //加密'
    },
    empty: {
      contacts: '无联系人'
    },
    confirm: {
      import: '导入将替换您当前的状态和联系人。\n\n如果想保留它们，请先保存状态。\n\n继续?'
    },
    snapshot: { showExamples: '显示示例' },
    example: {
      meta: '//加密',
      messages: [
        { speaker: 'JOHNNY', body: '醒醒，武士。我们有座城要烧。', side: 'left', time: '04:20' },
        { speaker: 'V', body: '等等。脑子还在嗡嗡叫。', side: 'right', time: '04:21' },
        { speaker: 'JOHNNY', body: '把图纸发给你——别在公共网上打开。', side: 'left', time: '04:22' },
        { type: 'system', body: '文件已传输' },
        { speaker: 'V', body: '收到。正赶往交付点。', side: 'right', time: '04:23' }
      ],
      choices: ['交付点我去见谁?', '留在我脑子里，银手。']
    },
    toast: {
      noImageClipboard: '剪贴板无图片',
      clipboardBlocked: '剪贴板被屏蔽',
      maxMessages: '最多99条消息',
      portraitLoaded: '头像已加载',
      noPortrait: '无头像',
      imgAttached: '图片已附加',
      noImg: '无图片',
      speakerRequired: '需要发言者',
      alreadySaved: '"{name}" 已保存',
      storageFull: '存储已满',
      contactAdded: '+ 联系人 "{name}"',
      loaded: '已加载 "{name}"',
      contactSelected: '+ "{name}"',
      messagesCleared: '消息已清除',
      contactsCleared: '联系人已清除',
      nameRequired: '需要名称',
      saved: '已保存 "{name}"',
      maxChoices: '最多6个选项',
      imgLoaded: '图片已加载',
      noBgYet: '无背景',
      storageFullDelete: '存储已满 // 删除一些',
      pngExported: 'PNG导出完成',
      exportFailed: '导出失败',
      stateExported: '状态导出完成',
      stateImported: '状态导入完成',
      importFailed: '导入失败',
      snapshotDeleted: '状态 "{name}" 已删除'
    }
  }
};
