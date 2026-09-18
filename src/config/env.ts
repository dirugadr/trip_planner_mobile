function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copiá .env.example a .env y completala.`
    );
  }
  return value;
}

export const env = {
  apiUrl: required('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL).replace(/\/+$/, ''),
  googleWebClientId: required(
    'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  ),
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
};
