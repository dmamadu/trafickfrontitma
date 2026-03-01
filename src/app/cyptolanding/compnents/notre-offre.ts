import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notre-offre',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="offre-wrapper">
      <div class="offre-container">

        <!-- Image logo -->
        <div class="offre-logo">
          <img
            src="assets/images/notreOffre.svg"
            alt="Logo Notre offre Invodis"
            class="offre-img"
          />
        </div>

        <!-- Texte Notre offre -->
        <h2 class="offre-title">Notre offre</h2>

      </div>
    </section>
  `,
  styles: [`
    /* ── Wrapper ── */
    .offre-wrapper {
      width: 100%;
      background-color: #f5f5f3;
      padding: 60px 40px;
      box-sizing: border-box;
    }

    /* ── Container flex centré ── */
    .offre-container {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 80px;
    }

    /* ── Logo image ── */
    .offre-logo {
      flex-shrink: 0;
      width: 220px;
    }

    .offre-img {
      width: 100%;
      height: auto;
      object-fit: contain;
      display: block;
    }

    /* ── Titre ── */
    .offre-title {
      font-size: 2.4rem;
      font-weight: 800;
      color: #2d7a3a;
      margin: 0;
      letter-spacing: -0.3px;
      white-space: nowrap;
    }

    /* ── Responsive tablette ── */
    @media (max-width: 768px) {
      .offre-container {
        flex-direction: column;
        gap: 32px;
        text-align: center;
      }

      .offre-logo {
        width: 160px;
      }

      .offre-title {
        font-size: 2rem;
      }
    }

    /* ── Responsive mobile ── */
    @media (max-width: 480px) {
      .offre-wrapper {
        padding: 40px 20px;
      }

      .offre-logo {
        width: 130px;
      }

      .offre-title {
        font-size: 1.7rem;
      }
    }
  `]
})
export class NotreOffreComponent {
  @Input() imagePath: string = 'assets/images/notre-offre-logo.png';
}