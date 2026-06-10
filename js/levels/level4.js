/* Level 4 — Quality Control (trim low-quality bases, keep good ones) */
(function (GH) {
  "use strict";

  var COLORS = { A: "#46d6c8", T: "#f0b65a", G: "#d678c8", C: "#7ad67a" };
  var BASES = ["A", "T", "G", "C"];

  GH._levelMounts[4] = function (root, ctx) {
    var t = ctx.t;
    var ROUNDS = 4;
    var round = 0;
    var score = 0;
    var mistakes = 0;

    root.appendChild(ctx.el("div", "gh-hint gh-center", t("l4_keep_good") + " &nbsp; 🟥=Q10 &nbsp; 🟩=Q30"));

    var board = ctx.el("div", "gh-qc-board");
    root.appendChild(board);

    var info = ctx.el("div", "gh-task", t("l4_intro"));
    root.appendChild(info);

    var nextBtn = ctx.el("button", "gh-btn gh-btn-primary", "✓ " + t("next"));
    nextBtn.style.display = "none";
    nextBtn.onclick = function () { GH.audio.click(); round++; if (round >= ROUNDS) finish(); else renderRound(); };
    root.appendChild(nextBtn);

    renderRound();
    updateHud();

    function updateHud() {
      ctx.setHud("🔁 " + (round + 1) + "/" + ROUNDS + " &nbsp; ⭐" + score);
    }

    function renderRound() {
      nextBtn.style.display = "none";
      board.innerHTML = "";
      updateHud();
      var len = 14 + round * 2;
      var read = ctx.el("div", "gh-read");
      var remaining = { bad: 0 };

      for (var i = 0; i < len; i++) {
        var b = BASES[(Math.random() * 4) | 0];
        // bad bases cluster at the ends (like real read quality) + random
        var endZone = i < 2 || i > len - 4;
        var isBad = endZone ? Math.random() < 0.7 : Math.random() < 0.15;
        if (isBad) remaining.bad++;
        var cell = ctx.el("button", "gh-qc-base " + (isBad ? "gh-qc-bad" : "gh-qc-good"), b);
        cell.style.color = COLORS[b];
        cell.dataset.bad = isBad ? "1" : "0";
        (function (cell) {
          cell.onclick = function () {
            if (cell.classList.contains("gh-trimmed")) return;
            if (cell.dataset.bad === "1") {
              GH.audio.pop();
              cell.classList.add("gh-trimmed");
              score += 8;
              remaining.bad--;
              if (remaining.bad <= 0) roundDone();
            } else {
              GH.audio.bad();
              mistakes++;
              score = Math.max(0, score - 6);
              cell.classList.add("gh-shake");
              setTimeout(function () { cell.classList.remove("gh-shake"); }, 400);
            }
            updateHud();
          };
        })(cell);
        read.appendChild(cell);
      }
      board.appendChild(read);
      if (remaining.bad === 0) roundDone();
    }

    function roundDone() {
      GH.audio.good();
      score += 12;
      nextBtn.style.display = "";
      updateHud();
    }

    function finish() {
      var stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
      setTimeout(function () { ctx.complete({ score: score, stars: stars, passed: true }); }, 200);
    }
  };
})(window.GH = window.GH || {});
