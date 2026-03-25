import { Clock, X } from "lucide-react";
import { formatDate } from "@fullcalendar/core";

import type { SelectedEventType } from "@/types/calendarEventTypes";


type ModalProps = {
    selectedEvent: SelectedEventType | null;
    setModalOpen: (open: boolean) => void;
};

const Modal = ({ selectedEvent, setModalOpen }: ModalProps) => {
    return (
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
                            {selectedEvent?.start &&
                                formatDate(selectedEvent.start, {
                                    locale: "ja",
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    ...(selectedEvent.allDay
                                        ? {}
                                        : {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          }),
                                })}
                            {selectedEvent?.end && (
                                <>
                                    {" - "}
                                    {formatDate(selectedEvent.end, {
                                        locale: "ja",
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        ...(selectedEvent.allDay
                                            ? {}
                                            : {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              }),
                                    })}
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
    );
};

export default Modal;
