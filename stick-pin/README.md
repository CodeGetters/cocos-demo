# 见缝插针开发指南

见缝插针中间有一个不停转动的圆，点击屏幕可以发射一根针，针会沿着圆的轨迹运动，当两根针的针尾接触时的视为游戏失败。

开始之前需要：

- 打开项目设置-项目数据，将设计宽度和设计高度设置为`720`和`1280`（竖屏显示）
- 打开项目设置-功能裁剪-2D-2D 物理系统，将其更改为`内置2D物理系统`（本游戏不需要太高级的物理系统）

## 实现步骤

1. 绘制圆
2. 绘制针
3. 发射针
4. 检测碰撞
5. 游戏结束

## 具体实现

### 绘制圆

在 `Canvas` 画布下新建一个 `2D 对象 Sprite(精灵)` 将其命名为 `Circle`，适当调整其大小和位置，右侧属性检查器下的`cc.Sprite`下的`Sprite Frame`中可以选择我们的图片。

设置完圆后，怎么让它转动起来呢，我们在 `assets/scripts` 下新建一个脚本文件，将其命名为 `Circle`并将其挂载（鼠标拖拽）到 `Circle` 节点上。

打开这个脚本文件，该文件会自动生成如下代码：

```ts
import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Circle")
export class Test extends Component {
  start() {} // 脚本初始化时执行一次

  update(deltaTime: number) {} // 每帧执行一次
}
```

想要让其转动起来，我需要先定一个旋转速度，然后在 `update` 方法中更新旋转角度，这里需要注意的是，这里的旋转角度是相对于父节点的，所以这里的旋转角度是负数(顺时针)。

```ts
@ccclass("Circle")
export class Test extends Component {
  @property
  rotateSpeed = 90; // 旋转速度 单位：度/秒

  update(deltaTime: number) {
    this.node.angle -= this.rotateSpeed * deltaTime;
  }
}
```

这里定义的 `rotateSpeed` 我们为它添加了装饰器 `@property`，这样我们就可以在编辑器中修改它的值了。

这里的`this.node.angle`是`Cocos Creator`中的一个属性，用于控制节点的旋转角度，具体来说：

- `this.node`表示当前组件所附加的节点对象（Node）
- `.angle`是节点对象的一个属性，表示节点的旋转角度。
  - 正值表示逆时针旋转
  - 负值表示顺时针旋转
  - 取值范围是 -180 到 180

到这里，圆就可以转动起来了。

### 绘制针

针有两个部分，一个是针头，一个是针尾，针头是一个圆形，针尾是一个矩形。那么我们先新建一个空节点，将其命名为 `Pin`，然后在 `Pin` 节点下新建一个 `2D 对象 Sprite(精灵)` 将其命名为 `PinHead`(放置),再新建一个`2D 对象 Sprite(精灵)` 将其命名为`PinBody`，适当调整其大小和位置。

这里完成后，我们可以将针拖动到 `assets/prefab` 下，方便我们在其他地方使用。

这里可能需要注意的是：我们放置的`PinBody`可能是一个横向的矩形，但是我们需要的是一个纵向的矩形，所以我们需要将其旋转 90 度，也就是在属性检查器的`Node`下的`Rotation`属性中将其设置为 90 即可。

接下来我们就要思考一下针的运动轨迹了，回想一下我们游戏的玩法，它是点击屏幕发射一根针，这根针是从屏幕下方发射到圆上的，当然，这根针是有一个起点和终点的，而且这根针肯定是在屏幕之前就已经存在，只是点击的从屏幕以外发射到了圆上。

所以我们需要在屏幕外侧放置一根针，屏幕下方放置一根针，圆圈上放置一根针，怎么放置呢？

我们先新建一个空节点，将其命名为 `Position1`，然后将 `Pin` 节点下移动到 `Position1`下，将其移动到屏幕外合适的位置，`Ctrl+D`复制一份，将其命名为 `Position2`，然后将其移动到屏幕内下方合适的位置，`Ctrl+D`复制一份，将其命名为 `Position3`，然后将其移动到圆上合适的位置。

这样我们就预定好了三根针的位置啦，我们将三个 `Position`下的 `Pin` 节点隐藏掉起来，也就是属性编辑器中的`prefab`下的 `Pin` 取消勾选，这样就隐藏掉了。

隐藏后，我们怎么让这根顺利的从屏幕外侧发射到圆上呢？

### 发射针

我们在 `assets/scripts` 下新建一个脚本文件，将其命名为 `GameManager` 并将其挂载（鼠标拖拽）到 `Canvas` 节点下新建的节点`GameManager`中。

接下来打开`GameManager`文件，我们开始处理发射针的逻辑。

我们首先初始化三根针并为它们都添加装饰器`@property(Node)`，同时也为初始化预制体 prefab`pinPrefab`添加装饰器 `@property(Prefab)`。

接下来我们在`GameManager`节点的属性管理器中拖拽进相应的节点。

最后我们需要将我们发射针的逻辑写入到相关的脚本文件中。

针的发射逻辑如下：

1. 点击屏幕(监听屏幕点击)
2. 从屏幕外侧发射一根针(针的初始化、针的移动、针的旋转)

也就是说，我们需要创建两个方法：

- 一个是 `Pin.ts`中的针移动方法，该方法可以让针从某一位置移动到另外一个位置。
- 一个是 `GameManager.ts`中的针发射方法，该方法主要是在生成针后调用 `Pin.ts`中的针移动方法。

```ts
// Pin.ts
@ccclass("Pin")
export class Pin extends Component {
  @property
  moveDuration = 0.5; // 移动时间 单位：秒

  moveTo(targetPos: Vec3, duration: number=1) {
    tween(this.node)
      .to(duration, { position:targetPos }，{easing:'smooth'})
      .call(()=>{
        if (parentNode !== null) {
          const potion = this.node.getWorldPosition();
          const rotation = this.node.getWorldRotation();
          this.node.setParent(parentNode);
          this.node.setWorldPosition(potion);
          this.node.setWorldRotation(rotation);

          GameManager.inst.updateScore();
        }
      })
      .start();
  }
}
```

```ts
// GameManager.ts
@ccclass("GameManager")
export class GameManager extends Component {
  @property(Node)
  position1: Node = null; // 位置1
  @property(Node)
  position2: Node = null; // 位置2
  @property(Node)
  position3: Node = null; // 位置3
  @property
  moveDuration = 0.1; // 针的移动动画持续时间（秒）
  @property(Prefab)
  pinPrefab: Prefab = null; // 针预制体
  private currentPin: Pin = null; // 当前针
  /**
   * 组件加载时初始化
   * 1. 设置单例实例
   * 2. 注册触摸事件监听器
   */
  protected onLoad(): void {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  /**
   * 组件销毁时清理
   * 移除触摸事件监听器
   */
  protected onDestroy(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
  }

  start() {
    this.pinSpawn();
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

    // 将当前针设置为新创建的针
    this.currentPin = pinNode.getComponent(Pin);
    if (this.currentPin) {
      this.currentPin.moveTo(this.p2.position, this.moveDuration);
    } else {
      console.log("当前针不存在");
    }
  }
}
```

### 检测碰撞

在 `Pin` 节点下添加`CircleCollider2D`组件
