import { Component, effect, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-connexion',
  imports: [FormRoot, FormField],
  templateUrl: './connexion.html'
})
export class Connexion {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.estAdmin()) {
        this.router.navigate(['/admin/gestion/produits']);
      }
    });
  }

  readonly connexionModel = signal<{ email: string; motDePasse: string }>({ email: '', motDePasse: '' });

  readonly connexionForm = form(this.connexionModel, path => {
    required(path.email, { message: 'L\'email est obligatoire' });
    email(path.email, { message: 'Adresse email invalide' });
    required(path.motDePasse, { message: 'Le mot de passe est obligatoire' });
  });

  readonly message = signal('');

  onSubmit(): void {
    this.message.set('');
    const valeurs = this.connexionModel();
    this.authService.connexion(valeurs.email, valeurs.motDePasse, 'admin').subscribe({
      next: reussi => {
        if (reussi) {
          this.router.navigate(['/admin/gestion/produits']);
        } else {
          this.message.set('Email ou mot de passe incorrect.');
        }
      },
      error: () => this.message.set('Connexion impossible. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }
}
