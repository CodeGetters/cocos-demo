import { _decorator, CCString, Component, Enum, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * 奖励类型枚举
 * TwoShoot: 双发射击模式，提升玩家火力，使玩家可以同时发射两颗子弹
 * Bomb: 炸弹道具，可立即清除屏幕上所有敌机，相当于全屏技能
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
 * 3. 超出屏幕边界时自动销毁
 */
@ccclass("Reward")
export class Reward extends Component {
  /** 
   * 奖励道具移动速度
   * 可在编辑器中调整，单位：像素/秒
   * 默认值与敌机移动速度相同
   */
  @property
  speed = 300;

  /** 
   * 奖励道具类型
   * 可在编辑器中通过下拉菜单选择
   * TwoShoot: 双发射击，提升玩家攻击力
   * Bomb: 炸弹道具，清除所有敌机
   */
  @property({ type: Enum(RewordType) })
  rewordType: RewordType = RewordType.TwoShoot;

  /**
   * 每帧更新函数
   * 功能：
   * 1. 控制奖励道具向下匀速移动
   * 2. 使用与敌机相同的移动逻辑
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
