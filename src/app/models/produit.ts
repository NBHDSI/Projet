export interface Caracteristique {
  nom: string;
  valeur: string;
}

export interface Produit {
  id: string;
  nom: string;
  photo: string;
  prix: number;
  disponible: boolean;
  dateSortie: Date;
  caracteristiques: Caracteristique[];
  categorie: string;
  description: string;
}

export interface Compte {
  id: string;
  nom: string;
  email: string;
  motDePasse: string;
  role: string;
}

export interface LigneCommande {
  idProduit: string;
  nom: string;
  prix: number;
  quantite: number;
}

export interface Livraison {
  nom: string;
  telephone: string;
  adresse: string;
  paiement: string;
}

export interface Commande {
  id: string;
  client: string;
  nomClient: string;
  date: string;
  lignes: LigneCommande[];
  total: number;
  telephone: string;
  adresse: string;
  paiement: string;
  statut: string;
  remise: number;
}
