import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type ColorVariant = 'green' | 'orange';

interface BeneficiaryCard {
  title: string;
  img: string;
  color: ColorVariant;     // 'green' (gauche) ou 'orange' (droite)
  hoverText: string;       // texte à afficher sur le fond coloré
}

@Component({
  selector: 'app-beneficiaries-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './beneficiaries-section.component.html',
  styleUrls: ['./beneficiaries-section.component.css'],
})
export class BeneficiariesSectionComponent {
  heading = 'Avantages pour nos bénéficiaires';

  cards: BeneficiaryCard[] = [
    {
      title: 'Gouvernements',
      img: 'assets/images/beneficiaries/govement.svg',
      color: 'green',
      hoverText:
        'Pilotage de politiques publiques, traçabilité et reporting en temps réel pour de meilleures décisions.',
    },
    {
      title: 'Communautés',
      img: 'assets/images/beneficiaries/comnaute.svg',
      color: 'green',
      hoverText:
        'Participation inclusive, transparence des opérations et accès simplifié aux informations clés.',
    },
    {
      title: 'Entreprises et Institutions',
      img: 'assets/images/beneficiaries/entrepriseInst.svg',
      color: 'orange',
      hoverText:
        'Optimisation des coûts, conformité et intégration fluide avec les systèmes d’information.',
    },
    {
      title: 'Organismes humanitaires',
      img: 'assets/images/beneficiaries/organismeH.svg',
      color: 'orange',
      hoverText:
        'Coordination inter-agences, suivi des impacts et déploiement rapide sur le terrain.',
    },
  ];
}
