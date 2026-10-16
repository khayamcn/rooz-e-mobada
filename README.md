# روز مبادا — پرونده اضطراری خانواده

<p align="center">
  <img src="public/icon.svg" alt="روز مبادا" width="120" height="120" />
</p>

<p align="center">
  اپلیکیشن اندرویدی پرونده دیجیتال اضطراری خانواده<br/>
  دسترسی آفلاین به مدارک، تماس‌های ضروری، راهنماهای بحران و فضای ابری خصوصی
</p>

<p align="center">
  <strong>نسخه:</strong> ۱.۴.۰ ·
  <strong>پلتفرم:</strong> PWA → APK (اندروید) ·
  <strong>زبان:</strong> فارسی (RTL)
</p>

---

## 📖 معرفی

«روز مبادا» یک اپلیکیشن موبایل است که به خانواده‌های ایرانی اجازه می‌دهد اطلاعات حیاتی خود را در یک پرونده دیجیتال امن و خصوصی نگه‌داری کنند. این برنامه طوری طراحی شده که حتی在没有 اینترنت نیز قابل استفاده باشد و اطلاعات ضروری هنگام بحران در دسترس باشند.

### ویژگی‌های کلیدی

- 🔐 **احراز هویت چندگانه**: ورود با Google، شماره موبایل (OTP) یا کد دعوت خانواده
- 👨‍👩‍👧‍👦 **مدیریت خانواده**: نقش‌های سرپرست، ویرایشگر و مشاهده‌گر با کنترل دسترسی
- 📁 **فضای ابری خصوصی**: پوشه‌ها، فایل‌ها، سطل بازیافت، سهمیه مصرفی و تاریخچه فعالیت
- 📄 **مدارک شخصی**: ۶ دسته برای هر عضو — اطلاعات فردی، شناسایی، تحصیلی، رمزها، پزشکی، مالی
- 📋 **کپی سریع**: دکمه کپی در کنار کد ملی، شماره موبایل، شماره سند و...
- 🚨 **هشدارهای انقضا**: یادآوری تاریخ انقضای بیمه‌نامه‌ها و مدارک
- ☁️ **فضای آفلاین**: ذخیره محلی اطلاعات متنی، دسترسی بدون اینترنت
- 🌗 **حالت روز/شب**: تم کامل با گرادیان بنفش/سرمه‌ای
- 💾 **پشتیبان‌گیری**: خروجی و بازیابی فایل JSON رمزگذاری‌شده
- 📚 **راهنماهای اضطراری**: CPR، زلزله، آتش‌سوزی و شیرهای اصلی منزل

---

## 🛠️ تکنولوژی‌ها

| بخش | تکنولوژی |
|---|---|
| فرانت‌اند | Next.js 16, React 19, TypeScript 5 |
| استایل | Tailwind CSS 4, shadcn/ui |
| مدیریت حالت | Zustand + persist middleware |
| انیمیشن | Framer Motion |
| آیکون‌ها | Lucide React |
| فونت | Vazirmatn (فارسی) |
| تاریخ | جلالی/شمسی (تبدیل داخلی بدون وابستگی) |
| PWA | manifest.webmanifest + Service Worker |

---

## 🚀 شروع سریع

### پیش‌نیازها

- Node.js 18+ یا Bun
- npm / yarn / bun

### نصب و اجرا

```bash
# کلون مخزن
git clone https://github.com/YOUR_USERNAME/rooz-e-mobada.git
cd rooz-e-mobada

# نصب وابستگی‌ها
bun install
# یا
npm install

# اجرای محیط توسعه
bun run dev
# یا
npm run dev

# بررسی کیفیت کد
bun run lint
```

برنامه روی `http://localhost:3000` در دسترس است.

---

## 📂 ساختار پروژه

