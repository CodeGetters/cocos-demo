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
 * 控制敌机的移动逻辑
 */
@ccclass("Enemy")
export class Enemy extends Component {
  /** 敌机移动速度，单位：像素/秒 */
  @property
  speed = 300;

  /** 敌机动画组件引用 */
  @property(Animation)
  anim: Animation = null;

  @property
  hp = 1; // 血量

  start() {
    // 注册单个碰撞体的回调函数
    let collider = this.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

  onBeginContact() {
    this.hp -= 1;
    this.anim.play();
  }
  onEndContact() {}

  /**
   * 每帧更新
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  update(deltaTime: number) {
    if (this.hp > 0) {
      // 获取当前位置
      const position = this.node.position;
      // 根据速度更新敌机位置，使其向下移动
      this.node.setPosition(position.x, position.y - this.speed * deltaTime);
    }
  }
}
