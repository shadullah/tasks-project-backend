import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const taskAdd = asyncHandler(async (req, res) => {
  const { title, description, userId, duedate, status } = req.body;
  console.log(title, description);

  if (
    [title, description, userId, duedate, status].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const createdtask = await Task.create({
    title,
    description,
    userId,
    duedate,
    status,
  });

  if (!createdtask) {
    return res.status(500).send({ message: "task adding error" });
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdtask, "task created successfully!!"));
});

const getAlltasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({});

  if (!tasks || tasks.length === 0) {
    throw new ApiError(404, "task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "tasks got successfully"));
});

const deletetask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findByIdAndDelete(id);

  if (!task) {
    throw new ApiError(404, "task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "task deleted successfully"));
});

const updatetask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id is required");
  }

  const { title, description, userId, duedate, status } = req.body;

  if (
    [title, description, userId, duedate, status].some(
      (field) => field?.trim() === ""
    )
  ) {
    res.send("all fields are required");
  }

  const existingTask = await Task.findById(id);

  if (existingTask.userId.toString() !== userId) {
    throw new ApiError(403, "You don't have permission to update this task");
  }

  const updates = {};

  if (title) {
    updates.title = title;
  }

  if (description) {
    updates.description = description;
  }

  if (duedate) {
    const [day, month, year] = duedate.split("-");
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) {
      throw new ApiError(400, "Invalid due date format");
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      throw new ApiError(
        400,
        "Invalid due date. due date must be a future date"
      );
    }
    updates.duedate = date;
  }

  if (status) {
    if (!["pending", "completed"].includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }
    updates.status = status;
  }

  const updatetask = await Task.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatetask) {
    throw new ApiError(400, "task not updated");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatetask, " task Updated successfully"));
});

const getSingletask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Id not exists");
  }

  const task = await Task.findById(id);

  if (!task) {
    throw new ApiError(404, "task does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "task fetched successfully"));
});

export { taskAdd, getAlltasks, deletetask, updatetask, getSingletask };
