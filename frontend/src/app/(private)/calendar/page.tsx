"use client";

import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ChevronLeft, ChevronRight, X, Clock } from "lucide-react";

import Main from "@/components/ui/PageMain";
import Header from "@/components/ui/PageHeader";
import OfficeHours from "@/components/features/calendar/OfficeHours";
import calenderEvents from "@/constants/calendarEvents";

const views = [
    { key: "dayGridMonth", label: "月" },
    { key: "timeGridWeek", label: "週" },
    { key: "timeGridDay", label: "日" },
];

const CalendarPage = () => {
    const [events, setEvents] = useState(calenderEvents);
    const [isTodayDisabled, setIsTodayDisabled] = useState(false);
    const [currentTitle, setCurrentTitle] = useState("");
    const [currentView, setCurrentView] = useState("dayGridMonth");
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);

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

    const handleDatesSet = (arg: any) => {
        setCurrentTitle(arg.view.title);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (today >= arg.start && today <= arg.end) {
            setIsTodayDisabled(true);
        } else {
            setIsTodayDisabled(false);
        }
    };

    const handleDateClick = (arg: any) => {
        if (currentView === "timeGridDay") return;

        const calendarApi = calendarRef.current?.getApi();
        calendarApi?.gotoDate(arg.dateStr);
        calendarApi?.changeView("timeGridDay");
        setCurrentView("timeGridDay");
    };

    const handleEventClick = (arg: any) => {
        setSelectedEvent({
            title: arg.event.title,
            start: arg.event.start,
            end: arg.event.allDay && arg.event.end 
                 ? new Date(arg.event.end.getTime() - 24 * 60 * 60 * 1000) 
                 : arg.event.end,
            allDay: arg.event.allDay,
        });
        setModalOpen(true);
    };

     const formatDate = (date: Date, allDay: boolean) => {
        if (!date) return "";
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
            ...(allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
        };
        return date.toLocaleDateString("ja-JP", options);
    };

    return (
        <Main padding="p-3 md:p-12">
            <Header
                title="TGカレンダー"
                description="東北学院大学年間スケジュールカレンダー"
            />

            <OfficeHours />
            
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
                            eventClick={handleEventClick}
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

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-border flex flex-col">
                        <div className="p-6 relative">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                            >
                                <X size={20} />
                            </button>

                            <div className="mb-2">
                                <p className="text-sm text-muted-foreground">
                                    イベント詳細
                                </p>
                            </div>

                            <h3 className="text-xl font-bold mb-4 pr-8">
                                {selectedEvent?.title}
                            </h3>

                            <div className="flex items-start gap-3 text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border">
                                <Clock
                                    size={20}
                                    className="mt-0.5 text-primary shrink-0"
                                />
                                <div className="text-sm font-medium leading-relaxed">
                                    {selectedEvent?.start && formatDate(selectedEvent.start, selectedEvent.allDay)}
                                    {selectedEvent?.end && (
                                        <>
                                            {" - "}
                                            {formatDate(selectedEvent.end, selectedEvent.allDay)}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-muted/30 border-t border-border flex justify-end">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-6 py-2 bg-background border border-border rounded-xl text-sm font-bold text-foreground hover:bg-muted transition-all shadow-sm"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Main>
    );
};

export default CalendarPage;
