import React, { useEffect, useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { UserProfile, Challenge } from '../types';
import { getUserHistory } from '../services/firestore';

interface NotificationsViewProps {
  currentUser: UserProfile;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ currentUser }) => {
  const [history, setHistory] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getUserHistory(currentUser.uid);
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser.uid]);

  const scheduledDuels = history.filter(c => c.status === 'accepted' || (c.status === 'pending' && c.scheduledTime));

  const formatDate = (ts: number) => new Date(ts).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-white mb-8">Notifications</h1>

      {/* Scheduled / Upcoming Section */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-zinc-300 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-400" />
          Scheduled & Pending
        </h2>
        
        {loading ? (
             <div className="flex justify-center p-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-500"></div>
            </div>
        ) : scheduledDuels.length > 0 ? (
          <div className="grid gap-4">
            {scheduledDuels.map(duel => (
              <div key={duel.id} className="bg-dark-surface border border-brand-500/30 rounded-xl p-4 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="bg-brand-500/10 p-2 rounded-full">
                       <Clock className="w-6 h-6 text-brand-400" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-lg">
                           Vs {duel.fromId === currentUser.uid ? duel.toName : duel.fromName}
                        </div>
                        <div className="text-zinc-400 text-sm">
                           {formatDate(duel.scheduledTime || duel.timestamp)}
                        </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold border border-brand-500/20 uppercase">
                       {duel.status === 'pending' ? 'Request Sent' : 'Scheduled'}
                    </span>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 italic bg-dark-surface/50 p-6 rounded-xl border border-dashed border-dark-border text-center">
            No upcoming duels scheduled.
          </div>
        )}
      </section>
    </div>
  );
};