import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
}

const NoteSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

export const Note = mongoose.model<INote>('Note', NoteSchema);
