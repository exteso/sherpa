export class userProfile {
    constructor(
        public id?: string,
        public email?: string,
        public firstName?: string,
        public lastName?: string,
        public groupAdmin?: boolean,
        public groupId?: string,
        public birthDate?: string
    ) {   }
}
