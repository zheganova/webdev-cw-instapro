// Функция для экранирования HTML
export function escapeHtml(unsafeText) {
  return unsafeText.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
