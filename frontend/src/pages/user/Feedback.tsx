import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Card, Button, Textarea } from '../../components/UI';
import { feedbackAPI } from '../../services/api';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';

const Feedback: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await feedbackAPI.createFeedback({ rating, comments });
      setSubmitted(true);
      setRating(0);
      setComments('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="mt-2 text-gray-600">Help us improve by sharing your experience</p>
        </div>

        <Card title="Submit Feedback" icon={<MessageSquare size={20} />}>
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600">Your feedback has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate your experience
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      {rating} out of 5 stars
                    </span>
                  )}
                </div>
              </div>

              <Textarea
                label="Comments (Optional)"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell us what you think about our crop recommendation system..."
                rows={5}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" loading={loading}>
                Submit Feedback
              </Button>
            </form>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Feedback;
