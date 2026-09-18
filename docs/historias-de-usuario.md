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

## HU-5.2 — Login con Google ✅ (implementación)

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

## Pendiente (manual, fuera del alcance de este cambio)

Estos pasos requieren credenciales/cuentas del usuario (Google Cloud Console,
cuenta de Expo) y un dispositivo físico, así que no se pudieron completar de
forma autónoma. Quedan documentados en el [README](../README.md):

- [ ] Crear los Client IDs de Android e iOS en Google Cloud Console (mismo
      proyecto que ya usa el backend) y completar `.env` /
      `iosUrlScheme` en `app.json` con los valores reales.
- [ ] `eas login` + `eas init` para vincular el proyecto a una cuenta de Expo.
- [ ] Generar y correr el development build en un dispositivo Android e iOS
      físico (o emulador/simulador de ambos).
- [ ] Probar el login con un correo en la allowlist (debe entrar) y uno que no
      (debe mostrar el mensaje de acceso denegado, sin JWT guardado).
- [ ] Verificar que cerrar y volver a abrir la app mantiene la sesión sin pedir
      login de nuevo, y que cerrar sesión borra el JWT del secure store.
