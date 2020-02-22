import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

import {
  FirestoreService
} from '../../../services';

import { Observable } from 'rxjs';
import { Group } from '../../../models';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.page.html',
  styleUrls: ['./group-list.page.scss'],
})

export class GroupListPage implements OnInit {
  public groupList: Observable<Group[]>;
  public userId;

  constructor(
    public storage: Storage,
    private firestore: FirestoreService
  ) {

  }

  ngOnInit() {
    this.groupList = this.firestore.getGroupList().valueChanges();
  }

}
