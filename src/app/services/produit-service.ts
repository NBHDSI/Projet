import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Caracteristique, Produit } from '../models/produit';

const URL = 'http://localhost:3000/produits';

interface ProduitJson {
  id: string | number;
  nom: string;
  photo: string;
  prix: number;
  disponible: boolean;
  dateSortie: string;
  caracteristiques: Caracteristique[];
  categorie: string;
  description: string;
}

@Service()
export class ProduitService {
  private readonly _http = inject(HttpClient);
  private readonly _produits = signal<Produit[]>([]);
  readonly produits = this._produits.asReadonly();

  getProduits(): Observable<Produit[]> {
    return this._http.get<ProduitJson[]>(URL).pipe(
      map(liste => this.versProduits(liste)),
      tap(liste => this._produits.set(liste))
    );
  }

  getProduitById(id: string): Observable<Produit> {
    return this._http.get<ProduitJson>(`${URL}/${id}`).pipe(
      map(donnees => this.versProduit(donnees))
    );
  }

  ajouterProduit(produit: Omit<Produit, 'id'>): Observable<Produit> {
    return this._http.post<ProduitJson>(URL, this.versDonnees(produit)).pipe(
      map(ajoute => this.versProduit(ajoute)),
      tap(ajoute => {
        const liste: Produit[] = [...this._produits(), ajoute];
        this._produits.set(liste);
      })
    );
  }

  modifierProduit(produit: Produit): Observable<Produit> {
    const donnees: ProduitJson = { id: produit.id, ...this.versDonnees(produit) };
    return this._http.put<ProduitJson>(`${URL}/${produit.id}`, donnees).pipe(
      map(modifie => this.versProduit(modifie)),
      tap(modifie => {
        const liste: Produit[] = [];
        for (const courant of this._produits()) {
          if (courant.id == produit.id) {
            liste.push(modifie);
          } else {
            liste.push(courant);
          }
        }
        this._produits.set(liste);
      })
    );
  }

  supprimerProduit(id: string): Observable<void> {
    return this._http.delete<void>(`${URL}/${id}`).pipe(
      tap(() => {
        const liste: Produit[] = [];
        for (const courant of this._produits()) {
          if (courant.id != id) {
            liste.push(courant);
          }
        }
        this._produits.set(liste);
      })
    );
  }

  private versTexteDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private versDonnees(produit: Omit<Produit, 'id'>): Omit<ProduitJson, 'id'> {
    return { ...produit, dateSortie: this.versTexteDate(produit.dateSortie) };
  }

  private versProduits(liste: ProduitJson[]): Produit[] {
    return liste.map(donnees => this.versProduit(donnees));
  }

  private versProduit(donnees: ProduitJson): Produit {
    return {
      id: String(donnees.id),
      nom: donnees.nom,
      photo: donnees.photo,
      prix: donnees.prix,
      disponible: donnees.disponible,
      dateSortie: new Date(donnees.dateSortie),
      caracteristiques: donnees.caracteristiques,
      categorie: donnees.categorie,
      description: donnees.description
    };
  }
}
