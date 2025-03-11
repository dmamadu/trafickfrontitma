import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private colors: { primary: string, secondary: string, accent: string } = {
    primary: '#3F51B5', // Couleur par défaut
    secondary: '#FF4081', // Couleur par défaut
    accent: '#4CAF50' // Couleur par défaut
  };

  constructor() {
    this.loadColorsFromLocalStorage();
  }

  // Appliquer les couleurs aux variables CSS
  private applyColorsToRoot() {
    document.documentElement.style.setProperty('--primary-color', this.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', this.colors.secondary);
    document.documentElement.style.setProperty('--accent-color', this.colors.accent);
  }

  // Mettre à jour les couleurs
  setColors(colors: { primary: string, secondary: string, accent: string }) {
    this.colors = colors;
    this.applyColorsToRoot();
    this.saveColorsToLocalStorage();
  }

  // Récupérer les couleurs actuelles
  getColors() {
    return this.colors;
  }

  // Charger les couleurs depuis le localStorage
  private loadColorsFromLocalStorage() {
    const savedColors = localStorage.getItem('projectColors');
    if (savedColors) {
      this.colors = JSON.parse(savedColors);
      this.applyColorsToRoot();
    }
  }

  // Sauvegarder les couleurs dans le localStorage
  private saveColorsToLocalStorage() {
    localStorage.setItem('projectColors', JSON.stringify(this.colors));
  }
}
