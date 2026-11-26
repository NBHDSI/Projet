import { computed, effect, inject, Service, signal } from '@angular/core';
import { Produit } from '../models/produit';
import { AuthService } from './auth-service';

export interface LignePanier {
  produit: Produit;
  quantite: number;
}

@Service()
export class PanierService {
  private readonly authService = inject(AuthService);
  private readonly _lignes = signal<LignePanier[]>([]);

  readonly lignes = this._lignes.asReadonly();

  readonly nombreArticles = computed(() => {
    let total = 0;
    for (const ligne of this._lignes()) {
      total = total + ligne.quantite;
    }
    return total;
  });

  readonly total = computed(() => {
    let total = 0;
    for (const ligne of this._lignes()) {
      total = total + ligne.produit.prix * ligne.quantite;
    }
    return total;
  });

  constructor() {
    effect(() => {
      if (this.authService.connecte() == false) {
        this._lignes.set([]);
      }
    });
  }

  quantite(id: string): number {
    for (const ligne of this._lignes()) {
      if (ligne.produit.id == id) {
        return ligne.quantite;
      }
    }
    return 0;
  }

  ajouter(produit: Produit): void {
    const liste: LignePanier[] = [];
    let trouve = false;
    for (const ligne of this._lignes()) {
      if (ligne.produit.id == produit.id) {
        liste.push({ produit: ligne.produit, quantite: ligne.quantite + 1 });
        trouve = true;
      } else {
        liste.push(ligne);
      }
    }
    if (trouve == false) {
      liste.push({ produit: produit, quantite: 1 });
    }
    this._lignes.set(liste);
  }

  augmenter(id: string): void {
    const liste: LignePanier[] = [];
    for (const ligne of this._lignes()) {
      if (ligne.produit.id == id) {
        liste.push({ produit: ligne.produit, quantite: ligne.quantite + 1 });
      } else {
        liste.push(ligne);
      }
    }
    this._lignes.set(liste);
  }

  diminuer(id: string): void {
    const liste: LignePanier[] = [];
    for (const ligne of this._lignes()) {
      if (ligne.produit.id == id && ligne.quantite > 1) {
        liste.push({ produit: ligne.produit, quantite: ligne.quantite - 1 });
      } else {
        liste.push(ligne);
      }
    }
    this._lignes.set(liste);
  }

  retirer(id: string): void {
    const liste: LignePanier[] = [];
    for (const ligne of this._lignes()) {
      if (ligne.produit.id != id) {
        liste.push(ligne);
      }
    }
    this._lignes.set(liste);
  }

  vider(): void {
    this._lignes.set([]);
  }
}
