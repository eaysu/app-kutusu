# Deploy

Bu uygulamayı Vercel olmadan deploy etmenin iki temiz yolu var. Her ikisinde de
depolama (Supabase) ve LLM (OpenAI) zaten harici servisler — sadece Next.js
sunucusunu host etmen yeter.

Hangi yolu seçersen seç önce şu üç ortam değişkenini hazırla:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-...
```

> Not: `NEXT_PUBLIC_*` build sırasında bundle'a gömüldüğü için image inşa
> aşamasında da ulaşılabilir olmalı. Service role anahtarı yalnızca sunucuda
> okunur — istemciye gitmez.

Schema'yı Supabase SQL editör'ünde `supabase/schema.sql` ile bir kez çalıştırmayı
unutma.

---

## Seçenek A — Hetzner VPS + Coolify (önerilen)

Plan dosyasındaki yol. ~€4–5/ay, full kontrol, otomatik Let's Encrypt SSL.

### 1. Hetzner'da sunucu aç

`https://console.hetzner.cloud` → New Project → Add Server:

- Image: **Ubuntu 24.04**
- Type: **CX22** (2 vCPU / 4 GB) yeterli; ARM **CAX11** daha ucuz
- Location: AB için Falkenstein / Helsinki, MENA için Ashburn'a yakın bölge yok — Helsinki en yakını
- SSH key: lokalde yoksa `ssh-keygen -t ed25519`, public key'i yapıştır
- Firewall: 22, 80, 443, 8000 portlarına izin ver

Sunucu açıldıktan sonra IP'yi al, SSH ile gir:

```bash
ssh root@<server-ip>
```

### 2. Coolify kur

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

5–10 dakika sürer. Bittiğinde `http://<server-ip>:8000` adresinden Coolify
dashboard'una erişebilirsin. İlk girişte admin hesabı yarat.

### 3. Domain bağla (opsiyonel ama önerilen)

DNS sağlayıcında A kaydı:

```
appkutusu.example.com  →  <server-ip>
```

Coolify dashboard → Settings → Domains → instance domain'ini set et. Coolify
Let's Encrypt'i otomatik halleder.

### 4. Repo'yu Coolify'a tanıt

1. GitHub'a push: `cd app && git init && git remote add origin <repo>`
2. Coolify → New Resource → **Public Repository** veya GitHub App
3. Repo URL'sini ver
4. **Build pack: Dockerfile** seç (repo'daki `Dockerfile` otomatik kullanılır)
5. **Ports**: 3000

### 5. Env değişkenlerini ekle

Coolify → resource → **Environment Variables**:

| Key | Scope | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Build + Runtime | Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime | Service role anahtarı |
| `OPENAI_API_KEY` | Runtime | OpenAI anahtarı |

`NEXT_PUBLIC_SUPABASE_URL` için **"Available at Buildtime"** kutusunu işaretle —
yoksa istemci tarafında `undefined` görür.

### 6. Deploy

Coolify → **Deploy**. İlk build ~3–5 dakika sürer (npm install + next build).
Bittiğinde domain'ine git, çalıştığını gör.

Bir sonraki deploy'da: `git push` → Coolify otomatik build + deploy. İstersen
PR preview branch'leri de kurabilir.

---

## Seçenek B — Fly.io

Tek komutla, ücretsiz tier'a yakın. Coolify'a göre VPS yönetmen gerekmez.

### 1. flyctl kur ve login ol

```bash
brew install flyctl     # macOS
fly auth signup         # ya da fly auth login
```

### 2. App'i oluştur

`app/` klasörünün içinden:

```bash
fly launch --no-deploy
```

`fly launch` Dockerfile'ı algılayacak. Sorularda:

- Region: `fra` (Frankfurt) veya `ams` (Amsterdam)
- Postgres / Redis: **No** (Supabase kullanıyoruz)
- Deploy now: **No**

### 3. Secrets ekle

```bash
fly secrets set \
  NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  OPENAI_API_KEY="sk-..."
```

`NEXT_PUBLIC_*` Fly'da build-args olarak da geçirilmeli. `fly.toml`'a şu bloğu
ekle:

```toml
[build.args]
  NEXT_PUBLIC_SUPABASE_URL = "https://<project-ref>.supabase.co"
```

### 4. Deploy

```bash
fly deploy
```

İlk deploy ~4–5 dakika. Bittiğinde URL'ini verir (`<app>.fly.dev`). Custom
domain için `fly certs add appkutusu.example.com` ve DNS'te CNAME.

---

## Seçenek C — Kendi Docker host'un (VPS, Kubernetes, Render, Railway…)

Repo'da hazır `Dockerfile` ve `.dockerignore` var. Bu image'i istediğin yerde
çalıştırabilirsin.

### Lokalde build + run

```bash
cd app
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co" \
  -t app-kutusu:latest .

docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co" \
  -e SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  -e OPENAI_API_KEY="sk-..." \
  app-kutusu:latest
```

`http://localhost:3000` üzerinden test et.

### Render / Railway

- New Web Service → Dockerfile
- Env vars'ı yukarıdaki gibi gir (`NEXT_PUBLIC_*` build-arg olarak da)
- Port: 3000

---

## Deploy sonrası kontrol listesi

- [ ] Anasayfa 200 dönüyor, içerikler localized
- [ ] Bir fikir gönder, Supabase Table Editor'de `ideas` tablosunda satır var
- [ ] AI analizi 5–10 saniye içinde "Analiz ediliyor..." durumundan gerçek
      sonuca geçiyor; `ai_analysis` jsonb'sinde `tr` ve `en` anahtarları var
- [ ] TR/EN toggle her iki dilde de doğru çalışıyor
- [ ] Cookie `ak_sid` `Secure` flag'iyle set ediliyor (DevTools → Application →
      Cookies)
- [ ] OpenAI Usage dashboard'da çağrı sayısı = oluşturduğun fikir sayısı (cache
      doğru çalışıyor mu kontrolü)

## Maliyet tahmini

| Servis | Tahmini aylık |
|---|---|
| Hetzner CX22 | ~€4.5 |
| Coolify | ücretsiz (open-source) |
| Supabase Free | ücretsiz (500 MB DB, 50k MAU) |
| OpenAI gpt-5-mini | ~$0.001–0.002 / yeni fikir analizi |
| Domain | ~$10–15 / yıl |

İlk birkaç yüz fikre kadar fiili masraf sadece VPS + domain.
