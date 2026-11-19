import { Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";

/**
 * Libellés français de la pagination Material, fournis pour toute l'application (AppModule).
 * Un module qui déclare son propre MatPaginatorIntl garde le sien.
 */
@Injectable()
export class PaginatorIntlFr extends MatPaginatorIntl {
  override itemsPerPageLabel = "Lignes par page";
  override nextPageLabel = "Page suivante";
  override previousPageLabel = "Page précédente";
  override firstPageLabel = "Première page";
  override lastPageLabel = "Dernière page";

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return `0 sur ${length}`;
    }
    const start = page * pageSize;
    const end = Math.min(start + pageSize, length);
    return `${start + 1} – ${end} sur ${length}`;
  };
}
