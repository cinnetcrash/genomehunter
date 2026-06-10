/* Level 1 — Sample Collection (action: catch the right samples) */
(function (GH) {
  "use strict";

  // Correct sample sources per organism, plus universal contaminants.
  var SAMPLES = {
    virus:    { good: ["🦠", "💧", "🧫"], label: { tr: "virüs örneği", en: "virus sample" } },
    bacteria: { good: ["🧫", "💩", "🥛"], label: { tr: "bakteri örneği", en: "bacteria sample" } },
    fungus:   { good: ["🍄", "🍂", "🌾"], label: { tr: "mantar örneği", en: "fungus sample" } },
    human:    { good: ["🩸", "🦷", "💇"], label: { tr: "insan örneği", en: "human sample" } }
  };
  var BAD = ["☠️", "🛢️", "🧴", "🦟", "🚬"]; // contamination

  GH._levelMounts[1] = function (root, ctx) {
    var t = ctx.t;
    var GOAL = 12;
    var lives = 3;
    var collected = 0;
    var score = 0;
    var timeLeft = 35;
    var running = true;
    var spec = SAMPLES[ctx.organism] || SAMPLES.bacteria;

    var field = ctx.el("div", "gh-field");
    root.appendChild(field);

    var legend = ctx.el("div", "gh-legend");
    legend.innerHTML =
      '<span class="gh-legend-good">✅ ' + t("l1_collect") + ": " + spec.good.join(" ") + "</span>" +
      '<span class="gh-legend-bad">⛔ ' + t("l1_avoid") + ": ☠️ 🛢️ 🦟</span>";
    root.appendChild(legend);

    updateHud();
    function updateHud() {
      ctx.setHud("🧪 " + collected + "/" + GOAL + " &nbsp; ❤️" + lives + " &nbsp; ⏱️" + timeLeft + "s &nbsp; ⭐" + score);
    }

    var items = [];
    function spawn() {
      if (!running) return;
      var isGood = Math.random() < 0.62;
      var emoji = isGood ? spec.good[(Math.random() * spec.good.length) | 0] : BAD[(Math.random() * BAD.length) | 0];
      var node = ctx.el("button", "gh-fall" + (isGood ? " gh-fall-good" : " gh-fall-bad"), emoji);
      var w = field.clientWidth || 600;
      var x = 10 + Math.random() * (w - 60);
      node.style.left = x + "px";
      node.style.bottom = "-60px";
      var speed = 0.9 + Math.random() * 0.9 + ctx.diff * 0.12;
      var obj = { node: node, y: -60, speed: speed, good: isGood, dead: false };
      node.onclick = function (e) {
        e.stopPropagation();
        if (obj.dead || !running) return;
        obj.dead = true;
        if (isGood) {
          GH.audio.pop();
          collected++; score += 10;
          node.classList.add("gh-pop");
          if (collected >= GOAL) finish(true);
        } else {
          GH.audio.bad();
          lives--; score = Math.max(0, score - 5);
          node.classList.add("gh-shake");
          flash(t("l1_contamination"));
          if (lives <= 0) finish(false);
        }
        updateHud();
        setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 250);
      };
      field.appendChild(node);
      items.push(obj);
    }

    function flash(msg) {
      var f = ctx.el("div", "gh-flash", msg);
      field.appendChild(f);
      setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 700);
    }

    var lastSpawn = 0;
    var last = null;
    function loop(ts) {
      if (!running) return;
      if (last == null) last = ts;
      var dt = (ts - last) / 16.67; last = ts;
      var h = field.clientHeight || 400;
      if (ts - lastSpawn > Math.max(420, 900 - ctx.diff * 60)) { spawn(); lastSpawn = ts; }
      items.forEach(function (o) {
        if (o.dead) return;
        o.y += o.speed * dt;
        o.node.style.bottom = "";
        o.node.style.top = o.y + "px";
        if (o.y > h + 60) {
          o.dead = true;
          if (o.parentNode) {}
          if (o.node.parentNode) o.node.parentNode.removeChild(o.node);
        }
      });
      items = items.filter(function (o) { return !o.dead; });
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    var timer = setInterval(function () {
      if (!running) return;
      timeLeft--;
      updateHud();
      if (timeLeft <= 0) finish(collected >= GOAL * 0.6);
    }, 1000);

    function finish(passed) {
      if (!running) return;
      running = false;
      clearInterval(timer);
      var stars = passed ? (lives === 3 ? 3 : lives === 2 ? 2 : 1) : 0;
      setTimeout(function () { ctx.complete({ score: score, stars: stars, passed: passed }); }, 400);
    }
  };
})(window.GH = window.GH || {});
