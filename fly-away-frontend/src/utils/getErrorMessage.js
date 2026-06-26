/**
 * Extrae un mensaje de error legible desde una respuesta de Axios.
 *
 * El backend de Fly Away puede responder errores en 3 formatos distintos:
 *  1. ProblemDetail (cuando se lanza ValidationException) -> { type, title, status, detail, instance }
 *     El mensaje útil está en `detail`, NO en `message`.
 *  2. String plano (cuando falla @Valid / MethodArgumentNotValidException) ->
 *     "Error en la validación: ..." con Content-Type text/plain.
 *  3. Sin respuesta del servidor (red caída, CORS, timeout).
 *
 * @param {import('axios').AxiosError} err
 * @param {string} fallback Mensaje genérico si no se puede determinar nada útil.
 * @returns {string}
 */
export function getErrorMessage(err, fallback = 'Ocurrió un error inesperado. Intenta nuevamente.') {
  const data = err?.response?.data;

  if (!data) return fallback;

  // Caso 2: el backend devolvió un string plano (text/plain)
  if (typeof data === 'string') {
    return data.replace(/^Error en la validación:\s*/i, '').trim() || fallback;
  }

  // Caso 1: ProblemDetail -> el mensaje real está en "detail"
  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }

  // Por si en algún momento el backend cambia a { message: "..." }
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }

  // Último recurso: cualquier objeto con campos de texto (ej. errores de validación por campo)
  if (typeof data === 'object') {
    const messages = Object.values(data).filter((v) => typeof v === 'string' && v.trim());
    if (messages.length) return messages.join(' ');
  }

  return fallback;
}
