import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * 圆盘控制组件
 * 负责控制圆盘的旋转行为
 * 包括：
 * 1. 持续旋转
 * 2. 游戏结束时停止旋转
 */
@ccclass("Circle")
export class Circle extends Component {
  @property
  rotateSpeed = 90; // 旋转速度（度/秒）

  private isRotating = true; // 旋转状态控制标志

  /**
   * 每帧更新
   * 根据旋转状态更新圆盘角度
   * @param deltaTime 帧间隔时间，用于确保旋转速度的一致性
   */
  update(deltaTime: number) {
    if (!this.isRotating) return;
    // 更新旋转角度：
    // 负值表示顺时针旋转
    // deltaTime 确保在不同帧率下旋转速度一致
    this.node.angle -= this.rotateSpeed * deltaTime;
  }

  /**
   * 停止圆盘旋转
   * 在游戏结束时调用
   */
  stopRotate() {
    this.isRotating = false;
  }
}
