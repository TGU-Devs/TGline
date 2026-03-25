"use client";

import React, { useState } from "react";
import { EventClickArg } from "@fullcalendar/core";

import calenderEvents from "@/constants/calendarEvents";
import Main from "@/components/ui/PageMain";
import Header from "@/components/ui/PageHeader";
import OfficeHours from "@/components/features/calendar/OfficeHours";
import CalendarWidget from "@/components/features/calendar/CalendarWidget";
import Modal from "@/components/features/calendar/Modal";
import { SelectedEventType } from "@/types/calendarEventTypes";


const CalendarPage = () => {
    const [events, setEvents] = useState(calenderEvents);
    const [selectedEvent, setSelectedEvent] = useState<SelectedEventType | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleEventClick = (arg: EventClickArg) => {
        setSelectedEvent({
            title: arg.event.title,
            start: arg.event.start,
            end:
                arg.event.allDay && arg.event.end
                    ? new Date(arg.event.end.getTime() - 24 * 60 * 60 * 1000)
                    : arg.event.end,
            allDay: arg.event.allDay,
        });
        setModalOpen(true);
    };

    return (
        <Main padding="p-3 md:p-12">
            {modalOpen && (
                <Modal
                    selectedEvent={selectedEvent}
                    setModalOpen={setModalOpen}
                />
            )}

            <Header
                title="TGカレンダー"
                description="東北学院大学年間スケジュールカレンダー"
            />

            <OfficeHours />

            <CalendarWidget eventClick={handleEventClick} events={events} />
        </Main>
    );
};

export default CalendarPage;
