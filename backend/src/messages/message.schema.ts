import * as mongoose from 'mongoose';

export const MessageSchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    readed: { type: Boolean, default: false },
  },
  { timestamps: true },
);
