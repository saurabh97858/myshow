import Support from '../models/supportModel.js';
import multer from 'multer';
import path from 'path';

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and PDFs are allowed!'));
    }
});

// Create a new support ticket
export const createTicket = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        let attachment = null;

        if (req.file) {
            attachment = `/uploads/${req.file.filename}`;
        }

        const newTicket = new Support({
            name,
            email,
            phone,
            message,
            attachment
        });

        await newTicket.save();

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            ticket: newTicket
        });
    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create support ticket',
            error: error.message
        });
    }
};

// Get all support tickets (Admin only)
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Support.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch support tickets',
            error: error.message
        });
    }
};

// Update ticket status (Admin only)
export const updateTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const ticket = await Support.findByIdAndUpdate(
            ticketId,
            { status },
            { new: true }
        );

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            ticket
        });
    } catch (error) {
        console.error('Error updating ticket status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status',
            error: error.message
        });
    }
};
