const Mongoose = require("mongoose")
const validator = require('validator');
const profileSchema = new Mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "name is required"],
        lowercase: true,
        trim: true,
    },
    lastname: {
        type: String,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        trim: true,
    },
    phonenumber: {
        type: Number,
        minlength: 10,
        required: [true, "password is required"],
    },
    imageurl: {
        type: String,
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/813px-Unknown_person.jpg?20200423155822"
    },
    description: {
        type: String,
        lowercase: true,
        trim: true,
        maxlength: 255,
        default: " ",
    },
});
const m = Mongoose.model("users_profile", profileSchema);
module.exports = m;