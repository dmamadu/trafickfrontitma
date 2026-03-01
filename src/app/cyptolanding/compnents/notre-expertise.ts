import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notre-expertise',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="expertise-wrapper">

      <!-- Blob blanc gauche : arrondi bas-gauche -->
      <div class="white-blob">
        <h2 class="section-title">Notre expertise</h2>
        <ul class="expertise-list">
          <li *ngFor="let item of items" class="expertise-item">
            <span class="checkbox">
              <svg viewBox="0 0 16 16" fill="none">
                <polyline points="3,8 7,12 13,4" stroke="white" stroke-width="2.5"
                          stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="item-text">{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- Partie droite : vidéo + photo flottante -->
      <div class="video-col">
        <video autoplay muted loop playsinline preload="auto" class="bg-video">
          <source src="assets/videos/Railway.mp4" type="video/mp4" />
        </video>
        <div class="bg-overlay"></div>

        <!-- Photo flottante par-dessus la vidéo -->
        <div class="floating-photo">
          <img src="assets/images/expertise-handshake.png" alt="Poignée de mains" />
        </div>
      </div>

    </section>
  `,
  styles: [`

    /* ── Wrapper : flex row ── */
    .expertise-wrapper {
      display: flex;
      flex-direction: row;
      width: 100%;
      min-height: 680px;
      overflow: hidden;
    }

    /* ── Blob blanc gauche ── */
    .white-blob {
      position: relative;
      z-index: 2;
      background-color: #ffffff;
      border-radius: 0 0 0 15rem; 
      width: 52%;
      flex-shrink: 0;
      padding: 56px 60px 72px 60px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      box-sizing: border-box;
    }

    /* ── Titre ── */
    .section-title {
      font-size: 2.2rem;
      font-weight: 900;
      color: #111827;
      margin: 0;
    }

    /* ── Liste ── */
    .expertise-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .expertise-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    /* ── Checkbox orange ── */
    .checkbox {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      background-color: #D45C00;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .item-text {
      font-size: 0.92rem;
      color: #1f2937;
      line-height: 1.6;
    }

    /* ── Colonne droite : vidéo ── */
    .video-col {
      position: relative;
      flex: 1;
      overflow: hidden;
    }

    .bg-video {
      position: absolute;
      top: 50%;
      left: 50%;
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      transform: translate(-50%, -50%);
      object-fit: cover;
      z-index: 0;
    }

    /* ── Overlay sombre sur la vidéo ── */
    .bg-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: 1;
    }

    /* ── Photo flottante par-dessus la vidéo ── */
    .floating-photo {
      position: absolute;
      z-index: 2;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      width: 260px;

      img {
        width: 100%;
        height: 300px;
        object-fit: cover;
        object-position: center;
        display: block;
        border-radius: 6px;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
      }
    }

    /* ── Responsive tablette ── */
    @media (max-width: 900px) {
      .expertise-wrapper {
        flex-direction: column;
      }

      .white-blob {
        width: 100%;
        border-radius: 0 0 0 3rem;
        padding: 48px 32px 60px;
      }

      .video-col {
        height: 320px;
      }

      .floating-photo {
        display: none;
      }
    }



    /* ── Responsive mobile ── */
    @media (max-width: 480px) {
      .white-blob {
        padding: 36px 20px 48px;
        gap: 20px;
      }

      .section-title { font-size: 1.8rem; }
      .item-text { font-size: 0.88rem; }

      .video-col { height: 240px; }
    }

  `],
})
export class NotreExpertiseComponent {
  items: string[] = [
    'Gestion des opérations de déplacement involontaire dans les projets de développement',
    'Gestion des parties prenantes affectées et touchées des projets de développement',
    'Mise en place de solutions digitales adaptées de suivi et évaluation des projets de développement',
    'Formation et appui conseil dans la mise en place de systèmes de sauvegarde environnementale et sociale',
    'Mise en place et administration de systèmes de gestions des réclammations',
    'Installation et gestion de système de suivi GPS de flottes automobiles et autres',
  ];
}