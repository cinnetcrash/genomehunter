/* Level 2 — DNA Extraction (order the steps: Lyse -> Bind -> Wash -> Elute) */
(function (GH) {
  "use strict";

  GH._levelMounts[2] = function (root, ctx) {
    var t = ctx.t;
    var STEPS = [
      { key: "l2_step_lyse", icon: "💥" },
      { key: "l2_step_bind", icon: "🧲" },
      { key: "l2_step_wash", icon: "🚿" },
      { key: "l2_step_elute", icon: "💧" }
    ];
    var ROUNDS = 3;          // repeat the pipeline a few times (different samples)
    var round = 0;
    var idx = 0;             // current correct step index in this round
    var score = 0;
    var mistakes = 0;

    var tube = ctx.el("div", "gh-tube-wrap");
    tube.innerHTML =
      '<div class="gh-tube"><div class="gh-tube-fluid" id="gh-tube-fluid"></div>' +
      '<div class="gh-tube-cells" id="gh-tube-cells">🦠🦠🦠</div></div>' +
      '<div class="gh-tube-caption" id="gh-tube-cap"></div>';
    root.appendChild(tube);

    var prompt = ctx.el("div", "gh-task", t("l2_pick_next"));
    root.appendChild(prompt);

    var choices = ctx.el("div", "gh-choice-grid");
    root.appendChild(choices);

    var progress = ctx.el("div", "gh-step-track");
    root.appendChild(progress);

    updateHud();
    render();

    function updateHud() {
      ctx.setHud("🔁 " + (round + 1) + "/" + ROUNDS + " &nbsp; 🧬 " + idx + "/4 &nbsp; ⭐" + score);
    }

    function render() {
      // progress track
      progress.innerHTML = STEPS.map(function (s, i) {
        var cls = i < idx ? "done" : (i === idx ? "active" : "");
        return '<span class="gh-step ' + cls + '">' + s.icon + "<small>" + t(s.key) + "</small></span>";
      }).join('<span class="gh-step-arrow">→</span>');

      // shuffled choices
      var shuffled = STEPS.slice().sort(function () { return Math.random() - 0.5; });
      choices.innerHTML = "";
      shuffled.forEach(function (s) {
        var b = ctx.el("button", "gh-choice", '<span class="gh-choice-icon">' + s.icon + "</span>" + t(s.key));
        b.onclick = function () { pick(s); };
        choices.appendChild(b);
      });

      var caps = ["🦠🦠🦠", "💥💥", "🧲🧬", "✨🧬✨"];
      document.getElementById("gh-tube-cells").textContent = caps[Math.min(idx, 3)];
      var fluid = document.getElementById("gh-tube-fluid");
      fluid.style.height = (15 + idx * 22) + "%";
    }

    function pick(s) {
      var correct = STEPS[idx];
      if (s.key === correct.key) {
        GH.audio.good();
        score += 15;
        idx++;
        if (idx >= STEPS.length) {
          round++;
          if (round >= ROUNDS) { finish(); return; }
          idx = 0;
        }
        updateHud();
        render();
      } else {
        GH.audio.bad();
        mistakes++;
        score = Math.max(0, score - 8);
        prompt.classList.add("gh-shake");
        prompt.textContent = t("l2_wrong");
        setTimeout(function () {
          prompt.classList.remove("gh-shake");
          prompt.textContent = t("l2_pick_next");
        }, 900);
        updateHud();
      }
    }

    function finish() {
      var stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
      setTimeout(function () { ctx.complete({ score: score, stars: stars, passed: true }); }, 300);
    }
  };
})(window.GH = window.GH || {});
