/* GenomeHunter Arcade — challenge generators (the 8 mini-games).
   Each provides: hp(diff), tutorial(), makeGrid(diff,state), cols, optional onCorrect(state).
   IMPORTANT: no answer-revealing hints (no highlighting the correct tile, no pair cheatsheets). */
(function (GH) {
  "use strict";
  var A = (GH.A = GH.A || {});
  var U = A.ui;
  var BASES = ["A", "T", "G", "C"];
  var PAIR = { A: "T", T: "A", G: "C", C: "G" };
  var BCOL = { A: "#46d6c8", T: "#f0b65a", G: "#d678c8", C: "#7ad67a" };
  var STOPS = ["TAA", "TAG", "TGA"];
  function ri(n) { return (Math.random() * n) | 0; }
  function rseq(n) { var s = ""; for (var i = 0; i < n; i++) s += BASES[ri(4)]; return s; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = ri(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function seqTxt(c, seq, x, y, sz) {
    c.font = "bold " + sz + "px monospace"; c.textBaseline = "middle"; c.textAlign = "left";
    var w = c.measureText("A").width;
    for (var i = 0; i < seq.length; i++) { c.fillStyle = BCOL[seq[i]] || "#fff"; c.fillText(seq[i], x + i * w, y); }
    return seq.length * w;
  }
  function centerSeq(c, seq, cx, y, sz) {
    c.font = "bold " + sz + "px monospace"; var w = c.measureText("A").width;
    seqTxt(c, seq, cx - seq.length * w / 2, y, sz);
  }

  A.CHALLENGES = {};

  // ---------- 1. SAMPLE: collect valid samples, avoid contamination ----------
  A.CHALLENGES.sample = {
    cols: 4,
    hp: function (d) { return d.count; },
    tutorial: function (t) { return t === "tr"
      ? "Geçerli biyolojik ÖRNEKLERİ topla (kan, sürüntü, kültür...). Kimyasal/böcek/zehir = KONTAMİNASYON, onlara dokunma!"
      : "Collect valid biological SAMPLES (blood, swab, culture...). Chemicals/insects/poison = CONTAMINATION, don't touch them!"; },
    good: ["🩸","🧫","💧","🦷","🧪","🌿","🐟","🍃"],
    bad: ["☠️","🦟","🛢️","🚬","🧴","🔋","🪥","🧹"],
    makeGrid: function (d, st) {
      var n = Math.min(12, 6 + Math.floor(d.L / 50));
      var nGood = 1 + ri(Math.min(3, 1 + Math.floor(d.L / 120)));
      var tiles = [], self = this;
      for (var i = 0; i < nGood; i++) tiles.push(mk(self.good[ri(self.good.length)], true));
      while (tiles.length < n) tiles.push(mk(self.bad[ri(self.bad.length)], false));
      shuffle(tiles);
      function mk(emoji, ok) {
        return { correct: ok, draw: function (c, r) {
          c.font = Math.floor(r.h * 0.62) + "px serif"; c.textAlign = "center"; c.textBaseline = "middle";
          c.fillText(emoji, r.x + r.w / 2, r.y + r.h / 2 + 1);
        } };
      }
      return { prompt: GH.i18n.t("a1_obj"), tiles: tiles };
    }
  };

  // ---------- 2. EXTRACTION: pick the steps in canonical order ----------
  var EXTRACT_ORDER = [
    { tr: "Lizis", en: "Lyse", icon: "💥" },
    { tr: "Bağla", en: "Bind", icon: "🧲" },
    { tr: "Yıka", en: "Wash", icon: "🚿" },
    { tr: "Etanol", en: "Ethanol", icon: "🧴" },
    { tr: "Santrifüj", en: "Spin", icon: "🌀" },
    { tr: "Kurut", en: "Dry", icon: "💨" },
    { tr: "Çöz", en: "Elute", icon: "💧" },
    { tr: "Ölç", en: "Quantify", icon: "📊" }
  ];
  A.CHALLENGES.extract = {
    cols: 4,
    hp: function (d) { return d.steps; },
    tutorial: function (t) { return t === "tr"
      ? "DNA ekstraksiyonunu DOĞRU SIRAYLA yap: Lizis→Bağla→Yıka→Etanol→Santrifüj→Kurut→Çöz→Ölç. Sırayı ezbere bil!"
      : "Do extraction in the RIGHT ORDER: Lyse→Bind→Wash→Ethanol→Spin→Dry→Elute→Quantify. Memorize it!"; },
    init: function (d, st) { st.order = EXTRACT_ORDER.slice(0, d.steps); st.ptr = 0; },
    onCorrect: function (st) { st.ptr++; },
    makeGrid: function (d, st) {
      if (!st.order) this.init(d, st);
      var lang = GH.i18n.lang;
      var tiles = st.order.map(function (step, idx) {
        return { correct: idx === st.ptr, draw: function (c, r) {
          c.font = Math.floor(r.h * 0.38) + "px serif"; c.textAlign = "center"; c.textBaseline = "middle";
          c.fillText(step.icon, r.x + r.w / 2, r.y + r.h * 0.4);
          U.text(c, step[lang], r.x + r.w / 2, r.y + r.h - 6, 11, "#eaf2ff", "center");
        } };
      });
      shuffle(tiles);
      return { prompt: (lang === "tr" ? "Sıradaki adım? (" : "Next step? (") + (st.ptr + 1) + "/" + st.order.length + ")", tiles: tiles };
    }
  };

  // ---------- 3. SEQUENCING: pick the complementary base ----------
  A.CHALLENGES.sequence = {
    cols: 4,
    hp: function (d) { return d.seqTarget; },
    tutorial: function (t) { return t === "tr"
      ? "Bazlar eşleşir: A↔T, G↔C. Üstte gösterilen baza karşı gelen tamamlayıcıyı seç. (İpucu verilmez!)"
      : "Bases pair: A↔T, G↔C. Pick the complement of the base shown on top. (No hints given!)"; },
    init: function (d, st) { st.target = BASES[ri(4)]; },
    onCorrect: function (st) { st.target = BASES[ri(4)]; },
    makeGrid: function (d, st) {
      if (!st.target) this.init(d, st);
      var tiles = BASES.map(function (b) {
        return { correct: b === PAIR[st.target], draw: function (c, r) {
          U.text(c, b, r.x + r.w / 2, r.y + r.h / 2 + 9, Math.floor(r.h * 0.5), BCOL[b], "center");
        } };
      });
      shuffle(tiles);
      return { prompt: (GH.i18n.lang === "tr" ? "Hedef baz: " : "Target base: ") + st.target, big: st.target, tiles: tiles };
    },
    drawTop: function (c, st, cx, cy) {
      U.textO(c, st.target, cx, cy, 40, BCOL[st.target], "center");
    }
  };

  // ---------- 4. QC: trim bases below Phred Q20 (read the score, not color) ----------
  A.CHALLENGES.qc = {
    cols: 0,
    hp: function (d) { return d.count; },
    tutorial: function (t) { return t === "tr"
      ? "Phred kalite skoru bazın güvenilirliğidir. Q20 ALTINDAKİ (Q<20) bazları kırp; Q20 ve üstünü KORU. Renk yok, skoru oku!"
      : "Phred score = base reliability. Trim bases BELOW Q20; KEEP Q20 and above. No colors — read the score!"; },
    makeGrid: function (d, st) {
      var len = 6 + ri(4);
      var tiles = [];
      var anyBad = false;
      for (var i = 0; i < len; i++) {
        var q = 2 + ri(38); // 2..39
        var bad = q < 20;
        if (bad) anyBad = true;
        var b = BASES[ri(4)];
        (function (b, q, bad) {
          tiles.push({ correct: bad, draw: function (c, r) {
            U.text(c, b, r.x + r.w / 2, r.y + r.h * 0.45, Math.floor(r.h * 0.34), "#eaf2ff", "center");
            U.text(c, "Q" + q, r.x + r.w / 2, r.y + r.h - 5, 11, "#9fb3d6", "center");
          } });
        })(b, q, bad);
      }
      if (!anyBad) { tiles[ri(tiles.length)].correct = true; tiles[ri(tiles.length)].draw = tiles[0].draw; }
      return { prompt: GH.i18n.lang === "tr" ? "Q<20 olan bazları kırp" : "Trim bases with Q<20", tiles: tiles, cols: len };
    }
  };

  // ---------- 5. ASSEMBLY: pick the read overlapping the contig end ----------
  A.CHALLENGES.assembly = {
    cols: 1,
    hp: function (d) { return Math.min(12, 4 + Math.floor(d.L / 45)); },
    tutorial: function (t) { return t === "tr"
      ? "Okumalar yapboz gibidir: bir okumanın SONU, diğerinin BAŞIYLA örtüşür. Contig'in son harflerine başlangıcı uyan okumayı seç."
      : "Reads are puzzle pieces: the END of one overlaps the START of another. Pick the read whose start matches the contig's end."; },
    init: function (d, st) { st.ov = Math.min(5, 3 + Math.floor(d.L / 200)); st.contig = rseq(8); },
    onCorrect: function (st) { /* extended in makeGrid via st.next */ if (st.next) { st.contig = st.next; st.next = null; } },
    makeGrid: function (d, st) {
      if (!st.contig) this.init(d, st);
      var ov = st.ov, end = st.contig.slice(-ov);
      var rest = rseq(6);
      var correctRead = end + rest;
      st.next = (st.contig + rest).slice(-12);
      var opts = [correctRead];
      while (opts.length < Math.min(4, d.options)) {
        var d2 = rseq(ov) + rseq(6);
        if (d2.slice(0, ov) !== end) opts.push(d2);
      }
      shuffle(opts);
      var tiles = opts.map(function (seq) {
        return { correct: seq === correctRead, draw: function (c, r) {
          centerSeq(c, seq, r.x + r.w / 2, r.y + r.h / 2, Math.floor(r.h * 0.5));
        } };
      });
      return { prompt: (GH.i18n.lang === "tr" ? "Contig sonu: " : "Contig end: "), contigEnd: end, tiles: tiles, contig: st.contig };
    },
    drawTop: function (c, st, cx, cy) {
      var contig = st.contig || "";
      var ov = st.ov || 4;
      U.text(c, GH.i18n.lang === "tr" ? "...örtüşmeyi bul" : "...find the overlap", cx, cy - 16, 11, "#9fb3d6", "center");
      centerSeq(c, contig.slice(-10), cx, cy + 4, 16);
    }
  };

  // ---------- 6. GENE: find valid mini-ORFs (ATG ... STOP, in frame) ----------
  A.CHALLENGES.gene = {
    cols: 3,
    hp: function (d) { return Math.min(8, 2 + Math.floor(d.L / 70)); },
    tutorial: function (t) { return t === "tr"
      ? "Bir gen ATG ile başlar, STOP (TAA/TAG/TGA) ile biter. ATG ile başlayıp STOP ile biten geçerli diziyi seç."
      : "A gene starts with ATG and ends with STOP (TAA/TAG/TGA). Pick sequences that start with ATG AND end with a stop."; },
    makeGrid: function (d, st) {
      var n = Math.min(9, 4 + Math.floor(d.L / 60));
      var nGood = 1 + ri(2);
      var tiles = [];
      function body(k) { var s = ""; for (var i = 0; i < k; i++) { var cdn; do { cdn = rseq(3); } while (STOPS.indexOf(cdn) >= 0); s += cdn; } return s; }
      for (var g = 0; g < nGood; g++) tiles.push(mk("ATG" + body(1 + ri(2)) + STOPS[ri(3)], true));
      while (tiles.length < n) {
        // invalid: wrong start, or missing stop
        var bad = ri(2) === 0 ? (rseq(3) + body(2) + STOPS[ri(3)]) : ("ATG" + body(2) + rseq(3));
        // ensure it's actually invalid
        var valid = bad.slice(0, 3) === "ATG" && STOPS.indexOf(bad.slice(-3)) >= 0;
        if (!valid) tiles.push(mk(bad, false));
      }
      shuffle(tiles);
      function mk(seq, ok) { return { correct: ok, draw: function (c, r) { centerSeq(c, seq, r.x + r.w / 2, r.y + r.h / 2, Math.floor(r.h * 0.34)); } }; }
      return { prompt: GH.i18n.lang === "tr" ? "Geçerli geni bul (ATG…STOP)" : "Find the valid gene (ATG…STOP)", tiles: tiles };
    }
  };

  // ---------- 7. IDENTIFY: find the requested microbe (e.g. the virus) ----------
  var KINGDOMS = [
    { id: "virus", tr: "VİRÜS", en: "VIRUS" },
    { id: "bacteria", tr: "BAKTERİ", en: "BACTERIUM" },
    { id: "fungus", tr: "MANTAR", en: "FUNGUS" },
    { id: "human", tr: "İNSAN HÜCRESİ", en: "HUMAN CELL" }
  ];
  function drawMicrobe(c, id, cx, cy, r) {
    if (id === "virus") { A.mon.Patojen(c, cx, cy, r * 0.6, 0); }
    else if (id === "bacteria") {
      c.fillStyle = "#9ad65f"; A.ui.rr(c, cx - r, cy - r * 0.4, r * 2, r * 0.8, r * 0.4); c.fill();
      c.strokeStyle = "#10182c"; c.lineWidth = 2; A.ui.rr(c, cx - r, cy - r * 0.4, r * 2, r * 0.8, r * 0.4); c.stroke();
      c.strokeStyle = "#3e7d22"; c.beginPath(); c.moveTo(cx + r, cy); c.lineTo(cx + r * 1.5, cy - r * 0.3); c.stroke();
    } else if (id === "fungus") {
      c.fillStyle = "#e8a0c8"; c.beginPath(); c.arc(cx, cy - r * 0.2, r * 0.9, Math.PI, 0); c.fill();
      c.strokeStyle = "#10182c"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy - r * 0.2, r * 0.9, Math.PI, 0); c.stroke();
      c.fillStyle = "#f5e6d0"; c.fillRect(cx - r * 0.25, cy - r * 0.2, r * 0.5, r * 0.9);
    } else { // human cell
      c.fillStyle = "#ffd2a0"; c.beginPath(); c.arc(cx, cy, r * 0.95, 0, 7); c.fill();
      c.strokeStyle = "#10182c"; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r * 0.95, 0, 7); c.stroke();
      c.fillStyle = "#b06a8c"; c.beginPath(); c.arc(cx + r * 0.2, cy, r * 0.35, 0, 7); c.fill();
    }
  }
  A.CHALLENGES.identify = {
    cols: 4,
    hp: function (d) { return d.count; },
    tutorial: function (t) { return t === "tr"
      ? "Metagenomikte örnekteki canlıyı tanırız. İstenen mikrobu (ör. dikenli VİRÜS) sürünün içinden bul. Şekilleri öğren!"
      : "In metagenomics we identify what's in a sample. Find the requested microbe (e.g. the spiky VIRUS) in the crowd. Learn the shapes!"; },
    init: function (d, st) { st.want = KINGDOMS[ri(KINGDOMS.length)]; },
    onCorrect: function (st) { /* keep same target within grid; new grid picks new */ },
    makeGrid: function (d, st) {
      st.want = KINGDOMS[ri(KINGDOMS.length)];
      var want = st.want;
      var n = Math.min(12, 6 + Math.floor(d.L / 60));
      var nGood = 1 + ri(Math.min(3, 1 + Math.floor(d.L / 150)));
      var tiles = [];
      for (var i = 0; i < nGood; i++) tiles.push(mk(want.id, true));
      while (tiles.length < n) {
        var other = KINGDOMS[ri(KINGDOMS.length)];
        if (other.id !== want.id) tiles.push(mk(other.id, false));
      }
      shuffle(tiles);
      function mk(id, ok) { return { correct: ok, draw: function (c, r) { drawMicrobe(c, id, r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.36); } }; }
      return { prompt: (GH.i18n.lang === "tr" ? want.tr + " bul!" : "Find the " + want.en + "!"), tiles: tiles };
    }
  };

  // ---------- 8. PHYLOGENY: pick the closest relative (fewest differences) ----------
  A.CHALLENGES.phylo = {
    cols: 1,
    hp: function (d) { return Math.max(3, Math.floor(d.count * 0.7)); },
    tutorial: function (t) { return t === "tr"
      ? "Akrabalık benzerliktir: en az FARK içeren dizi en yakın akrabadır. Soru diziyle karşılaştır, en benzerini seç."
      : "Relatedness = similarity: the sequence with the FEWEST differences is the closest relative. Compare to the query, pick the most similar."; },
    init: function (d, st) { st.q = rseq(10); },
    onCorrect: function (st) { st.q = rseq(10); },
    makeGrid: function (d, st) {
      if (!st.q) this.init(d, st);
      var q = st.q;
      function mutate(s, n) { s = s.split(""); var idx = shuffle(s.map(function (_, i) { return i; })).slice(0, n); idx.forEach(function (i) { var nb; do { nb = BASES[ri(4)]; } while (nb === s[i]); s[i] = nb; }); return s.join(""); }
      var nOpts = Math.min(5, d.options);
      var closeDiff = 1;
      var opts = [{ seq: mutate(q, closeDiff), correct: true }];
      var used = { 1: true };
      while (opts.length < nOpts) {
        var dd = 2 + ri(Math.min(6, 2 + Math.floor(d.L / 100)));
        opts.push({ seq: mutate(q, dd), correct: false });
      }
      shuffle(opts);
      var tiles = opts.map(function (o) {
        return { correct: o.correct, draw: function (c, r) { centerSeq(c, o.seq, r.x + r.w / 2, r.y + r.h / 2, Math.floor(r.h * 0.5)); } };
      });
      return { prompt: GH.i18n.lang === "tr" ? "En yakın akrabayı seç" : "Pick the closest relative", queryTop: q, tiles: tiles };
    },
    drawTop: function (c, st, cx, cy) {
      U.text(c, GH.i18n.lang === "tr" ? "Soru dizi:" : "Query:", cx, cy - 14, 11, "#9fb3d6", "center");
      centerSeq(c, st.q || "", cx, cy + 6, 18);
    }
  };
})(window.GH = window.GH || {});
