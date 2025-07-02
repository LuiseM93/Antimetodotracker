
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../Modal.tsx';
import { LoadingSpinner } from '../LoadingSpinner.tsx';
import { supabase } from '../../services/supabaseClient.ts';
import { UserCircleIcon } from '../icons/UserCircleIcon.tsx';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'followers' | 'following';
  profileId: string;
}

interface FollowUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({ isOpen, onClose, view, profileId }) => {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      
      let query;
      if (view === 'followers') {
        // Get profiles of users who are following `profileId`
        query = supabase
          .from('relationships')
          .select('follower_id:profiles!relationships_follower_id_fkey(id, username, display_name, avatar_url)')
          .eq('following_id', profileId);
      } else { // 'following'
        // Get profiles of users whom `profileId` is following
        query = supabase
          .from('relationships')
          .select('following_id:profiles!relationships_following_id_fkey(id, username, display_name, avatar_url)')
          .eq('follower_id', profileId);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching ${view}:`, error);
        setUsers([]);
      } else {
        const userList = data.map((item: any) => 
          view === 'followers' ? item.follower_id : item.following_id
        ).filter(Boolean); // Filter out any null/undefined profiles
        setUsers(userList);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [isOpen, view, profileId]);

  const title = view === 'followers' ? 'Seguidores' : 'Siguiendo';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner />
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-[var(--color-text-light)] py-4">No hay usuarios para mostrar.</p>
      ) : (
        <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
          {users.map(user => (
            <li key={user.id}>
              <Link
                to={`/profile/${user.username}`}
                onClick={onClose}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[var(--color-light-purple)] transition-colors"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name} className="w-10 h-10 rounded-full" />
                ) : (
                  <UserCircleIcon className="w-10 h-10 text-[var(--color-secondary)]" />
                )}
                <div>
                  <p className="font-semibold text-[var(--color-text-main)]">{user.display_name}</p>
                  <p className="text-sm text-[var(--color-text-light)]">@{user.username}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};