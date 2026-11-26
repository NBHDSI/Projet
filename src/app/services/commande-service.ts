import { HttpClient } from '@angular/common/http';
import { effect, inject, Service, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Commande, Compte, LigneCommande, Livraison } from '../models/produit';
import { AuthService } from './auth-service';
import { LignePanier } from './panier-service';

const URL = 'http://localhost:3000/commandes';

interface CommandeJson {
  id: string | number;
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

@Service()
export class CommandeService {
  private readonly _http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly _commandes = signal<Commande[]>([]);

  readonly commandes = this._commandes.asReadonly();

  constructor() {
    effect(() => {
      if (this.authService.connecte() == false) {
        this._commandes.set([]);
      }
    });
  }

  getCommandes(client: string): Observable<Commande[]> {
    return this._http.get<CommandeJson[]>(`${URL}?client=${encodeURIComponent(client)}`).pipe(
      map(liste => this.versCommandes(liste)),
      tap(liste => this._commandes.set(liste))
    );
  }

  getToutesCommandes(): Observable<Commande[]> {
    return this._http.get<CommandeJson[]>(URL).pipe(
      map(liste => this.versCommandes(liste)),
      tap(liste => this._commandes.set(liste))
    );
  }

  passerCommande(compte: Compte, lignes: LignePanier[], livraison: Livraison, remise: number): Observable<Commande> {
    const lignesCommande: LigneCommande[] = [];
    let total = 0;
    for (const ligne of lignes) {
      lignesCommande.push({
        idProduit: ligne.produit.id,
        nom: ligne.produit.nom,
        prix: ligne.produit.prix,
        quantite: ligne.quantite
      });
      total = total + ligne.produit.prix * ligne.quantite;
    }
    const commande = {
      client: compte.email,
      nomClient: livraison.nom,
      date: new Date().toISOString(),
      lignes: lignesCommande,
      total: Math.round(total * (1 - remise) * 1.19 * 100) / 100,
      telephone: livraison.telephone,
      adresse: livraison.adresse,
      paiement: livraison.paiement,
      statut: 'En attente',
      remise: remise
    };
    return this._http.post<CommandeJson>(URL, commande).pipe(map(ajoutee => this.versCommande(ajoutee)));
  }

  changerStatut(commande: Commande, statut: string): Observable<Commande> {
    const modifiee: Commande = { ...commande, statut: statut };
    return this._http.put<CommandeJson>(`${URL}/${commande.id}`, modifiee).pipe(
      map(resultat => this.versCommande(resultat)),
      tap(resultat => {
        const liste: Commande[] = [];
        for (const courante of this._commandes()) {
          if (courante.id == commande.id) {
            liste.push(resultat);
          } else {
            liste.push(courante);
          }
        }
        this._commandes.set(liste);
      })
    );
  }

  private versCommandes(liste: CommandeJson[]): Commande[] {
    return liste.map(donnees => this.versCommande(donnees));
  }

  private versCommande(donnees: CommandeJson): Commande {
    return {
      id: String(donnees.id),
      client: donnees.client,
      nomClient: donnees.nomClient,
      date: donnees.date,
      lignes: donnees.lignes,
      total: donnees.total,
      telephone: donnees.telephone,
      adresse: donnees.adresse,
      paiement: donnees.paiement,
      statut: donnees.statut,
      remise: donnees.remise
    };
  }
}
