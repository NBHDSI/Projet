import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { FavoriService } from '../../services/favori-service';
import { PanierService } from '../../services/panier-service';

@Component({
  selector: 'app-front-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './front-layout.html'
})
export class FrontLayout {
  private readonly authService = inject(AuthService);
  private readonly favoriService = inject(FavoriService);
  private readonly panierService = inject(PanierService);
  private readonly router = inject(Router);

  readonly connecte = this.authService.connecte;
  readonly estClient = this.authService.estClient;
  readonly nomCompte = this.authService.nomCompte;

  nombreFavoris(): number {
    return this.favoriService.ids().length;
  }

  nombreArticles(): number {
    return this.panierService.nombreArticles();
  }

  onDeconnexion(): void {
    this.authService.deconnexion();
    this.router.navigate(['/']);
  }
}
