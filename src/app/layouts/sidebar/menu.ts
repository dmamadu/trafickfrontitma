import { MenuItem } from "./menu.model";
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
        id: 1,
        label: "BaseLine PAR",
        link: "/dashboards/jobs",
        parentId: 2,
        icon: "bx bx-line-chart",
      },
      {
        id: 2,
        label: "Mise en Oeuvre",
        link: "/dashboards/miseEnOeuvre",
        parentId: 2,
        icon: "bx bx-wrench",
      },
    ],
  },
  {
    id: 40,
    label: "PROJETS",
    icon: "bx-briefcase-alt-2",
    subItems: [
      {
        id: 41,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/projects/list",
        parentId: 40,
      },
      // {
      //   id: 42,
      //   label: "Créer",
      //   icon: "bx-plus-circle",
      //   link: "/projects/create",
      //   parentId: 40,
      // }
    ],
  },
  {
    id: 45,
    label: "TACHES",
    icon: "bx-task",
    subItems: [
      {
        id: 46,
        label: "Liste des taches",
        icon: "bx-list-ul",
        link: "/tasks/liste",
        parentId: 45,
      },
    ],
  },
  {
    id: 91,
    label: "MAITRES D'OUVRAGES",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 92,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/maitrouvrages/list",
        parentId: 91,
      },
    ],
  },
  {
    id: 93,
    label: "Parties Prenantes",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 94,
        label: "Parties affectées",
        icon: "bxs-user-detail",
        link: "/pap/list",
        parentId: 93,
        subItems: [
          {
            id: 110,
            label: "Exploitants/Agricole",
            icon: "bxs-tree",
            link: "/pap/papAgricole",
            parentId: 94,
          },

          {
            id: 112,
            label: "Place Affaires/Economiques",
            icon: "bxs-chart",
            link: "/pap/papPlaceAffaire",
            parentId: 94,
          },
        ],
      },
      {
        id: 95,
        label: "Parties intéréssées",
        icon: "bxs-buildings",
        parentId: 93,
        subItems: [
          {
            id: 98,
            label: "Medias",
            icon: "bxs-buildings",
            link: "/pip/medias",
            parentId: 95,
          },
          {
            id: 99,
            label: "ONG",
            icon: "bxs-heart",
            link: "/pip/ong",
            parentId: 95,
          },
          {
            id: 100,
            label: "Entreprises",
            icon: "bxs-briefcase",
            link: "/pip/entreprise",
            parentId: 95,
          },
          {
            id: 101,
            label: "Organisations",
            icon: "bxs-group",
            link: "/pip/organisation",
            parentId: 95,
          },
          {
            id: 102,
            label: "Bailleurs",
            icon: "bxs-bank",
            link: "/pip/bailleurs",
            parentId: 95,
          },
        ],
      },
    ],
  },
  {
    id: 103,
    label: "Consultants",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 104,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/consultant/chef-de-mission",
        parentId: 103,
      },
    ],
  },
  {
    id: 105,
    label: "Plaintes",
    icon: "bxs-comment-detail",
    subItems: [
      {
        id: 106,
        label: "Liste(Phase d'Étude)",
        icon: "bx-list-ul",
        link: "/plainte/list",
        parentId: 105,
      },
      {
        id: 107,
        label: "Phase de Mise en Œuvre",
        icon: "bx-list-ul",
        link: "/plainte/miseEnOeuvrePlainte",
        parentId: 105,
      },
    ],
  },
  {
    id: 108,
    label: "Gestion des priviléges",
    icon: "bxs-comment-detail",
    subItems: [
      {
        id: 109,
        label: "Roles",
        icon: "bx-list-ul",
        link: "/roles",
        parentId: 108,
      },
      {
        id: 110,
        label: "Fonctions",
        icon: "bx-list-ul",
        link: "/fonctions",
        parentId: 108,
      },
      {
        id: 111,
        label: "Niveau de priviléges",
        icon: "bx-list-ul",
        link: "/categories",
        parentId: 108,
      },
    ],
  },
  {
    id: 112,
    label: "Gestion des utilisateurs",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 113,
        label: "Utilisateurs",
        icon: "bx-list-ul",
        link: "/utilisateurs",
        parentId: 112,
      },
    ],
  },
  {
    id: 114,
    label: "Gestion des documents",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 115,
        label: "Documents",
        icon: "bx-list-ul",
        link: "/dossiers",
        parentId: 114,
      },
      {
        id: 116,
        label: "Catégories documents",
        icon: "bx-list-ul",
        link: "/catégorie-dossier",
        parentId: 114,
      },
    ],
  },
  {
    id: 117,
    label: "Entente Compensation",
    icon: "bxs-detail",
    subItems: [
      {
        id: 118,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/ententeCompensation/list",
        parentId: 117,
      },
    ],
  },
  {
    id: 119,
    label: "Élaboration du PAR",
    icon: "bxs-detail",
    subItems: [
      {
        id: 120,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/rencontres",
        parentId: 119,
      },
    ],
  },
  {
    id: 121,
    label: "Barémes de compensation",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 122,
        label: "Arbres",
        icon: "bxs-tree",
        link: "/baremes/agricole",
        parentId: 121,
      },
      {
        id: 123,
        label: "Equipements",
        icon: "bxs-briefcase",
        link: "/baremes/economique",
        parentId: 121,
      },
      {
        id: 123,
        label: "Recoltes",
        icon: "bxs-briefcase",
        link: "/baremes/recolte",
        parentId: 121,
      },
      {
        id: 123,
        label: "Revenues,",
        icon: "bxs-briefcase",
        link: "/baremes/revenue",
        parentId: 121,
      },
    ],
  },
];
