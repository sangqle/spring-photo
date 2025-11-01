import React from 'react';
import usePhotoLike from '../../hooks/usePhotoLike';

interface FeedItemActionsProps {
  photoId: string;
  initialIsLiked?: boolean;
  initialLikeCount?: number;
  commentCount?: number;
  viewCount?: number;
  showComments?: boolean;
  onToggleComments?: () => void;
}

const FeedItemActions: React.FC<FeedItemActionsProps> = ({
  photoId,
  initialIsLiked = false,
  initialLikeCount,
  commentCount = 0,
  viewCount = 0,
  showComments = false,
  onToggleComments,
}) => {
  const { isLiked, likeCount, toggleLike } = usePhotoLike({
    photoId,
    initialIsLiked,
    initialLikeCount,
  });

  const handleToggleComments = () => {
    if (onToggleComments) {
      onToggleComments();
    }
  };

  return (
    <div className="border-b border-gray-800 px-6 py-3">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleLike}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-800"
          aria-label={isLiked ? 'Unlike' : 'Like'}
          data-photo-id={photoId}
        >
          <svg
            className={`h-6 w-6 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
          {likeCount !== null && likeCount > 0 ? (
            <span className="text-sm font-medium text-gray-300">{likeCount}</span>
          ) : null}
        </button>

        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-800 ${
            showComments ? 'bg-gray-800 text-blue-400' : ''
          }`}
          aria-label="Comment"
          data-photo-id={photoId}
        >
          <svg
            className={`h-6 w-6 transition-colors ${showComments ? 'text-blue-400' : 'text-gray-400 hover:text-blue-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-300">{commentCount}</span>
        </button>

        <div className="ml-auto flex items-center gap-3">
          {viewCount > 0 ? (
            <span className="text-sm font-medium text-gray-400">
              {new Intl.NumberFormat().format(viewCount)} views
            </span>
          ) : null}
          {/* <button
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-800"
            aria-label="Share"
          >
            <svg
              className="h-6 w-6 text-gray-400 hover:text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default FeedItemActions;
