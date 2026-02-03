import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Movie", index: true },
    theater: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Theater", index: true },
    showDateTime: { type: Date, required: true, index: true },
    // showPrice: { type: Number, required: true }, // Deprecated
    priceStandard: { type: Number, required: true, default: 100 },
    pricePremium: { type: Number, required: true, default: 200 },
    priceVIP: { type: Number, required: true, default: 300 },
    occupiedSeats: { type: Object, default: {} },
  },
  { minimize: false }
);

const Show = mongoose.model("Show", showSchema);
export default Show;
