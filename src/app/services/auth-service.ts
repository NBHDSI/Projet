import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { Compte } from '../models/produit';

const URL = 'http://localhost:3000/comptes';

@Service()
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _compte = signal<Compte | undefined>(undefined);

  readonly compte = this._compte.asReadonly();

  readonly connecte = computed(() => this._compte() != undefined);

  readonly estAdmin = computed(() => {
    const compte = this._compte();
    if (compte == undefined) {
      return false;
    }
    return compte.role == 'admin';
  });

  readonly estClient = computed(() => {
    const compte = this._compte();
    if (compte == undefined) {
      return false;
    }
    return compte.role == 'client';
  });

  readonly nomCompte = computed(() => {
    const compte = this._compte();
    if (compte == undefined) {
      return '';
    }
    return compte.nom;
  });

  connexion(email: string, motDePasse: string, role: string): Observable<boolean> {
    return this._http.get<Compte[]>(URL).pipe(
      map(liste => {
        for (const compte of liste) {
          if (compte.email == email && compte.motDePasse == motDePasse && compte.role == role) {
            this._compte.set(compte);
            return true;
          }
        }
        return false;
      })
    );
  }

  inscrire(nom: string, email: string, motDePasse: string): Observable<string> {
    return this._http.get<Compte[]>(`${URL}?email=${encodeURIComponent(email)}`).pipe(
      switchMap(existants => {
        if (existants.length > 0) {
          return of('Un compte existe déjà avec cet email.');
        }
        const nouveau = { nom: nom, email: email, motDePasse: motDePasse, role: 'client' };
        return this._http.post<Compte>(URL, nouveau).pipe(
          tap(compte => this._compte.set(compte)),
          map(() => '')
        );
      })
    );
  }

  deconnexion(): void {
    this._compte.set(undefined);
  }

  changerMotDePasse(ancienMotDePasse: string, nouveauMotDePasse: string): Observable<boolean> {
    const compte = this._compte();
    if (compte == undefined) {
      return of(false);
    }
    if (compte.motDePasse != ancienMotDePasse) {
      return of(false);
    }
    const modifie: Compte = { ...compte, motDePasse: nouveauMotDePasse };
    return this._http.put<Compte>(`${URL}/${compte.id}`, modifie).pipe(
      map(resultat => {
        this._compte.set(resultat);
        return true;
      })
    );
  }
}
