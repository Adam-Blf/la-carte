export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
};

export type Course = {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
};

export const COURSES: Course[] = [
  {
    id: "mises",
    numeral: "I",
    title: "Mises en bouche",
    subtitle: "Pour commencer en douceur",
    items: [
      {
        id: "cafe",
        name: "Café de spécialité",
        description: "Flat white, coin de comptoir et grandes questions.",
        price: "1 anecdote d'enfance",
      },
      {
        id: "balade",
        name: "Balade au bord de Seine",
        description:
          "Quais, ponts, et le tour des bouquinistes au coucher du soleil.",
        price: "2 fous rires",
      },
      {
        id: "librairie",
        name: "Librairie et chocolat chaud",
        description:
          "Chacun choisit un livre pour l'autre. Interdiction de se justifier.",
        price: "1 confidence",
      },
      {
        id: "marche",
        name: "Marché couvert",
        description:
          "Dégustation sauvage d'échantillons, du fromage aux olives.",
        price: "3 compliments sincères",
      },
      {
        id: "terrasse",
        name: "Limonade en terrasse",
        description: "Vue dégagée, conversation aussi.",
        price: "1 secret bien gardé",
      },
    ],
  },
  {
    id: "plats",
    numeral: "II",
    title: "Plats",
    subtitle: "Le cœur de la soirée · au moins un choix de la maison",
    items: [
      {
        id: "bowling",
        name: "Bowling",
        description:
          "Strike, spare ou gouttière, le perdant porte les chaussures avec fierté.",
        price: "1 revanche obligatoire",
      },
      {
        id: "escape",
        name: "Escape game",
        description: "60 minutes, 2 cerveaux, 1 porte. Aucune pression.",
        price: "1 esprit d'équipe",
      },
      {
        id: "musee",
        name: "Musée ou exposition",
        description:
          "On s'invente des interprétations très sérieuses devant les œuvres.",
        price: "2 théories absurdes",
      },
      {
        id: "karting",
        name: "Karting",
        description: "Le code de la route reste au vestiaire.",
        price: "1 tour d'honneur",
      },
      {
        id: "patinoire",
        name: "Patinoire",
        description:
          "Se tenir la main devient une mesure de sécurité officielle.",
        price: "2 chutes élégantes",
      },
      {
        id: "arcade",
        name: "Salle d'arcade",
        description: "Air hockey, jeux rétro et mauvaise foi assumée.",
        price: "5 pièces de revanche",
      },
      {
        id: "minigolf",
        name: "Mini-golf indoor",
        description: "18 trous, zéro talent requis, beaucoup de style.",
        price: "1 putt de la victoire",
      },
      {
        id: "atelier",
        name: "Atelier poterie ou cuisine",
        description:
          "On crée quelque chose à deux. Le résultat compte moins que les rires.",
        price: "2 mains pleines de farine",
      },
      {
        id: "ratatouille",
        name: "La ratatouille du film",
        description:
          "On cuisine à deux le plat qui a fait pleurer un critique, Le Festin en fond sonore.",
        price: "1 critique conquise",
      },
      {
        id: "cinema",
        name: "Cinéma de quartier",
        description:
          "Grand écran, sièges rouges, débat passionné obligatoire en sortant.",
        price: "1 critique enflammée",
      },
    ],
  },
  {
    id: "desserts",
    numeral: "III",
    title: "Desserts",
    subtitle: "La douceur de fin",
    items: [
      {
        id: "crepes",
        name: "Crêperie",
        description:
          "Beurre sucre pour les puristes, caramel beurre salé pour les autres.",
        price: "1 bouchée partagée",
      },
      {
        id: "glace",
        name: "Glace artisanale",
        description: "Deux boules, débat sur le meilleur parfum inclus.",
        price: "1 goût dans ton cornet",
      },
      {
        id: "patisserie",
        name: "Pâtisserie de chef",
        description: "Vitrine intimidante, choix impossible, aucun regret.",
        price: "1 dilemme assumé",
      },
      {
        id: "churros",
        name: "Churros",
        description: "Chauds, sucrés, et étonnamment difficiles à partager.",
        price: "1 duel de gourmandise",
      },
      {
        id: "chocolat",
        name: "Chocolat chaud à l'ancienne",
        description: "Épais comme il faut, chantilly négociable.",
        price: "1 moustache de cacao",
      },
    ],
  },
  {
    id: "accords",
    numeral: "IV",
    title: "Accords & suppléments",
    subtitle: "Servis à discrétion",
    items: [
      {
        id: "playlist",
        name: "Playlist partagée",
        description:
          "Construite à deux sur le trajet. Véto autorisé une seule fois.",
        price: "offert",
      },
      {
        id: "photomaton",
        name: "Photomaton",
        description: "Quatre poses, zéro dignité, un souvenir.",
        price: "1 grimace",
      },
      {
        id: "golden",
        name: "Golden hour",
        description: "Supplément lumière dorée, selon la météo du jour.",
        price: "selon arrivage",
      },
      {
        id: "pari",
        name: "Le pari",
        description: "Le perdant de l'activité principale paie le dessert.",
        price: "1 ego",
      },
      {
        id: "raccompagnement",
        name: "Raccompagnement",
        description:
          "Service de fin de soirée, conversation prolongée incluse.",
        price: "offert",
      },
      {
        id: "marathon",
        name: "Ratatouille sur grand écran",
        description:
          "Le film qui a donné sa musique à cette carte, plaid et plateau de fromages inclus.",
        price: "1 larme discrète",
      },
    ],
  },
];

export const DAYS = [
  { id: "lun", short: "L", label: "Lundi" },
  { id: "mar", short: "M", label: "Mardi" },
  { id: "mer", short: "M", label: "Mercredi" },
  { id: "jeu", short: "J", label: "Jeudi" },
  { id: "ven", short: "V", label: "Vendredi" },
  { id: "sam", short: "S", label: "Samedi" },
  { id: "dim", short: "D", label: "Dimanche" },
] as const;

export const SERVICES = [
  { id: "midi", label: "Midi" },
  { id: "aprem", label: "Après-midi" },
  { id: "soir", label: "Soirée" },
] as const;

export function findItem(id: string): MenuItem | undefined {
  for (const course of COURSES) {
    const item = course.items.find((i) => i.id === id);
    if (item) return item;
  }
  return undefined;
}
