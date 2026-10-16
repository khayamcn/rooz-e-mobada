# روز مبادا — خروجی APK نسخه ۱.۴.۰

این پوشه شامل فایل‌های APK آماده نصب و انتشار اپلیکیشن «روز مبادا» است.

---

## 📱 فایل‌های موجود

| فایل | حجم | نوع | کاربرد |
|---|---|---|---|
| `rooz-e-mobada-v1.4.0-release.apk` | ۳.۶ مگابایت | امضاشده | **بر انتشار در بازار** |
| `rooz-e-mobada-v1.4.0-debug.apk` | ۴.۵ مگابایت | تست | برای تست روی دستگاه خود |
| `rooz-e-mobada.keystore` | ۲.۸ کیلوبایت | Keystore | **نگه دارید — برای بروزرسانی‌های آینده** |

---

## 🔐 اطلاعات امضا (Release APK)

- **Package ID:** `com.roozemobada.app`
- **Version Name:** 1.4.0
- **Version Code:** 4
- **Min SDK:** 24 (اندروید ۷.۰ نوقا به بالا)
- **Target SDK:** 36
- **امضا:** SHA-256: `aece3bc04650273e074efbe97b01f97d9e7578ab8695ef9f6680f4d1861f9984`
- **صادرکننده:** CN=Rooz-e Mobada, OU=Mobile Apps, O=Rooz-e Mobada Team, L=Tehran, ST=Tehran, C=IR

### checksums (SHA-256)

```
release: def64114d1c8b69867bd9e14f2ea44d4b0fe04923e16129823fac9d1bd90f8fe
debug:   2d28e69402ca121cdff07caa4d87cdb46406f219ef1ff45f36603214262c7f84
```

---

## 🚀 انتشار در بازار اندروید

### مرحله ۱: ثبت‌نام در بازار

۱. به [cafebazaar.ir/developers](https://cafebazaar.ir/developers) بروید
۲. حساب توسعه‌دهنده بسازید (نیازمند تأیید هویت)
۳. روی «برنامه جدید» کلیک کنید

### مرحله ۲: تکمیل اطلاعات برنامه

| فیلد | مقدار |
|---|---|
| نام برنامه | روز مبادا |
| package name | com.roozemobada.app |
| دسته‌بندی | کاربردی (Utilities) یا سبک زندگی |
| توضیح کوتاه | پرونده اضطراری خانواده با فضای ابری خصوصی |
| نسخه | ۱.۴.۰ |

### مرحله ۳: آپلود فایل APK

۱. فایل `rooz-e-mobada-v1.4.0-release.apk` را آپلود کنید
۲. بازار به‌صورت خودکار امضای APK را تأیید می‌کند
۳. آیکون و تصاویر نمایشی را آپلود کنید (می‌توانید از `public/icon-512.png` استفاده کنید)

### مرحله ۴: منتظر بررسی

- بازار معمولاً ۱ تا ۳ روز کاری برای بررسی طول می‌کشد
- پس از تأیید، برنامه در دسترس کاربران قرار می‌گیرد

---

## ⚠️ نکات امنیتی مهم

### Keystore را نگه دارید!

فایل `rooz-e-mobada.keystore` حیاتی است:

- **برای بروزرسانی برنامه** در بازار، باید همان keystore استفاده شود
- اگر keystore را گم کنید، نمی‌توانید نسخه جدید منتشر کنید (باید برنامه را حذف و دوباره بسازید)
- در مکانی امن (پشتیبان‌گیری ابری رمزگذاری‌شده) ذخیره کنید

### رمزهای Keystore

```
Store password: roozmobada2026
Key alias: rooz-mobada
Key password: roozmobada2026
```

⚠️ **این رمزها را تغییر دهید** قبل از انتشار نهایی. برای تولید keystore جدید با رمز خودتان:

```bash
keytool -genkeypair -v \
  -keystore my-release.keystore \
  -alias my-alias \
  -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STRONG_PASSWORD \
  -keypass YOUR_STRONG_PASSWORD \
  -dname "CN=Your Name, O=Your Org, L=Tehran, C=IR"
```

سپس فایل `android/keystore.properties` را به‌روزرسانی کنید و دوباره APK را بسازید:

```bash
cd android
./gradlew assembleRelease
```

---

## 🧪 تست APK روی دستگاه

### روش ۱: نصب مستقیم

۱. فایل `rooz-e-mobada-v1.4.0-debug.apk` را به گوشی خود منتقل کنید
۲. در تنظیمات اندروید، «نصب از منابع ناشناخته» را فعال کنید
۳. روی APK ضربه بزنید تا نصب شود

### روش ۲: نصب از طریق ADB

```bash
# نصب Android Platform Tools
# https://developer.android.com/studio/releases/platform-tools

# اتصال گوشی با USB Debugging
adb install rooz-e-mobada-v1.4.0-release.apk
```

---

## 🔧 ساخت مجدد APK (برای توسعه‌دهنده)

اگر کد را تغییر دادید و می‌خواهید APK جدید بسازید:

```bash
# ۱. نصب وابستگی‌ها
cd /path/to/rooz-e-mobada
bun install

# ۲. ساخت خروجی استاتیک Next.js
bun run build

# ۳. همگام‌سازی Capacitor
npx cap sync android

# ۴. ساخت APK (debug یا release)
cd android
./gradlew assembleDebug      # برای تست
./gradlew assembleRelease    # برای انتشار

# ۵. APK خروجی در:
# debug:   android/app/build/outputs/apk/debug/app-debug.apk
# release: android/app/build/outputs/apk/release/app-release.apk
```

### پیش‌نیازها

- Node.js 18+ یا Bun
- Java JDK 21
- Android SDK (Platform 35, Build-tools 35.0.0)

---

## 📊 مشخصات فنی APK

| مشخصه | مقدار |
|---|---|
| اندازه (release) | ۳.۶ مگابایت |
| اندازه (debug) | ۴.۵ مگابایت |
| Application ID | com.roozemobada.app |
| Minimum SDK | 24 (اندروید ۷.۰) |
| Target SDK | 36 |
| Compile SDK | 35 |
| WebView | Android System WebView |
| Architecture | universal (arm64, armeabi, x86, x86_64) |
| Permissions | INTERNET |

---

## 🛠️ ساختار APK

APK از طریق Capacitor ساخته شده:

```
APK
├── assets/public/              # خروجی استاتیک Next.js
│   ├── index.html
│   ├── _next/                  # جاوااسکریپت و CSS
│   ├── manifest.webmanifest
│   └── icon-*.png
├── classes.dex                # کد اندروید Capacitor
├── res/                       # منابع اندروید
│   ├── values/strings.xml     # نام فارسی برنامه
│   ├── values/colors.xml      # رنگ‌های برند
│   └── mipmap/                # آیکون‌ها
└── AndroidManifest.xml        # تنظیمات برنامه
```

---

## 📞 پشتیبانی

- **مخزن GitHub:** [khayamcn/rooz-e-mobada](https://github.com/khayamcn/rooz-e-mobada)
- **مستندات:** فایل‌های `download/FIREBASE-ARCHITECTURE.md` و `download/firestore.rules`
- **README اصلی:** در ریشه پروژه

---

<p align="center">
  <strong>روز مبادا v1.4.0</strong><br/>
  ساخته‌شده با ❤️ برای خانواده‌های ایرانی
</p>
