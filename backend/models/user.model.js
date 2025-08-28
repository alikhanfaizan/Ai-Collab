import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        select: false,
    }
}, { timestamps: true });
userSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({email: this.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}
const User = mongoose.model('user', userSchema);

export default User;

