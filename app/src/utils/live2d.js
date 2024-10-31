

const model_info = {
    "name": "shizuku-local",
    "description": "Orange-Haired Girl, locally available. no internet required.",
    "url": "/live2d-models/shizuku/shizuku.model.json",
    "kScale": 0.000625,
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
const live2d = PIXI.live2d;
export const app = new PIXI.Application({
  view: document.getElementById("canvas"),
  autoStart: true,
  resizeTo: window,
  transparent: true,
  backgroundAlpha: 0,
});
export var model;
(async function () {
    model = await live2d.Live2DModel.from(model_info.url);
    app.stage.addChild(model);
    const scaleX = (innerWidth * model_info.kScale);
    const scaleY = (innerHeight * model_info.kScale);
    model.scale.set(Math.min(scaleX, scaleY));
    model.y = innerHeight * 0.01;
    model.x = app.view.width / 2 - model.width / 2;
})();


export var downloadFile = async () => {
    const htmlimagelement = await app.renderer.extract.image(app.stage)
    //document.body.appendChild(htmlimagelement);
    console.log(htmlimagelement)
    const a = document.createElement('a');
    a.href = htmlimagelement.src;
    a.download = 'image.png';
    a.click();
}
