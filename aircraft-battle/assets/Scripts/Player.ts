import {
  _decorator,
  Animation,
  CCString,
  Collider,
  Collider2D,
  Component,
  Contact2DType,
  director,
  Enum,
  EventTouch,
  Input,
  input,
  instantiate,
  IPhysics2DContact,
  Node,
  Prefab,
  Vec2,
  Vec3,
} from "cc";
import { Reward, RewordType } from "./Reward";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

/**
 * 射击类型枚举
 * None: 停止射击
 * OneShoot: 从飞机中间发射单发子弹
 * TwoShoot: 从飞机两侧各发射一发子弹
 */
enum ShootType {
  None,
  OneShoot,
  TwoShoot,
}

/**
 * 玩家控制组件
 * 负责：
 * 1. 处理玩家飞机的触摸移动控制
 * 2. 管理子弹的发射逻辑（无射击/单发/双发模式）
 * 3. 处理与敌机的碰撞检测和生命值管理
 * 4. 控制玩家飞机的受击无敌时间和销毁动画
 * 5. 处理道具效果（双发射击、炸弹等）
 */
@ccclass("Player")
export class Player extends Component {
  private static instance: Player;

  public static getInstance() {
    return this.instance;
  }

  /** 子弹发射计时器，用于控制发射间隔 */
  shootTimer = 0;

  /** 子弹发射间隔时间，可在编辑器中调整，单位：秒 */
  @property
  shootRate = 0.3;

  /** 单发模式使用的子弹预制体 */
  @property(Prefab)
  bullet1Prefab: Prefab = null;

  /** 子弹的父节点容器，用于统一管理所有发射的子弹 */
  @property(Node)
  bulletParent: Node = null;

  /** 单发模式的子弹发射位置节点 */
  @property(Node)
  position1: Node = null;

  /** 双发模式使用的子弹预制体 */
  @property(Prefab)
  bullet2Prefab: Prefab = null;

  /** 双发模式左侧子弹发射位置节点 */
  @property(Node)
  position2: Node = null;

  /** 双发模式右侧子弹发射位置节点 */
  @property(Node)
  position3: Node = null;

  /** 射击类型，默认为单发射击，生命值为0时切换为停止射击 */
  @property({ type: Enum(ShootType) })
  shootType: ShootType = ShootType.OneShoot;

  /** 碰撞体组件引用，用于处理与敌机的碰撞检测 */
  collider: Collider2D = null;

  /** 动画组件引用，用于播放受击和销毁动画 */
  @property(Animation)
  anim: Animation = null;

  /** 玩家生命值，为0时游戏结束 */
  @property
  private lifeCount = 5;

  /** 受击时播放的动画名称 */
  @property(CCString)
  animHit = "";

  /** 击毁时播放的动画名称 */
  @property(CCString)
  animDown = "";

  @property(CCString)
  animIdle = "";

  /** 受击后的无敌时间，可在编辑器中调整，单位：秒 */
  @property
  invincibleTime = 1;

  /** 无敌时间计时器 */
  invincibleTimer = 0;

  /** 是否处于无敌状态 */
  isInvincible = false;

  /** 双发射击持续时间，可在编辑器中调整，单位：秒 */
  @property
  twoShootTime = 5;
  /** 双发射击计时器 */
  twoShootTimer = 0;
  lastReward: Reward = null;

  /**
   * 组件加载时调用
   * 注册触摸移动事件监听
   */
  protected onLoad(): void {
    Player.instance = this;
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

    // 获取并注册碰撞体的碰撞回调
    this.collider = this.getComponent(Collider2D);
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  /**
   * 组件销毁时调用
   * 移除触摸移动事件监听，防止内存泄漏
   */
  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
  }

