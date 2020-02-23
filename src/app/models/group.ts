import { WeekDay } from '@angular/common';
import { User } from './user';

export class Group {
    
    public members: User[];
    
    constructor(
        public id: string,
        public groupName: string,
        public groupLocation: string, 
        public groupDeliveryDay: WeekDay,
        public contactEmail?: string
    ) {
    }
}