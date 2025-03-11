import { _decorator, Component, instantiate, math, Node, Prefab } from "cc";
const { ccclass, property } = _decorator;

/**
 * 敌机生成管理器
 * 负责在游戏中定时生成敌机
 */
@ccclass("EnemeyGmager")
export class EnemeyGmager extends Component {
  /** 第一种小飞机的生成间隔时间，单位：秒 */
  @property
  enemy0SpawnRate = 1;

  /** 第一种小飞机的预制体 */
  @property(Prefab)
  enemy0Prefab: Prefab = null;

  start() {
    // 启动定时生成敌机
    this.schedule(this.enemy0Spawn, this.enemy0SpawnRate);
  }

  /**
   * 组件销毁时调用
   * 清理定时器，防止内存泄漏
   */
  protected onDestroy(): void {
    this.unschedule(this.enemy0Spawn);
  }

  update(deltaTime: number) {}

  /**
   * 生成第一种小飞机
   * 在屏幕上方随机位置生成敌机
   */
  enemy0Spawn() {
    // 实例化敌机预制体
    const enemy0 = instantiate(this.enemy0Prefab);
    // 将敌机添加到管理器节点下
    this.node.addChild(enemy0);
    // 在屏幕上方随机位置生成敌机
    // x轴范围：-215 到 215
    const randomX = math.randomRangeInt(-215, 215);
    enemy0.setPosition(randomX, 450, 0);
  }
}
