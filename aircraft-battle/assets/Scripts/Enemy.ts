import {
  _decorator,
  Animation,
  Collider2D,
  Component,
  Contact2DType,
  Node,
  PhysicsSystem2D,
  CCString,
  IPhysics2DContact,
} from "cc";
const { ccclass, property } = _decorator;

/**
 * 敌机控制组件
 * 负责：
 * 1. 控制敌机的向下移动
 * 2. 处理敌机的碰撞检测和受击效果
 * 3. 管理敌机的生命值、动画和销毁
 */
@ccclass("Enemy")
export class Enemy extends Component {
  /** 敌机移动速度，可在编辑器中调整，单位：像素/秒 */
  @property
  speed = 300;

  /** 敌机动画组件引用，用于播放受击和销毁动画 */
  @property(Animation)
  anim: Animation = null;

  /** 敌机生命值，可在编辑器中调整，当生命值为0时敌机会被销毁 */
  @property
  hp = 1;

  /** 受击时播放的动画名称 */
  @property(CCString)
  animHit = "";

  /** 击毁时播放的动画名称 */
  @property(CCString)
  animDown = "";

  /** 碰撞体组件引用，用于处理与子弹的碰撞检测 */
  collider: Collider2D = null;

  /**
   * 组件初始化
   * 获取碰撞体组件并注册碰撞回调
   */
  start() {
    // 获取并注册碰撞体的碰撞回调
    this.collider = this.getComponent(Collider2D);
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  /**
   * 组件销毁时的清理工作
   * 移除碰撞监听，防止内存泄漏
   */
  protected onDestroy(): void {
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  /**
   * 碰撞开始时的处理函数
   * 处理流程：
   * 1. 减少敌机生命值
   * 2. 延迟一帧销毁子弹，避免碰撞检测过程中销毁导致的报错
   * 3. 根据生命值播放对应动画（受击/击毁）
   * 4. 如果生命值为0，禁用碰撞体并延迟销毁敌机
   * @param selfCollider 敌机的碰撞体组件
   * @param otherCollider 子弹的碰撞体组件
   * @param contact 碰撞信息
   */
  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    this.hp -= 1;
    // 销毁子弹，需要注意：这里不能直接销毁，在接触的一瞬间还在判断的时候销毁就会报错
    this.scheduleOnce(() => {
      if (otherCollider) {
        otherCollider.enabled;
        otherCollider.node?.destroy();
      }
    }, 0);
    // otherCollider.node.destroy();
    if (this.hp > 0) {
      this.anim.play(this.animHit);
    } else {
      this.anim.play(this.animDown);
    }

    this.collider = this.getComponent(Collider2D);
    if (this.hp <= 0) {
      if (this.collider) {
        this.collider.enabled = false;
      }
      // 延迟1秒销毁，留时间播放爆炸动画
      this.scheduleOnce(() => {
        this.node.destroy();
      }, 1);
    }
  }

  /**
   * 每帧更新函数
   * 功能：
   * 1. 当敌机存活时，控制其向下匀速移动
   * 2. 当敌机超出屏幕底部边界时，自动销毁
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  update(deltaTime: number) {
    if (this.hp > 0) {
      const position = this.node.position;
      // 根据速度和时间间隔计算新位置，实现匀速向下移动
      this.node.setPosition(position.x, position.y - this.speed * deltaTime);
    }
    // 当敌机超出屏幕底部时销毁节点
    if (this.node.position.y < -580) {
      this.node.destroy();
    }
  }
}
