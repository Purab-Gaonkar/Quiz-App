import React from 'react';

function ShareQuiz({ quizId, quizTitle }) {
  const shareUrl = `${window.location.origin}/quiz/${quizId}`;

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this quiz: ${quizTitle}`)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Quiz link copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="share-quiz">
      <h3>Share this Quiz</h3>
      <button onClick={shareOnFacebook}>Share on Facebook</button>
      <button onClick={shareOnTwitter}>Share on Twitter</button>
      <button onClick={copyToClipboard}>Copy Link</button>
    </div>
  );
}

export default ShareQuiz;
