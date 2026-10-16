# روز مبادا — سند معماری و پیاده‌سازی

**نسخه:** ۱.۲.۰
**تاریخ:** ۱۴۰۵/۰۷/۲۳
**پلتفرم هدف:** اندروید (PWA → APK از طریق PWABuilder یا Capacitor)

## ۱. نمای کلی معماری

```
┌─────────────────────────────────────────────────────────────┐
│                  Android App (PWA → APK)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth Flow  │  │   Main App   │  │   Cloud      │      │
│  │              │  │              │  │   Drive      │      │
│  │ - Splash     │  │ - Home       │  │              │      │
│  │ - Signup     │  │ - Documents  │  │ - Folders    │      │
│  │ - OTP        │  │ - Contacts   │  │ - Files      │      │
│  │ - Family     │  │ - Family     │  │ - Trash      │      │
│  │   create/join│  │ - Settings   │  │ - Activity   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  State Layer (Zustand + persist)                 │       │
│  │  - auth (user, session, pendingOtp)              │       │
│  │  - theme (light/dark)                            │       │
│  │  - members (with profile photos)                 │       │
│  │  - documents (per-member categories)             │       │
│  │  - credentials (usernames/passwords)            │       │
│  │  - cloud (folders, files, activity, quota)       │       │
│  │  - backup state                                  │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Mock Backend Layer (این نسخه)                    │       │
│  │  - OTP = "12345" (نمایش در UI)                    │       │
│  │  - Storage = localStorage / IndexedDB             │       │
│  │  - No network calls                               │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ (در نسخه نهایی)
┌─────────────────────────────────────────────────────────────┐
│              Production Backend (Supabase)                    │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth + OTP  │  │ PostgreSQL   │  │   Storage    │      │
│  │  (SMS via    │  │ + RLS        │  │   (private   │      │
│  │   provider)  │  │  policies    │  │    bucket)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Edge Functions (idempotency, quota enforcement,  │       │
│  │  file type validation, signed URL generation)    │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## ۲. جریان ثبت‌نام و عضویت

```
┌─────────────┐
│   Splash    │ ← کاربر روی «شروع استفاده» کلیک می‌کند
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Signup    │ ← نام + موبایل + (اختیاری) کد ملی
└──────┬──────┘
       │
       │ store.signup() →
       │   - تولید OTP تصادفی
       │   - ذخیره hash شده در otp_requests
       │   - ارسال پیامک (در تولید)
       │   - نمایش کد در UI دمو
       ▼
┌─────────────┐
│     OTP     │ ← ۵ رقم وارد می‌شود
└──────┬──────┘
       │
       │ store.verifyOtp() →
       │   - بررسی hash با رکورد ذخیره شده
       │   - بررسی انقضا و تعداد تلاش
       │   - ایجاد نشست (token, expires_at)
       │   - مسیریابی بر اساس وضعیت خانواده
       ▼
   ┌───────────┐
   │ خانواده؟  │
   └─────┬─────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│ Create │ │  Join  │
│Family  │ │Family  │
└────┬───┘ └────┬───┘
     │          │
     │          │ کد ۶ رقمی وارد می‌شود
     │          │
     │          │ store.joinFamily() →
     │          │   - بررسی code_hash در family_invitations
     │          │   - بررسی انقضا و ابطال
     │          │   - بررسی max_uses
     │          │   - ثبت membership با role='editor'
     │          ▼
     │      ┌─────────┐
     │      │ Main App│
     │      └─────────┘
     │
     │ store.createFamily() →
     │   - INSERT در families
     │   - INSERT در family_members با role='admin'
     │   - تولید invite_code (۶ کاراکتر، chars بدون ابهام)
     │   - INSERT در family_invitations با expires_at = +۷ روز
     │   - نمایش کد در UI
     ▼
 ┌─────────┐
 │ Main App│
 └─────────┘
