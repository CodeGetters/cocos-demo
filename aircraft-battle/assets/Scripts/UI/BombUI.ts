import { _decorator, Component, LabelComponent, Node } from "cc";
import { GameManager } from "../GameManager";
const { ccclass, property } = _decorator;

@ccclass("BombUI")
export class BombUI extends Component {
  @property(LabelComponent)
  numberLabel: LabelComponent;

  start() {
    GameManager.getInstance().node.on("onBombChange", this.onBombChange, this);
  }

  update(deltaTime: number) {}

  onBombChange() {
    this.numberLabel.string = GameManager.getInstance()
      .getBombNumber()
      .toString();
  }
}
