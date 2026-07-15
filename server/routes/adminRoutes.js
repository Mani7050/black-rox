const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// User Management
router.get('/users', authenticateToken, requireAdmin, adminController.getUsers);
router.post('/users', authenticateToken, requireAdmin, adminController.createUser);
router.post('/users/toggle', authenticateToken, requireAdmin, adminController.toggleUserStatus);
router.post('/users/reset-api', authenticateToken, requireAdmin, adminController.resetUserApi);
router.post('/users/assign-plan', authenticateToken, requireAdmin, adminController.assignPlan);
router.post('/users/update', authenticateToken, requireAdmin, adminController.updateUser);
router.post('/users/delete', authenticateToken, requireAdmin, adminController.deleteUser);

// Subscription Plans
router.post('/subscription-plans', authenticateToken, requireAdmin, adminController.createPlan);
router.post('/subscription-plans/update', authenticateToken, requireAdmin, adminController.updatePlan);
router.post('/subscription-plans/delete', authenticateToken, requireAdmin, adminController.deletePlan);

// Brokers
router.post('/brokers/toggle', authenticateToken, requireAdmin, adminController.toggleBroker);
router.post('/brokers/update', authenticateToken, requireAdmin, adminController.updateBroker);
router.post('/brokers/delete', authenticateToken, requireAdmin, adminController.deleteBroker);

// Signals
router.post('/signals', authenticateToken, requireAdmin, adminController.broadcastSignal);
router.post('/signals/delete', authenticateToken, requireAdmin, adminController.deleteSignal);

// Emergency
router.post('/square-off', authenticateToken, requireAdmin, adminController.squareOff);

module.exports = router;