```
rooz-e-mobada/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # ریشه‌ی برنامه + Theme Bootstrap
│   │   ├── page.tsx                  # مسیریابی اصلی (auth/main-app)
│   │   └── globals.css               # طراحی سیستم: تم‌ها، رنگ‌ها، utilities
│   │
│   ├── components/
│   │   ├── auth/                     # جریان احراز هویت
│   │   │   ├── auth-flow.tsx         # splash → onboarding → login → OTP → family
│   │   │   └── login-screen.tsx      # صفحه ورود با Google + موبایل + کد دعوت
│   │   ├── onboarding/               # معرفی اولیه ۵ اسلایدی
│   │   │   └── onboarding.tsx
│   │   ├── screens/                  # صفحات اصلی
│   │   │   ├── home.tsx              # داشبورد
│   │   │   ├── documents.tsx         # مدارک (۶ دسته برای هر عضو)
│   │   │   ├── contacts.tsx          # تماس‌های ضروری و راهنماها
│   │   │   ├── cloud.tsx             # فضای ابری (Google Drive-like)
│   │   │   ├── family.tsx            # مدیریت خانواده و نقش‌ها
│   │   │   ├── settings.tsx          # پشتیبان، بروزرسانی، Drive
│   │   │   └── sync.tsx              # مرکز همگام‌سازی و حل تعارض
│   │   ├── shared/                   # کامپوننت‌های مشترک
│   │   │   ├── copyable-field.tsx    # فیلد با دکمه کپی
│   │   │   ├── profile-avatar.tsx    # آواتار با عکس پروفایل
│   │   │   ├── image-uploader.tsx    # بارگذاری تصویر
│   │   │   ├── sheet.tsx             # مودال پایین صفحه
│   │   │   ├── ads-banner.tsx        # بنر تبلیغات بازار
│   │   │   └── ui.tsx                # AppCard, StatusBadge, ...
│   │   ├── phone-frame.tsx           # قاب موبایل + نوار وضعیت + Theme Toggle
│   │   └── bottom-nav.tsx            # نوار ناوبری پایین
│   │
│   ├── lib/
│   │   ├── types.ts                  # تایپ‌های دامنه (۱۰+ موجودیت)
│   │   ├── store.ts                  # Zustand store با persist
│   │   ├── mock-data.ts              # داده‌های نمونه فارسی
│   │   ├── persian.ts                # تبدیل ارقام فارسی
│   │   ├── jalali.ts                 # تاریخ شمسی
│   │   ├── db.ts                     # Prisma client
│   │   └── utils.ts                  # ابزارهای عمومی
│   │
│   └── hooks/
│       ├── use-toast.ts
│       └── use-mobile.ts
│
├── prisma/
│   └── schema.prisma                 # اسکیمای پایگاه داده
│
├── public/
│   ├── icon.svg                      # آیکون برنامه
│   ├── manifest.webmanifest          # PWA manifest
│   └── robots.txt
│
├── scripts/
│   └── generate-icons.py             # تولید آیکون‌های PWA
│
├── download/                         # فایل‌های قابل تحویل
│   ├── FIREBASE-ARCHITECTURE.md
│   ├── firestore.rules
│   ├── storage.rules
│   ├── .env.example
│   └── supabase-migrations-*.sql     # (نسخه قبلی Supabase)
│
├── .env.example                      # نمونه متغیرهای محیطی
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## 🔐 امنیت

### قابلیت‌های پیاده‌سازی‌شده

- احراز هویت چندمرحله‌ای (OTP + اختیاری کد ملی)
- نقش‌های دسترسی: سرپرست، ویرایشگر، مشاهده‌گر
- کد دعوت با انقضا ۷ روزه و قابلیت ابطال
- خصوصی‌سازی فایل‌ها و پوشه‌ها
- سطل بازیافت با نگهداری ۳۰ روزه
- پشتیبان‌گیری رمزگذاری‌شده
- قفل برنامه با اثر انگشت/PIN (آماده در UI)
- ثبت رویدادهای امنیتی (audit log)

### سیاست‌های RLS (آماده برای تولید)

فایل‌های زیر برای راه‌اندازی Firebase واقعی آماده شده‌اند:

- `download/firestore.rules` — قوانین Cloud Firestore با `isFamilyMember`, `isFamilyAdmin`, `isFamilyEditor`
- `download/storage.rules` — قوانین Cloud Storage با اعتبارسنجی نوع و حجم فایل

### محدودیت‌های صریح این نسخه دمو

| مورد | وضعیت |
|---|---|
| OTP واقعی | شبیه‌سازی (کد: ۱۲۳۴۵) |
| Google Sign-In واقعی | شبیه‌سازی (نیاز به Firebase) |
| Cloud Firestore/Storage | localStorage (نیاز به پروژه Firebase) |
| App Check / Play Integrity | نیاز به راه‌اندازی |
| رمزنگاری سرتاسری (E2E) | پیاده‌سازی نشده — باید client-side اضافه شود |
| SMS OTP (کاوه‌نگار) | نیاز به اتصال provider |

---

## 📱 ساخت APK برای بازار اندروید

### روش ۱: PWABuilder (ساده‌ترین)

1. برنامه را روی یک هاست عمومی (Vercel, Netlify) مستقر کنید
2. به [PWABuilder](https://www.pwabuilder.com) بروید
3. URL خود را وارد کنید
4. APK تولیدشده را دانلود کنید
5. با keystore خود امضا کنید
6. در [بازار اندروید](https://cafebazaar.ir) منتشر کنید

### روش ۲: Capacitor (نیتیو)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "روز مبادا" "com.roozemobada.app"
npx cap add android
npx cap sync
npx cap open android  # باز در Android Studio
# Build → Generate Signed APK
```

