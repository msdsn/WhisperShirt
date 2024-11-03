import { Live2DModel } from 'pixi-live2d-display-lipsyncpatch';
import { Application } from 'pixi.js';
const model_info = {
    "name": "shizuku-local",
    "description": "Orange-Haired Girl, locally available. no internet required.",
    "url": "/live2d-models/shizuku/shizuku.model.json",
    "kScale": 0.001725,
    "kXOffset": 1150,
    "idleMotionGroupName": "Idle",
    "emotionMap": {
        "neutral": 0,
        "anger": 2,
        "disgust": 2,
        "fear": 1,
        "joy": 3,
        "smirk": 3,
        "sadness": 1,
        "surprise": 3
    }
}
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

export const app: any = new Application({
    view: canvas,
    autoStart: true,
    resizeTo: window,
    backgroundAlpha: 0,
  });
export var model: any;
(async function () {
    model = await Live2DModel.from(model_info.url);
    app.stage.addChild(model);
    model.scale.set(1);
    model.y = -innerHeight * 0.01;
    model.x = app.view.width / 2 - model.width / 2;
})();
