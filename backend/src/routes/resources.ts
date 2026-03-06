import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Mock Resource Content
const MOCK_RESOURCES = {
    quote: {
        text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
        author: "Nelson Mandela"
    },
    videos: [
        {
            id: 'v1',
            type: 'video',
            title: '10 Minute Guided Meditation for Anxiety',
            category: 'Meditation',
            videoId: 'O-6f5wQXSu8',
            thumbnail: 'https://img.youtube.com/vi/O-6f5wQXSu8/maxresdefault.jpg',
            description: 'A gentle 10-minute guided meditation to help calm your mind and reduce anxiety.',
            duration: '10:00'
        },
        {
            id: 'v2',
            type: 'video',
            title: 'Morning Yoga for Focus and Clarity',
            category: 'Yoga & Mindfulness',
            videoId: '4C-9I99v1gA',
            thumbnail: 'https://img.youtube.com/vi/4C-9I99v1gA/maxresdefault.jpg',
            description: 'Start your day with these simple yoga poses to improve mental focus.',
            duration: '15:20'
        },
        {
            id: 'v3',
            type: 'video',
            title: 'The Science of Better Sleep',
            category: 'Sleep',
            videoId: 't0kACis_dJE',
            thumbnail: 'https://img.youtube.com/vi/t0kACis_dJE/maxresdefault.jpg',
            description: 'Learn how to improve your sleep hygiene for better mental health.',
            duration: '12:45'
        }
    ],
    articles: [
        {
            id: 'a1',
            type: 'article',
            title: 'Understanding the Cycle of Stress',
            category: 'Anxiety',
            url: 'https://www.mentalhealth.org.uk/explore-mental-health/a-z-topics/stress',
            description: 'An in-depth look at how stress affects the body and mind, and how to break the cycle.',
            duration: '5 min read'
        },
        {
            id: 'a2',
            type: 'article',
            title: 'Creating a Mental Wellness Toolbox',
            category: 'Wellness',
            url: 'https://www.nami.org/Your-Journey/Individuals-with-Mental-Illness/Taking-Care-of-Yourself',
            description: 'Practical tools and techniques you can use daily to maintain your mental wellbeing.',
            duration: '8 min read'
        },
        {
            id: 'a3',
            type: 'article',
            title: 'Navigating Social Anxiety in Large Crowds',
            category: 'Anxiety',
            url: 'https://www.verywellmind.com/tips-for-crowds-and-social-anxiety-3024845',
            description: 'Tips and tricks for staying calm when youre feeling overwhelmed in social situations.',
            duration: '6 min read'
        }
    ]
};

// @route   GET /api/resources
// @desc    Get curated resources and daily quote
// @access  Private
router.get('/', authMiddleware, (req, res) => {
    try {
        res.json(MOCK_RESOURCES);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

export default router;
