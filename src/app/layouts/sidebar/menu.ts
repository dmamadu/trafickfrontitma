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
        icon: "bx bx-line-chart", // Example of a Boxicon class
      },
      {
        id: 2,
        label: "Mise en Oeuvre",
        link: "/dashboards/miseEnOeuvre",
        parentId: 2,
        icon: "bx bx-wrench", // Example of a Boxicon class
      },
    ],
  },

  // {
  //   id: 8,
  //   isLayout: true,
  // },
  // {
  //   id: 9,
  //   label: "MENUITEMS.APPS.TEXT",
  //   isTitle: true,
  // },
  // {
  //   id: 10,
  //   label: "MENUITEMS.CALENDAR.TEXT",
  //   icon: "bx-calendar",
  //   link: "/calendar",
  // },
  // {
  //   id: 11,
  //   label: "MENUITEMS.CHAT.TEXT",
  //   icon: "bx-chat",
  //   link: "/chat",
  // },
  // {
  //   id: 12,
  //   label: "MENUITEMS.FILEMANAGER.TEXT",
  //   icon: "bx-file",
  //   link: "/filemanager",
  // },
  // {
  //   id: 13,
  //   label: "MENUITEMS.ECOMMERCE.TEXT",
  //   icon: "bx-store",
  //   subItems: [
  //     {
  //       id: 14,
  //       label: "MENUITEMS.ECOMMERCE.LIST.PRODUCTS",
  //       link: "/ecommerce/products",
  //       parentId: 13,
  //     },
  //     {
  //       id: 15,
  //       label: "MENUITEMS.ECOMMERCE.LIST.PRODUCTDETAIL",
  //       link: "/ecommerce/product-detail/1",
  //       parentId: 13,
  //     },
  //     {
  //       id: 16,
  //       label: "MENUITEMS.ECOMMERCE.LIST.ORDERS",
  //       link: "/ecommerce/orders",
  //       parentId: 13,
  //     },
  //     {
  //       id: 17,
  //       label: "MENUITEMS.ECOMMERCE.LIST.CUSTOMERS",
  //       link: "/ecommerce/customers",
  //       parentId: 13,
  //     },
  //     {
  //       id: 18,
  //       label: "MENUITEMS.ECOMMERCE.LIST.CART",
  //       link: "/ecommerce/cart",
  //       parentId: 13,
  //     },
  //     {
  //       id: 19,
  //       label: "MENUITEMS.ECOMMERCE.LIST.CHECKOUT",
  //       link: "/ecommerce/checkout",
  //       parentId: 13,
  //     },
  //     {
  //       id: 20,
  //       label: "MENUITEMS.ECOMMERCE.LIST.SHOPS",
  //       link: "/ecommerce/shops",
  //       parentId: 13,
  //     },
  //     {
  //       id: 21,
  //       label: "MENUITEMS.ECOMMERCE.LIST.ADDPRODUCT",
  //       link: "/ecommerce/add-product",
  //       parentId: 13,
  //     },
  //   ],
  // },
  // {
  //   id: 22,
  //   label: "MENUITEMS.CRYPTO.TEXT",
  //   icon: "bx-bitcoin",
  //   subItems: [
  //     {
  //       id: 23,
  //       label: "MENUITEMS.CRYPTO.LIST.WALLET",
  //       link: "/crypto/wallet",
  //       parentId: 22,
  //     },
  //     {
  //       id: 24,
  //       label: "MENUITEMS.CRYPTO.LIST.BUY/SELL",
  //       link: "/crypto/buy-sell",
  //       parentId: 22,
  //     },
  //     {
  //       id: 25,
  //       label: "MENUITEMS.CRYPTO.LIST.EXCHANGE",
  //       link: "/crypto/exchange",
  //       parentId: 22,
  //     },
  //     {
  //       id: 26,
  //       label: "MENUITEMS.CRYPTO.LIST.LENDING",
  //       link: "/crypto/lending",
  //       parentId: 22,
  //     },
  //     {
  //       id: 27,
  //       label: "MENUITEMS.CRYPTO.LIST.ORDERS",
  //       link: "/crypto/orders",
  //       parentId: 22,
  //     },
  //     {
  //       id: 28,
  //       label: "MENUITEMS.CRYPTO.LIST.KYCAPPLICATION",
  //       link: "/crypto/kyc-application",
  //       parentId: 22,
  //     },
  //     {
  //       id: 29,
  //       label: "MENUITEMS.CRYPTO.LIST.ICOLANDING",
  //       link: "/crypto-ico-landing",
  //       parentId: 22,
  //     },
  //   ],
  // },
  // {
  //   id: 30,
  //   label: "MENUITEMS.EMAIL.TEXT",
  //   icon: "bx-envelope",
  //   subItems: [
  //     {
  //       id: 31,
  //       label: "MENUITEMS.EMAIL.LIST.INBOX",
  //       link: "/email/inbox",
  //       parentId: 30,
  //     },
  //     {
  //       id: 32,
  //       label: "MENUITEMS.EMAIL.LIST.READEMAIL",
  //       link: "/email/read/1",
  //       parentId: 30,
  //     },
  //     {
  //       id: 33,
  //       label: "MENUITEMS.EMAIL.LIST.TEMPLATE.TEXT",
  //       badge: {
  //         variant: "success",
  //         text: "MENUITEMS.EMAIL.LIST.TEMPLATE.BADGE",
  //       },
  //       parentId: 30,
  //       subItems: [
  //         {
  //           id: 34,
  //           label: "MENUITEMS.EMAIL.LIST.TEMPLATE.LIST.BASIC",
  //           link: "/email/basic",
  //           parentId: 30,
  //         },
  //         {
  //           id: 35,
  //           label: "MENUITEMS.EMAIL.LIST.TEMPLATE.LIST.ALERT",
  //           link: "/email/alert",
  //           parentId: 30,
  //         },
  //         {
  //           id: 36,
  //           label: "MENUITEMS.EMAIL.LIST.TEMPLATE.LIST.BILLING",
  //           link: "/email/billing",
  //           parentId: 30,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: 37,
  //   label: "MENUITEMS.INVOICES.TEXT",
  //   icon: "bx-receipt",
  //   subItems: [
  //     {
  //       id: 38,
  //       label: "MENUITEMS.INVOICES.LIST.INVOICELIST",
  //       link: "/invoices/list",
  //       parentId: 37,
  //     },
  //     {
  //       id: 39,
  //       label: "MENUITEMS.INVOICES.LIST.INVOICEDETAIL",
  //       link: "/invoices/detail",
  //       parentId: 37,
  //     },
  //   ],
  // },

  {
    id: 40,
    label: "PROJETS",
    icon: "bx-briefcase-alt-2",
    subItems: [
      {
        id: 42,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/projects/list",
        parentId: 40,
      },
      {
        id: 44,
        label: "Créer",
        icon: "bx-plus-circle",
        link: "/projects/create",
        parentId: 40,
      },
      // {
      //   "id": 45,
      //   "label": "UPDATE",
      //   "icon": "bx-edit",
      //   "link": "/projects/update",
      //   "parentId": 40
      // }
    ],
  },

  {
    id: 45,
    label: "TACHES",
    icon: "bx-task",
    subItems: [
      // {
      //   "id": 46,
      //   "label": "Détail des taches",
      //   "icon": "bx-detail",
      //   "link": "/tasks/list",
      //   "parentId": 45
      // },
      {
        id: 47,
        label: "Liste des taches",
        icon: "bx-list-ul",
        link: "/tasks/liste",
        parentId: 45,
      },
      // {
      //   id: 48,
      //   label: "Créer",
      //   icon: "bx-plus-circle",
      //   link: "/tasks/create",
      //   parentId: 45,
      // },
    ],
  },
  // {
  //   id: 49,
  //   label: "Utilisateurs",
  //   icon: "bxs-user-detail",
  //   subItems: [
  //     {
  //       id: 50,
  //       label: "MENUITEMS.CONTACTS.LIST.USERGRID",
  //       link: "/contacts/grid",
  //       parentId: 49,
  //     },
  //     {
  //       id: 51,
  //       label: "MENUITEMS.CONTACTS.LIST.USERLIST",
  //       link: "/contacts/list",
  //       parentId: 49,
  //     },
  //     {
  //       id: 52,
  //       label: "MENUITEMS.CONTACTS.LIST.PROFILE",
  //       link: "/contacts/profile",
  //       parentId: 49,
  //     },
  //   ],
  // },

  // {
  //   id: 53,
  //   label: "MENUITEMS.BLOG.TEXT",
  //   icon: "bx-file",
  //   subItems: [
  //     {
  //       id: 54,
  //       label: "MENUITEMS.BLOG.LIST.BLOGLIST",
  //       link: "/blog/list",
  //       parentId: 53,
  //     },
  //     {
  //       id: 55,
  //       label: "MENUITEMS.BLOG.LIST.BLOGGRID",
  //       link: "/blog/grid",
  //       parentId: 53,
  //     },
  //     {
  //       id: 56,
  //       label: "MENUITEMS.BLOG.LIST.DETAIL",
  //       link: "/blog/detail",
  //       parentId: 53,
  //     },
  //   ],
  // },
  // {
  //   id: 57,
  //   label: "MENUITEMS.JOBS.TEXT",
  //   icon: "bx-briefcase-alt",
  //   subItems: [
  //     {
  //       id: 58,
  //       label: "MENUITEMS.JOBS.LIST.JOBLIST",
  //       link: "/jobs/list",
  //       parentId: 57,
  //     },
  //     {
  //       id: 59,
  //       label: "MENUITEMS.JOBS.LIST.JOBGRID",
  //       link: "/jobs/grid",
  //       parentId: 57,
  //     },
  //     {
  //       id: 60,
  //       label: "MENUITEMS.JOBS.LIST.APPLYJOB",
  //       link: "/jobs/apply",
  //       parentId: 57,
  //     },
  //     {
  //       id: 61,
  //       label: "MENUITEMS.JOBS.LIST.JOBDETAILS",
  //       link: "/jobs/details",
  //       parentId: 57,
  //     },
  //     {
  //       id: 62,
  //       label: "MENUITEMS.JOBS.LIST.JOBCATEGORIES",
  //       link: "/jobs/categories",
  //       parentId: 57,
  //     },
  //     {
  //       id: 63,
  //       label: "MENUITEMS.JOBS.LIST.CANDIDATE.TEXT",
  //       badge: {
  //         variant: "success",
  //         text: "MENUITEMS.EMAIL.LIST.TEMPLATE.BADGE",
  //       },
  //       parentId: 57,
  //       subItems: [
  //         {
  //           id: 64,
  //           label: "MENUITEMS.JOBS.LIST.CANDIDATE.LIST.LIST",
  //           link: "/jobs/candidate-list",
  //           parentId: 57,
  //         },
  //         {
  //           id: 65,
  //           label: "MENUITEMS.JOBS.LIST.CANDIDATE.LIST.OVERVIEW",
  //           link: "/jobs/candidate-overview",
  //           parentId: 57,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: 66,
  //   label: "MENUITEMS.PAGES.TEXT",
  //   isTitle: true,
  // },
  // {
  //   id: 67,
  //   label: "MENUITEMS.AUTHENTICATION.TEXT",
  //   icon: "bx-user-circle",
  //   subItems: [
  //     {
  //       id: 68,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.LOGIN",
  //       link: "/auth/login",
  //       parentId: 67,
  //     },
  //     {
  //       id: 69,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.LOGIN2",
  //       link: "/auth/login-2",
  //       parentId: 67,
  //     },
  //     {
  //       id: 70,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.REGISTER",
  //       link: "/auth/signup",
  //       parentId: 67,
  //     },
  //     {
  //       id: 71,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.REGISTER2",
  //       link: "/auth/signup-2",
  //       parentId: 67,
  //     },
  //     {
  //       id: 72,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD",
  //       link: "/auth/reset-password",
  //       parentId: 67,
  //     },
  //     {
  //       id: 73,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD2",
  //       link: "/auth/recoverpwd-2",
  //       parentId: 67,
  //     },
  //     {
  //       id: 74,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN",
  //       link: "/pages/lock-screen-1",
  //       parentId: 67,
  //     },
  //     {
  //       id: 75,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN2",
  //       link: "/pages/lock-screen-2",
  //       parentId: 67,
  //     },
  //     {
  //       id: 76,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL",
  //       link: "/pages/confirm-mail",
  //       parentId: 67,
  //     },
  //     {
  //       id: 77,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL2",
  //       link: "/pages/confirm-mail-2",
  //       parentId: 67,
  //     },
  //     {
  //       id: 78,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION",
  //       link: "/pages/email-verification",
  //       parentId: 67,
  //     },
  //     {
  //       id: 79,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION2",
  //       link: "/pages/email-verification-2",
  //       parentId: 67,
  //     },
  //     {
  //       id: 80,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION",
  //       link: "/pages/two-step-verification",
  //       parentId: 67,
  //     },
  //     {
  //       id: 81,
  //       label: "MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION2",
  //       link: "/pages/two-step-verification-2",
  //       parentId: 67,
  //     },
  //   ],
  // },
  // {
  //   id: 82,
  //   label: "MENUITEMS.UTILITY.TEXT",
  //   icon: "bx-file",
  //   subItems: [
  //     {
  //       id: 83,
  //       label: "MENUITEMS.UTILITY.LIST.STARTER",
  //       link: "/pages/starter",
  //       parentId: 82,
  //     },
  //     {
  //       id: 84,
  //       label: "MENUITEMS.UTILITY.LIST.MAINTENANCE",
  //       link: "/pages/maintenance",
  //       parentId: 82,
  //     },
  //     {
  //       id: 85,
  //       label: "Coming Soon",
  //       link: "/pages/coming-soon",
  //       parentId: 82,
  //     },
  //     {
  //       id: 86,
  //       label: "MENUITEMS.UTILITY.LIST.TIMELINE",
  //       link: "/pages/timeline",
  //       parentId: 82,
  //     },
  //     {
  //       id: 87,
  //       label: "MENUITEMS.UTILITY.LIST.FAQS",
  //       link: "/pages/faqs",
  //       parentId: 82,
  //     },
  //     {
  //       id: 88,
  //       label: "MENUITEMS.UTILITY.LIST.PRICING",
  //       link: "/pages/pricing",
  //       parentId: 82,
  //     },
  //     {
  //       id: 89,
  //       label: "MENUITEMS.UTILITY.LIST.ERROR404",
  //       link: "/pages/404",
  //       parentId: 82,
  //     },
  //     {
  //       id: 90,
  //       label: "MENUITEMS.UTILITY.LIST.ERROR500",
  //       link: "/pages/500",
  //       parentId: 82,
  //     },
  //   ],
  // },

  {
    id: 91,
    label: "MAITRES D'OUVRAGES",
    icon: "bxs-user-detail",
    subItems: [
      // {
      //   id: 92,
      //   label: "MO GRID",
      //   link: "/maitrouvrages/grid",
      //   parentId: 91,
      // },
      {
        id: 93,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/maitrouvrages/list",
        parentId: 91,
      },
      // {
      //   id: 94,
      //   label: "MO PROFILE",
      //   link: "/maitrouvrages/profile",
      //   parentId: 91,
      // },
    ],
  },
  {
    id: 92,
    label: "Parties Prenantes",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 95,
        label: "Parties affectées",
        icon: "bxs-user-detail",
        link: "/pap/list",
        parentId: 92,
        subItems: [
          {
            id: 110,
            label: "Pap Agricole",
            icon: "bxs-tree",
            link: "/pap/papAgricole",
            parentId: 95,
          },
          {
            id: 111,
            label: "Pap place affaire",
            icon: "bxs-briefcase",
            link: "/pap/papPlaceAffaire",
            parentId: 95,
          },
          // {
          //   id: 112,
          //   label: "Pap Economique",
          //   icon: "bxs-chart",
          //   link: "/pap/list",
          //   parentId: 95,
          // },
          {
            id: 112,
            label: "Pap Economique",
            icon: "bxs-chart",
            link: "/pap/papEconomique",
            parentId: 95,
          },
        ]
      },
      {
        id: 95,
        label: "Parties intéréssées",
        icon: "bxs-buildings",
        parentId: 92,
        subItems: [
          {
            id: 98,
            label: "Medias",
            icon: "bxs-buildings",
            link: "/pip/medias",
            parentId: 93,
          },
          {
            id: 99,
            label: "ONG",
            icon: "bxs-heart",
            link: "/pip/ong",
            parentId: 93,
          },
          {
            id: 100,
            label: "Entreprises",
            icon: "bxs-briefcase",
            link: "/pip/entreprise",
            parentId: 93,
          },
          {
            id: 101,
            label: "Organisations",
            icon: "bxs-group",
            link: "/pip/organisation",
            parentId: 93,
          },
          {
            id: 102,
            label: "Bailleurs",
            icon: "bxs-bank",
            link: "/pip/bailleurs",
            parentId: 93,
          },
        ],
      },
    ],
  },

  // {
  //   id: 92,
  //   label: "Parties affectées",
  //   icon: "bxs-user-detail",
  //   subItems: [
  //     {
  //       id: 95,
  //       label: "Liste",
  //       link: "/pap/list",
  //       parentId: 92,
  //     }
  //   ],
  // },
  // {
  //   id: 93,
  //   label: "Parties intéréssées",
  //   icon: "bxs-buildings",
  //   subItems: [

  //     {
  //       id: 97,
  //       label: "LIST",
  //       link: "/pip/list",
  //       parentId: 93,
  //     },
  //     {
  //       id: 98,
  //       label: "Medias",
  //       link: "/pip/medias",
  //       parentId: 93,
  //     },
  //     {
  //       id: 99,
  //       label: "ONG",
  //       link: "/pip/ong",
  //       parentId: 93,
  //     },
  //     {
  //       id: 100,
  //       label: "Entreprises",
  //       link: "/pip/entreprise",
  //       parentId: 93,
  //     },
  //     {
  //       id: 101,
  //       label: "Organisations",
  //       link: "/pip/organisation",
  //       parentId: 93,
  //     },
  //     {
  //       id: 102,
  //       label: "Bailleurs",
  //       link: "/pip/bailleurs",
  //       parentId: 93,
  //     },
  //   ],
  // },

  {
    id: 93,
    label: "Consultants",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 102,
        label: "Chef de mission",
        icon: "bx-list-ul",
        link: "/consultant/chef-de-mission", // Lien vers la liste des "Chef de mission"
        parentId: 93,
      },
      {
        id: 103,
        label: "Spécialiste en réinstallation",
        icon: "bx-list-ul",
        link: "/consultant/specialiste-reinstallation", // Lien vers la liste des "Spécialiste en réinstallation"
        parentId: 93,
      },
      {
        id: 104,
        label: "Spécialiste en gestion des parties prenantes",
        icon: "bx-list-ul",
        link: "/consultant/gestion-parties-prenantes", // Lien vers la liste des "Spécialiste en gestion des parties prenantes"
        parentId: 93,
      },
      {
        id: 105,
        label: "Spécialiste en Genre et Inclusions Sociale",
        icon: "bx-list-ul",
        link: "/consultant/genre-inclusions-sociale", // Lien vers la liste des "Spécialiste en Genre et Inclusions Sociale"
        parentId: 93,
      },
      {
        id: 106,
        label: "Spécialiste en base de données et SIG",
        icon: "bx-list-ul",
        link: "/consultant/base-de-donnees-sig", // Lien vers la liste des "Spécialiste en base de données et SIG"
        parentId: 93,
      },
      {
        id: 107,
        label: "Animateurs communautaires",
        icon: "bx-list-ul",
        link: "/consultant/animateurs-communautaires", // Lien vers la liste des "Animateurs communautaires"
        parentId: 93,
      },
    ],
  },
  {
    id: 94,
    label: "Plaintes",
    icon: "bxs-comment-detail",
    subItems: [
      {
        id: 102,
        label: "Phase d'Étude",
        icon: "bx-list-ul",
        link: "/plainte/list",
        parentId: 94,
      },
      {
        id: 102,
        label: "Phase de Mise en Œuvre",
        icon: "bx-list-ul",
        link: "/plainte/miseEnOeuvrePlainte",
        parentId: 94,
      },
    ],
  },

  {
    id: 94,
    label: "GestIon des priviléges",
    icon: "bxs-comment-detail",
    subItems: [
      {
        id: 102,
        label: "Roles",
        icon: "bx-list-ul",
        link: "/roles",
        parentId: 94,
      },
      {
        id: 103,
        label: "Fonctions",
        icon: "bx-list-ul",
        link: "/fonctions",
        parentId: 94,
      },
      {
        id: 104,
        label: "Niveau de priviléges",
        icon: "bx-list-ul",
        link: "/categories",
        parentId: 94,
      },
    ],
  },

  {
    id: 95,
    label: "Gestion des utilisateurs",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 102,
        label: "Utilisateurs",
        icon: "bx-list-ul",
        link: "/utilisateurs",
        parentId: 95,
      },
    ],
  },

  {
    id: 96,
    label: "Gestion des documents",
    icon: "bxs-user-detail",
    subItems: [
      {
        id: 103,
        label: "Documents",
        icon: "bx-list-ul",
        link: "/dossiers",
        parentId: 96,
      },
      {
        id: 103,
        label: "Catégories documents",
        icon: "bx-list-ul",
        link: "/catégorie-dossier",
        parentId: 96,
      },
    ],
  },

  // {
  //   id: 95,
  //   label: "Entente Compensation",
  //   icon: "bxs-detail",
  //   subItems: [
  //     {
  //       id: 103,
  //       label: "Liste",
  //       "icon": "bx-list-ul",
  //       link: "/ententeCompensation/list",
  //       parentId: 95,
  //     },
  // {
  //   id: 104,
  //   label: "Ajouter",
  //   "icon": "bx-plus-circle",
  //   link: "/ententeCompensation/add",
  //   parentId: 95,
  // },
  // {
  //   id: 105,
  //   label: "Détail",
  //   "icon": "bx-detail",
  //   link: "/ententeCompensation/detail",
  //   parentId: 95,
  // }
  //   ],
  // },

  {
    id: 96,
    label: "Élaboration du PAR",
    icon: "bxs-detail",
    subItems: [
      {
        id: 104,
        label: "Liste",
        icon: "bx-list-ul",
        link: "/rencontres",
        parentId: 96,
       }
      // {
      //   id: 105,
      //   label: "Ajouter",
      //   icon: "bx-plus-circle",
      //   link: "/ententeCompensation/add",
      //   parentId: 96,
      // },
    ],
  },
];
