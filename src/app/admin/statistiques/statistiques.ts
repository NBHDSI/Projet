import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ProduitService } from '../../services/produit-service';

@Component({
  selector: 'app-statistiques',
  imports: [CurrencyPipe, DecimalPipe, PercentPipe],
  templateUrl: './statistiques.html'
})
export class Statistiques implements OnInit {
  private readonly produitService = inject(ProduitService);

  readonly produits = this.produitService.produits;

  readonly nombreProduits = computed(() => this.produits().length);

  readonly nombreDisponibles = computed(() => {
    let total = 0;
    for (const produit of this.produits()) {
      if (produit.disponible) {
        total = total + 1;
      }
    }
    return total;
  });

  readonly nombreIndisponibles = computed(() => this.nombreProduits() - this.nombreDisponibles());

  readonly valeurCatalogue = computed(() => {
    let total = 0;
    for (const produit of this.produits()) {
      total = total + produit.prix;
    }
    return total;
  });

  readonly prixMoyen = computed(() => {
    if (this.nombreProduits() == 0) {
      return 0;
    }
    return this.valeurCatalogue() / this.nombreProduits();
  });

  readonly produitLePlusCher = computed(() => {
    let nom = 'Aucun produit';
    let prix = 0;
    for (const produit of this.produits()) {
      if (produit.prix > prix) {
        nom = produit.nom;
        prix = produit.prix;
      }
    }
    return nom;
  });

  readonly nombreCategories = computed(() => {
    const categories: string[] = [];
    for (const produit of this.produits()) {
      let trouve = false;
      for (const categorie of categories) {
        if (categorie == produit.categorie) {
          trouve = true;
        }
      }
      if (trouve == false) {
        categories.push(produit.categorie);
      }
    }
    return categories.length;
  });

  readonly pourcentageDisponibles = computed(() => {
    if (this.nombreProduits() == 0) {
      return 0;
    }
    return this.nombreDisponibles() / this.nombreProduits();
  });

  readonly pourcentageIndisponibles = computed(() => {
    if (this.nombreProduits() == 0) {
      return 0;
    }
    return this.nombreIndisponibles() / this.nombreProduits();
  });

  readonly erreur = signal('');

  ngOnInit(): void {
    this.produitService.getProduits().subscribe({
      next: () => this.erreur.set(''),
      error: () => this.erreur.set('Impossible de charger les statistiques. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }
}
