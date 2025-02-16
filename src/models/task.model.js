import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !isNaN(value.getTime()) && value >= new Date();
        },
        message: "Due date must be a valid future date.",
      },
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

taskSchema.methods.toJSON = function () {
  const task = this.toObject();

  if (task.dueDate instanceof Date) {
    const year = task.dueDate.getFullYear();
    const month = String(task.dueDate.getMonth() + 1).padStart(2, "0");
    const day = String(task.dueDate.getDate()).padStart(2, "0");
    task.dueDate = `${year}-${month}-${day}`;
  }

  return task;
};

export const Task = mongoose.model("Task", taskSchema);
