import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  Node,
  tween,
  Vec3,
} from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

/**
 * 针的控制组件
 * 负责处理针的所有行为，包括：
 * 1. 位置移动和父节点切换
 * 2. 碰撞检测和处理
 * 3. 与游戏管理器的交互（分数更新和游戏结束）
 */
@ccclass("Pin")
export class Pin extends Component {
  /**
   * 组件加载时初始化
   * 获取碰撞组件并注册碰撞事件监听器
   * 用于检测针与其他针的碰撞
   */
  protected onLoad(): void {
    const collider2d = this.getComponent(Collider2D);
    if (collider2d) {
      collider2d.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    } else {
      console.error("Pin component not found on the pin node.---Pin.ts");
    }
  }

  /**
   * 处理碰撞开始事件
   * 当针与其他针发生碰撞时：
   * 1. 输出碰撞日志
   * 2. 通知游戏管理器触发游戏结束
   */
  onBeginContact() {
    console.log("Pin onBeginContact");
    GameManager.inst.gameOver();
  }

  /**
   * 组件销毁时清理
   * 移除碰撞事件监听器，防止内存泄漏
   */
  protected onDestroy(): void {
    const collider2d = this.getComponent(Collider2D);
    if (collider2d) {
      collider2d.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  /**
   * 使针移动到目标位置
   * @param targetPos 目标位置坐标
   * @param duration 移动持续时间
   * @param parentNode 新的父节点（可选）
   * 
   * 移动流程：
   * 1. 创建补间动画移动到目标位置
   * 2. 移动完成后，如果指定了新父节点：
   *    - 保存当前世界坐标和旋转
   *    - 更改父节点（通常是附加到旋转圆盘）
   *    - 恢复世界坐标和旋转，保持视觉位置不变
   *    - 通知游戏管理器更新分数
   */
  moveTo(targetPos: Vec3, duration = 1, parentNode: Node = null) {
    // 创建一个补间动画：
    // 1. tween(this.node) 设置动画目标为当前节点
    // 2. to() 定义动画属性：
    //    - duration: 动画持续时间
    //    - position: 目标位置
    //    - easing: 使用平滑的缓动效果
    // 3. call() 动画完成后的回调函数，用于更改父节点
    // 4. start() 开始执行动画
    tween(this.node)
      .to(duration, { position: targetPos }, { easing: "smooth" })
      .call(() => {
        // 如果指定了新的父节点，则：
        // 1. 保存当前的世界坐标和旋转
        // 2. 更改父节点
        // 3. 恢复原来的世界坐标和旋转，确保视觉效果不变
        if (parentNode !== null) {
          const potion = this.node.getWorldPosition();
          const rotation = this.node.getWorldRotation();
          this.node.setParent(parentNode);
          this.node.setWorldPosition(potion);
          this.node.setWorldRotation(rotation);

          GameManager.inst.updateScore();
        }
      })
      .start();
  }
}
