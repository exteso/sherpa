import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection,
  AngularFirestoreCollectionGroup
} from '@angular/fire/firestore';

// import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
// import { GeoFirestore } from 'geofirestore';

import { User, GeoMap, Group } from '../../models';
import { WeekDay } from '@angular/common';
import { Catalog } from 'src/app/models/catalog';
import { Product } from 'src/app/models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  fsRef: any;
  // geoFirestore: any;

  constructor(
    private afs: AngularFirestore
  ) {

    /// Reference database location for GeoFirestore
    this.fsRef = this.afs.collection('geofirestore');
    // this.geoFirestore = new GeoFirestore(this.fsRef);
  }

  // Get an object from Firestore by its path. For eg: firestore.get('users/' + userId) to get a user object.
  public get(path: string): Promise<AngularFirestoreDocument<{}>> {
    return new Promise(resolve => {
      resolve(this.afs.doc(path));
    });
  }

  public getUser(userId: string): Observable<User> {
    return this.afs.doc<User>(`users/${userId}`).valueChanges();
  }

  // Check if the object exists on Firestore. Returns a boolean promise with true/false.
  public exists(path: string): Promise<boolean> {
    return new Promise(resolve => {
      this.afs.doc(path).valueChanges().pipe(take(1)).subscribe(res => {
        if (res) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  // Get all users on Firestore ordered by their firstNames.
  public getUsers(): AngularFirestoreCollection<User> {
    return this.afs.collection('users', ref => ref.orderBy('firstName'));
  }

  public getUserByUID(uid: string): Promise<User> {
    return new Promise(resolve => {
      this.afs.collection('users', ref => ref.where('userId', '==', uid)).valueChanges().pipe(take(1)).subscribe((res: User[]) => {
        if (res.length > 0) {
          resolve(res[0]);
        } else {
          resolve();
        }
      });
    });
  }

  // Get userData of a user given the pushToken. Return the userData promise.
  public getUserByPushToken(token: string): Promise<User> {
    return new Promise(resolve => {
      this.afs.collection('users', ref => ref.where('pushToken', '==', token)).valueChanges().pipe(take(1)).subscribe((res: User[]) => {
        if (res.length > 0) {
          resolve(res[0]);
        } else {
          resolve();
        }
      });
    });
  }

  // Set the pushToken of the user given the userId.
  public setPushToken(userId: string, token: string): void {
    this.getUserByPushToken(token).then((user: User) => {
      if (user) {
        this.removePushToken(user.userId);
      }
      this.get('users/' + userId).then(ref => {
        ref.update({
          pushToken: token
        });
      }).catch(() => { });
    }).catch(() => { });
  }

  // Remove the pushToken of the user given the userId.
  public removePushToken(userId: string): void {
    this.get('users/' + userId).then(ref => {
      ref.update({
        pushToken: ''
      });
    }).catch(() => { });
  }

  /* GeoFirestore */
  /////////////////

  /// Adds GeoFire data to database
  setLocation(l: Array<number>, u: string, t: number) {
    const g = this.afs.createId();

    this.afs.doc(`geofirestore/${g}`).set({g, l, u, t});
    // this.geoFirestore.set(key, coords)
    //   .then(_ => console.log('location updated'))
    //   .catch(err => console.log(err));
  }

  // Get all Locations registered on Firestore by setLocation().
  public getAllLocations(): AngularFirestoreCollection<GeoMap> {
    return this.fsRef;
  }

  /* CRUD */
  /////////////////

    // Group //
    createGroup(
      groupName: string,
      deliveryDay: WeekDay,
      groupLocation: string,
      contactEmail: string
    ): Promise<void> {
      const id = this.afs.createId();
      let newGroup = new Group(id, groupName, groupLocation, deliveryDay, contactEmail);
      return this.afs.doc(`groups/${id}`).set(Object.assign({}, newGroup));
    }
  
    getGroup(groupId: string): Promise<AngularFirestoreDocument<Group>>  {
      return new Promise(resolve => {
        resolve(this.afs.doc(`groups/${groupId}`));
      });
    }

    getGroupList(): AngularFirestoreCollection<Group> {
      return this.afs.collection('groups');
    }

    getUserGroups(userId: string): AngularFirestoreCollection<Group> {
      return this.afs.collection('groups', ref => ref.where('userId', '==', userId));
    }
  
    deleteGroup(groupId: string): Promise<void> {
      return this.afs.doc(`groups/${groupId}`).delete();
    }
  
    updateGroup(
      groupId: string,
      groupName: string,
      groupDeliveryDay: WeekDay,
      groupLocation: string,
      contactEmail: string
      ): Promise<void> {
      return this.afs.doc(`groups/${groupId}`).update({
        groupName,
        groupDeliveryDay,
        groupLocation,
        contactEmail
      });
    }

    getGroupMembers(groupId: string): AngularFirestoreCollection<User>  {
      return this.afs.collection(`groups/${groupId}/members`);
    }

    addMemberToGroup(user: User, groupId: string){
      return this.afs.doc(`groups/${groupId}/members/${user.email}`)
                     .set({
                       ...user
                     });
    }

    removeMemberFromGroup(user: User, groupId: string){
      return this.afs.doc(`groups/${groupId}/members/${user.email}`).delete();
    }
    ////

    // Catalog //
    private catalogId(year: string, week: string){
      return year+'w'+week;
    }

  
    createCatalog(catalog: Catalog): Promise<void> {
      return this.afs.doc(`catalogs/${catalog.id}`)
                     .set({...catalog});
    }


    getCatalog(year: string, week: string): Promise<AngularFirestoreDocument<Catalog>>  {
      return new Promise(resolve => {
        const id = this.catalogId(year, week);
        this.getCatalogById(id);
      });
    }

    getCatalogById(catalogId: string): Promise<AngularFirestoreDocument<Catalog>>  {
      return new Promise(resolve => {
        resolve(this.afs.doc(`catalogs/${catalogId}`));
      });
    }

    getCatalogProducts(catalogId: string): AngularFirestoreCollection<Product> {
      return this.afs.collection(`catalogs/${catalogId}/products`, 
                                  ref => ref.orderBy('category')
                                            .orderBy('guiOrder'))
    }

    getCatalogList(): AngularFirestoreCollection<Catalog> {
      return this.afs.collection('catalogs/', 
                                  ref =>
                                    ref.orderBy("id", "desc").limit(4));
    }
  
    deleteCatalog(year: string, week: string): Promise<void> {
      const id = this.catalogId(year, week);
      return this.deleteCatalogById(id);
    }

    deleteCatalogById(id: string): Promise<void> {
      return this.afs.doc(`catalogs/${id}`).delete();
    }

    addProductsToCatalog(products: Product[], catalogId: string){
        const weekCatalogCollection = this.afs.collection<Product>(`catalogs/${catalogId}/products/`);
        let promises: Promise<any>[] = [];
        for (let i=0; i<products.length; i++){
          let product = products[i];
          //TODO instead of creating a unique id, we should create a has of the product
          const id = product.id ? product.id : this.afs.createId();
          promises.push(weekCatalogCollection.add({...product, id}));
        }
        return Promise.all(promises);
    }

    addProductToCatalog(product: Product, catalogId: string){
      const id = product.id ? product.id : this.afs.createId();
      return this.afs.doc(`catalogs/${catalogId}/products/${id}`)
                     .set({
                       ...product,
                       id
                     });
    }

    removeProductFromCatalog(productId: string, catalogId: string){
      return this.afs.doc(`catalogs/${catalogId}/products/${productId}`).delete();
    }
    ////

    getProducts(): AngularFirestoreCollection<Product> {

      // Get all the products, no matter how deeply nested
      return this.afs.collection<Product>(
        `/products/2018/weeks/07/items`,
        ref => ref.orderBy('category')
                  .orderBy('guiOrder')
      );
      
    }

}