  /**
   * 碰撞开始时的处理函数
   * 处理流程：
   * 1. 检测碰撞对象类型（敌机/道具）
   * 2. 如果是道具，根据道具类型触发对应效果
   * 3. 如果是敌机，处理受击逻辑和生命值
   */
  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    const reward = otherCollider.getComponent(Reward);
    if (reward) {
      this.onContractToReward(reward);
    } else {
      this.onContactToEnemy();
    }
  }

  /**
   * 处理与道具的碰撞
   * 处理流程：
   * 1. 根据道具类型触发对应效果
   * 2. TwoShoot: 切换为双发射击模式
   * 3. Bomb: 增加炸弹道具数量
   * 4. 延迟一帧销毁道具，避免碰撞检测过程中销毁导致的报错
   * @param reward 道具组件实例
   */
  onContractToReward(reward: Reward) {
    if (reward === this.lastReward) return;
    switch (reward.rewordType) {
      case RewordType.TwoShoot:
        this.transformToTwoShoot();
        break;
      case RewordType.Bomb:
        GameManager.getInstance().addBomb();
        break;
    }
    this.scheduleOnce(() => {
      reward.node?.destroy();
    }, 0);
  }

  /**
   * 切换到双发射击模式
   * 1. 重置双发射击计时器
   * 2. 切换射击类型为双发模式
   * 3. 计时结束后自动恢复单发模式
   */
  transformToTwoShoot() {
    this.twoShootTimer = 0;
    this.shootType = ShootType.TwoShoot;
  }

  /**
   * 切换回单发射击模式
   * 在以下情况触发：
   * 1. 双发射击持续时间结束
   * 2. 玩家生命值为0时
   */
  transformToOneShoot() {
    this.shootType = ShootType.OneShoot;
  }

  /**
   * 处理与敌机碰撞的逻辑
   * 1. 检查是否处于无敌状态
   * 2. 重置无敌时间计时器
   * 3. 减少生命值并播放相应动画
   * 4. 生命值为0时禁用射击和碰撞
   */
  onContactToEnemy() {
    if (this.isInvincible) return;
    this.invincibleTimer = 0;
    this.isInvincible = true;
    this.changeLifeCount(-1);

    if (this.lifeCount > 0) {
      this.anim.play(this.animHit);
      this.anim.once(Animation.EventType.FINISHED, () => {
        this.anim.play(this.animIdle);
      });
    } else {
      this.anim.play(this.animDown);
    }
    if (this.lifeCount <= 0) {
      this.shootType = ShootType.None;
      if (this.collider) {
        this.collider.enabled = false;
      }
    }
  }

  /**
   * 触摸移动事件处理函数
   * 处理流程：
   * 1. 检查游戏是否暂停，暂停时不处理移动
   * 2. 检查玩家是否存活
   * 3. 根据触摸偏移量计算新位置
   * 4. 限制飞机在屏幕范围内移动
   * @param event 触摸事件对象，包含触摸位置变化信息
   */
  onTouchMove(event: EventTouch) {
    // 游戏暂停时不处理移动
    if (director.isPaused()) return;
    if (this.lifeCount < 1) {
      console.log("--------结束了------");
      return;
    }
    const position = this.node.position;
    // 根据触摸移动的偏移量计算目标位置
    let targetPosition = new Vec3(
      position.x + event.getDeltaX(),
      position.y + event.getDeltaY(),
      position.z
    );

    // 限制飞机在屏幕范围内移动
    // x轴范围：-230 到 230
    if (targetPosition.x < -230) {
      targetPosition.x = -230;
    }
    if (targetPosition.x > 230) {
      targetPosition.x = 230;
    }
    // y轴范围：-380 到 380
    if (targetPosition.y < -380) {
      targetPosition.y = -380;
    }
    if (targetPosition.y > 380) {
      targetPosition.y = 380;
    }
    // 更新飞机位置
    this.node.setPosition(targetPosition);
  }

  start() {}

  /**
   * 每帧更新
   * 处理流程：
   * 1. 根据射击类型执行对应的射击逻辑
   * 2. 处理无敌时间计时
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  update(deltaTime: number) {
    // 根据射击类型选择对应的射击方法
    switch (this.shootType) {
      case ShootType.OneShoot:
        this.oneShoot(deltaTime);
        break;
      case ShootType.TwoShoot:
        this.twoShoot(deltaTime);
        break;
    }
    if (this.isInvincible) {
      this.invincibleTimer += deltaTime;
      if (this.invincibleTimer > this.invincibleTime) {
        this.isInvincible = false;
      }
    }
  }

  /**
   * 单发射击模式
   * 从中间位置发射一颗子弹
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  oneShoot(deltaTime: number) {
    // 累加计时器
    this.shootTimer += deltaTime;
    // 到达发射间隔时间后创建子弹
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;
      // 实例化子弹预制体
      const bullet1 = instantiate(this.bullet1Prefab);
      // 将子弹添加到父节点容器中
      this.bulletParent.addChild(bullet1);
      // 设置子弹的世界坐标为发射位置
      bullet1.setWorldPosition(this.position1.worldPosition);
    }
  }

  /**
   * 双发射击模式
   * 从两侧位置各发射一颗子弹
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  twoShoot(deltaTime: number) {
    // 双发子弹使用周期
    this.twoShootTimer += deltaTime;
    if (this.twoShootTimer >= this.twoShootTime) {
      this.transformToOneShoot();
    }

    // 累加计时器
    this.shootTimer += deltaTime;
    // 到达发射间隔时间后创建子弹
    if (this.shootTimer >= this.shootRate) {
      this.shootTimer = 0;
      // 实例化子弹预制体
      const bullet2 = instantiate(this.bullet2Prefab);
      const bullet3 = instantiate(this.bullet2Prefab);
      // 将子弹添加到父节点容器中
      this.bulletParent.addChild(bullet2);
      this.bulletParent.addChild(bullet3);
      // 设置子弹的世界坐标为发射位置
      bullet2.setWorldPosition(this.position2.worldPosition);
      bullet3.setWorldPosition(this.position3.worldPosition);
    }
  }
  /**
   * 修改玩家生命值
   * @param count 生命值变化量，正数增加，负数减少
   */
  changeLifeCount(count: number) {
    this.lifeCount += count;
    // 触发生命值变化事件
    this.node.emit("onLifeCountChange");
  }

  /**
   * 获取当前生命值
   * @returns 玩家当前生命值
   */
  getLifeCount() {
    return this.lifeCount;
  }
}
