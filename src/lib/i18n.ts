export type Lang = "tr" | "en";

export const SUPPORTED_LANGS: Lang[] = ["tr", "en"];
export const DEFAULT_LANG: Lang = "tr";

const dict = {
  tr: {
    brand: "App Kutusu",
    site_title: "App Kutusu — Bir fikir paylaş, hepsini gör!",
    site_description:
      "Anonim, eğlenceli bir uygulama fikri duvarı. Bir fikir paylaş, gerisini aç.",

    topbar_ideas_chip: "{n} fikir!",

    hero_title: "Bir fikir paylaş, hepsini gör!",
    hero_counter: "{n} fikir paylaşıldı!",

    form_title_label: "BAŞLIK",
    form_title_placeholder: "Fikrin için kısa bir isim...",
    form_desc_label: "AÇIKLAMA",
    form_desc_placeholder: "Fikir nedir? (en az 80 karakter)",
    form_similar_label: "BENZER UYGULAMALAR (OPSİYONEL)",
    form_similar_placeholder: "Linkleri virgülle ayır...",
    form_submit: "Gönder ve Aç",
    form_submitting: "Gönderiliyor...",
    form_err_title: "Başlık en az 3 karakter olmalı.",
    form_err_desc: "Açıklama en az 80 karakter olmalı (şu anda {n}).",
    form_err_validation: "Yukarıdaki hataları düzelt lütfen.",
    form_err_session_dup: "Bu oturumda zaten aktif bir fikrin var.",
    form_err_generic: "Gönderilemedi ({err}).",

    locked_label: "Feed Kilitli!",

    my_idea_heading: "Fikrim",
    similar_apps_heading: "BENZER UYGULAMALAR",
    edit_button: "Düzenle",
    uniqueness_original: "Özgün açı!",
    uniqueness_similar: "Benzer fikirler var",
    uniqueness_common: "Yaygın bir fikir",
    analyzing: "Analiz ediliyor...",
    analysis_heading: "AI ANALİZİ",
    analysis_target: "Hedef kitle",
    analysis_monetization: "Gelir potansiyeli",
    analysis_competitors: "OLASI RAKİPLER",

    feed_heading: "Feed",

    nav_feed: "Feed",
    nav_mine: "Fikrim",

    cookie_toast:
      "Fikrin bu tarayıcıda yaşıyor. Çerezleri silersen düzenleme erişimini kaybedersin.",
    cookie_bubble:
      "Fikirler bu tarayıcıda yaşıyor. Çerezleri silme!",
    cookie_detail:
      "Bu tarayıcıdaki çerezleri silersen fikrin upvote'larıyla birlikte yayında kalır, ama düzenleme hakkını kaybedersin. Tasarımı gereği geri alınamaz.",

    edit_modal_heading: "Fikrini düzenle",
    edit_modal_cancel: "İPTAL",
    edit_modal_save: "KAYDET",
    edit_modal_err_generic: "Kaydedilemedi ({err}).",

    lang_label: "Dil",
    lang_tr: "TR",
    lang_en: "EN",
  },
  en: {
    brand: "App Kutusu",
    site_title: "App Kutusu — Share one idea, see them all!",
    site_description:
      "A playful, anonymous wall of app ideas. Share one, unlock the rest.",

    topbar_ideas_chip: "{n} Ideas!",

    hero_title: "Share one idea, see them all!",
    hero_counter: "{n} ideas shared!",

    form_title_label: "TITLE",
    form_title_placeholder: "A brief name for your idea...",
    form_desc_label: "DESCRIPTION",
    form_desc_placeholder: "What's the big idea? (min 80 characters)",
    form_similar_label: "SIMILAR APPS (OPTIONAL)",
    form_similar_placeholder: "Links separated by commas...",
    form_submit: "Submit to Unlock",
    form_submitting: "Submitting...",
    form_err_title: "Title must be at least 3 characters.",
    form_err_desc: "Description must be at least 80 characters (currently {n}).",
    form_err_validation: "Please fix the errors above.",
    form_err_session_dup: "You already have an active idea in this session.",
    form_err_generic: "Could not submit ({err}).",

    locked_label: "Feed is Locked!",

    my_idea_heading: "My Idea",
    similar_apps_heading: "SIMILAR APPS",
    edit_button: "Edit",
    uniqueness_original: "Original Angle!",
    uniqueness_similar: "Similar ideas exist",
    uniqueness_common: "Common concept",
    analyzing: "Analyzing...",
    analysis_heading: "AI ANALYSIS",
    analysis_target: "Target audience",
    analysis_monetization: "Monetization potential",
    analysis_competitors: "POSSIBLE COMPETITORS",

    feed_heading: "The Feed",

    nav_feed: "Feed",
    nav_mine: "My Idea",

    cookie_toast:
      "Your idea lives in this browser. Don't clear cookies — you'll lose edit access.",
    cookie_bubble:
      "Ideas live in this browser. Don't clear cookies!",
    cookie_detail:
      "If you clear cookies in this browser, your idea stays online with its upvotes — but you lose the ability to edit it. There's no recovery, by design.",

    edit_modal_heading: "Edit your idea",
    edit_modal_cancel: "CANCEL",
    edit_modal_save: "SAVE",
    edit_modal_err_generic: "Could not save ({err}).",

    lang_label: "Language",
    lang_tr: "TR",
    lang_en: "EN",
  },
} satisfies Record<Lang, Record<string, string>>;

export type Dict = (typeof dict)["tr"];
export type Key = keyof Dict;

export function t(
  lang: Lang,
  key: Key,
  vars?: Record<string, string | number>,
): string {
  const langDict = dict[lang] ?? dict[DEFAULT_LANG];
  let s = langDict[key];
  if (s === undefined) s = dict[DEFAULT_LANG][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export function formatNum(n: number, lang: Lang): string {
  return n.toLocaleString(lang === "tr" ? "tr-TR" : "en-US");
}
