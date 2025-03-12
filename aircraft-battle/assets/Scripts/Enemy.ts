import {
  _decorator,
  Animation,
  Collider2D,
  Component,
  Contact2DType,
  Node,
  PhysicsSystem2D,
} from "cc";
const { ccclass, property } = _decorator;

/**
 * 敌机控制组件
 * 负责：
 * 1. 控制敌机的向下移动
 * 2. 处理敌机的碰撞检测
 * 3. 管理敌机的生命值和销毁
 */
@ccclass("Enemy")
export class Enemy extends Component {
  /** 敌机移动速度，可在编辑器中调整，单位：像素/秒 */
  @property
  speed = 300;

  /** 敌机动画组件引用，用于播放爆炸动画 */
  @property(Animation)
  anim: Animation = null;

  /** 敌机生命值，可在编辑器中调整 */
  @property
  hp = 1;

  /** 碰撞体组件引用 */
  collider: Collider2D = null;

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
   * 1. 减少生命值
   * 2. 播放爆炸动画
   * 3. 禁用碰撞体防止重复触发
   * 4. 生命值为0时延迟销毁节点
   */
  onBeginContact() {
    this.hp -= 1;
    this.anim.play();
    this.collider = this.getComponent(Collider2D);
    if (this.collider) {
      this.collider.enabled = false;
    }
    if (this.hp <= 0) {
      // 延迟1秒销毁，留时间播放爆炸动画
      this.scheduleOnce(() => {
        this.node.destroy();
      }, 1);
    }
  }

  /**
   * 每帧更新函数
   * 1. 控制敌机向下移动
   * 2. 检测是否超出屏幕底部边界
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
