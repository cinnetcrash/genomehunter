/* GenomeHunter — tiny WebAudio sound engine (no asset files) */
(function (GH) {
  "use strict";

  var ctx = null;
  var muted = false;

  try { muted = localStorage.getItem("gh_muted") === "1"; } catch (e) {}

  function ac() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol) {
    if (muted) return;
    var c = ac();
    if (!c) return;
    var t0 = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.15));
    osc.connect(g).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + (dur || 0.15) + 0.02);
  }

  GH.audio = {
    isMuted: function () { return muted; },
    toggle: function () {
      muted = !muted;
      try { localStorage.setItem("gh_muted", muted ? "1" : "0"); } catch (e) {}
      if (!muted) this.click();
      return muted;
    },
    click: function () { tone(440, 0.08, "triangle", 0.12); },
    good: function () { tone(660, 0.1, "sine", 0.18); setTimeout(function () { tone(880, 0.12, "sine", 0.18); }, 90); },
    bad: function () { tone(160, 0.22, "sawtooth", 0.16); },
    pop: function () { tone(520, 0.06, "square", 0.10); },
    win: function () {
      var notes = [523, 659, 784, 1046];
      notes.forEach(function (f, i) { setTimeout(function () { tone(f, 0.16, "sine", 0.2); }, i * 130); });
    },
    fail: function () {
      [330, 247, 175].forEach(function (f, i) { setTimeout(function () { tone(f, 0.2, "sawtooth", 0.16); }, i * 150); });
    }
  };
})(window.GH = window.GH || {});
