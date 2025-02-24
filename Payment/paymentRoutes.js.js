const express = require("express");
const Stripe = require("stripe");
const mongoose = require("mongoose");

const router = express.Router();
const stripe = Stripe("sk_test_51QvvQ2B3RAhwFrHfhjmpYnBVN2EEOcZQFmvB9buS7ZoHcjpTqLLwWvEQFhuAq1HJnOIPRcFuprIpQtmldG0qfIY900RqubVWY9"); // Use your Secret Key

// Connect to MongoDB


// Define Payment Schema
const PaymentSchema = new mongoose.Schema({
    amount: Number,
    currency: String,
    sessionId: String,
    status: { type: String, default: "pending" }, // Default status
    createdAt: { type: Date, default: Date.now },
});

// Create Payment Model
const Payment = mongoose.model("Payment", PaymentSchema);

// POST - Create Payment Session & Save to DB
router.post("/payment", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ error: "Amount is required!" });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd", // USD
                        product_data: {
                            name: "Doctor Appointment Fee",
                        },
                        unit_amount: amount * 100, // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `http://localhost:5173/success?amount=${amount}&selectedDate=${req.body.selectedDate}&selectedSlot=${req.body.selectedSlot}&doctorId=${req.body.doctorId}&userId=${req.body.userId}`,

            cancel_url: "http://localhost:5173/cancel",
        });

        // Save Payment Data to MongoDB
        const newPayment = new Payment({
            amount,
            currency: "USD",
            sessionId: session.id,
            status: "Confirmed", // Initial status
        });

        await newPayment.save();

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating payment session:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET - Fetch All Payments (Only Payment Data)
router.get("/payments", async (req, res) => {
    try {
        const payments = await Payment.find(); // Fetch all payments
        res.status(200).json(payments);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