---

## 🌗 حالت روز/شب

برنامه دارای تم کامل روز/شب است:

- **حالت روز**: گرادیان روشن (`#F4F4F8` → `#ECEAF5`) با کارت‌های سفید
- **حالت شب**: گرادیان تیره (`#0B0F1E` → `#1B1530`) با کارت‌های نیمه‌شفاف
- رنگ برند: بنفش `#8B5CF6` (Violet-500)
- ذخیره خودکار انتخاب کاربر

---

## 📋 قابلیت کپی

دکمه کپی در کنار تمام اطلاعات مهم:

- کد ملی
- شماره موبایل
- شماره سند
- پلاک خودرو
- آدرس
- یادداشت‌های پزشکی
- نام کاربری و گذرواژه (در دسته credentials)
- کد دعوت خانواده

---

## 🧪 تست

```bash
# بررسی کیفیت کد
bun run lint

# اجرای محیط توسعه
bun run dev
```

تست تعاملی با Agent Browser در همه جریان‌ها انجام شده:
- ✅ معرفی اولیه ۵ اسلایدی
- ✅ ورود با Google + موبایل + کد دعوت
- ✅ ایجاد خانواده و دعوت اعضا
- ✅ مدیریت نقش‌ها (انتقال سرپرستی، لغو دسترسی)
- ✅ فضای ابری (پوشه، فایل، بازیافت)
- ✅ حالت روز/شب
- ✅ کپی فیلدها
- ✅ پشتیبان‌گیری و بازیابی

---

## 📊 برآورد هزینه (ماهانه)

| سرویس | پلن پیشنهادی | هزینه |
|---|---|---|
| Firebase (Free) | ۵۰۰MB Firestore, ۵GB Storage | رایگان |
| Firebase (Blaze) | ۸GB Firestore, ۱۰۰GB Storage | ~$۲۵ |
| SMS OTP (کاوه‌نگار) | هر پیامک ~۳۵۰ تومان | بسته به کاربر |
| هاست Next.js (Vercel) | پلن رایگان | رایگان |
| بازار اندروید | انتشار رایگان، ۳۰٪ از فروش | — |

**برای ۱۰۰ کاربر فعال:** ~۵۰۰ هزار تومان/ماه
**برای ۱۰۰۰ کاربر:** ~۲ میلیون تومان/ماه

---

## 🤝 مشارکت

1. مخزن را Fork کنید
2. شاخه جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را Commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request باز کنید

---

## 📜 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است. فایل `LICENSE` را ببینید.

---

## ⚠️ اعلام صادقانه محدودیت‌ها

این نسخه یک **دموی تعاملی** است. برای استفاده تولیدی:

1. یک پروژه Firebase واقعی ایجاد کنید
2. فایل‌های `firestore.rules` و `storage.rules` را اعمال کنید
3. SDK Firebase را در `src/lib/store.ts` جایگزین mock backend کنید
4. اتصال SMS provider (کاوه‌نگار) را برقرار کنید
5. با Capacitor یا PWABuilder APK تولید کنید

ادعای رمزنگاری سرتاسری (E2E) نمی‌کنیم. اگر نیاز است، باید قبل از آپلود با کلیدهای کاربر (client-side AES-GCM) رمزگذاری کنید.

---

## 📞 تماس

- **سازنده:** تیم روز مبادا
- **پلتفرم:** [بازار اندروید](https://cafebazaar.ir)
- **مستندات:** فایل‌های `download/` را ببینید

---

<p align="center">
  ساخته‌شده با ❤️ برای خانواده‌های ایرانی<br/>
  <em>«برای روز مبادا»</em>
</p>
