# روز مبادا — معماری Firebase و راهنمای راه‌اندازی

**نسخه:** ۱.۳.۰
**پلتفرم هدف:** اندروید (PWA → APK از طریق Capacitor یا PWABuilder)
**بک‌اند:** Firebase (به‌جای Supabase)

## ۱. نمای کلی سرویس‌های Firebase

| سرویس | کاربرد | هزینه (پلن رایگان) |
|---|---|---|
| **Firebase Authentication** | ورود با Google + شماره موبایل (OTP) | ۱۰K MAU رایگان |
| **Cloud Firestore** | اطلاعات ساختاریافته خانواده، اعضا، مدارک | ۱GB ذخیره‌سازی + ۵۰K خواندن/روز |
| **Cloud Storage for Firebase** | فایل‌های خصوصی خانواده (عکس، PDF، ...) | ۵GB ذخیره‌سازی + ۱GB دانلود/روز |
| **Firebase App Check** | کاهش درخواست‌های غیرمجاز | رایگان |
| **Play Integrity API** | بررسی یکپارچگی برنامه | رایگان (محدودیت ساعتی) |
| **Firebase Crashlytics** | گزارش خطاهای فنی | رایگان نامحدود |
| **Firebase Cloud Messaging** | اعلان‌های ضروری | رایگان |

**برآورد هزینه ماهانه برای ۱۰۰ کاربر فعال:** رایگان
**برای ۱۰۰۰ کاربر:** ~$۲۵ (ارتقا به پلن Blaze)

## ۲. جریان ورود

```
┌───────────────────────────────────────────────────────────┐
│                      First Launch                          │
│                                                            │
│  Splash → Onboarding (۵ اسلاید) → Login                   │
│                                                            │
│  Login گزینه‌ها:                                           │
│  ├── ادامه با Google (Credential Manager / GoogleAuthProvider)│
│  ├── ورود با شماره موبایل (PhoneAuthProvider + OTP)        │
│  └── پیوستن با کد دعوت (بعد از احراز هویت)                 │
│                                                            │
│  پس از احراز هویت:                                         │
│  ├── کاربر جدید → ایجاد خانواده (تولید کد دعوت)            │
│  └── کاربر با کد دعوت → joinFamily(code)                   │
│                                                            │
│  ذخیره:                                                    │
│  - auth.currentUser (Firebase ID token)                   │
│  - session در FlutterSecureStorage / Android Keystore     │
│  - hasSeenOnboarding در SharedPreferences                 │
└───────────────────────────────────────────────────────────┘
```

## ۳. مدل داده Cloud Firestore

```
users/{uid}
  ├── displayName: string
  ├── mobile: string (verified)
  ├── nationalId?: string (only if needed)
  ├── photoURL: string
  ├── familyId?: string
  ├── role?: "admin" | "editor" | "viewer"
  ├── createdAt: timestamp
  └── lastLoginAt: timestamp

families/{familyId}
  ├── title: string
  ├── ownerId: string (uid)
  ├── inviteCodeHash: string (hash of 6-char code)
  ├── inviteExpiresAt: timestamp
  ├── inviteRevoked: boolean
  ├── createdAt: timestamp
  └── updatedAt: timestamp

families/{familyId}/members/{uid}
  ├── role: "admin" | "editor" | "viewer"
  ├── status: "active" | "revoked"
  ├── joinedAt: timestamp
  └── revokedAt?: timestamp

families/{familyId}/invitations/{inviteId}
  ├── codeHash: string
  ├── createdBy: uid
  ├── expiresAt: timestamp
  ├── revokedAt?: timestamp
  ├── maxUses: number
  ├── useCount: number
  └── usedBy?: uid

families/{familyId}/folders/{folderId}
  ├── name: string
  ├── parentId?: string
  ├── isPrivate: boolean
  ├── ownerId: uid
  ├── deletedAt?: timestamp
  └── createdAt: timestamp

families/{familyId}/files/{fileId}
  ├── name: string
  ├── storagePath: string (Cloud Storage path)
  ├── mimeType: string
  ├── sizeBytes: number
  ├── folderId?: string
  ├── ownerId: uid
  ├── isPrivate: boolean
  ├── isOfflinePinned: boolean
  ├── deletedAt?: timestamp
  ├── purgeAfter?: timestamp (auto-permanent-delete)
  ├── createdAt: timestamp
  └── updatedAt: timestamp

families/{familyId}/activityLog/{logId}
  ├── action: "upload" | "rename" | "move" | "delete" | "restore" | "download"
  ├── actorId: uid
  ├── actorName: string
  ├── fileId?: string
  ├── folderId?: string
  ├── details: string
  └── timestamp: timestamp

families/{familyId}/quota
  ├── totalBytes: number (default 1GB)
  └── usedBytes: number
```

