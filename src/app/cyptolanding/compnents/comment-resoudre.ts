import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-comment-resoudre',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="resoudre-wrapper">
      <div class="white-card">

        <!-- Colonne gauche : Image smartphone -->
        <div class="phone-col">
          <img
            src="assets/images/MOBILEAPP.png"
            alt="Application Invodis sur smartphone"
            class="phone-img"
          />
        </div>

        <!-- Colonne droite : Texte + bouton -->
        <div class="content-col">
          <h2 class="section-title">
            Comment résoudre ce<br />problème&nbsp;?
          </h2>

          <p class="section-desc">
            Invodis met en place une application innovante et taillée sur
            mesure de gestion de la réinstallation et des parties prenantes,
            conformément aux meilleures pratiques mondiales.
          </p>

          <p class="section-desc">
            L'application aide à résoudre les défis liés à la relocalisation
            de populations avec des outils permettant une meilleure
            communication, un suivi des progrès et une coordination efficace.
          </p>

          <button class="btn-savoir-plus" (click)="onEnSavoirPlus()">
            En savoir plus &nbsp;→
          </button>
        </div>

      </div>
    </section>
  `,
  styles: [`

    /* ── Wrapper fond gris ── */

    /* ── Carte blanche : arrondi uniquement en bas à gauche ── */
    .resoudre-wrapper {
      width: 100%;
      background-color: #efefed;
      // padding: 40px 0 0 0;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      padding-bottom: 25px;
    }

    /* Grande carte blanche : arrondi seulement en haut à gauche */
    .white-card {
     width: 80%;
      background-color: #ffffff;
      border-radius:0 0 5rem 0; /* uniquement coin haut-gauche */
      margin-left: 80px; /* décalage depuis le bord gauche */
      padding: 80px 80px 80px 80px;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 80px;
      min-height: 560px;
    }

    /* ── Colonne téléphone ── */
    .phone-col {
      flex-shrink: 0;
      width: 260px;
      display: flex;
      justify-content: center;
    }

    .phone-img {
      width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 12px 40px rgba(0, 0, 0, 0.15));
    }

    /* ── Colonne texte ── */
    .content-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Titre ── */
    .section-title {
      font-size: 2.3rem;
      font-weight: 900;
      color: #1a2e3b;
      line-height: 1.2;
      margin: 0;
    }

    /* ── Paragraphes ── */
    .section-desc {
      margin: 0;
      font-size: 0.95rem;
      color: #4b5563;
      line-height: 1.75;
      max-width: 480px;
    }

    /* ── Bouton orange ── */
    .btn-savoir-plus {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-top: 12px;
      padding: 16px 36px;
      background-color: #D45C00;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      width: fit-content;
      transition: background-color 0.2s ease, transform 0.15s ease;
    }

    .btn-savoir-plus:hover {
      background-color: #b84e00;
      transform: translateX(3px);
    }

    /* ── Responsive tablette ── */
    @media (max-width: 900px) {
      .white-card {
        margin-left: 24px;
        flex-direction: column;
        padding: 48px 32px;
        gap: 40px;
        text-align: center;
        border-radius: 0 0 0 2rem;
      }

      .phone-col { width: 200px; }

      .section-title { font-size: 1.9rem; }

      .section-desc {
        max-width: 100%;
        margin: 0 auto;
      }

      .btn-savoir-plus {
        margin: 8px auto 0;
      }
    }

    /* ── Responsive mobile ── */
    @media (max-width: 480px) {
      .white-card {
        margin-left: 12px;
        padding: 36px 20px;
      }

      .phone-col { width: 160px; }
      .section-title { font-size: 1.6rem; }
    }

  `]
})
export class CommentResoudreComponent {
  onEnSavoirPlus(): void {
    console.log('En savoir plus clicked');
  }
}