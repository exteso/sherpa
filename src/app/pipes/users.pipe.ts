import { User } from '../models';
import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usersFilter',
  pure: false
})
@Injectable()
export class UsersPipe implements PipeTransform {
  // Accepts an array of userIds to filter out users, and a search string to search for a user based on their first, last, and email.
  transform(users: User[], data: [string[], string]): User[] {
    const excludedIds = data[0];
    let search = data[1];

    if (!users) {
      return;
    } else if (!excludedIds) {
      return users;
    } else if (excludedIds && !search) {
      return users.filter((user: User) => excludedIds.indexOf(user.userId) === -1);
    } else {
      search = search.toLowerCase();
      return users.filter((user: User) => (excludedIds.indexOf(user.userId) === -1 &&
        (
          String(user.firstName).toLowerCase().indexOf(search) > -1 ||
          String(user.lastName).toLowerCase().indexOf(search) > -1 ||
          String(user.email).toLowerCase().indexOf(search) > -1
        )));
    }
  }
}
