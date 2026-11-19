import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private colors: { primary: string, secondary: string, accent: string } = {
    primary: '#245363', // Couleur par défaut : charte INVODIS
    secondary: '#D45C00', // Couleur par défaut : charte INVODIS
    accent: '#2F7184' // Couleur par défaut
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
