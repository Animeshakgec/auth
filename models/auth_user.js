const Mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const validator = require('validator');
const authSchema = new Mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        trim: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
    },
    password: {
        type: String,
        minlength: 8,
        required: [true, "password is required"],
        select: false,
    },
    // confirm_password: {
    //     type: String,
    //     required: [true, "confirm_password is required"],
    //     validate: {
    //         validator: function (el) {
    //             return el === this.password;
    //         },
    //         message: "passwords are not same",
    //     }
    // },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
// authSchema.pre('save', async function (next) {
//     // Only run this function if password was actually modified
//     if (!this.isModified('password')) return next();

//     // Hash the password with cost of 12
//     this.password = await bcrypt.hash(this.password, 12);

//     // Delete passwordConfirm field
//     this.confirm_password = undefined;
//     return next();
// });
authSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    return next();
});
authSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
//after the token is changed
authSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};
authSchema.methods.createpasswordtokenreset = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log(resetToken, this.passwordResetToken);
    return resetToken;
};
// authSchema.pre('save',()=>{})
const m = Mongoose.model("auth", authSchema);
module.exports = m;