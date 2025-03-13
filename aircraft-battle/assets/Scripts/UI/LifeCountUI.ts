import { _decorator, Component, LabelComponent, Node } from "cc";
import { Player } from "../Player";
const { ccclass, property } = _decorator;

/**
 * 生命值UI组件
 * 负责：
 * 1. 显示玩家当前生命值
 * 2. 监听生命值变化并更新显示
 */
@ccclass("LifeCountUI")
export class LifeCountUI extends Component {
  /** 生命值显示标签组件 */
  @property(LabelComponent)
  numberLabel: LabelComponent;

  start() {
    if (Player.getInstance()) {
      // 设置初始生命值显示
      this.numberLabel.string = Player.getInstance().getLifeCount().toString();
      // 监听生命值变化事件
      Player.getInstance().node.on(
        "onLifeCountChange",
        this.onLifeCountChange,
        this
      );
    }
  }

  protected onDestroy(): void {
    // 组件销毁时移除事件监听
    if (Player.getInstance()) {
      Player.getInstance().node.off(
        "onLifeCountChange",
        this.onLifeCountChange,
        this
      );
    }
  }

  /** 生命值变化事件处理函数 */
  onLifeCountChange() {
    this.numberLabel.string = Player.getInstance().getLifeCount().toString();
  }
}
