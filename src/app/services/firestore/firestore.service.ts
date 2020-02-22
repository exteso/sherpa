import { Injectable } from '@angular/core';

import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';

// import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
// import { GeoFirestore } from 'geofirestore';

import { User, GeoMap, Group } from '../../models';
import { WeekDay } from '@angular/common';

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

  // Get userData of a user given the username. Return the userData promise.
  public getUserByUsername(username: string): Promise<User> {
    return new Promise(resolve => {
      this.afs.collection('users', ref => ref.where('username', '==', username)).valueChanges().pipe(take(1)).subscribe((res: User[]) => {
        if (res.length > 0) {
          resolve(res[0]);
        } else {
          resolve();
        }
      });
    });
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

 
  // Event //
  createEvent(
    eventName: string,
    eventDescription: string,
    eventLocation: string,
    eventDate: string,
    userId: string
  ): Promise<void> {
    const id = this.afs.createId();

    return this.afs.doc(`eventList/${id}`).set({
      id,
      eventName,
      eventDescription,
      eventLocation,
      eventDate,
      userId
    });
  }

  getEventList(userId: string): AngularFirestoreCollection<Event> {
    return this.afs.collection('eventList', ref => ref.where('userId', '==', userId));
  }

  deleteEvent(eventId: string): Promise<void> {
    return this.afs.doc(`eventList/${eventId}`).delete();
  }

  updateEvent(
    eventId: string,
    eventName: string,
    eventDescription: string,
    eventLocation: string,
    eventDate: number
    ): Promise<void> {
    return this.afs.doc(`eventList/${eventId}`).update({
      eventName,
      eventDescription,
      eventLocation,
      eventDate
    });
  }
  ////


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
  
    deleteGroup(eventId: string): Promise<void> {
      return this.afs.doc(`groups/${eventId}`).delete();
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
    ////
}
