import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireSelf } from '../middleware/ownership.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateSubscriptionSchema } from '../schemas/subscriptionSchemas.js';

const router = Router();

router.get('/active/:userId', authenticateToken, requireSelf, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM active_subscriptions WHERE user_id = ? LIMIT 1',
    [req.params.userId]
  );
  res.json(rows[0] || null);
}));

router.post('/update', authenticateToken, validate(updateSubscriptionSchema),
  asyncHandler(async (req, res) => {
    const { plan, months } = req.body;
    await pool.execute('CALL update_user_subscription(?, ?, ?)',
      [req.user.userId, plan, months]);
    res.json({ message: 'Subscription updated' });
  })
);

export default router;
