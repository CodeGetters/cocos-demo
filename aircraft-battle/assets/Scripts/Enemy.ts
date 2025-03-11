import { _decorator, Component, Node } from "cc";
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

  start() {}

  /**
   * 每帧更新
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  update(deltaTime: number) {
    // 获取当前位置
    const position = this.node.position;
    // 根据速度更新敌机位置，使其向下移动
    this.node.setPosition(position.x, position.y - this.speed * deltaTime);
  }
}
