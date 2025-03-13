import {
  _decorator,
  Animation,
  CCString,
  Collider,
  Collider2D,
  Component,
  Contact2DType,
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
 */
@ccclass("Player")
export class Player extends Component {
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
  lifeCount = 5;

  /** 受击时播放的动画名称 */
  @property(CCString)
  animHit = "";

  /** 击毁时播放的动画名称 */
  @property(CCString)
  animDown = "";

  /** 受击后的无敌时间，可在编辑器中调整，单位：秒 */
  @property
  invincibleTime = 1;

  /** 无敌时间计时器 */
  invincibleTimer = 0;

  /** 是否处于无敌状态 */
  isInvincible = false;

  /**
   * 组件加载时调用
   * 注册触摸移动事件监听
   */
  protected onLoad(): void {
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
   * 1. 减少玩家生命值
   * 2. 根据剩余生命值播放对应动画（受击/击毁）
   * 3. 如果生命值为0，禁用碰撞体并结束游戏
   * @param selfCollider 玩家飞机的碰撞体组件
   * @param otherCollider 敌机的碰撞体组件
   * @param contact 碰撞信息
   */
  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (this.isInvincible) return;
    this.invincibleTimer = 0;
    this.isInvincible = true;
    this.lifeCount--;
    if (this.lifeCount > 0) {
      this.anim.play(this.animHit);
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
   * @param event 触摸事件对象，包含触摸位置变化信息
   */
  onTouchMove(event: EventTouch) {
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
}
