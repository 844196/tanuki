/**
 * 永続化されるタスク情報
 */
export type RawTask = {
  name: string
  point: number
  // eslint-disable-next-line
  children: Array<RawTask>
  fold: boolean
}

/**
 * タスク
 */
export default class Task {
  // eslint-disable-next-line
  constructor (
    public name: string,
    public point: number,
    public children: Array<Task>,
    public fold: boolean
  ) {}

  /**
   * 折りたたみ状態をトグルする
   */
  toggleFold (): void {
    this.fold = !this.fold
  }

  /**
   * 子タスクがあるか？
   */
  hasChild (): boolean {
    return this.children.length > 0
  }

  /**
   * タスクの合計ポイント
   *
   * 子タスクがない場合は自身のポイント
   * 子タスクがある場合は子タスクのポイント合計値
   */
  totalPoint (): number {
    if (this.children.length === 0) {
      return this.point
    }
    return this.children.reduce((acc, child) => {
      acc += child.totalPoint()
      return acc
    }, 0)
  }

  /**
   * 子タスクを追加する
   */
  addChild (): void {
    this.children.push(Task.empty())
  }

  /**
   * 子タスクを削除する
   */
  removeChild (target: Task): void {
    const idx = this.children.findIndex(child => child === target)
    this.children.splice(idx, 1)
  }

  /**
   * 自身のMarkdownリスト表現を返す
   */
  toMarkdown (): string {
    let str = `* ${this.name}: ${this.totalPoint()}人日`
    if (this.hasChild()) {
      str += this.children
        .reduce((acc, child) => {
          acc = `${acc}\n${child.toMarkdown()}`
          return acc
        }, '')
        .split('\n')
        .map(e => '    ' + e)
        .join('\n')
    }
    return str
  }

  /**
   * 空のタスクを返す
   */
  static empty (): Task {
    return new Task('', 5, [], false)
  }

  /**
   * RawTaskからTaskを生成して返す
   *
   * RawTaskの値を信頼して生成するため、合計ポイントが不正な場合がある
   */
  private static simpleInflate ({ name, point, children, fold }: RawTask): Task {
    return new Task(
      name,
      point,
      children.map(child => Task.simpleInflate(child)),
      fold
    )
  }

  /**
   * RawTaskからTaskを生成して返す
   *
   * 生成したTaskを一度deflateしてから再度生成することで、合計ポイントを再計算している
   */
  static inflate (raw: RawTask): Task {
    const self = Task.simpleInflate(raw)
    return Task.simpleInflate(self.deflate())
  }

  /**
   * 自身をRawTaskに変換して返す
   */
  deflate (): RawTask {
    return {
      name: this.name,
      point: this.totalPoint(),
      children: this.children.map(child => child.deflate()),
      fold: this.fold
    }
  }
}
