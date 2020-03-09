export class User {
  public obj: {};
  constructor(
    public userId: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public groupId: string,
    public familyId: string,
    public photo: string,
    public username: string,
    public pushToken?: string,
    public notifications?: boolean
  ) {
    this.obj = {
      userId: this.userId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      groupId: this.userId,
      familyId: this.familyId,
      photo: this.photo,
      username: this.username,
      pushToken: this.pushToken,
      notifications: this.notifications
    };
  }
}
