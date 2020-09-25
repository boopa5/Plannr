class Assignment {
  constructor({ id, name, course, dueDate, et, description, progress, pinned} = {}) {
    this.id = id;
    this.name = name;
    this.course = course;
    this.duedate = dueDate;
    this.description = description;
    this.et = et;
    this.progress = progress;
    this.pinned = pinned;
  }
}
