// import { MenuItem } from "./menu.model";
// export const MENU: MenuItem[] = [
//   {
//     id: 1,
//     label: "MENUITEMS.MENU.TEXT",
//     isTitle: true,
//   },
//   {
//     id: 2,
//     label: "DASHBOARDS",
//     icon: "bx-home-circle",
//     subItems: [
//       {
//         id: 1,
//         label: "BaseLine PAR",
//         link: "/dashboards/jobs",
//         parentId: 2,
//         icon: "bx bx-line-chart",
//       },
//       {
//         id: 2,
//         label: "Mise en Oeuvre",
//         link: "/dashboards/miseEnOeuvre",
//         parentId: 2,
//         icon: "bx bx-wrench",
//       },
//     ],
//   },
//   {
//     id: 40,
//     label: "PROJETS",
//     icon: "bx-briefcase-alt-2",
//     subItems: [
//       {
//         id: 41,
//         label: "Liste",
//         icon: "bx-list-ul",
//         link: "/projects/list",
//         parentId: 40,
//       },
//     ],
//   },
//   {
//     id: 91,
//     label: "MAITRES D'OUVRAGES",
//     icon: "bxs-user-detail",
//     subItems: [
//       {
//         id: 92,
//         label: "Liste",
//         icon: "bx-list-ul",
//         link: "/maitrouvrages/list",
//         parentId: 91,
//       },
//     ],
//   },

//   {
//     id: 93,
//     label: "Parties Prenantes",
//     icon: "bxs-user-detail",
//     subItems: [
//       {
//         id: 94,
//         label: "Parties affectées",
//         icon: "bxs-user-detail",
//         link: "/pap/list",
//         parentId: 93,
//         subItems: [
//           {
//             id: 110,
//             label: "Exploitants/Agricole",
//             icon: "bxs-tree",
//             link: "/pap/papAgricole",
//             parentId: 94,
//           },

//           {
//             id: 112,
//             label: "Place Affaires/Economiques",
//             icon: "bxs-chart",
//             link: "/pap/papPlaceAffaire",
//             parentId: 94,
//           },
//         ],
//       },
//       {
//         id: 95,
//         label: "Parties intéréssées",
//         icon: "bxs-buildings",
//         parentId: 93,
//         subItems: [
//           {
//             id: 98,
//             label: "Medias",
//             icon: "bxs-buildings",
//             link: "/pip/medias",
//             parentId: 95,
//           },
//           {
//             id: 99,
//             label: "ONG",
//             icon: "bxs-heart",
//             link: "/pip/ong",
//             parentId: 95,
//           },
//           {
//             id: 100,
//             label: "Entreprises",
//             icon: "bxs-briefcase",
//             link: "/pip/entreprise",
//             parentId: 95,
//           },
//           {
//             id: 101,
//             label: "Organisations",
//             icon: "bxs-group",
//             link: "/pip/organisation",
//             parentId: 95,
//           },
//           {
//             id: 102,
//             label: "Bailleurs",
//             icon: "bxs-bank",
//             link: "/pip/bailleurs",
//             parentId: 95,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: 103,
//     label: "Consultants",
//     icon: "bxs-user-detail",
//     subItems: [
//       {
//         id: 104,
//         label: "Liste",
//         icon: "bx-list-ul",
//         link: "/consultant/chef-de-mission",
//         parentId: 103,
//       },
//     ],
//   },

//     {
//     id: 121,
//     label: "MISE EN ŒUVRE DU PAR",
//     icon: "bx-task",
//     subItems: [
//       {
//         id: 45,
//         label: "Liste des taches",
//         icon: "bx-list-ul",
//         link: "/tasks/liste",
//         parentId: 121,
//       },
//       {
//         id: 118,
//         label: "Entente de compensation",
//         icon: "bx-list-ul",
//         link: "/ententeCompensation/list",
//         parentId: 117,
//       },
//       {
//     id: 105,
//     label: "Plaintes",
//     icon: "bxs-comment-detail",
//     subItems: [
//       {
//         id: 106,
//         label: "Liste(Phase d'Étude)",
//         icon: "bx-list-ul",
//         link: "/plainte/list",
//         parentId: 105,
//       },
//       {
//         id: 107,
//         label: "Phase de Mise en Œuvre",
//         icon: "bx-list-ul",
//         link: "/plainte/miseEnOeuvrePlainte",
//         parentId: 105,
//       },
//     ],
//   },

