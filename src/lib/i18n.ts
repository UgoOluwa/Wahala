// Translations were drafted with AI assistance and need a native speaker's pass
// before this is ever put in front of a real user. In a panic UI a clumsy phrase
// is worse than falling back to English.

export const LOCALES = ["en", "pcm", "yo", "ig", "ha"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  pcm: "Pidgin",
  yo: "Yorùbá",
  ig: "Igbo",
  ha: "Hausa",
};

export type StringKey =
  | "cta.help"
  | "cta.cancel"
  | "cta.exit"
  | "cta.sms"
  | "cta.back"
  | "incident.prompt"
  | "incident.physical"
  | "incident.threat"
  | "incident.kidnap"
  | "incident.sexual"
  | "incident.followed"
  | "incident.other"
  | "flow.locating"
  | "flow.located"
  | "flow.noLocation"
  | "flow.sending"
  | "status.sent"
  | "status.queued"
  | "status.sms"
  | "receipt.ref"
  | "receipt.silent"
  | "banner.prototype"
  | "rapid.title"
  | "rapid.hint";

type Dict = Record<StringKey, string>;

const en: Dict = {
  "cta.help": "I need help",
  "cta.cancel": "Cancel",
  "cta.exit": "Leave now",
  "cta.sms": "Send by SMS",
  "cta.back": "Back",
  "incident.prompt": "What is happening?",
  "incident.physical": "Someone is hurting me",
  "incident.threat": "I have been threatened",
  "incident.kidnap": "Kidnapping",
  "incident.sexual": "Sexual abuse",
  "incident.followed": "Someone is following me",
  "incident.other": "Something else",
  "flow.locating": "Finding where you are",
  "flow.located": "Location captured",
  "flow.noLocation": "Could not get location. Sending without it.",
  "flow.sending": "Sending",
  "status.sent": "Received. Your report reached the agency.",
  "status.queued": "Saved. It will send by itself once there is network.",
  "status.sms": "No data connection. You can send this by SMS instead.",
  "receipt.ref": "Reference",
  "receipt.silent": "This screen is the only alert. Nothing will ring, buzz or show up later.",
  "banner.prototype": "Prototype for judging — in a real emergency call 112.",
  "rapid.title": "Hold the button",
  "rapid.hint": "Hold for 3 seconds. It works with the screen off after that.",
};

const pcm: Dict = {
  "cta.help": "I need help",
  "cta.cancel": "Cancel am",
  "cta.exit": "Comot now",
  "cta.sms": "Send by SMS",
  "cta.back": "Go back",
  "incident.prompt": "Wetin dey happen?",
  "incident.physical": "Person dey beat me",
  "incident.threat": "Person threaten me",
  "incident.kidnap": "Kidnap",
  "incident.sexual": "Sexual abuse",
  "incident.followed": "Person dey follow me",
  "incident.other": "Na something else",
  "flow.locating": "We dey find where you dey",
  "flow.located": "We don get your location",
  "flow.noLocation": "We no fit get your location. We go send am like that.",
  "flow.sending": "E dey send",
  "status.sent": "Dem don receive am. Your report don reach the agency.",
  "status.queued": "We don save am. E go send by itself when network come.",
  "status.sms": "No data. You fit send am by SMS instead.",
  "receipt.ref": "Reference",
  "receipt.silent": "Na this screen be the only alert. Nothing go ring, vibrate or show later.",
  "banner.prototype": "Na prototype for judging — for real emergency call 112.",
  "rapid.title": "Hold the button",
  "rapid.hint": "Hold am for 3 seconds. E go still work when screen off.",
};

const yo: Dict = {
  "cta.help": "Mo nílò ìrànlọ́wọ́",
  "cta.cancel": "Fagilé",
  "cta.exit": "Jáde kíákíá",
  "cta.sms": "Fi SMS ránṣẹ́",
  "cta.back": "Padà sẹ́yìn",
  "incident.prompt": "Kí ni ó ń ṣẹlẹ̀?",
  "incident.physical": "Ẹnìkan ń pa mí lára",
  "incident.threat": "Ẹnìkan halẹ̀ mọ́ mi",
  "incident.kidnap": "Jíjí gbé",
  "incident.sexual": "Ìfipábánilòpọ̀",
  "incident.followed": "Ẹnìkan ń tọ̀ mí lẹ́yìn",
  "incident.other": "Ohun mìíràn",
  "flow.locating": "À ń wá ibi tí o wà",
  "flow.located": "A ti rí ibi tí o wà",
  "flow.noLocation": "A kò rí ibi tí o wà. A ó fi ránṣẹ́ láìsí i.",
  "flow.sending": "Ó ń lọ",
  "status.sent": "A ti gbà á. Ìròyìn rẹ ti dé ọ̀dọ̀ àjọ náà.",
  "status.queued": "A ti fi pamọ́. Yóò fúnra rẹ̀ lọ nígbà tí nẹ́tíwọ́kì bá dé.",
  "status.sms": "Kò sí dátà. O lè fi SMS ránṣẹ́ dípò.",
  "receipt.ref": "Nọ́mbà ìtọ́kasí",
  "receipt.silent": "Ojú ìwé yìí nìkan ni ìkìlọ̀. Kò ní dún, kò ní mì, kò sì ní farahàn lẹ́yìn náà.",
  "banner.prototype": "Àwòṣe fún ìdíje — bí ewu bá dé ní tòótọ́, pe 112.",
  "rapid.title": "Di bọ́tìnnì náà mú",
  "rapid.hint": "Di í mú fún ìṣẹ́jú àáyá mẹ́ta. Yóò ṣiṣẹ́ bí ojú ìwé bá tilẹ̀ pa.",
};

