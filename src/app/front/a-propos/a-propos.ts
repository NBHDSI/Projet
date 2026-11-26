import { Component } from '@angular/core';

@Component({
  selector: 'app-a-propos',
  templateUrl: './a-propos.html'
})
export class APropos {
  readonly nomApplication = 'TechShop';
  readonly version = '1.0';
  readonly annee = 2026;
  readonly unite = 'Atelier Framework Côté Client';
  readonly technologies = '@angular/core 22, Signal Forms, Bootstrap 5.3, json-server';
  readonly etatProjet = 'Le site est encore en cours de développement : les informations de contact et certaines fonctionnalités seront ajoutées dans une prochaine version.';
}
