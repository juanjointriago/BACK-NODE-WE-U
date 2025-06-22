"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulerProgram = exports.scheduler = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const scheduler = (date, callback) => {
    node_schedule_1.default.scheduleJob(date, () => callback());
};
exports.scheduler = scheduler;
const schedulerProgram = (rule, callback) => {
    node_schedule_1.default.scheduleJob(rule, () => callback());
};
exports.schedulerProgram = schedulerProgram;
//# sourceMappingURL=scheduler.js.map