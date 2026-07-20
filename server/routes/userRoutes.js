const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.post('/settings', authenticateToken, userController.updateSettings);
router.post('/risk-settings', authenticateToken, userController.updateRiskSettings);

// Credentials
router.get('/credentials', authenticateToken, userController.getCredentials);
router.post('/credentials', authenticateToken, userController.addCredential);
router.delete('/credentials/:id', authenticateToken, userController.deleteCredential);

// Strategies
router.get('/strategies', authenticateToken, userController.getStrategies);
router.post('/strategies/toggle', authenticateToken, userController.toggleStrategy);
router.post('/strategies/save', authenticateToken, userController.saveUserStrategy);

module.exports = router;
