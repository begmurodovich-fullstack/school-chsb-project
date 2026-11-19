# BSB / CHSB Baholash — maktab sayti (GitHub + Vercel + Supabase)

Mavjud dasturning barcha funksiyalari (baholash, sinf bazasi, arxiv, hisobot, PDF/Excel, grafiklar) saqlangan.
Farqi: ma'lumotlar brauzerda emas, Supabase'da, har bir o'qituvchining o'z hisobida saqlanadi (login orqali).

## Tuzilma
- `src/app.html` — asl dastur (o'zgartirilmagan)
- `src/cloud.js` — login + Supabase saqlash qatlami
- `build.js` — ikkisini birlashtirib `dist/` yaratadi (Vercel buni ishga tushiradi)
- `supabase/schema.sql` — jadval va xavfsizlik qoidalari

## 1. Supabase
1. supabase.com → New project.
2. SQL Editor → `supabase/schema.sql` ni joylab Run.
3. Project Settings → API: `Project URL` va `anon public` kalitini oling.
4. (Ixtiyoriy) Authentication → Providers → Email → "Confirm email" ni o'chirsangiz, ro'yxatdan o'tgan zahoti kirish mumkin.

## 2. Mahalliy sinash
```bash
SUPABASE_URL=https://XXXX.supabase.co SUPABASE_ANON_KEY=... node build.js
npx serve dist
```
(Windows PowerShell: `$env:SUPABASE_URL="..."; $env:SUPABASE_ANON_KEY="..."; node build.js`)

## 3. GitHub
```bash
git init && git add . && git commit -m "BSB/CHSB sayt"
git branch -M main
git remote add origin https://github.com/<login>/<repo>.git
git push -u origin main
```

## 4. Vercel
1. vercel.com → Add New → Project → GitHub repo'ni tanlang (Framework: Other).
2. Environment Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
3. Deploy. Keyin Supabase → Authentication → URL Configuration → Site URL ga Vercel manzilini kiriting.

## Eski dasturdagi ma'lumotlarni ko'chirish
Eski .exe da "Ma'lumot ko'chirish" oynasidan kod oling, saytda xuddi shu oynada joylashtiring — arxiv va sinf ro'yxatlari bulutga yoziladi.

## Eslatmalar
- `anon` kalit ochiq bo'lishi normal; ma'lumotni RLS qoidalari himoya qiladi. `service_role` kalitni hech qachon qo'ymang.
- Maktab nomini o'zgartirish paroli (`PROTECTED_PASSWORD`) hamon `src/app.html` ichida — brauzerda ko'rinadi, jiddiy himoya emas.
- Hozir har bir o'qituvchi o'z ma'lumotini ko'radi. Butun maktab uchun umumiy arxiv kerak bo'lsa, keyingi bosqichda qo'shamiz.
