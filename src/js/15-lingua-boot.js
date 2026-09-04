

/* ============================================================
   Lingua — bootstrap (Italian browsers arrive in Italian)
   ============================================================ */
LBL=LABELS.en;
var startLang=((navigator.language||navigator.userLanguage||'en')+'').toLowerCase().slice(0,2)==='it'?'it':'en';
applyLang(startLang);

})();
