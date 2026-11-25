"use client";

const VAULT_KEY_STORAGE = "insightflow_zk_vault_key";
const ENCRYPTED_PREFIX = "ZK_AES256:";

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * يولّد ويحفظ مفتاح تشفير AES-256-GCM خاص بالمستخدم في متصفحه فقط (لا يُرسل للسيرفر أبداً)
 */
export async function initializeUserVaultKey(
  email: string,
  secretSeed?: string
): Promise<void> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return;

  const cleanEmail = (email || "guest").trim().toLowerCase();
  const encoder = new TextEncoder();

  // إذا توفر secretSeed (مثل كلمة المرور)، نشتق المفتاح عبر PBKDF2 بـ 100,000 دورة
  if (secretSeed) {
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(secretSeed),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: encoder.encode(`insightflow_salt_${cleanEmail}`),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const exported = await window.crypto.subtle.exportKey("raw", derivedKey);
    const b64Key = bufferToBase64(exported);
    sessionStorage.setItem(VAULT_KEY_STORAGE, b64Key);
    localStorage.setItem(`${VAULT_KEY_STORAGE}_${cleanEmail}`, b64Key);
    return;
  }

  // استرجاع المفتاح المحفوظ أو توليد مفتاح عشوائي جديد 256-bit
  const existing =
    sessionStorage.getItem(VAULT_KEY_STORAGE) ||
    localStorage.getItem(`${VAULT_KEY_STORAGE}_${cleanEmail}`);

  if (existing) {
    sessionStorage.setItem(VAULT_KEY_STORAGE, existing);
    return;
  }

  const randomKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const exported = await window.crypto.subtle.exportKey("raw", randomKey);
  const b64Key = bufferToBase64(exported);
  sessionStorage.setItem(VAULT_KEY_STORAGE, b64Key);
  localStorage.setItem(`${VAULT_KEY_STORAGE}_${cleanEmail}`, b64Key);
}

async function getActiveCryptoKey(): Promise<CryptoKey | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null;

  let b64Key = sessionStorage.getItem(VAULT_KEY_STORAGE);
  if (!b64Key) {
    const rawSession = localStorage.getItem("insightflow_session");
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession);
        const email = (parsed?.email || "guest").trim().toLowerCase();
        b64Key = localStorage.getItem(`${VAULT_KEY_STORAGE}_${email}`);
        if (b64Key) sessionStorage.setItem(VAULT_KEY_STORAGE, b64Key);
      } catch {
        // ignore
      }
    }
  }

  if (!b64Key) {
    await initializeUserVaultKey("default_workspace");
    b64Key = sessionStorage.getItem(VAULT_KEY_STORAGE);
  }
  if (!b64Key) return null;

  return window.crypto.subtle.importKey(
    "raw",
    base64ToBuffer(b64Key),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * تشفير أي بيانات (نص أو كائن JSON) في متصفح العميل قبل التخزين
 */
export async function encryptClientPayload(payload: unknown): Promise<string> {
  const key = await getActiveCryptoKey();
  const serialized =
    typeof payload === "string" ? payload : JSON.stringify(payload);

  if (!key) return serialized;

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(serialized);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return `${ENCRYPTED_PREFIX}${bufferToBase64(iv.buffer)}.${bufferToBase64(encrypted)}`;
}

/**
 * فك تشفير البيانات محلياً في متصفح العميل فقط
 */
export async function decryptClientPayload<T = any>(
  cipherText: string,
  fallback: T
): Promise<T> {
  if (!cipherText) return fallback;

  if (!cipherText.startsWith(ENCRYPTED_PREFIX)) {
    try {
      return JSON.parse(cipherText) as T;
    } catch {
      return (cipherText as unknown as T) ?? fallback;
    }
  }

  try {
    const key = await getActiveCryptoKey();
    if (!key) return fallback;

    const rawBody = cipherText.slice(ENCRYPTED_PREFIX.length);
    const [ivB64, dataB64] = rawBody.split(".");
    if (!ivB64 || !dataB64) return fallback;

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(base64ToBuffer(ivB64)) },
      key,
      base64ToBuffer(dataB64)
    );

    const decodedText = new TextDecoder().decode(decrypted);
    try {
      return JSON.parse(decodedText) as T;
    } catch {
      return decodedText as unknown as T;
    }
  } catch {
    return fallback;
  }
}

export function clearUserVaultKey(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(VAULT_KEY_STORAGE);
}