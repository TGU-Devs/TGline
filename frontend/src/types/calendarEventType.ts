type CalendarEvent = {
    id: string;
    title: string;
    start: Date | string;
    end?: Date | string;
    allDay?: boolean;
    backgroundColor?: string;
    textColor?: string;
};

export default CalendarEvent;