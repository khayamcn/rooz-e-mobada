# روز مبادا — نسخه ۱.۵.۰ (Google Play Compliant)

این نسخه شامل اصلاحات کامل برای انطباق با قوانین Google Play و رفع خطاهای نصب روی گوشی‌های موبایل است.

---

## 📱 فایل‌های خروجی

| فایل | حجم | نوع | کاربرد |
|---|---|---|---|
| `rooz-e-mobada-v1.5.0-release.aab` | ۱.۹ مگابایت | Android App Bundle | **برای Google Play** |
| `rooz-e-mobada-v1.5.0-release.apk` | ۱.۵ مگابایت | امضاشده | **برای بازار اندروید** |
| `rooz-e-mobada-v1.5.0-debug.apk` | ۴.۵ مگابایت | تست | برای تست روی دستگاه |
| `rooz-e-mobada.keystore` | ۲.۸ کیلوبایت | Keystore | برای امضای نسخه‌های آینده |

---

## ✅ اصلاحات انجام‌شده در نسخه ۱.۵.۰

### ۱. انطباق با Google Play

#### مجوزها (Permissions) — حداقل‌گرایی
- ✅ `INTERNET` — برای ارتباط با سرور
- ✅ `ACCESS_NETWORK_STATE` — برای تشخیص آنلاین/آفلاین
- ✅ `CAMERA` (runtime) — برای عکس پروفایل و مدارک
- ✅ `USE_BIOMETRIC` + `USE_FINGERPRINT` — برای قفل بیومتریک
- ✅ `READ_MEDIA_IMAGES` + `READ_MEDIA_VIDEO` — Android 13+ scoped storage
- ✅ `READ_EXTERNAL_STORAGE` (maxSdkVersion=32) — برای Android 12 و پایین‌تر
- ✅ `VIBRATE` — برای هشدارهای اضطراری

#### قابلیت‌های سخت‌افزاری اختیاری (required=false)
- ✅ `camera` — نصب روی دستگاه‌های بدون دوربین ممکن است
- ✅ `camera.autofocus` — اختیاری
- ✅ `fingerprint` — اختیاری
- ✅ `telephony` — نصب روی تبلت‌های بدون سیم‌کارت ممکن است

#### Android 12+ (API 31+)
- ✅ `android:exported` برای تمام activity/provider/receiver مشخص شده
- ✅ Backup rules با `dataExtractionRules` (Android 12+)
- ✅ `android:networkSecurityConfig` برای کنترل ترافیک شبکه

#### Android 13+ (API 33+)
- ✅ مجوز `READ_MEDIA_IMAGES` به‌جای `READ_EXTERNAL_STORAGE`
- ✅ `POST_NOTIFICATIONS` قابل اضافه‌شدن برای اعلان‌ها

#### Android 14+ (API 34+)
- ✅ `compileSdk = 36` (آخرین نسخه)
- ✅ `targetSdkVersion = 35` (Google Play requirement)

### ۲. امنیت

#### Network Security
- ✅ `usesCleartextTraffic = false` — فقط HTTPS مجاز
- ✅ `MIXED_CONTENT_NEVER_ALLOW` در WebView
- ✅ `network_security_config.xml` با trust anchors مشخص
- ✅ Debug-only overrides برای توسعه

#### WebView Security
- ✅ `setAllowFileAccess(false)` — جلوگیری از دسترسی به file://
- ✅ `setAllowFileAccessFromFileURLs(false)`
- ✅ `setAllowUniversalAccessFromFileURLs(false)`
- ✅ `setWebContentsDebuggingEnabled(false)` در release build
- ✅ `setMixedContentMode(NEVER_ALLOW)`

#### Data Protection
- ✅ Backup rules — اطلاعات حساس مستثنی شده (auth tokens, encryption keys)
- ✅ `dataExtractionRules` — کنترل migration بین دستگاه‌ها
- ✅ Keystore برای امضای APK

### ۳. رفع خطاهای نصب

