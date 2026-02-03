import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import './ActivityReport.css';

interface Activity {
  id: string;
  type: 'create_session' | 'add_participant' | 'add_item';
  description: string;
  date: string;
  sessionId: string;
  sessionName: string;
  user: string;
}

export default function ActivityReport() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const response = await api.get('/reports/activity');
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to load activity report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.description.toLowerCase().includes(search.toLowerCase()) ||
                         activity.sessionName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="loading">Loading activity report...</div>;

  return (
    <div className="activity-report">
      <header className="report-header">
        <h1>Activity Log</h1>
        <button onClick={() => navigate('/')} className="btn-secondary">
          ← Back to Dashboard
        </button>
      </header>

      <div className="filters-bar">
        <input 
          type="text" 
          placeholder="Search activities..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Events</option>
          <option value="create_session">Trip Created</option>
          <option value="add_participant">Participant Added</option>
          <option value="add_item">Item Added</option>
        </select>
      </div>

      <div className="timeline">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">No matching activities found</div>
        ) : (
          filteredActivities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="timeline-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`timeline-dot ${activity.type}`}></div>
              <div className="timeline-content">
                <div className="timeline-header">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-date">{formatDate(activity.date)}</span>
                </div>
                <div className="activity-description">
                  {activity.description}
                </div>
                <div className="activity-session">
                  Trip: {activity.sessionName}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
