# 🧬 GenomeHunter

**DNA'dan Genoma Macera** — çocuklar için, baştan sona biyoinformatik sürecini
eğlenceli ve aksiyon dolu mini-oyunlarla öğreten, tarayıcıdan oynanan bir oyun.

> *From DNA to Genome* — a browser game for kids that teaches the whole
> bioinformatics pipeline through fun, action-packed mini-games. **TR/EN bilingual.**

## 🎮 Oyna / Play
- Canlı: **https://cinnetcrash.github.io/genomehunter/**
- Yerelde: bu klasördeki `index.html` dosyasını çift tıkla (sunucu gerekmez).

## 🧪 Seviyeler / Levels
Her seviye gerçek bir genom projesinin bir aşamasıdır:

| # | Aşama | Mini-oyun | Mentor (gerçek bilim insanı) |
|---|-------|-----------|------------------------------|
| 1 | Örnek Toplama | Doğru örnekleri topla, kontaminasyondan kaç | Friedrich Miescher |
| 2 | DNA Ekstraksiyonu | Adımları doğru sırala (Lizis→Bağla→Yıka→Çöz) | Rosalind Franklin |
| 3 | Dizileme | Tamamlayıcı bazı hızlıca seç (A↔T, G↔C) | Frederick Sanger |
| 4 | Kalite Kontrolü | Düşük kaliteli bazları kırp | Phil Green (Phred) |
| 5 | Assembly | Örtüşen okumaları birleştir | Gene Myers |
| 6 | Anotasyon | Genleri bul (ATG→STOP) | Ewan Birney |

Ana rehber: **Margaret Dayhoff** — biyoinformatiğin kurucusu.
Her seviye geçildiğinde kahraman yeni bir **yetenek** kazanır; tüm seviyeler
bitince **Genom Avcısı Sertifikası** açılır.

## 🛠️ Teknik
- Saf HTML/CSS/JavaScript — **derleme adımı yok, bağımlılık yok**.
- Klasik `<script>` etiketleri → hem `file://` ile hem GitHub Pages'te çalışır.
- İlerleme `localStorage`'da saklanır. Ses WebAudio ile üretilir (asset yok).
- Mobil + masaüstü uyumlu; klavye, dokunmatik ve fare destekli.

## 📁 Yapı
```
index.html
css/style.css
js/i18n.js, characters.js, audio.js, game.js
js/levels/level1..level6.js
docs/superpowers/specs/  (tasarım dokümanı)
```

## 🚀 Yayınlama / Deploy (GitHub Pages)
`main` dalına push → Settings → Pages → Source: `main` / `(root)`.
Birkaç dakika içinde `https://<kullanıcı>.github.io/genomehunter/` adresinde yayında olur.

---
*Eğitim amaçlı bir projedir. Biyoinformatik kavramları oyunlaştırılmış temsillerle anlatılır.*
