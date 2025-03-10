import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * 背景控制组件
 * 实现背景图的无限滚动效果
 */
@ccclass("Bg")
export class Bg extends Component {
  /** 背景图片1 */
  @property(Node)
  bg01: Node = null;
  
  /** 背景图片2 */
  @property(Node)
  bg02: Node = null;
  
  /** 背景移动速度，单位：像素/秒 */
  @property
  moveSpeed = 100;

  start() {}

  /**
   * 每帧更新
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  update(deltaTime: number) {
    // 同时控制bg01、bg02的移动--还需要移动到下面的bg拼接到页面上方
    const position1 = this.bg01.position;
    this.bg01.setPosition(
      position1.x,
      position1.y - this.moveSpeed * deltaTime,
      position1.z
    );
    const position2 = this.bg02.position;
    this.bg02.setPosition(
      position2.x,
      position2.y - this.moveSpeed * deltaTime,
      position2.z
    );
    // 获取最新的位置
    const p1 = this.bg01.position;
    const p2 = this.bg02.position;

    // 当背景图移出屏幕底部时，将其移动到另一张背景图的上方
    // 852是背景图的高度
    if (this.bg01.position.y < -852) {
      this.bg01.setPosition(p2.x, p2.y + 852, p2.z);
    }
    if (this.bg02.position.y < -852) {
      this.bg02.setPosition(p1.x, p1.y + 852, p1.z);
    }
  }
}
