import { _decorator, CCString, Component, Enum, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * 奖励类型枚举
 * TwoShoot: 双发射击模式，提升玩家火力
 * Bomb: 炸弹道具，可清除屏幕上所有敌机
 */
enum RewordType {
  TwoShoot,
  Bomb,
}

/**
 * 奖励道具组件
 * 负责：
 * 1. 控制奖励道具的向下移动
 * 2. 定义奖励道具的类型和效果
 * 3. 与玩家碰撞后触发对应效果
 */
@ccclass("Reward")
export class Reward extends Component {
  /** 奖励道具移动速度，可在编辑器中调整，单位：像素/秒 */
  @property
  speed = 300;

  /** 
   * 奖励类型，可在编辑器中选择
   * TwoShoot: 获得后切换为双发射击模式
   * Bomb: 获得后可触发全屏清怪效果
   */
  @property({ type: Enum(RewordType) })
  rewordType: RewordType = RewordType.TwoShoot;

  start() {}

  /**
   * 每帧更新函数
   * 控制奖励道具向下匀速移动
   * @param deltaTime 距离上一帧的时间间隔，单位：秒
   */
  update(deltaTime: number) {
    const position = this.node.position;
    this.node.setPosition(
      position.x,
      position.y - this.speed * deltaTime,
      position.z
    );
  }
}
