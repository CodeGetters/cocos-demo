import {
  _decorator,
  Component,
  EventTouch,
  Input,
  input,
  instantiate,
  Node,
  Prefab,
  Vec2,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

/**
 * 玩家控制组件
 * 负责处理玩家飞机的触摸移动控制
 */
@ccclass("Player")
export class Player extends Component {
  /** 子弹发射计时器 */
  shootTimer = 0;
  /** 子弹发射间隔时间，单位：秒 */
  @property
  shootRate = 0.3;
  /** 子弹预制体 */
  @property(Prefab)
  bullet1Prefab: Prefab = null;
  /** 子弹的父节点容器 */
  @property(Node)
  bulletParent: Node = null;
  /** 子弹发射位置节点 */
  @property(Node)
  bulletPosition: Node = null;

  /**
   * 组件加载时调用
   * 注册触摸移动事件监听
   */
  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  /**
   * 组件销毁时调用
   * 移除触摸移动事件监听，防止内存泄漏
   */
  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
  }

  /**
   * 触摸移动事件处理函数
   * @param event 触摸事件对象，包含触摸位置变化信息
   */
  onTouchMove(event: EventTouch) {
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
      bullet1.setWorldPosition(this.bulletPosition.worldPosition);
    }
  }
}
