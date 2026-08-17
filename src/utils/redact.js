/** Keys (case-insensitive) whose values must never appear in logs. */
const SENSITIVE_KEYS = new Set(
  [
    'password',
    'token',
    'accesstoken',
    'refreshtoken',
    'authorization',
    'authorizationcode',
    'identitytoken',
    'id_token',
    'idtoken',
    'clientsecret',
    'privatekey',
    'fcmtoken',
    'memberid',
    'groupnumber',
    'rxbin',
    'pcn',
    'allergies',
    'conditions',
    'ssn',
    'otp',
    'cookie',
    'email',
    'phonenumber',
    'phone',
    'bloodtype',
    'biologicalsex',
    'dateofbirth',
    'dob',
    'ocrtext',
    'rawtext',
    'transcript',
    'audiotext',
    'jwt',
    'bearertoken',
    'sessiontoken',
    'apikey',
    'secret',
  ].map((k) => k.toLowerCase()),
);

const REDACTED = '[REDACTED]';

export function redactSensitive(value, depth = 0) {
  if (value == null || depth > 8) return value;
  if (typeof value !== 'object') return value;
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1));
  }
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(String(key).toLowerCase())) {
      out[key] = REDACTED;
    } else {
      out[key] = redactSensitive(val, depth + 1);
    }
  }
  return out;
}
