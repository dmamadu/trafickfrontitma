import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";

interface SlideContent {
  title: string;
  description: string;
  backgroundImage: string;
}

@Component({
  selector: "app-hero-carousel",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./hero-carousel.component.html",
  styleUrl: "./hero-carousel.component.css"
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  slides: SlideContent[] = [
    {
      title: "Gérez efficacement les parties prenantes",
      description:
        "Assurez le succés des relocalisations grace à une gestion transparente et collaborative ",
      backgroundImage: "url('assets/images/carousel/1c.webp')",
    },
    {
      title: "Une application de gestion des parties prenates",
      description:
        "Connectez, coordonnez, et suivez chaque étape du processus de déplacement involontaire",
      backgroundImage: "url('assets/images/carousel/2c.webp')",
    },
    {
      title: "Optimisez la coordination et l'implication des parties prenantes",
      description:
        "Assurez le succés de la réinstallation grace à une gestion inclusive,transparente et collaborative",
      backgroundImage: "url('assets/images/carousel/3c.webp')",
    },
    {
      title: "Une application de gestion des parties prenantes",
      description:
        "Facilitez la gestion des parties prenantes dans les opérations de déplacement involontaire",
      backgroundImage: "url('assets/images/carousel/4c.webp')",
    },
    {
      title: "Coordination en temps de crise",
      description:
        "Connectez tous les acteurs clés autour d'une plateforme unique pendant les situations d'urgence.",
      backgroundImage: "url('assets/images/carousel/5c.webp')",
    },
  ];

  currentIndex = 0;
  private intervalId: any;
  private readonly intervalTime = 5000;

  ngOnInit(): void {
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }

  get currentSlide() {
    return this.slides[this.currentIndex];
  }

  get backgroundStyle() {
    return {
      "background-image": this.currentSlide.backgroundImage,
      opacity: "0.9",
    };
  }

  private startCarousel(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    }, this.intervalTime);
  }

  private clearInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