## ۴. قوانین امنیتی Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: check if user is active member of family
    function isFamilyMember(familyId) {
      return request.auth != null
        && exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid))
        && get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.status == 'active';
    }

    function isFamilyAdmin(familyId) {
      return isFamilyMember(familyId)
        && get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.role == 'admin';
    }

    // users can read/update only their own profile
    match /users/{uid} {
      allow read: if request.auth.uid == uid
                  || isFamilyMember(get(/databases/$(database)/documents/users/$(uid)).data.familyId);
      allow update: if request.auth.uid == uid;
      allow create: if request.auth.uid == uid;
    }

    // families
    match /families/{familyId} {
      allow read: if isFamilyMember(familyId);
      allow update, delete: if isFamilyAdmin(familyId);
      allow create: if request.auth != null; // owner creates initial family

      match /members/{uid} {
        allow read: if isFamilyMember(familyId);
        allow create, update: if isFamilyAdmin(familyId);
        // User can update only their own status (e.g., leave)
        allow update: if request.auth.uid == uid
                       && request.resource.data.role == resource.data.role;
      }

      match /invitations/{inviteId} {
        allow read: if request.auth != null; // code is hashed, safe to read
        allow create, update, delete: if isFamilyAdmin(familyId);
      }

      match /folders/{folderId} {
        allow read: if isFamilyMember(familyId)
                     && (resource.data.isPrivate == false
                         || resource.data.ownerId == request.auth.uid
                         || isFamilyAdmin(familyId));
        allow create: if isFamilyMember(familyId)
                       && get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.role in ['admin', 'editor'];
        allow update, delete: if resource.data.ownerId == request.auth.uid
                              || isFamilyAdmin(familyId);
      }

      match /files/{fileId} {
        allow read: if isFamilyMember(familyId)
                     && (resource.data.isPrivate == false
                         || resource.data.ownerId == request.auth.uid
                         || isFamilyAdmin(familyId));
        allow create: if isFamilyMember(familyId)
                       && get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.role in ['admin', 'editor'];
        allow update, delete: if resource.data.ownerId == request.auth.uid
                              || isFamilyAdmin(familyId);
      }

      match /activityLog/{logId} {
        allow read: if isFamilyMember(familyId);
        allow create: if isFamilyMember(familyId);
      }

      match /quota {
        allow read: if isFamilyMember(familyId);
        // Only server (Cloud Functions) can write quotas
        allow write: if false;
      }
    }
  }
}
```

## ۵. قوانین امنیتی Cloud Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // All family files are private — no public access
    match /families/{familyId}/{filePath=**} {
      allow read: if request.auth != null
                  && exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid))
                  && get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.status == 'active';

      allow write: if request.auth != null
                   && exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid))
                   && get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.status == 'active'
                   && get(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid)).data.role in ['admin', 'editor']
                   && request.resource.size < 10 * 1024 * 1024  // 10MB limit
                   && request.resource.contentType.matches('image/.*|application/pdf|application/msword|application/vnd.openxmlformats-officedocument.*|audio/.*|video/.*');
    }
  }
}
```

