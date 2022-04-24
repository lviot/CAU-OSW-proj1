import {
  action, computed,
  makeAutoObservable,
} from 'mobx';

export type EventExecutor = () => Thunk<void>;

class EventStack {
  private _stack: EventExecutor[] = [];

  constructor()
  {
    makeAutoObservable(this);
  }

  /**
   * Push new event executor to the stack
   * @param eventExecutor
   * @return {void}
   */
  @action public push(eventExecutor: EventExecutor): void
  {
    this._stack.push(eventExecutor);
  }

  /**
   * Clear stack without executing it
   * @return {void}
   */
  @action public clear(): void
  {
    this._stack = [];
  }

  /**
   * Execute whole stack
   * @return {Promise<void>}
   */
  @action public async executeStack(): Promise<void>
  {
    await Promise.all(this._stack.reverse().map((eventExecutor) => eventExecutor()));
    this.clear();
  }

  /**
   * Returns stack length
   * @return {number}
   */
  @computed public get length(): number
  {
    return this._stack.length;
  }
}

export default new EventStack();
