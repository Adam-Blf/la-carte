import couverture from './couverture.js';
import carte from './carte.js';
import carnet from './carnet.js';
import commande from './commande.js';
import addition from './addition.js';
import invite from './invite.js';
import fin from './fin.js';

// Ordre de construction : la carte avant la barre de commande (mesures).
export const SCENES = [couverture, carte, carnet, commande, addition, invite, fin];
