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
  /** 第二种中型敌机的生成间隔时间，单位：秒 */
  @property
  enemy1SpawnRate = 3;
  /** 第二种中型敌机的预制体 */
  @property(Prefab)
  enemy1Prefab: Prefab = null;
  /** 第三种大型敌机的生成间隔时间，单位：秒 */
  @property
  enemy2SpawnRate = 3;
  /** 第三种大型敌机的预制体 */
  @property(Prefab)
  enemy2Prefab: Prefab = null;

  start() {
    // 启动定时生成敌机
    this.schedule(this.enemy0Spawn, this.enemy0SpawnRate);
    this.schedule(this.enemy1Spawn, this.enemy1SpawnRate);
    this.schedule(this.enemy2Spawn, this.enemy2SpawnRate);
  }

  /**
   * 组件销毁时调用
   * 清理定时器，防止内存泄漏
   */
  protected onDestroy(): void {
    this.unschedule(this.enemy0Spawn);
    this.unschedule(this.enemy1Spawn);
    this.unschedule(this.enemy2Spawn);
  }

  update(deltaTime: number) {}

  /**
   * 生成第一种小型敌机
   */
  enemy0Spawn() {
    this.enemySpawn(this.enemy0Prefab, -215, 215, 450);
  }

  /**
   * 生成第二种中型敌机
   */
  enemy1Spawn() {
    this.enemySpawn(this.enemy1Prefab, -200, 200, 475);
  }

  /**
   * 生成第三种大型敌机
   */
  enemy2Spawn() {
    this.enemySpawn(this.enemy2Prefab, -155, 155, 560);
  }

  /**
   * 通用敌机生成方法
   * @param enemyPrefab 敌机预制体
   * @param minX x轴最小生成位置
   * @param maxX x轴最大生成位置
   * @param y y轴生成位置
   */
  enemySpawn(enemyPrefab: Prefab, minX: number, maxX: number, y: number) {
    // 实例化敌机预制体
    const enemy = instantiate(enemyPrefab);
    // 将敌机添加到管理器节点下
    this.node.addChild(enemy);
    // 在屏幕上方随机位置生成敌机
    // 如：x轴范围：-215 到 215
    const randomX = math.randomRangeInt(minX, maxX);
    enemy.setPosition(randomX, y, 0);
  }
}
