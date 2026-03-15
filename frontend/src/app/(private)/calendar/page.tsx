// frontend/src/app/(private)/calendar/page.tsx

"use client";

import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import Main from "@/components/ui/PageMain";
import Header from "@/components/ui/PageHeader";
import calenderEvents from "@/constants/calendarEvents";

const CalendarPage = () => {
    const [events, setEvents] = useState(calenderEvents);

    const handleDateClick = (arg: any) => {
        alert(`クリックされた日付: ${arg.dateStr}`);
    };

    const handleEventClick = (arg: any) => {
        alert(`クリックされた予定: ${arg.event.title}`);
    };

    return (
        <Main padding="p-3 md:p-12">
            <Header
                title="TGカレンダー"
                description="東北学院大学年間スケジュールカレンダー"
            />

            {/* カレンダー本体のカード部分 */}
            <div className="flex flex-col h-200 bg-card p-3 rounded-xl border shadow-sm mt-8 md:p-8 md:h-180">
                <div className="grow">
                    <FullCalendar
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                        ]}
                        initialView="dayGridMonth"
                        locale="ja"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay",
                        }}
                        events={events}
                        dateClick={handleDateClick}
                        eventClick={handleEventClick}
                        height="100%"
                        contentHeight="100%"
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5],
                            startTime: "08:00",
                            endTime: "18:00",
                        }}
                        nowIndicator={true}
                    />
                </div>
            </div>
        </Main>
    );
};

export default CalendarPage;
