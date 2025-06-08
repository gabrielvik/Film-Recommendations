import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { X, Play } from 'lucide-react';
import type { Video } from '@/lib/api/types';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: Video[];
  movieTitle: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  videos,
  movieTitle,
}) => {
  // Find the first official trailer, or fall back to any trailer
  const trailer = videos.find(video => 
    video.type === 'Trailer' && video.official && video.site === 'YouTube'
  ) || videos.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  ) || videos.find(video => 
    video.site === 'YouTube'
  );

  if (!trailer) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="relative bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <Play className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No Trailer Available</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Sorry, no trailer is available for {movieTitle}.
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  const youtubeUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="relative bg-black rounded-lg overflow-hidden max-w-4xl mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="aspect-video">
          <iframe
            src={youtubeUrl}
            title={`${movieTitle} - ${trailer.name}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        
        <div className="p-4 bg-slate-900 text-white">
          <h3 className="font-semibold">{trailer.name}</h3>
          <p className="text-sm text-slate-300">
            {trailer.type} • {new Date(trailer.published_at).getFullYear()}
          </p>
        </div>
      </div>
    </Modal>
  );
};