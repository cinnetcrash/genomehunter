/* Level 6 — Annotation (find ORFs: ATG ... STOP) */
(function (GH) {
  "use strict";

  var COLORS = { A: "#46d6c8", T: "#f0b65a", G: "#d678c8", C: "#7ad67a" };
  var BASES = ["A", "T", "G", "C"];
  var STOPS = ["TAA", "TAG", "TGA"];

  function randCodon(noStop) {
    var c;
    do { c = BASES[(Math.random()*4)|0] + BASES[(Math.random()*4)|0] + BASES[(Math.random()*4)|0]; }
    while ((noStop && STOPS.indexOf(c) >= 0) || c === "ATG");
    return c;
  }

  GH._levelMounts[6] = function (root, ctx) {
    var t = ctx.t;
    var TARGET_GENES = ctx.diff >= 3 ? 4 : 3;
    var codons = [];
    var genes = [];   // {start, end} inclusive codon indices
    var found = 0;
    var score = 0;
    var mistakes = 0;

    // Build genome (in-frame codons) with embedded genes.
    var i = 0;
    while (genes.length < TARGET_GENES) {
      // filler (non-ATG) codons
      var fill = 1 + ((Math.random() * 3) | 0);
      for (var f = 0; f < fill; f++) codons.push(randCodon(false));
      // gene: ATG + body (no stop) + stop
      var start = codons.length;
      codons.push("ATG");
      var bodyLen = 2 + ((Math.random() * 3) | 0);
      for (var b = 0; b < bodyLen; b++) codons.push(randCodon(true));
      codons.push(STOPS[(Math.random() * STOPS.length) | 0]);
      var end = codons.length - 1;
      genes.push({ start: start, end: end, done: false });
    }
    // trailing filler
    var tail = 1 + ((Math.random() * 3) | 0);
    for (var t2 = 0; t2 < tail; t2++) codons.push(randCodon(false));

    root.appendChild(ctx.el("div", "gh-hint gh-center", t("l6_find") + " &nbsp; (STOP: TAA · TAG · TGA)"));

    var strip = ctx.el("div", "gh-anno-strip");
    root.appendChild(strip);
    renderStrip();

    var msg = ctx.el("div", "gh-task", t("l6_intro"));
    root.appendChild(msg);
    updateHud();

    function updateHud() {
      ctx.setHud("🔎 " + found + "/" + TARGET_GENES + " &nbsp; ⭐" + score);
    }

    function renderStrip() {
      strip.innerHTML = "";
      codons.forEach(function (c, idx) {
        var cell = ctx.el("button", "gh-codon", c);
        var inGene = geneAt(idx);
        if (inGene && inGene.done) {
          cell.classList.add("gh-codon-gene");
          if (idx === inGene.start) cell.classList.add("gh-codon-start");
          if (idx === inGene.end) cell.classList.add("gh-codon-stop");
        }
        if (STOPS.indexOf(c) >= 0) cell.classList.add("gh-codon-isstop");
        if (c === "ATG") cell.classList.add("gh-codon-isatg");
        cell.onclick = function () { clickCodon(idx, cell); };
        strip.appendChild(cell);
      });
    }

    function geneAt(idx) {
      for (var g = 0; g < genes.length; g++) {
        if (idx >= genes[g].start && idx <= genes[g].end) return genes[g];
      }
      return null;
    }

    function clickCodon(idx, cell) {
      // Correct only if this is the START (ATG) of an undiscovered gene.
      var g = null;
      for (var k = 0; k < genes.length; k++) {
        if (genes[k].start === idx && !genes[k].done) { g = genes[k]; break; }
      }
      if (g && codons[idx] === "ATG") {
        GH.audio.good();
        g.done = true;
        found++;
        score += 25;
        flashGene(g);
        renderStrip();
        if (found >= TARGET_GENES) { finish(); return; }
        msg.textContent = "✅ " + t("l6_gene_found");
      } else {
        GH.audio.bad();
        mistakes++;
        score = Math.max(0, score - 6);
        cell.classList.add("gh-shake");
        setTimeout(function () { cell.classList.remove("gh-shake"); }, 400);
        msg.textContent = "❌ " + t("l6_not_gene");
      }
      updateHud();
    }

    function flashGene(g) {
      var f = ctx.el("div", "gh-flash", "🧬 " + t("l6_gene_found"));
      strip.appendChild(f);
      setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 700);
    }

    function finish() {
      var stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      setTimeout(function () { ctx.complete({ score: score, stars: stars, passed: true }); }, 400);
    }
  };
})(window.GH = window.GH || {});