## ۶. ادغام Firebase در Flutter (مرجع)

```dart
// lib/main.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_app_check/firebase_app_check.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  await FirebaseAppCheck.instance.activate();
  runApp(RoozEMobadaApp());
}

// Google Sign-In
Future<UserCredential> signInWithGoogle() async {
  final GoogleAuthProvider googleProvider = GoogleAuthProvider();
  googleProvider.setCustomParameters({'hl': 'fa'});
  // Note: do NOT request Drive scope here — only basic profile
  return await FirebaseAuth.instance.signInWithProvider(googleProvider);
}

// Phone OTP
Future<void> verifyPhone(String phone, Function(String, int?) onCodeSent) async {
  await FirebaseAuth.instance.verifyPhoneNumber(
    phoneNumber: phone,
    timeout: const Duration(seconds: 120),
    verificationCompleted: (credential) async {
      await FirebaseAuth.instance.signInWithCredential(credential);
    },
    verificationFailed: (e) { /* handle */ },
    codeSent: (verificationId, resendToken) => onCodeSent(verificationId, resendToken),
    codeAutoRetrievalTimeout: (verificationId) {},
  );
}

// Create family
Future<String> createFamily(String title) async {
  final user = FirebaseAuth.instance.currentUser!;
  final familyRef = await FirebaseFirestore.instance.collection('families').add({
    'title': title,
    'ownerId': user.uid,
    'inviteCodeHash': hashInviteCode(generateInviteCode()),
    'inviteExpiresAt': DateTime.now().add(Duration(days: 7)),
    'inviteRevoked': false,
    'createdAt': FieldValue.serverTimestamp(),
  });
  await familyRef.collection('members').doc(user.uid).set({
    'role': 'admin',
    'status': 'active',
    'joinedAt': FieldValue.serverTimestamp(),
  });
  return familyRef.id;
}

// Upload file
Future<String> uploadFile(String familyId, File file, String folderId) async {
  final user = FirebaseAuth.instance.currentUser!;
  final fileId = FirebaseFirestore.instance.collection('families').doc(familyId).collection('files').doc().id;
  final storageRef = FirebaseStorage.instance.ref('families/$familyId/$fileId');
  final uploadTask = storageRef.putFile(file);
  final snapshot = await uploadTask;
  final downloadUrl = await snapshot.ref.getDownloadURL();
  await FirebaseFirestore.instance
      .collection('families').doc(familyId).collection('files').doc(fileId)
      .set({
    'name': file.path.split('/').last,
    'storagePath': 'families/$familyId/$fileId',
    'mimeType': lookupMimeType(file.path),
    'sizeBytes': await file.length(),
    'folderId': folderId,
    'ownerId': user.uid,
    'isPrivate': false,
    'createdAt': FieldValue.serverTimestamp(),
  });
  return fileId;
}
```

## ۷. ویژگی‌های امنیتی پیاده‌سازی‌شده

| ریسک | راهکار | وضعیت در نسخه دمو |
|---|---|---|
| دسترسی غیرمجاز | Firebase Auth + Firestore Security Rules | ⚠️ شبیه‌سازی |
| دسترسی بین خانواده‌ها | `isFamilyMember()` helper در rules | ⚠️ آماده برای راه‌اندازی |
| OTP به‌صورت متن آشکار | هرگز در لاگ یا localStorage ذخیره نمی‌شود | ✅ در نسخه دمو نمایش داده می‌شود (هشدار داده شده) |
| نشست و توکن | در FlutterSecureStorage / Android Keystore | ⚠️ در نسخه وب از localStorage استفاده می‌شود |
| قفل برنامه | BiometricPrompt / PIN | ⚠️ آماده در UI |
| لغو دسترسی | تغییر `status` به `revoked` در Firestore | ✅ پیاده‌سازی شد |
| انتقال سرپرستی | `transferOwnership()` با تغییر role | ✅ پیاده‌سازی شد |
| تولید مجدد کد دعوت | `regenerateInviteCode()` | ✅ پیاده‌سازی شد |
| App Check | جلوگیری از استفاده از کلیدهای API دزدیده‌شده | ⚠️ نیازمند راه‌اندازی پروژه Firebase |

