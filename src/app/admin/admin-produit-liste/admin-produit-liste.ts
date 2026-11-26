import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { Produit } from '../../models/produit';
import { ProduitService } from '../../services/produit-service';

@Component({
  selector: 'app-admin-produit-liste',
  imports: [RouterLink, CurrencyPipe, DatePipe, FormRoot, FormField],
  templateUrl: './admin-produit-liste.html'
})
export class AdminProduitListe implements OnInit {
  private readonly produitService = inject(ProduitService);

  readonly produits = this.produitService.produits;

  readonly rechercheModel = signal<{ texte: string }>({ texte: '' });

  readonly rechercheForm = form(this.rechercheModel);

  readonly produitsFiltres = computed(() => {
    const texte = this.rechercheModel().texte.toLowerCase();
    const resultat: Produit[] = [];
    for (const produit of this.produits()) {
      if (produit.nom.toLowerCase().includes(texte)) {
        resultat.push(produit);
      }
    }
    return resultat;
  });

  readonly erreur = signal('');
  readonly idASupprimer = signal('');

  ngOnInit(): void {
    this.produitService.getProduits().subscribe({
      next: () => this.erreur.set(''),
      error: () => this.erreur.set('Impossible de charger les produits. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }

  classeDisponibilite(produit: Produit): string {
    if (produit.disponible) {
      return 'badge text-bg-success';
    }
    return 'badge text-bg-danger';
  }

  texteDisponibilite(produit: Produit): string {
    if (produit.disponible) {
      return 'Oui';
    }
    return 'Non';
  }

  onDemanderSuppression(id: string): void {
    this.idASupprimer.set(id);
  }

  onAnnulerSuppression(): void {
    this.idASupprimer.set('');
  }

  onSupprimer(produit: Produit): void {
    this.erreur.set('');
    this.produitService.supprimerProduit(produit.id).subscribe({
      next: () => this.idASupprimer.set(''),
      error: () => this.erreur.set('La suppression a échoué.')
    });
  }
}