//     ],
//   },

//   {
//     id: 114,
//     label: "Gestion des documents",
//     icon: "bxs-user-detail",
//     subItems: [
//       {
//         id: 115,
//         label: "Documents",
//         icon: "bx-list-ul",
//         link: "/dossiers",
//         parentId: 114,
//       },
//       {
//         id: 116,
//         label: "Catégories documents",
//         icon: "bx-list-ul",
//         link: "/catégorie-dossier",
//         parentId: 114,
//       },
//     ],
//   },

//   {
//     id: 119,
//     label: "Élaboration du PAR",
//     icon: "bxs-detail",
//     subItems: [
//       {
//         id: 120,
//         label: "Liste",
//         icon: "bx-list-ul",
//         link: "/rencontres",
//         parentId: 119,
//       },
//     ],
//   },

//   {
//     id: 120,
//     label: "Parametres",
//     icon: "bx-cog",
//     subItems: [
//       {
//         id: 108,
//         label: "Gestion des priviléges",
//         icon: "bxs-comment-detail",
//         subItems: [
//           {
//             id: 109,
//             label: "Roles",
//             icon: "bx-list-ul",
//             link: "/roles",
//             parentId: 108,
//           },
//           {
//             id: 110,
//             label: "Fonctions",
//             icon: "bx-list-ul",
//             link: "/fonctions",
//             parentId: 108,
//           },
//           {
//             id: 111,
//             label: "Niveau de priviléges",
//             icon: "bx-list-ul",
//             link: "/categories",
//             parentId: 108,
//           },
//         ],
//       },
//       {
//         id: 112,
//         label: "Gestion des utilisateurs",
//         icon: "bxs-user-detail",
//         subItems: [
//           {
//             id: 113,
//             label: "Utilisateurs",
//             icon: "bx-list-ul",
//             link: "/utilisateurs",
//             parentId: 112,
//           },
//         ],
//       },
//     ],
//   },
// ];


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
        id: 3,
        label: "BaseLine PAR",
        link: "/dashboards/jobs",
        parentId: 2,
        icon: "bx bx-line-chart",
      },
      {
        id: 4,
        label: "Mise en Oeuvre",
        link: "/dashboards/miseEnOeuvre",
        parentId: 2,
        icon: "bx bx-wrench",
      },
    ],
  },
  {
    id: 5,
    label: "PROJETS",
    icon: "bx-briefcase-alt-2",
    subItems: [
      {
        id: 6,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/projects/list",
        parentId: 5,
      },
    ],
  },
  {
    id: 7,
    label: "MAITRES D'OUVRAGES",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 8,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/maitrouvrages/list",
        parentId: 7,
      },
    ],
  },
  {
    id: 9,
    label: "Parties Prenantes",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 10,
        label: "Parties affectées",
        icon: "bxs-user-detail",
        link: "/pap/list",
        parentId: 9,
        subItems: [
          {
            id: 11,
            label: "Exploitants/Agricole",
            icon: "bxs-tree",
            link: "/pap/papAgricole",
            parentId: 10,
          },
          {
            id: 12,
            label: "Place Affaires/Economiques",
            icon: "bxs-chart",
            link: "/pap/papPlaceAffaire",
            parentId: 10,
          },
        ],
      },
      {
        id: 13,
        label: "Parties intéréssées",
        icon: "bxs-buildings",
        parentId: 9,
        subItems: [
          {
            id: 14,
            label: "Medias",
            icon: "bxs-buildings",
            link: "/pip/medias",
            parentId: 13,
          },
          {
            id: 15,
            label: "ONG",
            icon: "bxs-heart",
            link: "/pip/ong",
            parentId: 13,
          },
          {
            id: 16,
            label: "Entreprises",
            icon: "bxs-briefcase",
            link: "/pip/entreprise",
            parentId: 13,
          },
          {
            id: 17,
            label: "Organisations",
            icon: "bxs-group",
            link: "/pip/organisation",
            parentId: 13,
          },
          {
            id: 18,
            label: "Bailleurs",
            icon: "bxs-bank",
            link: "/pip/bailleurs",
            parentId: 13,
          },
        ],
      },
    ],
  },
  {
    id: 19,
    label: "Consultants",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 20,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/consultant/chef-de-mission",
        parentId: 19,
      },
    ],
  },
  {
    id: 21,
    label: "MISE EN ŒUVRE DU PAR",
    icon: "bx-task",
    subItems: [
      {
        id: 22,
        label: "Taches",
        icon: "bx-list-ul",
        link: "/tasks/liste",
        parentId: 21,
      },
       {
        id: 23,
        label: "Fiche d'identification du pap",
        icon: "bx-list-ul",
       // link: "/tasks/liste",
        parentId: 21,
      },
      {
        id: 24,
        label: "Entente de compensation",
        icon: "bx-list-ul",
        link: "/ententeCompensation/list",
        parentId: 21,
      },
      {
        id: 24,
        label: "Mécanismes des gestion des plaintes",
        icon: "bxs-comment-detail",
        subItems: [
          {
            id: 25,
            label: "Liste(Phase d'Étude)",
            icon: "bx-list-ul",
            link: "/plainte/list",
            parentId: 24,
          },
          {
            id: 26,
            label: "Phase de Mise en Œuvre",
            icon: "bx-list-ul",
            link: "/plainte/miseEnOeuvrePlainte",
            parentId: 24,
          },
        ],
      },
      {
        id: 27,
        label: "Accompagnement social",
        icon: "bxs-comment-detail",
        subItems: [
          {
            id: 28,
            label: "Liste",
            icon: "bx-list-ul",
            //link: "/plainte/list",
            parentId: 27,
          },
        ],
      },
      {
        id: 29,
        label: "Restauration des moyens de subsistance",
        icon: "bxs-comment-detail",
        subItems: [
          {
            id: 30,
            label: "Liste",
            icon: "bx-list-ul",
            //link: "/plainte/list",
            parentId: 29,
          },
        ],
      },
      {
        id: 31,
        label: "Négociation et conciliation",
        icon: "bxs-comment-detail",
        subItems: [
          {
            id: 32,
            label: "Liste",
            icon: "bx-list-ul",
            //link: "/plainte/list",
            parentId: 31,
          },
        ],
      },
      {
        id: 33,
        label: "Paiement des compensations",
        icon: "bxs-comment-detail",
        subItems: [
          {
            id: 34,
            label: "Liste",
            icon: "bx-list-ul",
            //link: "/plainte/list",
            parentId: 33,
          },
        ],
      },
      {
        id: 35,
        label: "Engagements des parties prenantes",
        icon: "bxs-comment-detail",
        subItems: [
          {
            id: 36,
            label: "Liste",
            icon: "bx-list-ul",
            //link: "/plainte/list",
            parentId: 35,
          },
        ],
      },
    ],
  },
  {
    id: 27,
    label: "Gestion des documents",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 28,
        label: "Documents",
        icon: "bx-list-ul",
        link: "/dossiers",
        parentId: 27,
      },
      {
        id: 29,
        label: "Catégories documents",
        icon: "bx-list-ul",
        link: "/catégorie-dossier",
        parentId: 27,
      },
    ],
  },
  {
    id: 30,
    label: "Élaboration du PAR",
    icon: "bxs-detail",
    subItems: [
      {
        id: 31,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/rencontres",
        parentId: 30,
      },
    ],
  },
  {
    id: 32,
    label: "Parametres",
    icon: "bx-cog",
    subItems: [
      {
        id: 33,
        label: "Gestion des priviléges",
        icon: "bxs-comment-detail",
        subItems: [
          {
            id: 34,
            label: "Roles",
            icon: "bx-list-ul",
            link: "/roles",
            parentId: 33,
          },
          {
            id: 35,
            label: "Fonctions",
            icon: "bx-list-ul",
            link: "/fonctions",
            parentId: 33,
          },
          {
            id: 36,
            label: "Niveau de priviléges",
            icon: "bx-list-ul",
            link: "/categories",
            parentId: 33,
          },
        ],
      },
      {
        id: 37,
        label: "Gestion des utilisateurs",
        icon: "bxs-user-detail",
        subItems: [
          {
            id: 38,
            label: "Utilisateurs",
            icon: "bx-list-ul",
            link: "/utilisateurs",
            parentId: 37,
          },
        ],
      },
    ],
  },
];
