import {
  _decorator,
  Component,
  EventTouch,
  Input,
  input,
  Node,
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

  update(deltaTime: number) {}
}
