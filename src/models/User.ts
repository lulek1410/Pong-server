import { Document, Schema, Types, model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

export interface IUser extends Document {
  name: string;
  password: string;
  email: string;
  image?: string;
  friends: Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  name: { type: String, require: true },
  password: { type: String, require: true, minlength: 6 },
  email: { type: String, require: true, unique: true },
  image: { type: String },
  friends: [{ type: Types.ObjectId, required: true, ref: "User" }],
});

userSchema.plugin(uniqueValidator);

export const User = model("User", userSchema);
