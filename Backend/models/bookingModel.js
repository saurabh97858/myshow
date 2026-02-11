import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: String, required: true, ref: 'User' },
    show: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Show' },
    amount: { type: Number, required: true },
    bookedSeats: { type: Array, required: true },
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String },
    contactDetails: {
        name: { type: String },
        email: { type: String },
        mobile: { type: String }
    },
    foodItems: [
        {
            name: { type: String },
            price: { type: Number },
            quantity: { type: Number }
        }
    ],
    paymentDetails: {
        method: { type: String }, // 'upi' or 'card'
        upiId: { type: String },
        utrNumber: { type: String },
        cardLast4: { type: String }
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    },
    isCancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date },
    refundAmount: { type: Number, default: 0 },
    cancellationReason: { type: String }
}, { timestamps: true })

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
