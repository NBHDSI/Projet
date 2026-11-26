import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'ttc' })
export class TtcPipe implements PipeTransform {
  transform(prix: number, taux: number = 19): number {
    return prix * (1 + taux / 100);
  }
}
