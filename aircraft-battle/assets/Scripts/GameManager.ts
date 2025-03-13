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
  bombNumber = 0;

  /**
   * 组件初始化
   * 设置单例实例引用
   */
  start() {
    GameManager.instance = this;
  }

  update(deltaTime: number) {}

  /**
   * 增加炸弹道具数量
   * 当玩家获得炸弹道具时调用
   */
  public addBomb() {
    this.bombNumber++;
  }
}
