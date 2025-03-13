import { _decorator, Component, LabelComponent, Node } from "cc";
import { GameManager } from "../GameManager";
const { ccclass, property } = _decorator;

/**
 * 炸弹数量UI组件
 * 负责：
 * 1. 显示玩家当前炸弹数量
 * 2. 监听炸弹数量变化并更新显示
 */
@ccclass("BombUI")
export class BombUI extends Component {
  /** 炸弹数量显示标签组件 */
  @property(LabelComponent)
  numberLabel: LabelComponent;

  start() {
    // 监听炸弹数量变化事件
    GameManager.getInstance().node.on("onBombChange", this.onBombChange, this);
  }

  protected onDestroy(): void {
    // 组件销毁时移除事件监听
    GameManager.getInstance().node.off("onBombChange", this.onBombChange, this);
  }

  /** 炸弹数量变化事件处理函数 */
  onBombChange() {
    this.numberLabel.string = GameManager.getInstance()
      .getBombNumber()
      .toString();
  }
}
