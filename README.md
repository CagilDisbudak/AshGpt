# Jan AI Mobile Client (AshGpt)

A cross-platform mobile app (Android + iOS) built with Expo and TypeScript to interact with a local Jan AI OpenAI-compatible server.

> **Veriler sadece sizde.** Ayarlar, sohbetler ve mesajlar yalnızca telefonda saklanır; buluta hiçbir şey gitmez.  
> **All data stays local.** Settings, chats, and messages are stored only on your phone; nothing is sent to the cloud.

## Privacy: All Data Stays on Your Device (Local Only)

**Tüm veriler cihazınızda kalır.** Ayarlar, sohbet geçmişi ve mesajlar yalnızca telefonunuzda (AsyncStorage) saklanır; hiçbir veri buluta veya harici sunuculara gönderilmez. Jan AI sunucusu kendi bilgisayarınızda çalıştığı için yalnızca siz ve cihazınız arasında iletişim vardır.

**All data remains on your device.** Settings, chat history, and messages are stored only on your phone (AsyncStorage); no data is sent to the cloud or external servers. Because the Jan AI server runs on your own PC, communication stays between you and your devices.

| Nerede saklanır? | Buluta gider mi? |
|------------------|-------------------|
| Ayarlar (Base URL, model, tema) | Hayır |
| Sohbet listesi ve mesajlar | Hayır |
| Tema tercihi (açık/koyu/ChatGPT) | Hayır |

## Features

- **Direct LAN Connection**: Connect to your Jan AI server running on your PC via Wi-Fi.
- **Configurable**: Easily set Base URL, API Key, Model, Temperature, and Max Tokens.
- **Chat Interface**: Clean UI with message bubbles and auto-scrolling.
- **Connection Test**: Verify your setup with the "Test Connection" feature.
- **Persisted Settings**: Your configuration is saved locally on the device (AsyncStorage).
- **Local Chat History**: Conversation history is stored only on your phone; no cloud sync.
- **Themes**: Light, Dark, and ChatGPT-style themes; preference saved locally.

## Prerequisites

1.  **Jan AI**: Install and run Jan AI on your PC.
2.  **Wi-Fi**: Ensure your mobile device and PC are on the same Wi-Fi network.
3.  **Expo Go**: Download the Expo Go app on your [iOS](https://apps.apple.com/us/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) device.

## Setup Instructions

### 1. Enable Jan Local API Server
- Open Jan AI on your PC.
- Go to **Settings** -> **Local API Server**.
- Enable the server (default port is `1337`).
- Note the server status (it should say "Started").

### 2. Find your PC LAN IP
- **Windows**: Open Command Prompt and type `ipconfig`. Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.50`).
- **Mac/Linux**: Open Terminal and type `ifconfig` or `ip addr`. Look for the IP address associated with `en0` or `eth0`.

### 3. Run the Expo App
- In the project directory, run:
  ```bash
  npm install
  npx expo start
  ```
- Scan the QR code revealed in the terminal using your phone's camera (iOS) or the Expo Go app (Android).

### 4. Configure the App
- Once the app is running, tap the **Settings** icon in the top right.
- Enter the **Base URL**: `http://<YOUR_PC_IP>:1337` (e.g., `http://192.168.1.50:1337`).
- Enter the **Model name** (found in Jan's Model Hub, e.g., `Meta-Llama-3_1-8B-Instruct-IQ4_XS`).
- Tap **Test Connection** to verify.
- Tap **Save Settings** and return to the Chat screen.

## Building APK (Android)

### Yöntem 1: Yerel build (EAS / bulut yok)

APK'yı kendi bilgisayarınızda, EAS veya Expo Go kullanmadan almak için:

**Gereksinimler:** Node.js, JDK 17, Android SDK (`ANDROID_HOME` tanımlı; Android Studio kuruluysa genelde hazırdır).

1. Native Android projesini oluşturun (ilk seferde veya `app.json` değişince):
   ```bash
   npm run prebuild:android
   ```
   Bu komut `android/` klasörünü oluşturur.

2. Release APK üretin:
   ```bash
   npm run build:apk
   ```
   Bu komut `expo run:android --variant release` çalıştırır ve APK'yı derler.

3. APK konumu: `android/app/build/outputs/apk/release/app-release.apk`  
   Bu dosyayı telefona atıp kurabilirsiniz.

**Windows'ta Gradle'ı elle çalıştırmak isterseniz:**
   ```bash
   npm run prebuild:android
   cd android
   gradlew.bat assembleRelease
   ```

---

### Yöntem 2: EAS Build (bulut)

Telefonunuza kurulum için **EAS Build** kullanabilirsiniz (ücretsiz Expo hesabı gerekir).

### 1. EAS CLI ve giriş
```bash
npm install -g eas-cli
eas login
```
(Expo hesabınız yoksa [expo.dev](https://expo.dev) üzerinden ücretsiz kayıt olun.)

### 2. APK build
```bash
npm run build:android
```
veya doğrudan:
```bash
eas build --platform android --profile preview
```

### 3. İndirme ve kurulum
- Build tamamlanınca Expo dashboard’da çıkan **APK indir** linkine tıklayın.
- APK’yı telefona atıp (USB, e-posta veya tarayıcıdan indirip) kurun. “Bilinmeyen kaynaklardan yükleme”ye izin vermeniz gerekebilir.

`eas.json` içinde `preview` ve `production` profilleri **APK** üretecek şekilde ayarlıdır (Play Store için AAB değil).

## Troubleshooting

- **Server not reachable**: Ensure your phone and PC are on the same Wi-Fi. Check if your PC's firewall is blocking connections on port `1337`.
- **Invalid Model**: Verify the model name exactly as it appears in Jan AI.
- **Empty Response**: Some models might return an empty content if parameters (like temperature) are too high or if the model isn't fully loaded.
- **Network Errors**: Double-check the Base URL includes `http://` and the correct port.

## Tech Stack
- React Native with Expo
- TypeScript
- React Navigation
- AsyncStorage
- Fetch API
