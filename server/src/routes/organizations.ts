import express from 'express';
import { query } from '../database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get organization members
router.get('/:orgId/members', authenticateToken, async (req, res) => {
  try {
    const { orgId } = req.params;

    // Verify the organization exists and user has access
    const orgResult = await query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get all members of the organization
    const result = await query(
      'SELECT id, email, role FROM users WHERE organization_id = $1',
      [orgId]
    );

    res.json({
      members: result.rows.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: orgId
      }))
    });
  } catch (error) {
    console.error('Get organization members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add user to organization
router.post('/:orgId/members', authenticateToken, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Verify the organization exists
    const orgResult = await query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Find the user
    const userResult = await query('SELECT id, email, role FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Update user's organization
    await query(
      'UPDATE users SET organization_id = $1 WHERE id = $2',
      [orgId, user.id]
    );

    res.json({
      message: 'User added to organization successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: orgId
      }
    });
  } catch (error) {
    console.error('Add user to organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove user from organization
router.delete('/:orgId/members/:email', authenticateToken, async (req, res) => {
  try {
    const { orgId, email } = req.params;

    // Verify the organization exists
    const orgResult = await query('SELECT id FROM organizations WHERE id = $1', [orgId]);
    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Find and update the user
    const result = await query(
      'UPDATE users SET organization_id = NULL WHERE email = $1 AND organization_id = $2 RETURNING id',
      [email, orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in this organization' });
    }

    res.json({ message: 'User removed from organization successfully' });
  } catch (error) {
    console.error('Remove user from organization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
