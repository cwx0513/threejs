import * as THREE from "three"
// 导入控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
//导入水面
import {Water} from "three/examples/jsm/objects/Water2"
//导入gltf载入库
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader"
//导入解压的库
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader"
import { DirectionalLight } from "three";
//导入
//初始化场景
const scene = new THREE.Scene();

//初始化相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

//设置相机的位置
// camera.position.set(-50, 50, 130);
camera.position.set(0, 50, 200);
//更新摄像头宽高比例
camera.aspect = window.innerWidth / window.innerHeight
//更新摄像头投影矩阵,任何参数被改变时调用
camera.updateProjectionMatrix()

scene.add(camera)

//初始化渲染器
const renderer = new THREE.WebGLRenderer({
  //抗锯齿
  antialias: true,
  //对数深度缓冲区
  logarithmicDepthBuffer: true
})
renderer.outputEncoding = THREE.sRGBEncoding
//设置渲染的宽高
renderer.setSize(window.innerWidth, window.innerHeight)

//监听屏幕的大小改变，修改渲染器的宽高，相机的比例
window.addEventListener("resize", ()=>{
  camera.aspect = window.innerWidth / window.innerHeight
  //更新摄像头投影矩阵,任何参数被改变时调用
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

//将渲染器添加到页面
document.body.appendChild(renderer.domElement)

// 实例化控制器
const controls = new OrbitControls(camera, renderer.domElement);

//render函数
function render(){
  //渲染场景
  renderer.render(scene, camera)
  //引擎自动更新渲染器
  requestAnimationFrame(render)
}

render()

// 添加平面
// const planeGeometry = new THREE.PlaneGeometry(100, 100);
// const planeMaterial = new THREE.MeshBasicMaterial({
//   color: 0xffffff
// })

// const plane = new THREE.Mesh(planeGeometry, planeMaterial)
// scene.add(plane)

//创建一个巨大的天空球体
let texture = new THREE.TextureLoader().load("./textures/sky.jpg");
const skyGeometry = new THREE.SphereGeometry(1000, 60, 60);
const skyMaterial = new THREE.MeshBasicMaterial({
  // map: texture,
});

skyGeometry.scale(1, 1, -1)
const sky = new THREE.Mesh(skyGeometry, skyMaterial)
scene.add(sky)

//创建视频纹理
const video = document.createElement("video")
video.src = "./textures/sky.mp4";
video.loop = true;

window.addEventListener("click", (e) => {
  // 当鼠标移动的时候播放视频
  //   判断视频是否处于播放状态
  if (video.paused) {
    video.play();
    let texture = new THREE.VideoTexture(video);
    skyMaterial.map = texture;
    skyMaterial.map.needsUpdate = true;
  }
});

//载入环境纹理
const hdrLoader = new RGBELoader()
hdrLoader.loadAsync("./assets/050.hdr").then((texture)=>{
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.background = texture
  scene.environment = texture
})

//创建平行光
const light = new DirectionalLight(0xffffff, 1)
light.position.set(-100, 100, 10)
scene.add(light)

//创建一个水面
const waterGeometry = new THREE.CircleBufferGeometry(300, 64);
const water = new Water(waterGeometry,{
  textureHeight: 1024,
  textureWidth: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 1
})
water.rotation.x = -Math.PI / 2
water.position.x = 3

scene.add(water)

//添加小岛模型

//实例化gltf载入库
const loader = new GLTFLoader();
// 实例化draco载入库
const dracoLoader = new DRACOLoader();
//添加draco载入库，draco目录下是一个解压库，用来解压被压缩的glb文件
dracoLoader.setDecoderPath("./draco/");  
// 把解压库draco添加到gltf实例中，然后就会让glb文件先解压，在load进来
loader.setDRACOLoader(dracoLoader);

//会先draco解压，然后在load进来
loader.load("./model/island2.glb", (gltf) => {  
  scene.add(gltf.scene);
});

