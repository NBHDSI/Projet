import { effect, inject, Service, signal } from '@angular/core';
import { AuthService } from './auth-service';

@Service()
export class FavoriService {
  private readonly authService = inject(AuthService);
  private readonly _ids = signal<string[]>([]);

  readonly ids = this._ids.asReadonly();

  constructor() {
    effect(() => {
      if (this.authService.connecte() == false) {
        this._ids.set([]);
      }
    });
  }

  estFavori(id: string): boolean {
    for (const courant of this._ids()) {
      if (courant == id) {
        return true;
      }
    }
    return false;
  }

  basculer(id: string): void {
    const liste: string[] = [];
    let dejaFavori = false;
    for (const courant of this._ids()) {
      if (courant == id) {
        dejaFavori = true;
      } else {
        liste.push(courant);
      }
    }
    if (dejaFavori == false) {
      liste.push(id);
    }
    this._ids.set(liste);
  }

  vider(): void {
    this._ids.set([]);
  }
}
