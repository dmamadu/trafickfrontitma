import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pourquoi-parties-prenantes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section-wrapper">
      <div class="white-card">
        <div class="content-col">
          <h2 class="section-title">
            Pourquoi la gestion<br>
            des <span class="title-green">parties prenantes</span><br>
            est essentielle&nbsp;?
          </h2>
          <p class="section-desc">
            Les opérations de réinstallation impliquent des
            dizaines d'acteurs (gouvernements, ONG,
            communautés...). Sans coordination centralisée, les
            risques de conflits, de retards et de mauvaise
            allocation des ressources sont élevés.
          </p>
        </div>

        <div class="image-col">
          <div class="image-card">
            <img
              src="assets/images/african-woman.svg"
              alt="Femme en tenue traditionnelle africaine souriant"
              class="section-img"
            />
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`

    .section-wrapper {
      width: 100%;
      background-color: #efefed;
      padding: 40px 0 0 0;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    /* Grande carte blanche : arrondi seulement en haut à gauche */
    .white-card {
     width: 80%;
      background-color: #ffffff;
      border-radius: 5rem 0 0 0; /* uniquement coin haut-gauche */
      margin-left: 80px; /* décalage depuis le bord gauche */
      padding: 80px 80px 80px 80px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 80px;
      min-height: 560px;
    }

    /* Colonne texte */
    .content-col {
      flex: 1;
      min-width: 0;
    }

    .section-title {
      font-size: 2.1rem;
      font-weight: 900;
      color: #111827;
      line-height: 1.28;
      margin: 0 0 28px 0;
    }

    .title-green {
      color: #2e8b40;
      text-decoration: underline;
      text-underline-offset: 6px;
      text-decoration-thickness: 2px;
    }

    .section-desc {
      margin: 0;
      font-size: 0.95rem;
      color: #4b5563;
      line-height: 1.95;
      max-width: 400px;
    }

    /* Colonne image */
    .image-col {
      flex-shrink: 0;
      width: 320px;
    }

    .image-card {
      border-radius: 1.5rem;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .section-img {
      width: 100%;
      height: 500px;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    /* Responsive tablette */
    @media (max-width: 900px) {
      .white-card {
        margin-left: 24px;
        flex-direction: column;
        padding: 48px 24px;
        gap: 36px;
        border-radius: 2rem 0 0 0;
      }

      .content-col { text-align: center; }
      .section-desc { max-width: 100%; }

      .image-col {
        width: 100%;
        max-width: 340px;
        margin: 0 auto;
      }

      .section-img { height: 380px; }
      .section-title { font-size: 1.8rem; }
    }

    /* Responsive mobile */
    @media (max-width: 480px) {
      .white-card {
        margin-left: 12px;
        padding: 36px 20px;
      }

      .section-title { font-size: 1.5rem; }
      .section-img { height: 300px; }
    }

  `]
})
export class PourquoiPartiesPrenantesComponent {}