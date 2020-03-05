import { Pipe, PipeTransform, Injectable } from "@angular/core";
import { Product } from '../models/product';

@Pipe({
  name: 'searchProduct',
  pure: false
})
@Injectable()
export class SearchProductPipe implements PipeTransform {

  /**
     * @param items object from array
     * @param term term's search
     * @param excludes array of strings which will ignored during search
     */
  transform(items: any, term: string, excludes: any = []): any {
    if (!term || !items) return items;

    return SearchProductPipe.filter(items, term, excludes);
  }

  /**
   *
   * @param items List of items to filter
   * @param term  a string term to compare with every property of the list
   * @param excludes List of keys which will be ignored during search
   *
   */
  static filter(items: Array<Product>, term: string, excludes: any): Array<Product> {

    const toCompare = term.toLowerCase();

    function checkInside(item: Product, term: string) {
      if (item.name && item.name.toLowerCase().includes(toCompare) ||
          item.category && item.category.toLowerCase().includes(toCompare) ||
          item.origin && item.origin.toLowerCase().includes(toCompare)) {
            return true;
          }
      return false;
    }

    return items.filter(function (item) {
      return checkInside(item, term);
    });
  }
}