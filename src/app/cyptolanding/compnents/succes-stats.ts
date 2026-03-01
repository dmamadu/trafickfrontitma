import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat {
  value: string;
  plus: boolean;
  label: string;
}

@Component({
  selector: 'app-succes-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="succes-wrapper">

      <!-- Titre -->
      <h2 class="succes-title">
        Nous sommes fiers de notre <span class="succes-green">succès</span>
      </h2>

      <!-- Carte stats -->
      <div class="stats-card">
        <div class="stats-grid">
          <div
            *ngFor="let stat of stats; let last = last"
            class="stat-item"
            [class.no-border]="last"
          >
            <p class="stat-value">
              {{ stat.value }}<span class="stat-plus"> +</span>
            </p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </div>

    </section>
  `,
  styles: [`
    /* ── Wrapper ── */
    .succes-wrapper {
      width: 100%;
      background-color: #f5f5f3;
      padding: 64px 40px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── Titre ── */
    .succes-title {
      font-size: 2rem;
      font-weight: 800;
      color: #111827;
      text-align: center;
      margin: 0 0 40px 0;
      letter-spacing: -0.3px;
    }

    .succes-green {
      color: #3a9e4f;
    }

    /* ── Carte blanche ── */
    .stats-card {
      background-color: #ffffff;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
      padding: 40px 48px;
      width: 100%;
      max-width: 900px;
      box-sizing: border-box;
    }

    /* ── Grille 4 colonnes ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      align-items: center;
    }

    /* ── Chaque stat ── */
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 0 24px;
      border-right: 1.5px solid #e5e7eb;
      box-sizing: border-box;
    }

    .stat-item.no-border {
      border-right: none;
    }

    /* ── Valeur ── */
    .stat-value {
      margin: 0 0 8px 0;
      font-size: 1.9rem;
      font-weight: 800;
      color: #111827;
      line-height: 1.2;
      white-space: nowrap;
    }

    .stat-plus {
      color: #3a9e4f;
      font-weight: 800;
      font-size: 1.9rem;
    }

    /* ── Label ── */
    .stat-label {
      margin: 0;
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.5;
    }

    /* ── Responsive tablette ── */
    @media (max-width: 768px) {
      .succes-wrapper {
        padding: 48px 24px;
      }

      .succes-title {
        font-size: 1.6rem;
      }

      .stats-card {
        padding: 32px 24px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 32px 0;
      }

      .stat-item {
        border-right: none;
        border-bottom: 1.5px solid #e5e7eb;
        padding-bottom: 24px;
      }

      /* Retirer la bordure bas sur les 2 derniers items */
      .stat-item:nth-child(3),
      .stat-item:nth-child(4) {
        border-bottom: none;
        padding-bottom: 0;
      }

      /* Ajouter séparateur vertical entre les 2 colonnes */
      .stat-item:nth-child(odd) {
        border-right: 1.5px solid #e5e7eb;
      }
    }

    /* ── Responsive mobile ── */
    @media (max-width: 480px) {
      .succes-title {
        font-size: 1.3rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 24px 0;
      }

      .stat-item {
        border-right: none !important;
        border-bottom: 1.5px solid #e5e7eb;
        padding-bottom: 24px;
      }

      .stat-item.no-border {
        border-bottom: none;
        padding-bottom: 0;
      }

      .stat-value,
      .stat-plus {
        font-size: 1.6rem;
      }
    }
  `]
})
export class SuccesStatsComponent {
  stats: Stat[] = [
    {
      value: '18',
      plus: true,
      label: "Années d'expérience"
    },
    {
      value: '50 000',
      plus: true,
      label: 'Pap recensés et ou réinstallés'
    },
    {
      value: '50',
      plus: true,
      label: 'Opérations de réinstallation'
    },
    {
      value: '30 000',
      plus: true,
      label: 'Parties prenantes satisfaites'
    }
  ];
}