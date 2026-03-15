type CalendarEvent = {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  backgroundColor?: string;
}

const calenderEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '春学期 授業開始',
      start: '2026-04-06',
      allDay: true,
      backgroundColor: '#4ade80' // 緑
    },
    {
      id: '2',
      title: '履修登録期間',
      start: '2026-04-06',
      end: '2026-04-14',
      allDay: true,
      backgroundColor: '#f87171' // 赤
    },
    {
      id: '3',
      title: 'プログラミング演習1 (教室: 101)',
      start: '2026-04-08T10:40:00',
      end: '2026-04-08T12:10:00',
      backgroundColor: '#60a5fa' // 青
    }
  ];

export default calenderEvents;