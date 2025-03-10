import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * 子弹控制组件
 * 控制子弹的飞行逻辑
 */
@ccclass("Bullet")
export class Bullet extends Component {
  /** 子弹飞行速度，单位：像素/秒 */
  @property
  speed = 500; // 子弹飞行速度 200px/s

  start() {}

  /**
   * 每帧更新
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  update(deltaTime: number) {
    // 获取当前位置
    const position = this.node.position;
    // 根据速度更新子弹位置，使其向上飞行
    this.node.setPosition(
      position.x,
      position.y + this.speed * deltaTime,
      position.z
    );
  }
}
