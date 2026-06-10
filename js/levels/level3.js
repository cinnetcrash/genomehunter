/* Level 3 — Sequencing (action: pick the complementary base before time runs out) */
(function (GH) {
  "use strict";

  var PAIR = { A: "T", T: "A", G: "C", C: "G" };
  var COLORS = { A: "#46d6c8", T: "#f0b65a", G: "#d678c8", C: "#7ad67a" };
  var BASES = ["A", "T", "G", "C"];

  GH._levelMounts[3] = function (root, ctx) {
    var t = ctx.t;
    var TARGET = 15;        // bases to sequence
    var done = 0;
    var score = 0;
    var streak = 0;
    var lives = 3;
    var running = true;
    var perBaseTime = Math.max(1.6, 3.2 - ctx.diff * 0.3); // seconds
    var timeLeft = perBaseTime;
    var current = null;

    root.appendChild(ctx.el("div", "gh-hint gh-center", t("l3_pair_hint")));

    var machine = ctx.el("div", "gh-seq-machine");
    machine.innerHTML =
      '<div class="gh-seq-template">' +
      '  <span class="gh-seq-label">5′</span>' +
      '  <span class="gh-seq-read" id="gh-seq-read"></span>' +
      '  <span class="gh-seq-cursor" id="gh-seq-cursor">?</span>' +
      '  <span class="gh-seq-label">3′</span>' +
      "</div>" +
      '<div class="gh-seq-bar"><div class="gh-seq-bar-fill" id="gh-seq-bar"></div></div>';
    root.appendChild(machine);

    var pad = ctx.el("div", "gh-base-pad");
    BASES.forEach(function (b) {
      var btn = ctx.el("button", "gh-base-btn", b);
      btn.style.setProperty("--accent", COLORS[b]);
      btn.onclick = function () { pick(b); };
      pad.appendChild(btn);
    });
    root.appendChild(pad);

    var readEl = document.getElementById("gh-seq-read");
    var cursor = document.getElementById("gh-seq-cursor");
    var bar = document.getElementById("gh-seq-bar");

    // keyboard support
    function onKey(e) {
      var k = (e.key || "").toUpperCase();
      if (PAIR[k] != null) pick(k);
    }
    document.addEventListener("keydown", onKey);

    var built = "";
    nextBase();
    updateHud();

    var tick = setInterval(function () {
      if (!running) return;
      timeLeft -= 0.1;
      var pct = Math.max(0, timeLeft / perBaseTime) * 100;
      bar.style.width = pct + "%";
      bar.style.background = pct < 30 ? "#f06a6a" : "#46d6c8";
      if (timeLeft <= 0) { miss(); }
    }, 100);

    function updateHud() {
      ctx.setHud("🧬 " + done + "/" + TARGET + " &nbsp; ❤️" + lives + " &nbsp; 🔥" + streak + " &nbsp; ⭐" + score);
    }

    function nextBase() {
      current = BASES[(Math.random() * 4) | 0];
      cursor.textContent = current;
      cursor.style.color = COLORS[current];
      timeLeft = perBaseTime;
    }

    function pick(b) {
      if (!running) return;
      var need = PAIR[current];
      if (b === need) {
        GH.audio.pop();
        streak++; score += 10 + Math.min(20, streak * 2);
        done++;
        built += b;
        readEl.innerHTML += '<span style="color:' + COLORS[b] + '">' + b + "</span>";
        if (done >= TARGET) { finish(true); return; }
        nextBase();
      } else {
        GH.audio.bad();
        streak = 0; lives--; score = Math.max(0, score - 5);
        cursor.parentNode.classList.add("gh-shake");
        setTimeout(function () { cursor.parentNode.classList.remove("gh-shake"); }, 400);
        if (lives <= 0) { finish(false); return; }
      }
      updateHud();
    }

    function miss() {
      GH.audio.bad();
      streak = 0; lives--;
      if (lives <= 0) { finish(false); return; }
      nextBase();
      updateHud();
    }

    function finish(passed) {
      if (!running) return;
      running = false;
      clearInterval(tick);
      document.removeEventListener("keydown", onKey);
      var stars = passed ? (lives === 3 ? 3 : lives === 2 ? 2 : 1) : 0;
      setTimeout(function () { ctx.complete({ score: score, stars: stars, passed: passed }); }, 300);
    }
  };
})(window.GH = window.GH || {});
