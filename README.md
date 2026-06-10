# 🧬 GenomeHunter — Genom Bölgesi Macerası

Çocuklar için **Pokémon tarzı, arcade** bir biyoinformatik oyunu. Profesör
Margaret Dayhoff'la birlikte **Genom Bölgesi**'ni keş­fet, vahşi **Genom-mon**'ları
bilimle yakala ve **1000 seviyeyi** geçerek **Genom Şampiyonu** ol!

> A Pokémon-style, arcade bioinformatics game for kids. Catch wild Genome-mon
> with science across **1000 increasingly hard levels**. **TR/EN bilingual.**

## 🎮 Oyna / Play
- Canlı: **https://cinnetcrash.github.io/genomehunter/**
- 2D mini-oyun sürümü: **https://cinnetcrash.github.io/genomehunter/classic/**

## 🕹️ Kontroller
- Yürü: **Ok tuşları / WASD** · Onay: **Enter / Z** · Geri: **X / ESC**
- Dokunmatik: ekrandaki yön ve aksiyon tuşları.

## 🧪 Nasıl çalışır
Her seviye bir **karşılaşma** (Pokémon savaşı havasında): vahşi bir Genom-mon'un
HP'si vardır; her **doğru cevap bir saldırı**, her **yanlış cevap kalp kaybı**, ve
**süre biterse yaratık kaçar**. HP biterse yaratık yakalanır, sonraki seviyeye
geçersin. Her **25. seviye bir BOSS**, her **100 seviyede yeni bir bölge teması**.

**Kopya yok:** doğru cevabı ele veren ipuçları gösterilmez (örn. dizilemede
A↔T hatırlatması yok; kalite kontrolünde renk yerine gerçek **Phred skoru** okunur).

### 8 mini-oyun (biyoinformatik boru hattı + ekstra)
1. **Örnek Sahası** — geçerli biyolojik örnekleri seç, kontaminasyondan kaç
2. **Ekstraksiyon Mağarası** — DNA çıkarma adımlarını doğru sırayla uygula
3. **Dizileme Kulesi** — tamamlayıcı bazı seç (A↔T, G↔C)
4. **Patojen Avı** — sürünün içinden istenen mikrobu (ör. virüsü) bul
5. **Kalite Vadisi** — Phred skoru Q<20 olan bazları kırp
6. **Assembly Labirenti** — örtüşen okumayı seç, contig'i uzat
7. **Filogeni Vadisi** — soru diziye en yakın akrabayı (en az fark) seç
8. **Gen Tapınağı** — ATG ile başlayıp STOP ile biten geçerli geni bul

### Zorluk
Seviye arttıkça: **süre kısalır**, **hedef sayısı/seçenek artar**, hız yükselir.
İlerleme ve en yüksek skor `localStorage`'da saklanır.

## 🏆 Skor Tablosu (Şeref Salonu)
Bu cihazdaki en iyi skorlar isimle sıralanır. Site statik (GitHub Pages) olduğundan
skorlar varsayılan olarak cihazda tutulur. **Global** bir tablo için kod hazır:
`js/arcade/scoreboard.js` içindeki `A.board.endpoint`'e ücretsiz bir REST uç noktası
(Supabase / Firebase / Cloudflare Worker) verildiğinde skorlar otomatik
yayınlanır ve uzak liste birleştirilir.

## 🧑‍🔬 Karakterler
Ana rehber **Margaret Dayhoff** (biyoinformatiğin kurucusu). 2D klasik sürümde ayrıca
Miescher, Franklin, Sanger, Phil Green, Gene Myers, Ewan Birney mentor olarak yer alır.

## 🛠️ Teknik
- Saf HTML/CSS/JavaScript — **derleme adımı/bağımlılık yok**. Pixel-art canvas (480×270, nearest-neighbor).
- Tüm görseller **kodla üretilir** (özgün pixel yaratıklar; telifli sprite kullanılmaz).
- Ses WebAudio ile üretilir. Mobil + masaüstü; klavye, dokunmatik, fare.

## 📁 Yapı
```
index.html              (arcade oyunu)
classic/index.html      (eski 2D mini-oyun sürümü)
css/arcade.css, css/style.css
js/i18n.js, js/audio.js
js/arcade/  sprites · ui · core · challenges · battle · route · scoreboard · main
docs/superpowers/specs/ (tasarım dokümanı)
```

---
*Eğitim amaçlı bir projedir. Biyoinformatik kavramları oyunlaştırılmış temsillerle anlatılır.*
