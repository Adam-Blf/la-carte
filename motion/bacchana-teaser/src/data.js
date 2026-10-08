// Contenu repris tel quel de l'app (hub de bacchana.beloucif.com).
export const GAMES = [
  { id: 'borderland', name: 'Borderland', tag: '52 cartes - 4 règles - 0 pitié.' },
  { id: 'quitte', name: 'Quitte ou double', tag: 'Ta culture se paie au comptoir' },
  { id: 'honneur', name: "Le tableau d'honneur", tag: 'Le taulier classe, la tablée devine' },
  { id: 'criee', name: 'La criée', tag: 'Surenchéris… ou crie « tu mens ! »' },
  { id: 'taulier', name: 'Le taulier', tag: 'Le patron de la soirée, ses ordres font loi' },
  { id: 'action', name: 'Action ou vérité', tag: 'Aveu au comptoir ou gage, choisis' },
  { id: 'jamais', name: "Je n'ai jamais", tag: 'Les confidences de la tablée' },
  { id: 'quidenous', name: 'Qui de nous', tag: 'La tablée pointe du doigt' },
  { id: 'prefere', name: 'Tu préfères', tag: 'Vote, la minorité prend la pénalité' },
  { id: 'dix', name: "C'est un 10 mais", tag: 'Le défaut qui gâche tout' },
  { id: 'sept', name: '7 secondes', tag: 'Réponds avant le dernier grain' },
  { id: 'pilori', name: 'Le pilori', tag: 'Un accusé, une tablée, un verdict' },
  { id: 'roue', name: 'La roue du destin', tag: 'Fais-la tourner, assume le sort' },
  { id: 'fauxfrere', name: 'Le faux frère', tag: 'Un de vous ment, trouvez-le' },
  { id: 'barometre', name: 'Le baromètre', tag: 'Un seul mot pour viser juste' },
];
export const game = (id) => GAMES.find((g) => g.id === id);

// Ordre de passage dans le film : 8 vignettes, puis la rafale.
export const MONTAGE = ['borderland', 'roue', 'sept', 'quitte', 'prefere', 'pilori', 'criee', 'quidenous'];
export const RAFALE = ['action', 'jamais', 'dix', 'taulier', 'barometre', 'fauxfrere', 'honneur'];

export const PLAYERS = ['Léa', 'Hugo', 'Inès', 'Malik'];
