import { _decorator, Component, director, Node } from "cc";
const { ccclass, property } = _decorator;

/**
 * 开始界面UI控制组件
 */
@ccclass("StartUI")
export class StartUI extends Component {
  start() {}

  update(deltaTime: number) {}

  /**
   * 开始按钮点击事件处理函数
   * 点击后加载游戏场景
   */
  onStartButtonClick() {
    director.loadScene("02-GameScene");
  }
}
