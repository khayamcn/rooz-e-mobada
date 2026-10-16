# Google Play Data Safety Form

## Data Collection and Sharing

### Does your app collect or share any of the following user data?
**No** — This app does not collect, share, or transmit any user data.

### Data Types Used:

| Data Type | Collected | Shared | Purpose |
|---|---|---|---|
| Personal info (name, phone, national ID) | No | No | Stored only on device |
| Financial info (card numbers, CVV2, Shiba) | No | No | Stored only on device |
| Photos and videos | No | No | Stored only on device |
| App activity | No | No | N/A |
| App info and performance | No | No | N/A |
| Device or other IDs | No | No | N/A |

## Data Security

### Is all user data encrypted in transit?
**Yes** — The app uses HTTPS only (cleartext traffic is disabled).

### Is user data encrypted at rest?
**Partial** — User data is stored in the app's local storage (WebView localStorage). The app's backup feature uses XOR-based encryption with a user-provided passphrase.

### Can users request data deletion?
**Yes** — Users can delete all data by:
1. Using the app's "Deactivate" feature
2. Uninstalling the app (all data is removed)

## Permissions

| Permission | Reason | Required |
|---|---|---|
| INTERNET | Required for WebView to function | Yes |
| ACCESS_NETWORK_STATE | Check network connectivity | Yes |
| CAMERA | Take photos of documents/cards | No (runtime grant) |
| READ_MEDIA_IMAGES | Select images from gallery | No (runtime grant) |
| VIBRATE | Emergency alert notifications | Yes |
| USE_BIOMETRIC | App lock with fingerprint | No (runtime grant) |

## Google Play Compliance Checklist

- [x] Target SDK 35 (within 1 year of latest)
- [x] No background location access
- [x] No SMS/call log permissions
- [x] No contacts permission
- [x] No advertising SDKs
- [x] No analytics SDKs
- [x] No crash reporting without consent
- [x] Backup disabled (data stays on device)
- [x] Network security config (HTTPS only)
- [x] ProGuard/R8 enabled (code obfuscation)
- [x] APK Signature Scheme v2
- [x] 64-bit support (universal APK)
- [x] Privacy Policy provided
- [x] No deceptive behavior
- [x] No sensitive permissions without justification

## App Content Rating

- **Category:** Productivity / Utilities
- **Target Audience:** 18+ (general audience)
- **Content:** No violence, no sexual content, no gambling
- **Interactive Elements:** Users can store personal financial information

## Target Audience

- **Target Age Group:** 18+ (adults managing family documents)
- **Children:** App is NOT directed at children under 13
- **COPPA:** Not applicable (no children's data collected)
