enum TaskStatus {
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESSFUL = 'SUCCESSFUL',
}

class BackgroundTask<T> {
  private taskStatus: TaskStatus;

  private readonly taskFunction: () => Promise<T>;

  private task: Promise<T>;

  constructor(task: () => Promise<T>) {
    this.taskStatus = TaskStatus.PENDING;
    this.taskFunction = task;
    this.task = this.runTask();
  }

  public get result(): Promise<T> {
    if (this.taskStatus === TaskStatus.FAILED) {
      this.task = this.runTask();
      return this.task;
    }

    return this.task;
  }

  private async runTask(): Promise<T> {
    this.taskStatus = TaskStatus.PENDING;

    try {
      const result = await this.taskFunction();
      this.taskStatus = TaskStatus.SUCCESSFUL;
      return result;
    } catch (ex) {
      console.log('Failed to execute task', ex);
      this.taskStatus = TaskStatus.FAILED;
      throw ex;
    }
  }
}

export default BackgroundTask;
