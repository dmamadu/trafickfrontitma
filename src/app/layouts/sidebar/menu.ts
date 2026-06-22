import { MenuItem } from "./menu.model";

const ADMIN_ROLES = ["Super Admin", "Admin"];

export const MENU: MenuItem[] = [
  {
    id: 1,
    label: "MENUITEMS.MENU.TEXT",
    isTitle: true,
  },
  {
    id: 2,
    label: "DASHBOARDS",
    icon: "bx-home-circle",
    subItems: [
      {
        id: 3,
        label: "BaseLine PAR",
        link: "/dashboards/jobs",
        parentId: 2,
        icon: "bx-line-chart",
      },
      {
        id: 4,
        label: "Mise en Oeuvre",
        link: "/dashboards/miseEnOeuvre",
        parentId: 2,
        icon: "bx-wrench",
      },
    ],
  },
  {
    id: 5,
    label: "PROJETS",
    icon: "bx-briefcase-alt-2",
    roles: ADMIN_ROLES,
    subItems: [
      {
        id: 6,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/projects/list",
        parentId: 5,
      },
      {
        id: 7,
        label: "Normes",
        icon: "bx-book-open",
        link: "/projects/normes",
        parentId: 5,
      },
    ],
  },
  {
    id: 8,
    label: "MAITRES D'OUVRAGES",
    icon: "bxs-buildings",
    roles: ADMIN_ROLES,
    subItems: [
      {
        id: 9,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/maitrouvrages/list",
        parentId: 8,
      },
    ],
  },
  {
    id: 10,
    label: "Parties Prenantes",
    icon: "bxs-group",
    subItems: [
      {
        id: 11,
        label: "Parties affectées",
        icon: "bxs-user-minus",
        link: "/pap/list",
        parentId: 10,
        subItems: [
          {
            id: 12,
            label: "Exploitants/Agricole",
            icon: "bxs-tree",
            link: "/pap/papAgricole",
            parentId: 11,
          },
          {
            id: 13,
            label: "Place Affaires/Economiques",
            icon: "bxs-store",
            link: "/pap/papPlaceAffaire",
            parentId: 11,
          },
          {
            id: 14,
            label: "Habitat",
            icon: "bxs-home",
            link: "/pap/papHabitat",
            parentId: 11,
          },
        ],
      },
      {
        id: 15,
        label: "Parties intéréssées",
        icon: "bxs-user-check",
        parentId: 10,
        subItems: [
          {
            id: 16,
            label: "Liste",
            icon: "bx-list-ul",
            link: "/pip/",
            parentId: 15,
          },
        ],
      },
    ],
  },
  {
    id: 17,
    label: "Consultants",
    icon: "bxs-id-card",
    roles: ADMIN_ROLES,
    subItems: [
      {
        id: 18,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/consultant/chef-de-mission",
        parentId: 17,
      },
    ],
  },
  {
    id: 19,
    label: "MISE EN ŒUVRE DU PAR",
    icon: "bx-task",
    subItems: [
      {
        id: 20,
        label: "Taches",
        icon: "bx-list-check",
        link: "/tasks/liste",
        parentId: 19,
      },
      {
        id: 21,
        label: "Entente de compensation",
        icon: "bx-handshake",
        link: "/ententeCompensation/list",
        parentId: 19,
      },
      {
        id: 22,
        label: "Mécanisme de gestion des plaintes",
        icon: "bxs-megaphone",
        parentId: 19,
        subItems: [
          {
            id: 23,
            label: "Phase d'Étude",
            icon: "bx-list-ul",
            link: "/plainte/list",
            parentId: 22,
          },
          {
            id: 24,
            label: "Phase de Mise en Œuvre",
            icon: "bx-list-ul",
            link: "/plainte/miseEnOeuvrePlainte",
            parentId: 22,
          },
        ],
      },
      {
        id: 25,
        label: "Accompagnement social",
        icon: "bxs-heart",
        parentId: 19,
        subItems: [
          {
            id: 26,
            label: "Liste",
            icon: "bx-list-ul",
            link: "/accompagnement/list",
            parentId: 25,
          },
        ],
      },
      {
        id: 27,
        label: "Restauration des moyens de subsistance",
        icon: "bx-recycle",
        parentId: 19,
        subItems: [
          {
            id: 28,
            label: "Liste",
            icon: "bx-list-ul",
            link: "/restauration/list",
            parentId: 27,
          },
        ],
      },
      {
        id: 29,
        label: "Négociation et conciliation",
        icon: "bxs-conversation",
        parentId: 19,
        subItems: [
          {
            id: 30,
            label: "Liste",
            icon: "bx-list-ul",
            link: "/negociation/list",
            parentId: 29,
          },
        ],
      },
      {
        id: 31,
        label: "Paiement des compensations",
        icon: "bxs-credit-card",
        parentId: 19,
        subItems: [
          {
            id: 32,
            label: "Liste",
            icon: "bx-list-ul",
            link: "/paiement/list",
            parentId: 31,
          },
        ],
      },
      {
        id: 33,
        label: "Engagements des parties prenantes",
        icon: "bxs-book-bookmark",
        parentId: 19,
        subItems: [
          {
            id: 34,
            label: "Liste",
            icon: "bx-list-ul",
            link: "/engagements/list",
            parentId: 33,
          },
        ],
      },
    ],
  },
  {
    id: 35,
    label: "Gestion des documents",
    icon: "bxs-folder",
    subItems: [
      {
        id: 36,
        label: "Documents",
        icon: "bxs-file",
        link: "/dossiers",
        parentId: 35,
      },
      {
        id: 37,
        label: "Catégories documents",
        icon: "bxs-category",
        link: "/catégorie-dossier",
        parentId: 35,
      },
    ],
  },
  {
    id: 38,
    label: "Élaboration du PAR",
    icon: "bxs-detail",
    subItems: [
      {
        id: 39,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/rencontres",
        parentId: 38,
      },
    ],
  },
  {
    id: 40,
    label: "Géolocalisation",
    icon: "bxs-map",
    roles: ADMIN_ROLES,
    subItems: [
      {
        id: 41,
        label: "Quartiers",
        icon: "bx-buildings",
        link: "/geolocalisation/quartiers",
        parentId: 40,
      },
      {
        id: 42,
        label: "Points de repère",
        icon: "bx-map-pin",
        link: "/geolocalisation/points-de-repere",
        parentId: 40,
      },
    ],
  },
  {
    id: 43,
    label: "PARAMÉTRAGE",
    isTitle: true,
    roles: ADMIN_ROLES,
  },
  {
    id: 44,
    label: "Administration",
    icon: "bxs-cog",
    roles: ADMIN_ROLES,
    subItems: [
      {
        id: 45,
        label: "Utilisateurs",
        icon: "bxs-user-detail",
        link: "/utilisateurs",
        parentId: 44,
      },
      {
        id: 46,
        label: "Rôles",
        icon: "bxs-shield",
        link: "/roles",
        parentId: 44,
      },
      {
        id: 47,
        label: "Fonctions",
        icon: "bxs-briefcase",
        link: "/fonctions",
        parentId: 44,
      },
      {
        id: 48,
        label: "Catégories utilisateurs",
        icon: "bxs-label",
        link: "/categories",
        parentId: 44,
      },
    ],
  },
];