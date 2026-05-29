"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

interface FollowButtonProps {
  authorId: string;
  authorName: string;
  initialIsFollowing: boolean;
  isLoggedIn: boolean;
}

export default function FollowButton({ authorId, authorName, initialIsFollowing, isLoggedIn }: FollowButtonProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { showNotification } = useNotification();

  const handleFollow = async () => {
    if (!isLoggedIn) return showNotification("Logga in för att följa användare.", "info");
    setIsFollowing(!isFollowing);
    try {
      await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followedId: authorId, action: isFollowing ? 'remove' : 'add' })
      });
      router.refresh();
    } catch (e) {
      console.error(e);
      setIsFollowing(isFollowing); // Revert on error
    }
  };

  return (
    <button 
      onClick={handleFollow} 
      className="btn-secondary" 
      style={{ 
        width: '100%', 
        padding: '0.75rem', 
        background: isFollowing ? 'var(--color-primary)' : '', 
        color: isFollowing ? 'white' : '',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}
    >
      {isFollowing ? '✓ Följer' : '+ Följ'} {authorName}
    </button>
  );
}
