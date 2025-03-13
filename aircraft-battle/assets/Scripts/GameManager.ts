import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * 游戏管理器组件
 * 负责：
 * 1. 管理全局游戏状态
 * 2. 提供单例访问接口
 * 3. 管理道具系统（炸弹数量等）
 */
@ccclass("GameManager")
export class GameManager extends Component {
  /** 单例实例引用 */
  private static instance: GameManager;

  /**
   * 获取游戏管理器实例
   * 用于其他组件访问游戏管理器
   */
  public static getInstance(): GameManager {
    return this.instance;
  }

  /** 炸弹道具数量 */
  @property
  private bombNumber = 0;

  /** 游戏总分 */
  @property
  private score = 0;

  /**
   * 组件初始化
   * 设置单例实例引用
   */
  protected onLoad(): void {
    GameManager.instance = this;
  }

  start() {}

  update(deltaTime: number) {}

  /**
   * 增加炸弹道具数量
   * 1. 增加炸弹计数
   * 2. 触发炸弹数量变化事件
   */
  public addBomb() {
    this.bombNumber++;
    this.node.emit("onBombChange");
  }

  /**
   * 获取当前炸弹数量
   * @returns 玩家当前拥有的炸弹数量
   */
  public getBombNumber() {
    return this.bombNumber;
  }
  /**
   * 增加游戏分数
   * 1. 增加指定分数
   * 2. 触发分数变化事件
   * @param num 要增加的分数值
   */
  public addScore(num: number) {
    this.score += num;
    this.node.emit("onScoreChange");
  }

  /**
   * 获取当前游戏分数
   * @returns 当前游戏总分
   */
  public getGameScore() {
    return this.score;
  }
}