```

## ۳. مدل داده (خلاصه)

نمودار ERD کامل در فایل `supabase-migrations-01-schema.sql` قرار دارد. موجودیت‌های کلیدی:

| جدول | کلید اصلی | روابط کلیدی | هدف |
|---|---|---|---|
| `users` | id (UUID) | ↔ families | حساب کاربری |
| `families` | id | → owner_id | پرونده خانواده |
| `family_members` | id | → family_id, user_id | نقش و وضعیت عضو |
| `family_invitations` | id | → family_id, created_by | کد دعوت با انقضا |
| `otp_requests` | id | (mobile) | تأیید موبایل |
| `folders` | id | → family_id, parent_id | پوشه‌های ابری |
| `files` | id | → family_id, folder_id, owner_id | فایل‌های ابری |
| `file_permissions` | id | → file_id/folder_id, user_id | دسترسی‌های شخصی |
| `file_activity_log` | id | → file_id, actor_id | لاگ تغییرات |
| `storage_quotas` | family_id | → families | سهمیه فضای خانواده |
| `audit_log` | id | → actor, family | رویدادهای امنیتی |
| `sync_outbox` | operation_id | → family_id, user_id | صف همگام‌سازی آفلاین |
| `processed_sync_operations` | operation_id | → family_id | جلوگیری از idempotency |

## ۴. سیاست‌های دسترسی (RLS)

- **قانون اصلی**: هر کاربر فقط به رکوردهای خانواده خود دسترسی دارد.
- **مدیر (admin)**: دسترسی کامل شامل ویرایش، حذف، مدیریت اعضا و دعوت‌ها.
- **ویرایشگر (editor)**: بارگذاری و ویرایش فایل‌ها و مدارک مجاز.
- **مشاهده‌گر (viewer)**: فقط مشاهده و دانلود موارد مجاز.
- **خصوصی‌سازی**: فایل/پوشه خصوصی فقط برای صاحب و مدیر قابل مشاهده است.
- **لغو دسترسی**: با تغییر `status='revoked'`، RLS بلافاصله دسترسی را قطع می‌کند.

سياسيات کامل در فایل `supabase-migrations-02-rls-policies.sql` آمده است.

## ۵. امنیت فایل‌ها

| ریسک | راهکار |
|---|---|
| دسترسی غیرمجاز به فایل | RLS + private bucket + signed URLs کوتاه‌مدت (۵ دقیقه) |
| بارگذاری فایل مخرب | اعتبارسنجی نوع MIME در سرور (نه فقط پسوند) |
| اجرای کد مخرب | محدود کردن پسوندها (`.exe`, `.bat`, `.sh` رد می‌شوند) |
| جاگذاری مسیر (path traversal) | نام‌گذاری امن با UUID در storage_key |
| فراتر رفتن از سهمیه | تریگر `enforce_storage_quota` قبل از INSERT |
| کلیدهای API در APK | استفاده از Supabase Edge Functions؛ کلیدهای خصوصی هرگز در کد کلاینت قرار نمی‌گیرند |
| توکن‌های دزدیده‌شده | انقضای کوتاه و قابلیت revocation |
| **هشدار صادقانه** | سرویس ابری Supabase به‌صورت پیش‌فرض end-to-end رمزنگاری نمی‌کند. اگر رمزنگاری سرتاسری نیاز است، باید با کلیدهای کاربر (client-side AES-GCM) قبل از آپلود انجام شود. |

## ۶. آفلاین و همگام‌سازی

- **خواندن**: همیشه از IndexedDB/localStorage انجام می‌شود.
- **نوشتن**: ابتدا در state محلی ثبت، سپس در `sync_outbox` قرار می‌گیرد.
- **پس از اتصال**: Outbox processor با exponential backoff ارسال می‌کند.
- **idempotency**: `operation_id` در `processed_sync_operations` چک می‌شود.
- **تعارض**: اگر `base_version` با `record_version` سرور مطابقت نداشت، رکورد به حالت `conflict` می‌رود و کاربر در صفحه Sync تصمیم می‌گیرد.

## ۷. آزمون‌های پذیرش

| # | سناریو | نتیجه مورد انتظار |
|---|---|---|
| 1 | ثبت‌نام بدون OTP معتبر | مسدود |
| 2 | دعوت منقضی | رد می‌شود |
| 3 | دعوت باطل‌شده | رد می‌شود |
| 4 | عضو جدید بدون دعوت معتبر | مسدود |
| 5 | کاربر خانواده A به فایل خانواده B | رد می‌شود (RLS) |
| 6 | مشاهده‌گر سعی در حذف | رد می‌شود |
| 7 | تغییر شناسه خانواده در API | مسدود (RLS با auth.uid) |
| 8 | لغو عضویت → دسترسی بعدی | مسدود |
| 9 | بارگذاری فایل بزرگ (>۱۰MB) | رد می‌شود (نسخه دمو) |
| 10 | فایل خصوصی با لینک عمومی | مسدود (private bucket) |
| 11 | فراتر رفتن از سهمیه | رد می‌شود (trigger) |
| 12 | فایل حذف‌شده | ۳۰ روز قابل بازیابی |
| 13 | قطع اینترنت در آپلود | در صف می‌ماند و تلاش مجدد می‌کند |
| 14 | تعارض تغییرات | کاربر تصمیم می‌گیرد (Local vs Server) |

## ۸. راهنمای راه‌اندازی تولید

```bash
# 1. ایجاد پروژه Supabase
# - ثبت‌نام در supabase.com
# - ایجاد پروژه جدید
# - دریافت URL و anon key

