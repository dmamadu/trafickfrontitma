export interface StatutOption {
  value: string;
  label: string;
  icon: string;
  bg: string;
  border: string;
  color: string;
}

// Options de statut partagées entre la création/édition et la liste des tâches.
export const STATUT_OPTIONS: StatutOption[] = [
  { value: 'en-attente', label: 'En attente', icon: 'hourglass_empty', bg: '#FFF3CD', border: '#F59E0B', color: '#92400E' },
  { value: 'en-cours',   label: 'En cours',   icon: 'sync',            bg: '#DBEAFE', border: '#2563EB', color: '#1E3A8A' },
  { value: 'approuve',   label: 'Approuvé',   icon: 'verified',        bg: '#E8F5E9', border: '#2E7D32', color: '#1B5E20' },
  { value: 'complete',   label: 'Complété',   icon: 'check_circle',    bg: '#EDE9FE', border: '#7C3AED', color: '#4C1D95' },
];
