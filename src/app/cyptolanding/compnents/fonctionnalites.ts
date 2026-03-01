import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  title: string;
  description: string;
}

@Component({
  selector: 'app-fonctionnalites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section-wrapper">
      <div class="section-container">

        <!-- Colonne gauche : Image -->
        <div class="image-col">
          <img
            src="assets/images/ImagefonctionnaliteFinale.svg"
            alt="Homme tenant un smartphone affichant l'application Invodis"
            class="feature-image"
          />
        </div>

        <!-- Colonne droite : Contenu -->
        <div class="content-col">

          <h2 class="section-title">Fonctionnalités</h2>

          <ul class="feature-list">
            <li *ngFor="let feature of features" class="feature-item">

              <!-- Icône check cerclé -->
              <span class="check-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </span>

              <div class="feature-text">
                <p class="feature-title">{{ feature.title }}</p>
                <p class="feature-desc">{{ feature.description }}</p>
              </div>

            </li>
          </ul>

        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ── Section wrapper ── */
    .section-wrapper {
      width: 100%;
      background-color: #f5f5f3;
      padding: 64px 80px;
      box-sizing: border-box;
    }

    /* ── Container flex ── */
    .section-container {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 80px;
    }

    /* ── Colonne image ── */
    .image-col {
      flex: 0 0 45%;
      max-width: 45%;
    }

    .feature-image {
      width: 100%;
      height: auto;
      object-fit: cover;
      border-radius: 8px;
      display: block;
    }

    /* ── Colonne contenu ── */
    .content-col {
      flex: 1;
      padding-top: 4px;
    }

    /* ── Titre ── */
    .section-title {
      font-size: 2.4rem;
      font-weight: 800;
      color: #3a9e4f;
      margin: 0 0 32px 0;
      letter-spacing: -0.5px;
    }

    /* ── Liste ── */
    .feature-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* ── Item ── */
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    /* ── Icône SVG ── */
    .check-icon {
      flex-shrink: 0;
      margin-top: 2px;
      width: 20px;
      height: 20px;
      color: #3a9e4f;
    }

    .check-icon svg {
      width: 20px;
      height: 20px;
      stroke: #3a9e4f;
    }

    /* ── Texte feature ── */
    .feature-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .feature-title {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #111827;
      line-height: 1.4;
    }

    .feature-desc {
      margin: 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.6;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .section-wrapper {
        padding: 48px 32px;
      }

      .section-container {
        flex-direction: column;
        gap: 40px;
      }

      .image-col {
        flex: 0 0 100%;
        max-width: 100%;
      }

      .section-title {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .section-wrapper {
        padding: 32px 20px;
      }

      .section-title {
        font-size: 1.7rem;
        margin-bottom: 24px;
      }

      .feature-list {
        gap: 20px;
      }
    }
  `]
})
export class FonctionnalitesComponent {
  features: Feature[] = [
    {
      title: 'Gestion des parties prenantes',
      description: "Suivi de l'implication, des rôles, et des responsabilités."
    },
    {
      title: 'Suivi des projets',
      description: "Chronologie, jalons, et suivi de l'avancement."
    },
    {
      title: 'Communication et collaboration',
      description: 'Outils de communication entre les parties prenantes, partage de documents.'
    },
    {
      title: 'Carte interactive',
      description: 'Carte de google map avec des géofences qui délimites les zones affectées des projets'
    },
    {
      title: 'Rapports et analyses',
      description: "Tableau de bord pour évaluer l'impact, le progrès et les besoins."
    },
    {
      title: 'Gestion des plaintes',
      description: 'Enregistrement, suivi et résolution des plaintes via un système traçable'
    },
    {
      title: 'Gestion des compensations',
      description: 'Suivi des demandes, validation des critères, et versement des indemnités'
    }
  ];
}