# 2. اعمال migrations
supabase db push --db-url "postgresql://..."

# 3. پیکربندی OTP via SMS
# - اتصال به کاوه‌نگار یا فراز SMS
# - تنظیم در Supabase Dashboard → Auth → SMS Provider

# 4. تنظیم متغیرهای محیطی
cp .env.example .env.local
# - NEXT_PUBLIC_SUPABASE_URL=...
# - NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# - SUPABASE_SERVICE_ROLE_KEY=... (فقط سرور)

# 5. ساخت APK با PWABuilder
# - آپلود URL در pwabuilder.com
# - دانلود APK تولیدشده
# - امضای APK با keystore
# - انتشار در بازار

# یا با Capacitor:
npx cap init
npx cap add android
npx cap sync
npx cap open android  # ساخت در Android Studio
```

## ۹. برآورد هزینه (ماهانه)

| سرویس | پلن پیشنهادی | هزینه تقریبی (تومان) |
|---|---|---|
| Supabase (Free) | ۵۰۰MB DB, ۱GB Storage, ۵۰K MAU | رایگان |
| Supabase Pro | ۸GB DB, ۱۰۰GB Storage, ۱۰۰K MAU | ~$۲۵ = ۱.۵M |
| SMS OTP (کاوه‌نگار) | هر پیامک ~۳۵۰ تومان | بسته به کاربران فعال |
| هاست اپ Next.js (Vercel) | پلن رایگان تا زمانی که ترافیک کم باشد | رایگان |
| بازار اندروید | انتشار رایگان، ۳۰٪ از فروش | — |

**هزینه اولیه (نمونه اولیه با ۱۰۰ کاربر فعال):** ~۵۰۰ هزار تومان ماهانه
**با ۱۰۰۰ کاربر:** ~۲ میلیون تومان ماهانه (عمدتاً SMS OTP)

## ۱۰. محدودیت‌های صریح

| مورد | وضعیت در نسخه دمو | وضعیت در نسخه تولید |
|---|---|---|
| OTP واقعی | شبیه‌سازی (کد=12345 نمایش داده می‌شود) | SMS از طریق provider |
| ذخیره فایل | localStorage (base64) | Supabase Storage (private bucket) |
| همگام‌سازی چند دستگاه | شبیه‌سازی | Supabase Realtime + Outbox |
| RLS | در SQL آماده اما اجرا نشده | اجرا با `supabase db push` |
| APK | PWA قابل نصب | APK امضا‌شده از PWABuilder |
| **ادعای E2E رمزنگاری** | ندارد | در صورت نیاز، رمزنگاری client-side قبل از آپلود اضافه شود |

## ۱۱. خروجی‌های قابل تحویل

این پوشه شامل فایل‌های زیر است:

- `supabase-migrations-01-schema.sql` — اسکریپت ساخت جداول
- `supabase-migrations-02-rls-policies.sql` — سیاست‌های RLS و Storage
- `ARCHITECTURE.md` — همین فایل
- اسکرین‌شات‌های تست (`v3-*.png`)

## ۱۲. قدم بعدی

۱. ایجاد پروژه Supabase واقعی و اعمال migrations
۲. اتصال provider SMS (کاوه‌نگار/فراز)
۳. جایگزینی mock backend در `src/lib/store.ts` با Supabase Client واقعی
۴. ساخت APK از طریق PWABuilder یا Capacitor
۵. انتشار در بازار
