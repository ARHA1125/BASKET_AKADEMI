'use client';

import { useState, useEffect, useRef } from 'react';
import { Title, Text } from '@/components/ui/notifications/Common';
import { Calendar, MapPin, Users, Trophy, Swords, UserCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Event, Squad, EventType, SquadStatus } from '@/types/events';
import { authenticatedFetch } from '@/lib/api-client';
import gsap from 'gsap';

type TimeFilter = 'all' | 'upcoming' | 'past';

interface EventWithSquad {
  event: Event;
  squads: Squad[];
}

const EVENT_TYPE_CONFIG = {
  [EventType.TOURNAMENT]: {
    icon: Trophy,
    label: 'Turnamen',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
  },
  [EventType.SPARRING]: {
    icon: Swords,
    label: 'Latih Tanding',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
  },
  [EventType.TRYOUT]: {
    icon: UserCheck,
    label: 'Uji Coba',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
  },
};

export function StudentScheduleView() {
  const [events, setEvents] = useState<EventWithSquad[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const fetchSchedule = async () => {
    try {
      setLoading(true);

      const [eventsRes, squadsRes, profileRes] = await Promise.all([
        authenticatedFetch(`${apiUrl}/community-module/events`),
        authenticatedFetch(`${apiUrl}/community-module/squads`),
        authenticatedFetch(`${apiUrl}/auth/profile`),
      ]);

      if (!eventsRes.ok || !squadsRes.ok || !profileRes.ok) {
        toast.error('Gagal memuat jadwal');
        setLoading(false);
        return;
      }

      const eventsData: Event[] = await eventsRes.json();
      const squadsData: Squad[] = await squadsRes.json();
      const profileData = await profileRes.json();

      setCurrentUserId(profileData.student?.id || null);

      const eventsWithSquads: EventWithSquad[] = eventsData.map((event) => ({
        event,
        squads: squadsData.filter((squad) => squad.event.id === event.id),
      }));

      const myEvents = eventsWithSquads.filter((ews) =>
        ews.squads.some((squad) =>
          squad.players.some((player) => player.id === profileData.student?.id)
        )
      );

      setEvents(myEvents);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast.error('Gagal memuat jadwal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (!loading && events.length > 0 && cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll('.event-card');
      gsap.from(cards, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, [loading, events]);

  const toggleEventExpand = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  const filterEventsByTime = (events: EventWithSquad[]): EventWithSquad[] => {
    const now = new Date();
    
    if (timeFilter === 'upcoming') {
      return events.filter((ews) => new Date(ews.event.date) >= now);
    } else if (timeFilter === 'past') {
      return events.filter((ews) => new Date(ews.event.date) < now);
    }
    return events;
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isUpcoming = (dateString: string | Date) => {
    return new Date(dateString) >= new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const filteredEvents = filterEventsByTime(events);

  return (
    <div className="space-y-6">
      <div>
        <Title>Jadwal Saya</Title>
        <Text className="mt-1">Lihat acara mendatang dan status daftar tim Anda</Text>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTimeFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            timeFilter === 'all'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Semua Acara
        </button>
        <button
          onClick={() => setTimeFilter('upcoming')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            timeFilter === 'upcoming'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Mendatang
        </button>
        <button
          onClick={() => setTimeFilter('past')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            timeFilter === 'past'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Selesai
        </button>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Acara tidak ditemukan
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {timeFilter === 'upcoming'
              ? "Anda tidak memiliki acara mendatang."
              : timeFilter === 'past'
              ? "Anda tidak memiliki acara masa lalu."
              : "Anda belum masuk dalam daftar tim acara apa pun."}
          </p>
        </div>
      ) : (
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((ews) => {
            const { event, squads } = ews;
            const mySquads = squads.filter((squad) =>
              squad.players.some((player) => player.id === currentUserId)
            );
            const config = EVENT_TYPE_CONFIG[event.type];
            const IconComponent = config.icon;

            return (
              <div
                key={event.id}
                className="event-card bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all duration-200"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} ${config.border} border`}>
                      <IconComponent className={`w-4 h-4 ${config.color}`} />
                      <span className={`text-xs font-semibold uppercase ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    {isUpcoming(event.date) && (
                      <span className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 rounded-md">
                        Mendatang
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {event.name}
                    </h3>
                    <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {mySquads.map((squad) => (
                    <div
                      key={squad.id}
                      className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {squad.name}
                          </span>
                        </div>
                        {squad.status === SquadStatus.DRAFT ? (
                          <span className="px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 rounded-md animate-pulse">
                            Draft Roster
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 rounded-md">
                            ✓ Roster Dikonfirmasi
                          </span>
                        )}
                      </div>

                      {squad.coachName && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Pelatih: {squad.coachName}
                        </p>
                      )}

                      <div>
                        <button
                          onClick={() => toggleEventExpand(squad.id)}
                          className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          <span>Roster ({squad.players.length} pemain)</span>
                          {expandedEvents.has(squad.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedEvents.has(squad.id) ? 'max-h-96 mt-3' : 'max-h-0'
                          }`}
                        >
                          <ul className="space-y-2">
                            {squad.players.map((player) => {
                              const isCurrentUser = player.id === currentUserId;
                              return (
                                <li
                                  key={player.id}
                                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                                    isCurrentUser
                                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100 font-medium'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {isCurrentUser && <span className="text-amber-500">⭐</span>}
                                  <span>{player.user.fullName}</span>
                                  {isCurrentUser && <span className="text-xs">(Anda)</span>}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