## ۸. محدودیت‌های صریح این نسخه دمو

- **OTP واقعی**: شبیه‌سازی می‌شود (کد نمایش داده می‌شود در UI)
- **Google Sign-In واقعی**: شبیه‌سازی می‌شود (بدون OAuth واقعی)
- **Cloud Firestore/Storage واقعی**: از localStorage مرورگر استفاده می‌شود
- **App Check / Play Integrity**: نیاز به پروژه Firebase واقعی دارد
- **FCM اعلان‌ها**: نیاز به سرتیفیکیت FCM دارد
- **رمزنگاری سرتاسری**: فعلاً پیاده‌سازی نشده — فایل‌ها در حالت تولید در Cloud Storage به‌صورت پیش‌فرض خصوصی هستند اما رمزنگاری client-side نیاز به پیاده‌سازی جداگانه دارد

## ۹. راهنمای راه‌اندازی تولید

```bash
# ۱. ایجاد پروژه Firebase
# - ثبت‌نام در console.firebase.google.com
# - ایجاد پروژه جدید
# - فعال‌سازی Authentication (Google + Phone)
# - فعال‌سازی Cloud Firestore
# - فعال‌سازی Cloud Storage (private bucket)
# - فعال‌سازی App Check (reCAPTCHA Enterprise برای وب، Play Integrity برای اندروید)

# ۲. دانلود google-services.json
# - Project Settings → Your Apps → Add Android App
# - Package name: com.roozemobada.app
# - دانلود google-services.json
# - قرار دادن در android/app/

# ۳. تنظیم متغیرهای محیطی
cp .env.example .env.local
# - NEXT_PUBLIC_FIREBASE_API_KEY=...
# - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# - NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...

# ۴. اعمال Security Rules
firebase deploy --only firestore:rules
firebase deploy --only storage

# ۵. ساخت APK با Capacitor
npx cap init
npx cap add android
npx cap sync
npx cap open android  # build in Android Studio

# ۶. انتشار در بازار اندروید
# - امضای APK با keystore
# - آپلود در cafébazaar.ir
```

## ۱۰. الزامات آزمون پذیرش

| # | سناریو | نتیجه مورد انتظار |
|---|---|---|
| ۱ | ورود با Google | کاربر به صفحه ایجاد خانواده هدایت می‌شود |
| ۲ | ورود با موبایل + OTP | پس از تأیید OTP به main-app |
| ۳ | ایجاد خانواده | کد دعوت ۶ رقمی تولید می‌شود |
| ۴ | پیوستن با کد دعوت نامعتبر | خطا نمایش داده می‌شود |
| ۵ | پیوستن با کد منقضی | خطا نمایش داده می‌شود |
| ۶ | مشاهده‌گر سعی در ویرایش | رد می‌شود |
| ۷ | کاربر خانواده A به فایل خانواده B | رد می‌شود (rules) |
| ۸ | لغو عضویت | دسترسی قطع می‌شود |
| ۹ | بارگذاری فایل بزرگ | رد می‌شود (storage rules) |
| ۱۰ | فایل خصوصی با لینک عمومی | رد می‌شود |
| ۱۱ | حذف فایل → بازیابی | تا ۳۰ روز قابل بازیابی |
| ۱۲ | قطع اینترنت در آپلود | در صف می‌ماند |
| ۱۳ | تعارض همگام‌سازی | کاربر تصمیم می‌گیرد |
| ۱۴ | مشاهده دوباره معرفی | از تنظیمات قابل دسترس است |
| ۱۵ | حالت روز/شب | کل پس‌زمینه تغییر می‌کند |
| ۱۶ | کپی فیلدها | کد ملی، موبایل، شماره سند و... قابل کپی |
