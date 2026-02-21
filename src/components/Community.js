import React from 'react';
import './Community.css';

const Community = () => {
  const communityPosts = [
    {
      id: 1,
      name: 'David Miller',
      location: 'Massachusetts',
      service: 'babysitter',
      matchTime: '25 mins',
      feedback: 'Amazing experience! Sarah was professional and my kids loved her. Highly recommend!',
      rating: 5,
      avatar: '👨',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      name: 'Emily Chen',
      location: 'California',
      service: 'dog walker',
      matchTime: '18 mins',
      feedback: 'Found the perfect dog walker for my golden retriever. Quick match and great service!',
      rating: 5,
      avatar: '👩',
      timestamp: '4 hours ago'
    },
    {
      id: 3,
      name: 'Marcus Johnson',
      location: 'Texas',
      service: 'house cleaner',
      matchTime: '32 mins',
      feedback: 'Got matched with an excellent cleaner. My house has never looked better. Will definitely use again!',
      rating: 5,
      avatar: '👨‍🦱',
      timestamp: '6 hours ago'
    },
    {
      id: 4,
      name: 'Sophia Rodriguez',
      location: 'Florida',
      service: 'tutor for algebra',
      matchTime: '15 mins',
      feedback: 'Super fast match! The tutor was patient and knowledgeable. My daughter\'s grades improved significantly.',
      rating: 5,
      avatar: '👩‍🦰',
      timestamp: '8 hours ago'
    },
    {
      id: 5,
      name: 'James Wilson',
      location: 'New York',
      service: 'yard work',
      matchTime: '40 mins',
      feedback: 'Great platform! Got matched with someone who did an incredible job on my lawn. Very satisfied.',
      rating: 4,
      avatar: '👨‍🦳',
      timestamp: '10 hours ago'
    },
    {
      id: 6,
      name: 'Olivia Martinez',
      location: 'Washington',
      service: 'grocery shopping',
      matchTime: '12 mins',
      feedback: 'Lightning fast service! Someone picked up my groceries and delivered them within an hour. Lifesaver!',
      rating: 5,
      avatar: '👩‍🦱',
      timestamp: '12 hours ago'
    },
    {
      id: 7,
      name: 'Liam Brown',
      location: 'Illinois',
      service: 'car wash',
      matchTime: '22 mins',
      feedback: 'Convenient and affordable. My car looks brand new! Highly recommend this service.',
      rating: 5,
      avatar: '👨‍🦲',
      timestamp: '14 hours ago'
    },
    {
      id: 8,
      name: 'Ava Thompson',
      location: 'Arizona',
      service: 'pet sitter',
      matchTime: '28 mins',
      feedback: 'Found a wonderful pet sitter for my cats while I was away. They were so well taken care of!',
      rating: 5,
      avatar: '👩‍🦳',
      timestamp: '1 day ago'
    }
  ];

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Community Feed</h1>
        <p>See what services people nearby are requesting and getting matched with</p>
      </div>

      <div className="community-feed">
        {communityPosts.map(post => (
          <div key={post.id} className="community-post">
            <div className="post-header">
              <div className="post-avatar">{post.avatar}</div>
              <div className="post-user-info">
                <h3>{post.name}</h3>
                <p className="post-location">📍 {post.location}</p>
              </div>
              <span className="post-timestamp">{post.timestamp}</span>
            </div>

            <div className="post-content">
              <div className="post-service-info">
                <span className="service-badge">🎯 Requested: {post.service}</span>
                <span className="match-time">⚡ Matched in {post.matchTime}</span>
              </div>
              <p className="post-feedback">{post.feedback}</p>
              <div className="post-rating">
                <span className="stars">{renderStars(post.rating)}</span>
                <span className="rating-text">{post.rating}/5</span>
              </div>
            </div>

            <div className="post-footer">
              <button className="post-action-btn">👍 Helpful</button>
              <button className="post-action-btn">💬 Comment</button>
              <button className="post-action-btn">🔗 Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
