import {
  _decorator,
  Camera,
  Color,
  Component,
  director,
  Input,
  input,
  instantiate,
  Label,
  Node,
  Prefab,
  tween,
} from "cc";
import { Pin } from "./Pin";
import { Circle } from "./Circle";
const { ccclass, property } = _decorator;

/**
 * 游戏管理器组件
 * 负责管理游戏的核心逻辑，包括：
 * 1. 针的生成和位置控制
 * 2. 触摸事件处理
 * 3. 针的运动路径控制：p1(生成) -> p2(等待) -> p3(插入) -> circle(旋转)
 * 4. 分数统计和显示
 * 5. 游戏结束效果处理（相机效果和场景重载）
 */
@ccclass("GameManager")
export class GameManager extends Component {
  /** 
   * 单例模式实现
   * 通过静态属性存储唯一实例
   * 确保游戏中只有一个游戏管理器实例
   */
  private static _inst: GameManager = null;
  public static get inst() {
    return this._inst;
  }

  // 场景中的三个关键位置节点
  @property(Node)
  p1: Node = null; // 针的生成位置
  @property(Node)
  p2: Node = null; // 针的等待位置
  @property(Node)
  p3: Node = null; // 针的插入位置

  @property(Prefab)
  pinPrefab: Prefab = null; // 针的预制体模板

  @property
  moveDuration = 0.1; // 针的移动动画持续时间（秒）

  @property(Label)
  scoreLabel: Label = null; // 分数显示标签

  @property(Camera)
  camera: Camera = null; // 主相机，用于游戏结束特效

  @property
  targetOrthoHeight = 600; // 相机目标正交高度

  @property(Color)
  targetColorBg: Color = new Color(); // 游戏结束时的目标背景颜色

  // 游戏状态相关变量
  private currentPin: Pin = null; // 当前活动的针
  private score = 0; // 游戏分数
  private isGameOver = false; // 游戏结束标志
  private isColorLerp = false; // 颜色渐变标志

  @property(Node)
  circleNode: Node = null; // 旋转圆盘节点

  /**
   * 组件加载时初始化
   * 1. 设置单例实例
   * 2. 注册触摸事件监听器
   */
  protected onLoad(): void {
    GameManager._inst = this;
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  /**
   * 游戏开始时的初始化
   * 生成第一个针
   */
  start(): void {
    this.pinSpawn();
  }

  /**
   * 每帧更新
   * 处理背景颜色的平滑渐变效果
   * @param deltaTime 帧间隔时间
   */
  update(deltaTime: number) {
    if (this.isColorLerp) {
      const outColor = new Color();
      Color.lerp(
        outColor,
        this.camera.clearColor,
        this.targetColorBg,
        deltaTime
      );
      this.camera.clearColor = outColor;
    }
  }

  /**
   * 更新游戏分数
   * 1. 增加分数计数
   * 2. 更新分数显示标签
   */
  updateScore() {
    this.score++;
    this.scoreLabel.string = this.score.toString();
  }

  /**
   * 处理触摸开始事件
   * 1. 将当前针移动到p3位置
   * 2. 移动完成后将针附加到旋转圆盘上
   * 3. 生成新的针继续游戏
   */
  onTouchStart() {
    if (this.isGameOver) return;
    this.currentPin.moveTo(
      this.p3.position,
      this.moveDuration,
      this.circleNode
    );
    this.pinSpawn();
  }

  /**
   * 生成新的针
   * 1. 实例化针预制体
   * 2. 将针添加为当前节点的子节点
   * 3. 设置针的初始位置为 p1 的位置
   * 4. 获取针组件并控制其移动到 p2 位置
   * 5. 保存当前针的引用以便后续控制
   */
  pinSpawn() {
    // 通过预制体创建一个新的针实例
    // instantiate 是 Cocos Creator 提供的实例化方法
    const pinNode = instantiate(this.pinPrefab);

    // 将新创建的针添加为当前节点的子节点
    // 这样针就会显示在场景中，并继承父节点的变换属性
    this.node.addChild(pinNode);

    // 设置针的位置
    // 将针移动到 p1 节点的位置
    // position 是一个包含 x, y, z 坐标的向量
    pinNode.setPosition(this.p1.position);

    // 获取针节点上的 Pin 组件
    // 如果获取成功，则控制针移动到 p2 位置
    this.currentPin = pinNode.getComponent(Pin);
    if (this.currentPin) {
      this.currentPin.moveTo(this.p2.position, this.moveDuration);
    } else {
      console.error(
        "Pin component not found on the pin node.---GameManager.ts"
      );
    }
  }

  /**
   * 游戏结束处理
   * 1. 设置游戏结束标志
   * 2. 停止圆盘旋转
   * 3. 触发相机动画效果（正交高度变化）
   * 4. 启动背景颜色渐变
   * 5. 延迟2秒后重新加载场景
   */
  gameOver() {
    // 游戏结束逻辑
    // 可以在这里添加游戏结束后的处理，比如显示游戏结束界面、重新开始游戏等
    console.log("Game Over!");
    if (!this.isGameOver) {
      this.isGameOver = true;
      this.circleNode.getComponent(Circle).stopRotate();
      tween(this.camera)
        .to(
          0.5,
          {
            // clearColor: this.targetColorBg,
            orthoHeight: this.targetOrthoHeight,
          },
          { easing: "smooth" }
        )
        .start();
      this.isColorLerp = true;
      this.scheduleOnce(() => {
        director.loadScene(director.getScene().name);
      }, 2);
    }
  }

  /**
   * 组件销毁时清理
   * 移除触摸事件监听器
   */
  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }
}