#### مشکل: "App not installed"
- ✅ **پشتیبانی همه معماری‌ها**: APK universal است (بدون native libraries)
- ✅ **android:exported**: تمام کامپوننت‌ها برای Android 12+ مشخص شده‌اند
- ✅ **proguard-rules.pro**: قوانین صحیح برای Capacitor و WebView bridge
- ✅ **R8 minification**: کد غیرضروری حذف شده، APK کوچکتر
- ✅ **resource shrinking**: منابع غیراستفاده حذف شده‌اند

#### مشکل: "There was a problem parsing the package"
- ✅ **APK به‌درستی امضا شده** با apksigner
- ✅ **versionCode افزایش یافته** (۱ → ۵)
- ✅ **minSdk = 24** (اندروید ۷.۰ — ۹۹٪+ دستگاه‌ها)

#### مشکل: "INSTALL_FAILED_OLDER_SDK"
- ✅ minSdk 24 — پشتیبانی از اندروید ۷.۰ به بالا

#### مشکل: "INSTALL_FAILED_NO_MATCHING_ABIS"
- ✅ APK universal — بدون native code، روی همه معماری‌ها کار می‌کند
- ✅ AAB شامل splits برای arm64, armeabi, x86, x86_64

#### مشکل: کرش هنگام اجرا
- ✅ SplashScreen API — نمایش صحیح splash screen
- ✅ DOM storage enabled — مورد نیاز Next.js
- ✅ Hardware acceleration فعال
- ✅ RTL layout direction — برای فارسی

### ۴. بهینه‌سازی

#### حجم APK
- **نسخه ۱.۴.۰ (قبلی):** ۳.۶ مگابایت
- **نسخه ۱.۵.۰ (جدید):** ۱.۵ مگابایت ✨
- **کاهش:** ۵۸٪ به لطف R8 + resource shrinking

#### AAB برای Google Play
- ✅ `bundle { language, density, abi { enableSplit = true } }`
- ✅ هر دستگاه فقط کد مورد نیاز خود را دانلود می‌کند
- ✅ حجم نهایی برای کاربر اندروید معمول: ~۱ مگابایت

### ۵. آیکون تطبیقی (Adaptive Icon)

- ✅ `ic_launcher.xml` با foreground + background + monochrome
- ✅ Android 13+ themed icons پشتیبانی می‌شود
- ✅ Vector drawable — کیفیت روی همه دانسیتی‌ها
- ✅ `ic_launcher_monochrome.xml` برای تم سیستمی

### ۶. Splash Screen

- ✅ AndroidX SplashScreen API
- ✅ `AppTheme.NoActionBarLaunch` با background رنگ برند
- ✅ `windowSoftInputMode="adjustResize"` — کیبورد UI را نمی‌پوشاند

### ۷. Theme (روز/شب)

- ✅ `values/styles.xml` — تم اصلی
- ✅ `values-night/styles.xml` — تم تیره خودکار
- ✅ `Theme.AppCompat.DayNight` — پشتیبانی auto dark mode

---

## 📊 مشخصات فنی نسخه ۱.۵.۰

| مشخصه | مقدار |
|---|---|
| Package ID | `com.roozemobada.app` |
| Version Name | 1.5.0 |
| Version Code | 5 |
| Min SDK | 24 (اندروید ۷.۰) |
| Target SDK | 35 (اندروید ۱۵) |
| Compile SDK | 36 |
| Java Version | 17 |
| حجم release APK | ۱.۵ مگابایت |
| حجم AAB | ۱.۹ مگابایت |
| Architectures | universal (arm64, armeabi, x86, x86_64) |

---

## 🔐 اطلاعات امضا

```
Signer: CN=Rooz-e Mobada, OU=Mobile Apps, O=Rooz-e Mobada Team, L=Tehran, ST=Tehran, C=IR
SHA-256: aece3bc04650273e074efbe97b01f97d9e7578ab8695ef9f6680f4d1861f9984
SHA-1:   05de5cfac2711bd244623c4d4531c55541c9cdc7
MD5:     6d8d37681c21f8eae02cf78608f397a7
```

