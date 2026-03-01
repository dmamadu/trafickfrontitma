import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type Couleur = 'green' | 'dark';

interface Solution {
  id: number;
  titre: string;
  description: string;
  couleur: Couleur;
  icone: 'communication' | 'progress' | 'coordination' | 'risk' | 'accessibility';
  iconSvg?: SafeHtml;
}

@Component({
  selector: 'app-solutions-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solutions-section.component.html',
  styleUrls: ['./solutions-section.component.css'],
})
export class SolutionsSectionComponent {

  solutions: Solution[];

  constructor(private sanitizer: DomSanitizer) {
    this.solutions = [
      {
        id: 1,
        titre: 'Amélioration de la communication',
        description: 'Amélioration de la communication à travers des canaux centralisés, des notifications et alertes en temps réel, ainsi que des forums de discussion sécurisés.',
        couleur: 'green',
        icone: 'communication',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <circle cx="12" cy="20" r="1" fill="white" stroke="none"/>
            <circle cx="17" cy="21" r="2"/>
            <line x1="19" y1="19" x2="21" y2="21"/>
          </svg>`)
      },
      {
        id: 2,
        titre: 'Suivi des progrès',
        description: 'Suivi des progrès via des tableaux de bord interactifs, des tâches planifiées avec jalons et des indicateurs de performance personnalisés pour un pilotage précis et en temps réel.',
        couleur: 'dark',
        icone: 'progress',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>`)
      },
      {
        id: 3,
        titre: 'Coordination entre les parties prenantes',
        description: 'Coordination renforcée grâce à une gestion claire des rôles, un partage centralisé de documents et un suivi des interactions pour assurer transparence et collaboration efficace entre les parties prenantes.',
        couleur: 'dark',
        icone: 'coordination',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>`)
      },
      {
        id: 4,
        titre: 'Gestion des risques et des conflits',
        description: 'Gestion proactive des risques et des conflits grâce à des alertes sur les problèmes potentiels et des outils intégrés de médiation pour prévenir les tensions et faciliter la résolution des désaccords.',
        couleur: 'dark',
        icone: 'risk',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>`)
      },
      {
        id: 5,
        titre: 'Accessibilité et collaboration à distance',
        description: "Solution collaborative mobile-first offrant un accès omniprésent et une synchronisation immédiate des données pour les équipes dispersées, crucial dans les interventions d'urgence.",
        couleur: 'dark',
        icone: 'accessibility',
        iconSvg: this.sanitizer.bypassSecurityTrustHtml(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <circle cx="12" cy="20" r="1" fill="white" stroke="none"/>
            <circle cx="17" cy="22" r="2"/>
          </svg>`)
      },
    ];
  }
}