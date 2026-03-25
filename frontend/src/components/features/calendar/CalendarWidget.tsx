type CalendarWidgetProps = {
    events: EventInput[];
    eventClick: (arg: EventClickArg) => void;
};

import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { DateClickArg } from "@fullcalendar/interaction";
import { ChevronLeft, ChevronRight } from "lucide-react";

const views = [
    { key: "dayGridMonth", label: "月" },
    { key: "timeGridWeek", label: "週" },
    { key: "timeGridDay", label: "日" },
];

const CalendarWidget = ({ eventClick, events }: CalendarWidgetProps) => {
    const [isTodayDisabled, setIsTodayDisabled] = useState(false);
    const [currentTitle, setCurrentTitle] = useState("");
    const [currentView, setCurrentView] = useState("dayGridMonth");

    const calendarRef = useRef<FullCalendar | null>(null);

    const handlePrev = () => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.prev();
    };

    const handleNext = () => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.next();
    };

    const handleToday = () => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.today();
    };

    const handleChangeView = (view: string) => {
        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.changeView(view);
        setCurrentView(view);
    };

    const handleDatesSet = (arg: DatesSetArg) => {
        setCurrentTitle(arg.view.title);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (today >= arg.start && today <= arg.end) {
            setIsTodayDisabled(true);
        } else {
            setIsTodayDisabled(false);
        }
    };

    const handleDateClick = (arg: DateClickArg) => {
        if (currentView === "timeGridDay") return;

        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.gotoDate(arg.dateStr);
        calendarApi?.changeView("timeGridDay");
        setCurrentView("timeGridDay");
    };

    return (
        <div className="flex flex-col h-200 bg-card p-3 rounded-xl border shadow-sm mt-8 md:p-8 md:h-180">
            <div className="p-5 mb-4 border-b border-sidebar-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted/50 p-1 rounded-xl">
                        <button
                            onClick={handlePrev}
                            className="p-2 hover:bg-destructive-foreground/80 hover:shadow-sm rounded-lg transition-colors text--muted-foreground"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            className="p-2 hover:bg-destructive-foreground/80 hover:shadow-sm rounded-lg transition-colors text--muted-foreground"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <button
                        onClick={handleToday}
                        className={`px-5 py-2 rounded-xl border border-sidebar-border text-sm font-bold transition-colors shadow-sm ${
                            isTodayDisabled
                                ? "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                                : "bg-card hover:bg-muted"
                        }`}
                    >
                        今日
                    </button>
                </div>

                <div className="flex items-center gap-3 order-first md:order-0">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {currentTitle}
                    </h2>
                </div>

                <div className="inline-flex bg-muted/50 p-1 rounded-xl w-fit">
                    {views.map((view) => (
                        <button
                            key={view.key}
                            onClick={() => handleChangeView(view.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentView === view.key
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted"
                            }`}
                        >
                            {view.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grow overflow-x-auto overflow-y-hidden">
                <div
                    className={`${currentView === "timeGridWeek" ? "min-w-175 md:min-w-0" : "w-full"} h-full`}
                >
                    <FullCalendar
                        ref={calendarRef}
                        datesSet={handleDatesSet}
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView={currentView}
                        locale="ja"
                        headerToolbar={false}
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={eventClick}
                        height="100%"
                        contentHeight="100%"
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5],
                            startTime: "08:30",
                            endTime: "17:00",
                        }}
                        nowIndicator={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;
