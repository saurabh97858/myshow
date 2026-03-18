import express from 'express';
import { createTicket, getAllTickets, updateTicketStatus, upload } from '../controllers/supportController.js';
import { protectSuperAdmin } from '../middleware/auth.js';

const supportRouter = express.Router();

// Route to create a new support ticket (with file upload middleware)
supportRouter.post('/create', upload.single('attachment'), createTicket);

// Route to get all tickets (Admin only)
supportRouter.get('/all', protectSuperAdmin, getAllTickets);

// Route to update ticket status (Admin only)
supportRouter.patch('/:ticketId/status', protectSuperAdmin, updateTicketStatus);

export default supportRouter;
