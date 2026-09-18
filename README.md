# Trip Planner Mobile 📱

App móvil (Expo / React Native) de [Trip Planner](https://trip-planner-eight-pi.vercel.app),
para planificar viajes desde el celular. Repo **nuevo e independiente** del
backend/web (`dirugadr/trip-planner`) — consume la misma API ya en producción,
el backend no se modifica.

## Stack

- **Expo** (TypeScript) + `expo-dev-client` (Development Build, no Expo Go —
  hace falta para módulos nativos como Google Sign-In).
- **React Navigation** (native-stack) para la navegación Login ↔ Home.
- **`@react-native-google-signin/google-signin`** para el login nativo.
- **`expo-secure-store`** para guardar el JWT de sesión (Keychain en iOS,
  Keystore en Android).

## Primeros pasos (local)

```bash
npm install
cp .env.example .env   # completar los Client IDs de Google (ver abajo)
npx expo start
```

Por defecto `EXPO_PUBLIC_API_URL` apunta a producción
(`https://trip-planner-eight-pi.vercel.app`). Para debuggear contra el backend
corriendo en tu máquina (repo `C:\Trip-Planner`, `npm run dev`), cambiá esa
variable en `.env` a `http://<IP-de-tu-LAN>:3000` — un dispositivo físico o
emulador no resuelve `localhost` de tu PC.

Este proyecto usa **Development Build**, no Expo Go: hace falta generar un
build instalable (ver siguiente sección) antes de poder correr `npx expo start`
contra un dispositivo/emulador.

## Configurar Google Sign-In (una vez)

El login nativo reusa el mismo backend de auth que la web (Épica 7 del repo
`dirugadr/trip-planner`) — no hay endpoint de auth nuevo. Pasos en
[console.cloud.google.com](https://console.cloud.google.com), mismo proyecto
de Google Cloud que ya usa el backend:

1. **Reusar el Client ID Web existente** (el mismo que `GOOGLE_CLIENT_ID_TP` /
   `VITE_GOOGLE_CLIENT_ID_TP` del repo web) → pegarlo en `.env` como
   `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Es el que determina el `audience` del ID
   token que el backend valida — por eso no se crea un client ID Web nuevo.
2. **Crear un Client ID de tipo Android** con el package name
   `com.dirugadr.tripplanner` y el SHA-1 del certificado de firma (para dev,
   `eas credentials` te lo da una vez que corriste `eas build` al menos una
   vez, o generalo con `keytool`). No hace falta copiar este valor a ningún
   lado — Google lo matchea automáticamente por package name + SHA-1.
3. **Crear un Client ID de tipo iOS** con el Bundle ID
   `com.dirugadr.tripplanner` → pegarlo en `.env` como
   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, y también reemplazar
   `REPLACE_WITH_IOS_CLIENT_ID` en el plugin `@react-native-google-signin/google-signin`
   de `app.json` (`iosUrlScheme`, formato
   `com.googleusercontent.apps.<el-id-numérico-del-client-id>`).

## Generar el development build (EAS)

```bash
npx eas-cli login        # cuenta de Expo (crear una en expo.dev si hace falta)
npx eas-cli init         # vincula este proyecto a la cuenta (una vez)
npx eas-cli build --profile development --platform android
npx eas-cli build --profile development --platform ios
```

Instalá el build resultante en el dispositivo y después corré
`npx expo start` — la app se conecta sola al bundler.

Los perfiles `preview` y `production` en `eas.json` están preparados pero no
se generaron builds todavía (no hace falta para esta épica).

## Estructura

```
src/
  config/env.ts          # variables de entorno centralizadas
  api/client.ts           # fetch wrapper: adjunta el Bearer token, maneja 401 global
  api/auth.ts              # POST /api/auth/login, GET /api/auth/me
  auth/secureStore.ts      # guardar/leer/borrar el JWT en expo-secure-store
  auth/AuthContext.tsx      # estado de sesión + login/logout con Google
  screens/LoginScreen.tsx
  screens/HomeScreen.tsx
  navigation/RootNavigator.tsx
```

## Documentación

- [`docs/historias-de-usuario.md`](docs/historias-de-usuario.md) — HU-5.1 y
  HU-5.2, criterios de aceptación y pasos manuales pendientes (Google Cloud
  Console, EAS, prueba en dispositivo físico).
