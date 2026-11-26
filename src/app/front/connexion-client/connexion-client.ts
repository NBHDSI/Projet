import { Component, inject, signal } from '@angular/core';
import { email, form, FormField, FormRoot, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-connexion-client',
  imports: [FormRoot, FormField, RouterLink],
  templateUrl: './connexion-client.html'
})
export class ConnexionClient {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly connexionModel = signal<{ email: string; motDePasse: string }>({ email: '', motDePasse: '' });

  readonly connexionForm = form(this.connexionModel, path => {
    required(path.email, { message: 'L\'email est obligatoire' });
    email(path.email, { message: 'Adresse email invalide' });
    required(path.motDePasse, { message: 'Le mot de passe est obligatoire' });
  });

  readonly message = signal('');
  readonly erreur = signal('');

  onSubmit(): void {
    this.message.set('');
    this.erreur.set('');
    const valeurs = this.connexionModel();
    this.authService.connexion(valeurs.email, valeurs.motDePasse, 'client').subscribe({
      next: reussi => {
        if (reussi == false) {
          this.message.set('Email ou mot de passe incorrect.');
          return;
        }
        this.router.navigate([this.pageRetour()]);
      },
      error: () => this.erreur.set('Connexion impossible. Vérifiez que le serveur JSON est démarré (npm run db).')
    });
  }

  pageRetour(): string {
    const retour = this.activatedRoute.snapshot.queryParamMap.get('retour');
    if (retour == null) {
      return '/';
    }
    return retour;
  }
}
