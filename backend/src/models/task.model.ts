import mongoose, { Document, Schema } from "mongoose";
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from "../enums/task.enum";
import { generateTaskCode } from "../utils/uuid";

export interface TaskDocument extends Document {
  taskCode: string;
  title: string;
  description: string | null;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  status: TaskStatusEnumType;
  priority: TaskPriorityEnumType;
  assignedTo: mongoose.Types.ObjectId | null;
  dueDate: Date | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskDocument>(
  {
    taskCode: {
      type: String,
      unique: true,
      default: generateTaskCode,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      default: null,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatusEnum),
      default: TaskStatusEnum.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriorityEnum),
      default: TaskPriorityEnum.MEDIUM,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TaskModel = mongoose.model<TaskDocument>("Task", taskSchema);
export default TaskModel;
