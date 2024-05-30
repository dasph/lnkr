export const randomBase64 = (length: number) => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(length))))
