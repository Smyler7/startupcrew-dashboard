# StartupCrew Mobile

ChatGPT-inspired Flutter version of the StartupCrew dashboard.

## Build An APK

Flutter is not installed on this machine right now. After installing Flutter:

```bash
cd mobile_flutter
flutter create . --platforms android --project-name startupcrew_mobile
flutter pub get
flutter build apk --release \
  --dart-define=GEMINI_API_KEY=your_gemini_key \
  --dart-define=GEMINI_MODEL=gemini-3.5-flash \
  --dart-define=OPENAI_API_KEY=your_openai_key \
  --dart-define=OPENAI_MODEL=gpt-4.1-mini
```

If API calls do not work in the release APK, make sure this line exists above the
`<application>` tag in `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

The APK will be created at:

```txt
mobile_flutter/build/app/outputs/flutter-apk/app-release.apk
```

## Important

Putting OpenAI or Gemini API keys directly inside a mobile app is not private. For a production app, call your own backend or serverless function, and keep AI provider keys on the server.
