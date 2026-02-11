import express from 'express';
import { createTicket, getAllTickets, updateTicketStatus, upload } from '../controllers/supportController.js';

const supportRouter = express.Router();

// Route to create a new support ticket (with file upload middleware)
supportRouter.post('/create', upload.single('attachment'), createTicket);

// Route to get all tickets (Admin only)
supportRouter.get('/all', getAllTickets);

// Route to update ticket status (Admin only)
supportRouter.patch('/:ticketId/status', updateTicketStatus);

export default supportRouter;
