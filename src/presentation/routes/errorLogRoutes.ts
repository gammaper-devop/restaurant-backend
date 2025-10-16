import { Router } from 'express';
import { ErrorLogController } from '../controllers/ErrorLogController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const errorLogController = new ErrorLogController();

/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the error log
 *         message:
 *           type: string
 *           description: The error message
 *         stackTrace:
 *           type: string
 *           description: The error stack trace
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: The severity level of the error
 *         category:
 *           type: string
 *           enum: [authentication, authorization, validation, database, external_api, business_logic, system, network, unknown]
 *           description: The category of the error
 *         statusCode:
 *           type: string
 *           description: The HTTP status code
 *         endpoint:
 *           type: string
 *           description: The endpoint where the error occurred
 *         method:
 *           type: string
 *           description: The HTTP method
 *         ipAddress:
 *           type: string
 *           description: The IP address of the client
 *         userAgent:
 *           type: string
 *           description: The user agent string
 *         userId:
 *           type: string
 *           description: The ID of the user who triggered the error
 *         requestBody:
 *           type: object
 *           description: The request body
 *         requestHeaders:
 *           type: object
 *           description: The request headers
 *         errorContext:
 *           type: object
 *           description: Additional error context
 *         errorCode:
 *           type: string
 *           description: The error code
 *         isResolved:
 *           type: boolean
 *           description: Whether the error has been resolved
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: When the error was resolved
 *         resolvedBy:
 *           type: string
 *           description: Who resolved the error
 *         resolutionNotes:
 *           type: string
 *           description: Notes about the resolution
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the error occurred
 *         serviceName:
 *           type: string
 *           description: The name of the service
 *         serviceVersion:
 *           type: string
 *           description: The version of the service
 *         environmentInfo:
 *           type: object
 *           description: Environment information
 *     ErrorStatistics:
 *       type: object
 *       properties:
 *         totalErrors:
 *           type: integer
 *           description: Total number of errors
 *         errorsBySeverity:
 *           type: object
 *           description: Errors grouped by severity
 *         errorsByCategory:
 *           type: object
 *           description: Errors grouped by category
 *         recentErrors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ErrorLog'
 *           description: Recent errors (last 24 hours)
 *         unresolvedErrors:
 *           type: integer
 *           description: Number of unresolved errors
 */

/**
 * @swagger
 * /api/error-logs:
 *   get:
 *     summary: Get error logs with filtering and pagination
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity level
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [authentication, authorization, validation, database, external_api, business_logic, system, network, unknown]
 *         description: Filter by error category
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: endpoint
 *         schema:
 *           type: string
 *         description: Filter by endpoint
 *       - in: query
 *         name: isResolved
 *         schema:
 *           type: boolean
 *         description: Filter by resolution status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter until this date (ISO format)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of results per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Error logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ErrorLog'
 *                     total:
 *                       type: integer
 *                       description: Total number of error logs
 *                     limit:
 *                       type: integer
 *                       description: Results per page
 *                     offset:
 *                       type: integer
 *                       description: Results skipped
 *                     hasMore:
 *                       type: boolean
 *                       description: Whether there are more results
 *                 message:
 *                   type: string
 *                   example: "Error logs retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *                 method:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, errorLogController.getErrorLogs);

/**
 * @swagger
 * /api/error-logs/statistics:
 *   get:
 *     summary: Get error statistics
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (ISO format)
 *     responses:
 *       200:
 *         description: Error statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ErrorStatistics'
 *                 message:
 *                   type: string
 *                   example: "Error statistics retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *                 method:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/statistics', authenticateToken, errorLogController.getErrorStatistics);

/**
 * @swagger
 * /api/error-logs/{id}:
 *   get:
 *     summary: Get error log by ID
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Error log ID
 *     responses:
 *       200:
 *         description: Error log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ErrorLog'
 *                 message:
 *                   type: string
 *                   example: "Error log retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *                 method:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Error log not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, errorLogController.getErrorLogById);

/**
 * @swagger
 * /api/error-logs/{id}/resolve:
 *   put:
 *     summary: Mark error as resolved
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Error log ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolutionNotes:
 *                 type: string
 *                 description: Notes about how the error was resolved
 *     responses:
 *       200:
 *         description: Error marked as resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Error log ID
 *                     resolvedBy:
 *                       type: string
 *                       description: User who resolved the error
 *                     resolvedAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the error was resolved
 *                 message:
 *                   type: string
 *                   example: "Error marked as resolved successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *                 method:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Error log not found
 *       500:
 *         description: Server error
 */
router.put('/:id/resolve', authenticateToken, errorLogController.markAsResolved);

/**
 * @swagger
 * /api/error-logs/cleanup:
 *   delete:
 *     summary: Clean up old error logs (Admin only)
 *     tags: [Error Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysToKeep
 *         schema:
 *           type: integer
 *           default: 90
 *           minimum: 1
 *           maximum: 365
 *         description: Number of days of logs to keep
 *     responses:
 *       200:
 *         description: Old error logs cleaned up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       description: Number of logs deleted
 *                     daysToKeep:
 *                       type: integer
 *                       description: Days of logs kept
 *                 message:
 *                   type: string
 *                   example: "Successfully cleaned up 150 old error logs"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 path:
 *                   type: string
 *                 method:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/cleanup', authenticateToken, errorLogController.cleanupOldLogs);

export default router;
