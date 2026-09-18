# Trip Planner Mobile — Historias de usuario

> Continúa la numeración de **Épica 5** del backlog del proyecto web
> (`dirugadr/trip-planner`, `docs/historias-de-usuario.md`). Este repo es
> independiente del backend/web — el backend no se modifica, mobile consume
> la misma API ya en producción (`https://trip-planner-eight-pi.vercel.app`).

---

## HU-5.1 — Setup del proyecto ✅

**Como** desarrollador, **quiero** un proyecto Expo configurado y
funcionando, **para** empezar a construir pantallas sobre una base sólida.

**Criterios de aceptación:**
- [x] Proyecto inicializado con Expo (TypeScript), configurado para Android e iOS.
- [x] Configurado como Development Build (`expo-dev-client` instalado, no Expo Go).
- [x] `eas.json` con perfil `development` listo para generar builds instalables,
      y estructura de `preview`/`production` preparada.
- [x] Variables de entorno separadas (`EXPO_PUBLIC_API_URL`), con default a
      producción y documentación para apuntar a un backend local.
- [x] `docs/historias-de-usuario.md` (este archivo) creado en el repo.

## HU-5.2 — Login con Google ✅ (verificado en Android; iOS pendiente)

**Como** viajero, **quiero** iniciar sesión con mi cuenta de Google, **para**
acceder a mis viajes desde el celular.

**Criterios de aceptación:**
- [x] Login nativo con Google (`@react-native-google-signin/google-signin`,
      SDK nativo — no WebView con redirect).
- [x] El ID token de Google se envía al backend **existente**
      (`POST /api/auth/login`, mismo endpoint que usa la web) — no se creó
      ningún endpoint de auth nuevo ni se tocó el backend.
- [x] El JWT recibido se guarda en `expo-secure-store` (Keychain/Keystore),
      nunca en `AsyncStorage`.
- [x] Cuando el correo no está en la allowlist, el backend responde `403` y la
      pantalla de login muestra el mensaje de error tal cual lo devuelve la API
      (mismo comportamiento fail-closed que la web), sin guardar token.
- [x] La sesión se restaura al abrir la app (`GET /api/auth/me` con el token
      guardado) hasta que expire o el usuario cierre sesión manualmente; un
      `401` de cualquier request cierra la sesión localmente y vuelve al login.

**Notas de diseño:**
- El login nativo se configura con `webClientId` = el mismo Client ID *Web*
  que ya usa el backend (`GOOGLE_CLIENT_ID_TP`), porque el backend valida el
  `audience` del ID token contra ese único client ID. Los Client IDs de
  Android/iOS nuevos (ver pendientes) son para registrar la app nativa en
  Google Cloud, no cambian el `audience` del token.

---

## Pendiente

Verificado en emulador Android (2026-09-18):

- [x] Client IDs creados en Google Cloud Console: Web (reusado del backend),
      dos de Android (uno con el SHA-1 del keystore de EAS y otro con el del
      keystore de debug local en `android/app/debug.keystore`, ambos con
      package name `com.dirugadr.tripplanner`), y uno de iOS. `.env` y el
      `iosUrlScheme` de `app.json` completados con los valores reales.
- [x] `eas login` + `eas init` hecho, proyecto vinculado.
- [x] Development build generado localmente (`npx expo run:android`) e
      instalado en un emulador Android.
- [x] Login con un correo de la allowlist: funciona de punta a punta (Google
      → backend → JWT en secure store → pantalla Home).
- [x] Login con un correo que **no** está en la allowlist: el backend
      responde `403` y la pantalla de login muestra "Tu cuenta no está
      habilitada para usar esta app" tal cual la devuelve la API, sin
      guardar JWT. (Encontramos y arreglamos un bug en el camino: si no
      cerrábamos la sesión nativa de Google tras un rechazo, Play Services
      reutilizaba esa cuenta en silencio en el siguiente intento en vez de
      mostrar el picker — ver `src/auth/AuthContext.tsx`.)
- [x] Cerrar y volver a abrir la app mantiene la sesión sin pedir login de
      nuevo.
- [x] Cerrar sesión borra el JWT del secure store y vuelve a la pantalla de
      login.

Falta (manual, requiere Mac/dispositivo iOS):

- [ ] Repetir toda la verificación en iOS (requiere macOS/Xcode o un build
      EAS de iOS en dispositivo físico — no probado todavía).
