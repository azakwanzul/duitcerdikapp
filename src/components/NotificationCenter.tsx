import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, Target, Trophy, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const { state, supabaseActions } = useAppContext();
  const { notifications } = state;
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bill_due':
        return <Calendar size={20} className="text-yellow-400" />;
      case 'budget_alert':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'goal_achieved':
        return <Target size={20} className="text-green-400" />;
      case 'achievement_unlocked':
        return <Trophy size={20} className="text-purple-400" />;
      case 'recurring_transaction':
        return <Bell size={20} className="text-blue-400" />;
      case 'bank_sync':
        return <Bell size={20} className="text-teal-400" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await supabaseActions.markNotificationAsRead(notificationId);
  };

  const handleDelete = async (notificationId: string) => {
    await supabaseActions.deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await supabaseActions.markAllNotificationsAsRead();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface rounded-2xl w-full max-w-2xl border border-dark-border animate-scale-in max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-border">
          <div className="flex items-center space-x-3">
            <Bell size={24} className="text-primary" />
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <p className="text-gray-400 text-sm">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              <CheckCheck size={16} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-gray-500 text-sm">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for updates.'
                  : 'We\'ll notify you about important updates and achievements.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-dark-border hover:bg-gray-700/30 transition-colors ${
                    !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-500' : 'text-gray-400'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-gray-400 hover:text-green-400 transition-colors"
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;