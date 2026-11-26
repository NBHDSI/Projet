import { Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html'
})
export class AdminLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly connecte = this.authService.estAdmin;
  readonly nomCompte = this.authService.nomCompte;

  constructor() {
    effect(() => {
      if (this.connecte() == false) {
        this.router.navigate(['/admin']);
      }
    });
  }

  onDeconnexion(): void {
    this.authService.deconnexion();
  }
}