const ig: Dict = {
  "cta.help": "Achọrọ m enyemaka",
  "cta.cancel": "Kagbuo",
  "cta.exit": "Pụọ ozugbo",
  "cta.sms": "Zipu site na SMS",
  "cta.back": "Laghachi azụ",
  "incident.prompt": "Gịnị na-eme?",
  "incident.physical": "Onye na-emerụ m ahụ",
  "incident.threat": "Onye yiri m egwu",
  "incident.kidnap": "Ịtọrọ mmadụ",
  "incident.sexual": "Mmegbu mmekọahụ",
  "incident.followed": "Onye na-eso m",
  "incident.other": "Ihe ọzọ",
  "flow.locating": "Na-achọ ebe ị nọ",
  "flow.located": "Ejidere ebe ị nọ",
  "flow.noLocation": "Enweghị ike ịchọta ebe ị nọ. A ga-ezipu ya na-enweghị ya.",
  "flow.sending": "Na-ezipu",
  "status.sent": "Anatala ya. Akụkọ gị eruola ndị ọrụ nchekwa.",
  "status.queued": "Echekwala ya. Ọ ga-ezipu onwe ya ozugbo netwọk bịara.",
  "status.sms": "Enweghị data. Ị nwere ike iji SMS zipu ya.",
  "receipt.ref": "Nọmba nrụtụaka",
  "receipt.silent": "Naanị ihuenyo a bụ ọkwa ahụ. Ọ gaghị ada ụda, maọbụ pụta ma emesịa.",
  "banner.prototype": "Ihe nlereanya maka asọmpi — ọ bụrụ ezigbo ihe mberede, kpọọ 112.",
  "rapid.title": "Jide bọtịnụ ahụ",
  "rapid.hint": "Jide ya sekọnd atọ. Ọ ga-arụ ọrụ ọbụna mgbe ihuenyo gbanyụrụ.",
};

const ha: Dict = {
  "cta.help": "Ina buƙatar taimako",
  "cta.cancel": "Soke",
  "cta.exit": "Fita yanzu",
  "cta.sms": "Aika ta SMS",
  "cta.back": "Koma baya",
  "incident.prompt": "Me ke faruwa?",
  "incident.physical": "Wani yana cutar da ni",
  "incident.threat": "An yi min barazana",
  "incident.kidnap": "Sace mutane",
  "incident.sexual": "Cin zarafin jima'i",
  "incident.followed": "Wani yana bina",
  "incident.other": "Wani abu dabam",
  "flow.locating": "Ana neman inda kake",
  "flow.located": "An gano inda kake",
  "flow.noLocation": "Ba a sami wurin ba. Za a aika ba tare da shi ba.",
  "flow.sending": "Ana aikawa",
  "status.sent": "An karɓa. Rahotonka ya isa hukuma.",
  "status.queued": "An ajiye. Zai aika da kansa idan hanyar sadarwa ta dawo.",
  "status.sms": "Babu data. Za ka iya aika ta SMS maimakon haka.",
  "receipt.ref": "Lambar tuntuɓa",
  "receipt.silent": "Wannan allon shi kaɗai ne sanarwar. Ba zai yi ƙara ba, ba zai girgiza ba.",
  "banner.prototype": "Samfuri don gasa — idan haƙiƙanin gaggawa ne, kira 112.",
  "rapid.title": "Riƙe maɓallin",
  "rapid.hint": "Riƙe shi na daƙiƙa uku. Zai yi aiki ko allon ya kashe.",
};

const DICTS: Record<Locale, Dict> = { en, pcm, yo, ig, ha };

export function t(locale: Locale, key: StringKey): string {
  return DICTS[locale][key] ?? DICTS.en[key];
}
