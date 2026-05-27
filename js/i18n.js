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
      donate: 'DONATE',
      messages: '// MESSAGES',
      preview: '// PREVIEW',
      config: '// CONFIG'
    },
    donate: {
      title: '// INCOMING TRANSMISSION',
      line1: 'You jacked in. You forged dialogs worth flashing across the Net.',
      line2: 'If DIALOG_CONSTRUCTOR lit up your screen and earned a slot in your loadout — toss some into the rig.',
      line3: 'Every signal keeps the netrunner humming and the chrome moving.',
      cta: 'HELL YEAH',
      scan: '// OR SCAN TO JACK IN'
    },
    field: {
      channelTop: 'Channel — Top',
      channelBottom: 'Channel — Bottom',
      choices: 'Choices',
      accent: 'Accent Color',
      fx: 'FX',
      bg: 'Background',
      bright: 'BRIGHT'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES' },
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
    }
  },

  ru: {
    tag: { app: 'КОНСТРУКТОР ДИАЛОГОВ', glitch: 'ПОДДЕЛКА ДИАЛОГОВ' },
    status: 'НЕТРАННЕР В СЕТИ',
    panel: {
      contacts: 'КОНТАКТЫ',
      snapshots: 'СЛЕПКИ',
      donate: 'ДОНАТ',
      messages: '// СООБЩЕНИЯ',
      preview: '// ПРОСМОТР',
      config: '// НАСТРОЙКИ'
    },
    donate: {
      title: '// ВХОДЯЩАЯ ПЕРЕДАЧА',
      line1: 'Ты подключился. Ты подделал диалоги, достойные мелькать в Сети.',
      line2: 'Если КОНСТРУКТОР_ДИАЛОГОВ зажёг твой экран и занял слот в арсенале — подкинь немного в копилку.',
      line3: 'Каждый сигнал держит нетраннера в строю, а хром — на ходу.',
      cta: 'ПОЕХАЛИ',
      scan: '// ИЛИ СКАНИРУЙ ДЛЯ ПОДКЛЮЧЕНИЯ'
    },
    field: {
      channelTop: 'Канал — Верх',
      channelBottom: 'Канал — Низ',
      choices: 'Варианты ответа',
      accent: 'Акцентный цвет',
      fx: 'ЭФФЕКТЫ',
      bg: 'Фон',
      bright: 'ЯРКОСТЬ'
    },
    fx: { glitch: 'ГЛИТЧ', scanlines: 'ПОЛОСЫ' },
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
    }
  },

  fr: {
    tag: { app: 'CONSTRUCTEUR DE DIALOGUES', glitch: 'FALSIFIE DE DIALOGUES' },
    status: 'NETRUNNER EN LIGNE',
    panel: {
      contacts: 'CONTACTS',
      snapshots: 'SAUVEGARDES',
      donate: 'DON',
      messages: '// MESSAGES',
      preview: '// APERÇU',
      config: '// CONFIG'
    },
    donate: {
      title: '// TRANSMISSION ENTRANTE',
      line1: "Tu t'es connecté. Tu as falsifié des dialogues dignes de circuler sur le Net.",
      line2: "Si CONSTRUCTEUR_DE_DIALOGUES a illuminé ton écran et a sa place dans ton arsenal — balance quelques eurodollars dans le tirelire.",
      line3: 'Chaque signal garde le netrunner en marche et le chrome qui coule.',
      cta: 'CARRÉMENT',
      scan: '// OU SCANNE POUR TE CONNECTER'
    },
    field: {
      channelTop: 'Canal — Haut',
      channelBottom: 'Canal — Bas',
      choices: 'Choix',
      accent: "Couleur d'accent",
      fx: 'FX',
      bg: 'Fond',
      bright: 'LUM.'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES' },
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
    }
  },

  de: {
    tag: { app: 'DIALOG-KONSTRUKTOR', glitch: 'DIALOGFÄLSCHER' },
    status: 'NETRUNNER ONLINE',
    panel: {
      contacts: 'KONTAKTE',
      snapshots: 'SNAPSHOTS',
      donate: 'SPENDEN',
      messages: '// NACHRICHTEN',
      preview: '// VORSCHAU',
      config: '// KONFIG'
    },
    donate: {
      title: '// EINGEHENDE ÜBERTRAGUNG',
      line1: 'Du hast dich eingeloggt. Du hast Dialoge gefälscht, die im Netz Aufsehen erregen.',
      line2: 'Wenn DIALOG-KONSTRUKTOR deinen Bildschirm zum Leuchten brachte und einen Slot in deinem Loadout verdient hat — wirf ein paar Eddies in das Sparschwein.',
      line3: 'Jedes Signal hält den Netrunner am Laufen und das Chrom in Fluss.',
      cta: 'AUF GEHT’S',
      scan: '// ODER SCANNE ZUM EINKLINKEN'
    },
    field: {
      channelTop: 'Kanal — Oben',
      channelBottom: 'Kanal — Unten',
      choices: 'Optionen',
      accent: 'Akzentfarbe',
      fx: 'FX',
      bg: 'Hintergrund',
      bright: 'HELL.'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES' },
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
    }
  },

  es: {
    tag: { app: 'CONSTRUCTOR DE DIÁLOGOS', glitch: 'FALSIFICADOR DE DIÁLOGOS' },
    status: 'NETRUNNER EN LÍNEA',
    panel: {
      contacts: 'CONTACTOS',
      snapshots: 'INSTANTÁNEAS',
      donate: 'DONAR',
      messages: '// MENSAJES',
      preview: '// VISTA PREVIA',
      config: '// CONFIG'
    },
    donate: {
      title: '// TRANSMISIÓN ENTRANTE',
      line1: 'Te conectaste. Falsificaste diálogos dignos de circular por la Red.',
      line2: 'Si CONSTRUCTOR_DE_DIÁLOGOS iluminó tu pantalla y se ganó un sitio en tu equipo — tira unos eddies al puchero.',
      line3: 'Cada señal mantiene al netrunner zumbando y el cromo fluyendo.',
      cta: '¡DALE!',
      scan: '// O ESCANEA PARA CONECTAR'
    },
    field: {
      channelTop: 'Canal — Arriba',
      channelBottom: 'Canal — Abajo',
      choices: 'Opciones',
      accent: 'Color de acento',
      fx: 'FX',
      bg: 'Fondo',
      bright: 'BRILLO'
    },
    fx: { glitch: 'GLITCH', scanlines: 'LÍNEAS' },
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
    }
  },

  it: {
    tag: { app: 'COSTRUTTORE DI DIALOGHI', glitch: 'FABBRO DI DIALOGHI' },
    status: 'NETRUNNER ONLINE',
    panel: {
      contacts: 'CONTATTI',
      snapshots: 'ISTANTANEE',
      donate: 'DONA',
      messages: '// MESSAGGI',
      preview: '// ANTEPRIMA',
      config: '// CONFIG'
    },
    donate: {
      title: '// TRASMISSIONE IN ARRIVO',
      line1: 'Ti sei collegato. Hai falsificato dialoghi degni di girare sulla Net.',
      line2: 'Se COSTRUTTORE_DI_DIALOGHI ha acceso il tuo schermo e si è guadagnato uno slot nel tuo arsenale — butta qualche eddie nel salvadanaio.',
      line3: 'Ogni segnale tiene il netrunner in moto e il cromo in scorrimento.',
      cta: 'ALLA GRANDE',
      scan: '// O SCANSIONA PER COLLEGARTI'
    },
    field: {
      channelTop: 'Canale — Sopra',
      channelBottom: 'Canale — Sotto',
      choices: 'Scelte',
      accent: "Colore d'accento",
      fx: 'FX',
      bg: 'Sfondo',
      bright: 'LUM.'
    },
    fx: { glitch: 'GLITCH', scanlines: 'SCANLINES' },
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
    }
  }
};
