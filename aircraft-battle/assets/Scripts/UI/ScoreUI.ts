import { _decorator, Component, LabelComponent, Node } from "cc";
import { GameManager } from "../GameManager";
const { ccclass, property } = _decorator;

/**
 * 游戏分数UI组件
 * 负责：
 * 1. 显示当前游戏分数
 * 2. 监听分数变化并更新显示
 */
@ccclass("ScoreUI")
export class ScoreUI extends Component {
  /** 分数显示标签组件 */
  @property(LabelComponent)
  numberLabel: LabelComponent;

  start() {
    // 监听分数变化事件
    GameManager.getInstance().node.on(
      "onScoreChange",
      this.onScoreChange,
      this
    );
  }

  protected onDestroy(): void {
    // 组件销毁时移除事件监听
    GameManager.getInstance().node.off(
      "onScoreChange",
      this.onScoreChange,
      this
    );
  }

  /** 分数变化事件处理函数 */
  onScoreChange() {
    this.numberLabel.string = GameManager.getInstance()
      .getGameScore()
      .toString();
  }
}
