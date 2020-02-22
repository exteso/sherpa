import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { Grocery } from '../../models/grocery';
import { Product, Unit } from "../../models/product";

@Injectable()
export class InventoryProvider {
  //userId: string;
  //userProfile$: Observable<userProfile>;
  orderWeek: string;

  constructor(
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth
  ) {  
    let week: any = this.getWeekNumber(new Date());
    this.setOrderWeek(`${week[0]}w${week[1]}`);
    //usually we want to order for the next week
    this.nextOrderWeek();
  }

  getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    let yearStart: any = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    let weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
  }

  setOrderWeek(orderWeek: string){
    this.orderWeek = orderWeek;
  }

  getOrderWeek(){
    return this.orderWeek;
  }

  nextOrderWeek(){
    const orderWeek = this.getOrderWeek();
    const year = parseFloat(orderWeek.substring(0,4));
    let week = parseFloat(orderWeek.substring(5,7));
    week++;
    if (week >52) {
      this.setOrderWeek((year+1)+'w01');
    }else{
      let weekText = week.toString();
      if (week<10) {
        weekText = "0"+week;
      }
      this.setOrderWeek(year+'w'+weekText);
    }
  }

  previousOrderWeek(){
    const orderWeek = this.getOrderWeek();
    const year = parseFloat(orderWeek.substring(0,4));
    let week = parseFloat(orderWeek.substring(5,7));
    week--;
    if (week <1) {
      this.setOrderWeek((year-1)+'w52');
    }else{
      let weekText = week.toString();
      if (week<10) {
        weekText = "0"+week;
      }
      this.setOrderWeek(year+'w'+weekText);
    }
  }


  //TODO To be fixed
  getGroceryList(teamId: string): AngularFirestoreCollection<Grocery> {
    return this.fireStore.collection<Grocery>(
      `/teamProfile/${teamId}/groceryList`,
      ref => ref.orderBy('quantity')
    );
  }

  getProductsForShoppingListWeek(year: string, week: string): AngularFirestoreCollection<Product> {
    return this.fireStore.collection<Product>(
      `/products/${year}/weeks/${week}/items`,
      ref => ref.orderBy('category')
                .orderBy('guiOrder')
    );
  }

  getShoppingListWeek(year: string, week: string): AngularFirestoreDocument<any> {
    return this.fireStore.doc(`/products/2018/weeks/01`);
  }

  getCategories(year: string, week: string){
   const categories = ['Proposte', 'verdure', 'erbette','panetteria','pane',
                        'pane frigo', 'uova', 'senza lattosio', 'latte + latticini', 'formaggi mucca',
                        'formaggi capra', 'gastromia', 'congelati per consumo immediato','carne + pesce freschi',
                        'salumeria', 'burger veg', 'tofu + seitan', 'diversi', 'pomodoro', 'pomodoro cartoni',
                        'olio', 'olio box', 'aceto', 'vino', 'bibite e succhi', 'bibite casse + box', 'sciroppi',
                        'drink diversi', 'drink cartoni', 'confetture', 'miele', 'creme + birnel', 'conserve',
                        'prodotti soia', 'condimenti', 'spezie', 'pasta integrale', 'pasta bianca', 'pasta bianca cartoni',
                        'pasta farro', 'paste speciali', 'riso', 'riso cartoni', 'farine e cereali', 'farine + cereali cartoni e sacchi',
                        'flakes + muesli', 'leguminose', 'te + tisane', 'caffé + surrogati', 'zucchero + lievito + unigel',
                        'zucchero sacchi', 'cioccolato + cacao', 'cioccolato rotto', 'biscotti + crackers', 'frutta secca + snacks', 
                        'diversi secchi', 'idee regalo', 'stoviglie compostabili'];
   return categories;
 }
  getProductsByCat(year: string, week: string, cat: string):  AngularFirestoreCollection<Product> {
    return this.fireStore.collection<Product>(
      `/products/${year}/weeks/${week}/items`,
      ref => ref.where('category', "==", cat)
                .orderBy('guiOrder')
    );
  }


  createProduct(
    teamId: string, year: string, week: string,
    name: string,
    origin: string,
    category: string,
    orderUnit: Unit,
    priceUnit: Unit,
    price: number,
    currency: string,
    guiOrder: number
    //TODO quantity field should be defined at vendor level
    //quantity is only used if there is a limited number of this items (across all the groups)
    //quantity?: number
  ): Promise<void> {
    const productId: string = this.fireStore.createId();

    return this.fireStore
      .doc<Product>(`/products/${year}/weeks/${week}/items/${productId}`)
      .set({
        id: productId,
        name,
        origin,
        category,
        orderUnit,
        priceUnit,
        price,
        currency,
        guiOrder
      });
  }


  addProductsToCatalog(year: string, week: string,
                       products: Array<Product>){

    const weekCatalogCollection = this.fireStore
      .collection<Product>(`/products/${year}/weeks/${week}/items/`);

    products.map(p => {weekCatalogCollection.add({...p})});
          
  }

  getMyFavoriteProducts(
    teamId: string,
    isInShoppingList: boolean,
    year: string,
    week: string,
    userId: string
  ): AngularFirestoreCollection<Grocery> {
    return this.fireStore.collection<Grocery>(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/`,
      ref =>
        ref
          .where('favorite', '==', true)
    );
  }

  createGrocery(
    teamId: string,
    year: string,
    week: string,
    userId: string,
    grocery: Grocery
  ): Promise<void> {
    //const groceryId: string = this.fireStore.createId();
    const groceryId: string = grocery.id;

    return this.fireStore
      .doc<Grocery>(`/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}`)
      .set({
        ...grocery
      });
  }

  addGroceryQuantity(
    groceryId: string,
    quantity: number,
    teamId: string,
    year: string,
    week: string,
    userId: string
  ): Promise<void> {
    const groceryRef = this.fireStore.doc(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}`
    ).ref;

    return this.fireStore.firestore.runTransaction(transaction => {
      return transaction.get(groceryRef).then(groceryDoc => {
        const newQuantity: number = groceryDoc.data().quantity + quantity;
        transaction.update(groceryRef, { quantity: newQuantity });
      });
    });
  }

  removeGroceryQuantity(
    groceryId: string,
    quantity: number,
    teamId: string,
    year: string,
    week: string,
    userId: string
  ): Promise<void> {
    const groceryRef = this.fireStore.doc(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}`
    ).ref;

    return this.fireStore.firestore.runTransaction(transaction => {
      return transaction.get(groceryRef).then(groceryDoc => {
        const newQuantity: number = groceryDoc.data().quantity - quantity;
        transaction.update(groceryRef, { quantity: newQuantity });
      });
    });
  }

  addGroceryToFavorites(groceryId: string, teamId: string,
    year: string,
    week: string,
    userId: string): Promise<void> {
    const groceryRef = this.fireStore.doc(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}`
    );

    return groceryRef.update({
      inFavorite: true
    });
  }

  removeGroceryFromShoppingList(
    groceryId: string,
    teamId: string,
    year: string,
    week: string,
    userId: string
  ): Promise<void> {
    const groceryRef = this.fireStore.doc(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}`
    );

    return groceryRef.update({
      inShoppingList: false
    });
  }

  pickUpGroceryFromShoppingList(
    groceryId: string,
    quantityShopping: number,
    teamId: string,
    year: string,
    week: string,
    userId: string
  ): Promise<void> {
    const groceryRef = this.fireStore.doc(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}}`
    ).ref;

    return this.fireStore.firestore.runTransaction(transaction => {
      return transaction.get(groceryRef).then(groceryDoc => {
        const newQuantity: number =
          groceryDoc.data().quantity + quantityShopping;

        transaction.update(groceryRef, {
          quantity: newQuantity,
          quantityShopping: quantityShopping,
          picked: true
        });
      });
    });
  }

  addQuantityGroceryFromShoppingList(
    groceryId: string,
    quantityShopping: number,
    teamId: string,
    year: string,
    week: string,
    userId: string
  ): Promise<void> {
    const groceryRef = this.fireStore.doc(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}`
    ).ref;

    return this.fireStore.firestore.runTransaction(transaction => {
      return transaction.get(groceryRef).then(groceryDoc => {
        const newQuantity: number =
          groceryDoc.data().quantity + quantityShopping;
        const newQuantityShopping: number =
          groceryDoc.data().quantityShopping + quantityShopping;
        transaction.update(groceryRef, {
          quantity: newQuantity,
          quantityShopping: newQuantityShopping,
          picked: true
        });
      });
    });
  }

  removeQuantityGroceryFromShoppingList(
    groceryId: string,
    quantityShopping: number,
    teamId: string,
    year: string,
    week: string,
    userId: string
  ): Promise<void> {
    const groceryRef = this.fireStore.doc(
      `/orders/${year}w${week}/groups/${teamId}/member/${userId}/items/${groceryId}`
    ).ref;

    return this.fireStore.firestore.runTransaction(transaction => {
      return transaction.get(groceryRef).then(groceryDoc => {
        const newQuantity: number =
          groceryDoc.data().quantity - quantityShopping;
        const newQuantityShopping: number =
          groceryDoc.data().quantityShopping - quantityShopping;
        transaction.update(groceryRef, {
          quantity: newQuantity,
          quantityShopping: newQuantityShopping,
          picked: true
        });
      });
    });
  }
}
