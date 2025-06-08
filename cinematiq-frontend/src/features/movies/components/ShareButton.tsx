import React from 'react';
import { Button } from '@/components/ui/Button';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  title,
  text,
  url = window.location.href,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        // User cancelled or error occurred, fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className={className}
    >
      {copied ? (
        <Check className="h-4 w-4 mr-2 text-green-500" />
      ) : (
        <Share2 className="h-4 w-4 mr-2" />
      )}
      {copied ? 'Copied!' : 'Share'}
    </Button>
  );
};