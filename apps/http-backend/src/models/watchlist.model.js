import mongoose, { Schema } from "mongoose";

const watchlistSchema = new Schema(
  {
    coin: {
      type: String,
      required: true,
    },
    current_price: {
      type: Number,
      required: true,
    },
    low_24h: {
      type: Number,
      required: true,
    },
    high_24h: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);
