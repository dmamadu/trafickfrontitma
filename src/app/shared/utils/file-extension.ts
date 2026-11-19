/**
 * Indique si une extension de fichier (".JPEG", ".jpg", "png"…) figure dans une liste autorisée.
 *
 * - Comparaison insensible à la casse (".JPG", ".Jpeg"… sont acceptés).
 * - ".jpg" et ".jpeg" sont équivalents : c'est le même format JPEG. Une liste qui autorise
 *   l'un autorise donc l'autre.
 * - Le point initial est facultatif, dans la liste comme dans l'extension testée.
 */
export function isExtensionAccepted(accept: string[], extension: string): boolean {
  const ext = normalizeExtension(extension);
  return accept.some((allowed) => normalizeExtension(allowed) === ext);
}

function normalizeExtension(extension: string): string {
  const lower = (extension || "").trim().toLowerCase();
  const withDot = lower.startsWith(".") ? lower : "." + lower;
  return withDot === ".jpeg" ? ".jpg" : withDot;
}
