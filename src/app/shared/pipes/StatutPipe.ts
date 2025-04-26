import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statut'
})
export class StatutPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const mappings: {[key: string]: string} = {
      'en-attente': 'En attente',
      'approuve': 'Approuvé',
      'en-cours': 'En cours',
      'complete': 'Complété'
    };

    return mappings[value] || value;
  }
}
