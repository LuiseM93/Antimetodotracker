import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAppContext } from '../../contexts/AppContext';
import { Button } from '../../components/Button';

export const AvatarUploader: React.FC = () => {
  const { session, userProfile, updateUserProfile } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.avatar_url || null);

  useEffect(() => {
    if (userProfile?.avatar_url) {
      setAvatarUrl(userProfile.avatar_url);
    }
  }, [userProfile?.avatar_url]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session!.user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      updateUserProfile({ avatar_url: publicUrl });

    } catch (error) {
      alert((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <img
        src={avatarUrl || './assets/default-avatar.png'} // Provide a default avatar image
        alt="Avatar"
        className="w-32 h-32 rounded-full mx-auto mb-4"
      />
      <div>
        <label htmlFor="single" className="button primary block">
          {uploading ? 'Subiendo ...' : 'Subir una foto de perfil'}
        </label>
        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id="single"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>
    </div>
  );
};
