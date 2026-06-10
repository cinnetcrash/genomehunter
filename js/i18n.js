/* GenomeHunter — i18n (TR/EN) */
(function (GH) {
  "use strict";

  var DICT = {
    tr: {
      lang_name: "Türkçe",
      title: "GenomeHunter",
      subtitle: "Genom Avcısı: DNA'dan Genoma Macera",
      tagline: "Margaret Dayhoff ile biyoinformatik macerasına hazır mısın?",
      start: "Maceraya Başla",
      continue: "Kaldığın Yerden Devam",
      reset: "Sıfırla",
      choose_organism: "Hedef Organizmanı Seç",
      organism_hint: "Her organizmanın genomu farklı! Küçükten başlamak istersen virüsü seç.",
      bacteria: "Bakteri",
      virus: "Virüs",
      fungus: "Mantar",
      human: "İnsan",
      bacteria_desc: "Orta boy genom (~5 Mb). Klasik bir başlangıç.",
      virus_desc: "Minik genom (~30 kb). En kolay mod.",
      fungus_desc: "Büyükçe genom (~12 Mb). Biraz zor.",
      human_desc: "Dev genom (~3.2 Gb). Usta modu!",
      level: "Seviye",
      locked: "Kilitli",
      mentor: "Mentor",
      begin_level: "Seviyeye Başla",
      back: "Geri",
      next: "Devam",
      replay: "Tekrar Oyna",
      map_title: "Genom Laboratuvarı Haritası",
      map_hint: "Bir seviyeye tıkla. Her seviye bir genom projesi aşamasıdır.",
      score: "Skor",
      time: "Süre",
      lives: "Can",
      ability_unlocked: "Yeni Yetenek Açıldı!",
      level_complete: "Seviye Tamamlandı!",
      level_failed: "Tekrar Dene!",
      stars_earned: "Kazanılan yıldız",
      your_abilities: "Yeteneklerin",
      no_abilities: "Henüz yetenek yok",
      mute: "Sesi Kapat",
      unmute: "Sesi Aç",
      certificate: "GENOM AVCISI SERTİFİKASI",
      cert_body: "Tebrikler! DNA örneğinden tam genoma kadar tüm biyoinformatik boru hattını başarıyla tamamladın.",
      cert_signed: "İmza: Margaret Dayhoff, Biyoinformatik Öncüsü",
      cert_total: "Toplam Skor",
      play_again: "Yeniden Oyna",
      print_cert: "Sertifikayı Yazdır",
      learned: "Ne öğrendin?",
      go: "Hadi!",
      tap_to_start: "Başlamak için tıkla",

      /* Level meta */
      l1_name: "Örnek Toplama",
      l1_mech: "Doğru örnekleri topla, yanlışlardan kaç!",
      l2_name: "DNA Ekstraksiyonu",
      l2_mech: "Adımları doğru sırayla uygula.",
      l3_name: "Dizileme",
      l3_mech: "Bazları hızlıca eşleştir!",
      l4_name: "Kalite Kontrolü",
      l4_mech: "Kötü bazları kırp, iyileri koru.",
      l5_name: "Assembly",
      l5_mech: "Örtüşen okumaları birleştir.",
      l6_name: "Anotasyon",
      l6_mech: "Genleri (START→STOP) bul.",

      /* Level 1 */
      l1_intro: "Bir genom projesi örnekle başlar! Hedef organizmana ait DOĞRU örnekleri sepete topla. Yanlış örnek = kontaminasyon!",
      l1_collect: "Topla",
      l1_avoid: "Kaçın",
      l1_contamination: "Kontaminasyon!",
      l1_goal: "Hedef: 12 doğru örnek",

      /* Level 2 */
      l2_intro: "Hücrenin içindeki DNA'yı çıkarmalıyız. Adımları doğru sırayla seç: Parçala → Bağla → Yıka → Çöz.",
      l2_step_lyse: "Hücreyi Parçala (Lizis)",
      l2_step_bind: "DNA'yı Bağla",
      l2_step_wash: "Yıka (Saflaştır)",
      l2_step_elute: "DNA'yı Çöz (Elüsyon)",
      l2_pick_next: "Sıradaki doğru adım hangisi?",
      l2_wrong: "Yanlış sıra! DNA zarar görebilir.",

      /* Level 3 */
      l3_intro: "Dizileme makinesi bazları okuyor! Üstteki baza karşı gelen tamamlayıcı bazı hızlıca seç. A↔T, G↔C.",
      l3_pair_hint: "Eşleşmeler: A↔T, G↔C",

      /* Level 4 */
      l4_intro: "Okumalarda hatalar var. Kalitesi düşük (kırmızı) bazları kırp, kaliteli (yeşil) bazları SAKIN kırpma!",
      l4_trim: "Kırp",
      l4_keep_good: "Yeşilleri koru!",

      /* Level 5 */
      l5_intro: "Kısa okumalar bir yapbozun parçaları gibidir. Bir okumanın SONU, diğerinin BAŞIYLA örtüşür. Doğru örtüşen okumayı seç.",
      l5_overlap: "Bu okumanın sonuna hangisi örtüşüyor?",
      l5_contig: "Contig",

      /* Level 6 */
      l6_intro: "Genom hazır! Şimdi genleri bulalım. Bir gen START kodonu (ATG) ile başlar, STOP kodonu (TAA/TAG/TGA) ile biter. Genleri işaretle.",
      l6_find: "Genleri bul: ATG ile başlayan diziyi tıkla",
      l6_gene_found: "Gen bulundu!",
      l6_not_gene: "Bu bir gen değil."
    },

    en: {
      lang_name: "English",
      title: "GenomeHunter",
      subtitle: "Genome Hunter: From DNA to Genome",
      tagline: "Ready for a bioinformatics adventure with Margaret Dayhoff?",
      start: "Start Adventure",
      continue: "Continue",
      reset: "Reset",
      choose_organism: "Choose Your Target Organism",
      organism_hint: "Every organism has a different genome! Pick the virus to start small.",
      bacteria: "Bacterium",
      virus: "Virus",
      fungus: "Fungus",
      human: "Human",
      bacteria_desc: "Medium genome (~5 Mb). A classic start.",
      virus_desc: "Tiny genome (~30 kb). Easiest mode.",
      fungus_desc: "Larger genome (~12 Mb). A bit harder.",
      human_desc: "Huge genome (~3.2 Gb). Expert mode!",
      level: "Level",
      locked: "Locked",
      mentor: "Mentor",
      begin_level: "Start Level",
      back: "Back",
      next: "Next",
      replay: "Replay",
      map_title: "Genome Lab Map",
      map_hint: "Click a level. Each level is a stage of a real genome project.",
      score: "Score",
      time: "Time",
      lives: "Lives",
      ability_unlocked: "New Ability Unlocked!",
      level_complete: "Level Complete!",
      level_failed: "Try Again!",
      stars_earned: "Stars earned",
      your_abilities: "Your Abilities",
      no_abilities: "No abilities yet",
      mute: "Mute",
      unmute: "Unmute",
      certificate: "GENOME HUNTER CERTIFICATE",
      cert_body: "Congratulations! You completed the entire bioinformatics pipeline, from a DNA sample to a fully annotated genome.",
      cert_signed: "Signed: Margaret Dayhoff, Pioneer of Bioinformatics",
      cert_total: "Total Score",
      play_again: "Play Again",
      print_cert: "Print Certificate",
      learned: "What did you learn?",
      go: "Go!",
      tap_to_start: "Click to start",

      l1_name: "Sample Collection",
      l1_mech: "Grab the right samples, dodge the wrong ones!",
      l2_name: "DNA Extraction",
      l2_mech: "Perform the steps in the right order.",
      l3_name: "Sequencing",
      l3_mech: "Match the bases fast!",
      l4_name: "Quality Control",
      l4_mech: "Trim bad bases, keep good ones.",
      l5_name: "Assembly",
      l5_mech: "Join the overlapping reads.",
      l6_name: "Annotation",
      l6_mech: "Find the genes (START→STOP).",

      l1_intro: "Every genome project starts with a sample! Collect the CORRECT samples for your organism. Wrong sample = contamination!",
      l1_collect: "Collect",
      l1_avoid: "Avoid",
      l1_contamination: "Contamination!",
      l1_goal: "Goal: 12 correct samples",

      l2_intro: "We must extract the DNA from inside the cell. Pick the steps in order: Lyse → Bind → Wash → Elute.",
      l2_step_lyse: "Lyse the cell",
      l2_step_bind: "Bind the DNA",
      l2_step_wash: "Wash (purify)",
      l2_step_elute: "Elute the DNA",
      l2_pick_next: "Which is the correct next step?",
      l2_wrong: "Wrong order! The DNA could be damaged.",

      l3_intro: "The sequencer is reading bases! Quickly pick the complementary base for the top one. A↔T, G↔C.",
      l3_pair_hint: "Pairs: A↔T, G↔C",

      l4_intro: "The reads have errors. Trim the low-quality (red) bases, but NEVER trim good (green) bases!",
      l4_trim: "Trim",
      l4_keep_good: "Keep the greens!",

      l5_intro: "Short reads are like puzzle pieces. The END of one read overlaps the START of another. Pick the correctly overlapping read.",
      l5_overlap: "Which read overlaps the end of this one?",
      l5_contig: "Contig",

      l6_intro: "The genome is ready! Now find the genes. A gene starts with a START codon (ATG) and ends with a STOP codon (TAA/TAG/TGA). Mark the genes.",
      l6_find: "Find genes: click a sequence starting with ATG",
      l6_gene_found: "Gene found!",
      l6_not_gene: "That is not a gene."
    }
  };

  GH.i18n = {
    lang: "tr",
    dict: DICT,
    set: function (lang) {
      if (DICT[lang]) {
        this.lang = lang;
        try { localStorage.setItem("gh_lang", lang); } catch (e) {}
      }
    },
    t: function (key) {
      var d = DICT[this.lang] || DICT.tr;
      return d[key] != null ? d[key] : (DICT.tr[key] != null ? DICT.tr[key] : key);
    },
    init: function () {
      try {
        var saved = localStorage.getItem("gh_lang");
        if (saved && DICT[saved]) this.lang = saved;
      } catch (e) {}
    }
  };
})(window.GH = window.GH || {});
