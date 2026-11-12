// Instalasi PWA (tanpa Play Store / App Store).

let promptTertunda = null;
const pendengar = new Set();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  promptTertunda = e;
  pendengar.forEach((f) => f());
});

window.addEventListener('appinstalled', () => {
  promptTertunda = null;
  pendengar.forEach((f) => f());
});

export function saatStatusPasang(f) { pendengar.add(f); return () => pendengar.delete(f); }
export function bisaPasang() { return !!promptTertunda; }
export function sudahTerpasang() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}
export function iOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent) && !sudahTerpasang(); }

export async function pasang() {
  if (!promptTertunda) return false;
  promptTertunda.prompt();
  const { outcome } = await promptTertunda.userChoice;
  promptTertunda = null;
  pendengar.forEach((f) => f());
  return outcome === 'accepted';
}
