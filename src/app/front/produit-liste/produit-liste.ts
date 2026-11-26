import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { Produit } from '../../models/produit';
import { FavoriService } from '../../services/favori-service';
import { PanierService } from '../../services/panier-service';
import { ProduitService } from '../../services/produit-service';
import { ProduitItem } from '../produit-item/produit-item';

@Component({
  selector: 'app-produit-liste',
  imports: [ProduitItem, FormRoot, FormField],
  templateUrl: './produit-liste.html'
})
export class ProduitListe implements OnInit {
  private readonly produitService = inject(ProduitService);
  private readonly favoriService = inject(FavoriService);
  private readonly panierService = inject(PanierService);

  readonly produits = this.produitService.produits;

  readonly rechercheModel = signal<{ nom: string; prixMax: number | null; categorie: string }>({
    nom: '',
    prixMax: null,
    categorie: ''
  });

  readonly rechercheForm = form(this.rechercheModel);

  readonly categories = computed(() => {
    const liste: string[] = [];
    for (const produit of this.produits()) {
      let trouve = false;
      for (const categorie of liste) {
        if (categorie == produit.categorie) {
          trouve = true;
        }
      }
      if (trouve == false) {
        liste.push(produit.categorie);
      }
    }
    return liste;
  });

  readonly produitsFiltres = computed(() => {
    const nom = this.rechercheModel().nom.toLowerCase();
    const prixMax = this.rechercheModel().prixMax;
    const categorie = this.rechercheModel().categorie;
    const resultat: Produit[] = [];
    for (const produit of this.produits()) {
      let categorieOk = false;
      if (categorie == '' || produit.categorie == categorie) {
        categorieOk = true;
      }
      if (categorieOk && produit.nom.toLowerCase().includes(nom)) {
        if (prixMax == null) {
          resultat.push(produit);
        } else {
          if (produit.prix <= prixMax) {
            resultat.push(produit);
          }
        }
      }
    }
    return resultat;
  });

  readonly erreur = signal('');

  ngOnInit(): void {
    this.produitService.getProduits().subscribe({
      next: () => this.erreur.set(''),
      error: () => this.erreur.set('Impossible de charger les produits. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }

  classeCategorie(categorie: string): string {
    if (this.rechercheModel().categorie == categorie) {
      return 'btn btn-sm btn-primary';
    }
    return 'btn btn-sm btn-outline-primary';
  }

  onCategorie(categorie: string): void {
    this.rechercheForm.categorie().value.set(categorie);
  }

  onBasculerFavori(id: string): void {
    this.favoriService.basculer(id);
  }

  onAjouterAuPanier(produit: Produit): void {
    this.panierService.ajouter(produit);
  }

  onReinitialiser(): void {
    this.rechercheForm.nom().value.set('');
    this.rechercheForm.prixMax().value.set(null);
    this.rechercheForm.categorie().value.set('');
  }
}
