import mongoose from "mongoose";

const quoteSchema = mongoose.Schema({


    quotefilelink: { // link to the file with all info related quote and  user authontication 
        type: String,
        required: [true, "Please enter a name"],
    },

    category: {
        type: String,
        enum: ['Celebrity', 'Sports', 'Media', 'Politics'],
        required: [true, "Please enter a role"],
    },

    status: {
        type: [Number], //0th index for expert 1, 1st index for expert 2, 2nd index for expert 3
        default: [-1, -1, -1]  // -1: pending, 1: approved, 0: rejected
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

});


export default mongoose.model("Quote", quoteSchema);