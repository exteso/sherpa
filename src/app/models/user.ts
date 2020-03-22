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
    public pushToken?: string,
    public notifications?: boolean
  ) {
    this.obj = {
      userId: this.userId,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      groupId: this.groupId,
      familyId: this.familyId,
      photo: this.photo,
      pushToken: this.pushToken,
      notifications: this.notifications
    };
  }
}
