import { WeekDay } from '@angular/common';

export class Group {
    constructor(
        public id: string,
        public groupName: string,
        public groupLocation: string, 
        public groupDeliveryDay: WeekDay,
        public contactEmail?: string
    ) {
    }
}