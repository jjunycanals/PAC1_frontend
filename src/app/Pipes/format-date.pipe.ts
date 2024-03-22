import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date, ...args: number[]): unknown {
    // TODO 1
    if (!value) return null; // Si no hi ha cap valor, retornem null

    const date = new Date(value);

    if (isNaN(date.getTime())) return null;

    const day = ('0' + date.getDate()).slice(-2); // Obté el dia i afegeix un zero si és necessari
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Obté el mes i afegeix un zero si és necessari
    const year = date.getFullYear(); // Obté l'any

    switch (args[0]) { // Utilitzem el primer argument per determinar el format de la data
      case 1:
        return `${year}${month}${day}`; // Format → 25092021
      case 2:
        return `${day} / ${month} / ${year}`; // Format → 25 / 09 / 2021
      case 3:
        return `${day}/${month}/${year}`; // Format → 25/09/2021
      case 4:
        return `${year}-${month}-${day}`; // Format → 2021-09-25
      default:
        return null;; // Si l'argument no és vàlid, retornem null
    }

  }
}
