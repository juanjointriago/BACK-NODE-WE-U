import schedule from 'node-schedule';

export const scheduler = (date: Date, callback: Function) => {
  schedule.scheduleJob(date, () => callback());
};
export const schedulerProgram = (rule: string | number | Date | schedule.RecurrenceRule | schedule.RecurrenceSpecDateRange | schedule.RecurrenceSpecObjLit, callback: Function) => {
  schedule.scheduleJob(rule, () => callback());
};