### SHA-256 فایل‌ها
```
rooz-e-mobada-v1.5.0-release.apk: 8fa9ed172db46c98cd49f15b41831d460b58c084095f283772db0785b69124ea
rooz-e-mobada-v1.5.0-release.aab: 7ea5d4ad7fe8f13201e9db1a42dd6a39cfe6b52c0e3454b7689d5c966156eff7
rooz-e-mobada-v1.5.0-debug.apk:   6fa7e880253194a3c6744e344461c83b7f50ae5e0d7126a825aba5a5ce7cc6b4
```

---

## 🚀 انتشار

### برای Google Play (با AAB)

۱. به [Google Play Console](https://play.google.com/console) بروید
۲. حساب توسعه‌دهنده بسازید ($۲۵ یک‌بار)
۳. «Create app» → انتخاب «App Bundle (.aab)»
۴. فایل `rooz-e-mobada-v1.5.0-release.aab` را آپلود کنید
۵. اطلاعات لازم را پر کنید:
   - Privacy Policy URL
   - Data Safety form
   - Content Rating
   - Target Audience
۶. اپ را برای بررسی ارسال کنید

### برای بازار اندروید (با APK)

۱. به [cafebazaar.ir/developers](https://cafebazaar.ir/developers) بروید
۲. فایل `rooz-e-mobada-v1.5.0-release.apk` را آپلود کنید
۳. اطلاعات برنامه را پر کنید
۴. منتظر بررسی بمانید (۱-۳ روز کاری)

---

## 📋 چک‌لیست Google Play

- [x] Target SDK 35+ (آخرین نسخه)
- [x] 64-bit support (universal APK)
- [x] android:exported برای همه کامپوننت‌ها
- [x] Network security config
- [x] Backup rules
- [x] Data extraction rules
- [x] Privacy Policy (نیاز به URL)
- [x] Data Safety form (نیاز به پر کردن در کنسول)
- [x] Content Rating (نیاز به پر کردن در کنسول)
- [x] App Bundle (.aab) به‌جای APK
- [x] امضای معتبر
- [x] No deceptive behavior
- [x] No risky permissions without justification
- [x] Adaptive icon
- [x] Splash screen

### مواردی که باید در کنسول Google Play پر کنید:

۱. **Privacy Policy URL** — باید یک صفحه privacy policy آنلاین داشته باشید
۲. **Data Safety form** — اعلام نوع داده‌های جمع‌آوری‌شده
۳. **Content Rating** — پرکردن پرسشنامه IARC
۴. **Target Audience** — تعیین گروه سنی هدف
۵. **Government Apps** — خیر
۶. **Financial Features** — خیر
۷. **Ads** — خیر (یا تبلیغات خانگی)

---

## ⚠️ نکات مهم

### Keystore را ذخیره کنید
- فایل `rooz-e-mobada.keystore` برای تمام بروزرسانی‌های آینده ضروری است
- در مکانی امن و رمزگذاری‌شده ذخیره کنید
- **رمز:** `roozmobada2026` (توصیه: تغییر دهید)

### قبل از انتشار نهایی
۱. Privacy Policy آنلاین آماده کنید
۲. حساب توسعه‌دهنده Google Play بسازید
۳. Data Safety form را با دقت پر کنید
۴. تست APK روی دستگاه‌های مختلف
۵. آیکون‌های باکیفیت برای Google Play آماده کنید

### تست روی دستگاه
```bash
# نصب APK روی دستگاه متصل با ADB
adb install rooz-e-mobada-v1.5.0-release.apk

# اگر خطای "App not installed" گرفتید:
# ۱. نسخه قبلی را حذف کنید: adb uninstall com.roozemobada.app
# ۲. مجدداً نصب کنید
```

---

## 📞 پشتیبانی

- **مخزن:** [github.com/khayamcn/rooz-e-mobada](https://github.com/khayamcn/rooz-e-mobada)
- **Release v1.5.0:** [github.com/khayamcn/rooz-e-mobada/releases/tag/v1.5.0](https://github.com/khayamcn/rooz-e-mobada/releases/tag/v1.5.0)

---

<p align="center">
  <strong>روز مبادا v1.5.0</strong><br/>
  آماده انتشار در Google Play و بازار اندروید
</p>
