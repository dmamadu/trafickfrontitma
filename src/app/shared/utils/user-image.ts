import { environment } from "src/environments/environment";

/** Image affichée quand l'utilisateur n'a pas de photo. */
export const DEFAULT_USER_IMAGE = "assets/images/users/user-dummy-img.jpg";

/**
 * Événement émis sur `window` quand l'utilisateur modifie son propre profil (photo, contact…),
 * pour que la barre du haut se mette à jour sans rechargement.
 */
export const USER_PROFILE_UPDATED_EVENT = "invodis:user-profile-updated";

/**
 * Transforme le champ `imageUrl` d'un utilisateur en URL affichable.
 * Il peut contenir une URL complète (anciens comptes) ou un simple nom de fichier MinIO.
 */
export function resolveUserImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl || !imageUrl.trim()) {
    return DEFAULT_USER_IMAGE;
  }
  if (/^(https?:|data:|assets\/)/.test(imageUrl)) {
    return imageUrl;
  }
  return `${environment.apiUrl}fileMinios/download/${imageUrl}`;
}
