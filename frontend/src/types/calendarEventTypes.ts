export type CalendarEvent = {
    id?: string;
    title: string;
    start: Date | string;
    end?: Date | string;
    allDay?: boolean;
    backgroundColor?: string;
    textColor?: string;
};

export type SelectedEventType = {
    title: string;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
};
