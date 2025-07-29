// Debug route to view database data
import express from 'express';
import { query } from '../database';

const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT id, email, role, organization_id, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all organizations
router.get('/organizations', async (req, res) => {
  try {
    const result = await query('SELECT * FROM organizations ORDER BY created_at DESC');
    res.json({ organizations: result.rows });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const result = await query('SELECT * FROM announcements ORDER BY created_at DESC');
    res.json({ announcements: result.rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const result = await query('SELECT * FROM events ORDER BY date ASC');
    res.json({ events: result.rows });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get database stats
router.get('/stats', async (req, res) => {
  try {
    const userCount = await query('SELECT COUNT(*) FROM users');
    const orgCount = await query('SELECT COUNT(*) FROM organizations');
    const announcementCount = await query('SELECT COUNT(*) FROM announcements');
    const eventCount = await query('SELECT COUNT(*) FROM events');

    res.json({
      stats: {
        users: parseInt(userCount.rows[0].count),
        organizations: parseInt(orgCount.rows[0].count),
        announcements: parseInt(announcementCount.rows[0].count),
        events: parseInt(eventCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
