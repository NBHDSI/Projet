import { CurrencyPipe, DatePipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Produit } from '../../models/produit';
import { AuthService } from '../../services/auth-service';
import { FavoriService } from '../../services/favori-service';
import { PanierService } from '../../services/panier-service';
import { ProduitService } from '../../services/produit-service';
import { TtcPipe } from '../../pipes/ttc-pipe';

@Component({
  selector: 'app-produit-detail',
  imports: [CurrencyPipe, DatePipe, UpperCasePipe, TitleCasePipe, TtcPipe, RouterLink],
  templateUrl: './produit-detail.html'
})
export class ProduitDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly produitService = inject(ProduitService);
  private readonly favoriService = inject(FavoriService);
  private readonly panierService = inject(PanierService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly produit = signal<Produit | undefined>(undefined);
  readonly message = signal('');

  readonly estClient = this.authService.estClient;

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(parametres => {
      const id = parametres.get('id');
      if (id != null) {
        this.produit.set(undefined);
        this.message.set('');
        this.produitService.getProduitById(id).subscribe({
          next: produit => this.produit.set(produit),
          error: () => this.produit.set(undefined)
        });
      }
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
      return 'Disponible';
    }
    return 'Rupture de stock';
  }

  texteFavori(): string {
    const produit = this.produit();
    if (produit == undefined) {
      return 'Favori';
    }
    if (this.favoriService.estFavori(produit.id)) {
      return 'Retirer des favoris';
    }
    return 'Ajouter aux favoris';
  }

  onBasculerFavori(): void {
    const produit = this.produit();
    if (produit != undefined) {
      this.favoriService.basculer(produit.id);
      this.message.set('');
    }
  }

  onAjouterAuPanier(): void {
    const produit = this.produit();
    if (produit != undefined) {
      this.panierService.ajouter(produit);
      this.message.set('Produit ajouté à votre panier.');
    }
  }

  onRetour(): void {
    this.router.navigate(['/']);
  }
}
