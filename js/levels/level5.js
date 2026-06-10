/* Level 5 — Assembly (pick the read that overlaps the current contig's end) */
(function (GH) {
  "use strict";

  var COLORS = { A: "#46d6c8", T: "#f0b65a", G: "#d678c8", C: "#7ad67a" };
  var BASES = ["A", "T", "G", "C"];

  function rndSeq(n) {
    var s = "";
    for (var i = 0; i < n; i++) s += BASES[(Math.random() * 4) | 0];
    return s;
  }
  function colorize(seq, hiStart, hiLen) {
    var out = "";
    for (var i = 0; i < seq.length; i++) {
      var hi = hiStart != null && i >= hiStart && i < hiStart + hiLen;
      out += '<span class="gh-asm-b' + (hi ? " gh-asm-hi" : "") + '" style="color:' + COLORS[seq[i]] + '">' + seq[i] + "</span>";
    }
    return out;
  }

  GH._levelMounts[5] = function (root, ctx) {
    var t = ctx.t;
    var OVERLAP = 4;
    var readLen = 10;
    var JOINS = 5;                // number of joins to make
    var joined = 0;
    var score = 0;
    var mistakes = 0;

    // Build a genome and a chain of overlapping reads.
    var genome = rndSeq(readLen + JOINS * (readLen - OVERLAP) + 2);
    var reads = [];
    var pos = 0;
    while (pos + readLen <= genome.length && reads.length <= JOINS) {
      reads.push(genome.substr(pos, readLen));
      pos += (readLen - OVERLAP);
    }

    var contig = reads[0];
    var step = 1;

    var contigBox = ctx.el("div", "gh-asm-contig");
    contigBox.innerHTML = '<span class="gh-asm-label">' + t("l5_contig") + ":</span><div id=\"gh-contig\"></div>";
    root.appendChild(contigBox);

    var prompt = ctx.el("div", "gh-task", t("l5_overlap"));
    root.appendChild(prompt);

    var endHint = ctx.el("div", "gh-asm-endhint");
    root.appendChild(endHint);

    var choices = ctx.el("div", "gh-asm-choices");
    root.appendChild(choices);

    renderContig();
    renderChoices();
    updateHud();

    function updateHud() {
      ctx.setHud("🧩 " + joined + "/" + JOINS + " &nbsp; ⭐" + score);
    }

    function renderContig() {
      var box = document.getElementById("gh-contig");
      box.innerHTML = colorize(contig, contig.length - OVERLAP, OVERLAP);
      endHint.innerHTML = "→ " + t("l5_overlap").toUpperCase().slice(0, 0) +
        '<span class="gh-asm-end">' + colorize(contig.slice(-OVERLAP)) + "</span>";
    }

    function renderChoices() {
      var correct = reads[step];
      var opts = [correct];
      // distractors: reads with wrong overlap
      while (opts.length < 3) {
        var d = rndSeq(readLen);
        // ensure it does NOT start with the needed overlap
        if (d.substr(0, OVERLAP) !== contig.slice(-OVERLAP)) opts.push(d);
      }
      opts.sort(function () { return Math.random() - 0.5; });

      choices.innerHTML = "";
      opts.forEach(function (seq) {
        var match = seq.substr(0, OVERLAP) === contig.slice(-OVERLAP);
        var b = ctx.el("button", "gh-asm-card");
        b.innerHTML = colorize(seq, 0, OVERLAP);
        b.onclick = function () { pick(seq, match, b); };
        choices.appendChild(b);
      });
    }

    function pick(seq, match, btn) {
      if (match) {
        GH.audio.good();
        score += 20;
        // merge with overlap
        contig = contig + seq.slice(OVERLAP);
        joined++; step++;
        btn.classList.add("gh-pop");
        if (joined >= JOINS) { finish(); return; }
        renderContig();
        renderChoices();
        updateHud();
      } else {
        GH.audio.bad();
        mistakes++;
        score = Math.max(0, score - 8);
        btn.classList.add("gh-shake");
        setTimeout(function () { btn.classList.remove("gh-shake"); }, 400);
        updateHud();
      }
    }

    function finish() {
      renderContig();
      var stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      setTimeout(function () { ctx.complete({ score: score, stars: stars, passed: true }); }, 400);
    }
  };
})(window.GH = window.GH || {});
