// mazemini.js - Web version of the Haunted Maze Renderer
// Enhanced with debug logging and visual aids for texture/rendering issues

(() => {

  // -----------------------
  // CONFIG / editable area
  // -----------------------
  const CONFIG = {
    cellPx: 8,
    wallHeight: 2.4,
    playerHeight: 1.7,
    playerRadius: 0.18,
    maxJumpscares: 6,
    jumpscareDurationRange: [3000, 4000],
    ambientList: [
      'assets/ambient1.mp3',
      'assets/ambient2.mp3',
      'assets/ambient3.mp3',
      'assets/ambient4.mp3',
      'assets/ambient5.mp3',
      'assets/ambient6.mp3',
      'assets/ambient7.mp3',
      'assets/ambient8.mp3'
    ],
    jumpscareImages: [
      'assets/jumpscare1.png','assets/jumpscare2.png','assets/jumpscare3.png',
      'assets/jumpscare4.png','assets/jumpscare5.png','assets/jumpscare6.png'
    ],
    jumpscareAudios: [
      'assets/jumpscare1.mp3','assets/jumpscare2.mp3','assets/jumpscare3.mp3',
      'assets/jumpscare4.mp3','assets/jumpscare5.mp3','assets/jumpscare6.mp3'
    ],
    decorImages: [
      'assets/decor1.png',
      'assets/decor2.png'
    ],
    ambientIntervalMin: 6000,
    ambientIntervalMax: 25000
  };

  // -----------------------
  // DOM references
  // -----------------------
  const canvas = document.getElementById('three-canvas');
  const intro = document.getElementById('intro');
  const startBtn = document.getElementById('startBtn');
  const titleEl = document.getElementById('title');
  const introTextEl = document.getElementById('intro-text');
  const messageEl = document.getElementById('message');
  const minimapWrap = document.getElementById('mini-wrap');
  const minimapCanvas = document.getElementById('minimap');
  const jumpscareOverlay = document.getElementById('jumpscare');
  const jumpscareImg = document.getElementById('jumpscare-img');
  const vhsOverlay = document.getElementById('vhs');
  const noiseCanvas = document.getElementById('noise');
  const mapCtx = minimapCanvas.getContext('2d');

  // Intro text
  titleEl.textContent = 'Haunted Maze — Escape if you can';
  introTextEl.textContent = 'Find the exit before the maze consumes you. Click Start, then click the view to lock mouse. WASD to move. Toggle VHS (V). Toggle minimap (M). Toggle debug (D).';

  // -----------------------
  // Debug overlay (enhanced)
  // -----------------------
  let debugEnabled = false;
  const debugDiv = document.createElement('div');
  debugDiv.id = 'debug-overlay';
  debugDiv.style.cssText = `
    position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white;
    padding: 10px; font-family: monospace; font-size: 12px; z-index: 1000; display: none; max-width: 300px;
  `;
  document.body.appendChild(debugDiv);

  function updateDebug() {
    if (!debugEnabled) return;
    const fps = Math.round(1 / ((performance.now() - lastTime) / 1000));
    const sceneChildren = scene.children.length;
    const wallCount = wallGroup.children.length;
    const decorCount = decorGroup.children.length;
    debugDiv.innerHTML = `
      FPS: ${fps}<br>
      Player Pos: (${player.pos.x.toFixed(2)}, ${player.pos.y.toFixed(2)})<br>
      Yaw: ${player.yaw.toFixed(2)}<br>
      Jumpscares: ${jumpscareCount}/${CONFIG.maxJumpscares}<br>
      Assets Loaded: ${loadedAssets}/${totalAssets}<br>
      Scene Objects: ${sceneChildren} (Walls: ${wallCount}, Decor: ${decorCount})<br>
      Rendering: ${renderer.info.render.calls} calls<br>
      Last Error: ${lastDebugError || 'None'}
    `;
  }

  let lastDebugError = null;
  function logDebugError(msg) {
    lastDebugError = msg;
    console.error('[DEBUG ERROR]', msg);
  }

  function toggleDebug() {
    debugEnabled = !debugEnabled;
    debugDiv.style.display = debugEnabled ? 'block' : 'none';
    console.log(`[DEBUG] Debug overlay ${debugEnabled ? 'enabled' : 'disabled'}`);
  }

  // Asset loading tracking (enhanced)
  let loadedAssets = 0;
  let totalAssets = 0;
  function trackAssetLoad(success, type, path, error = null) {
    if (success) {
      loadedAssets++;
      console.log(`[DEBUG] ${type} loaded successfully: ${path}`);
    } else {
      logDebugError(`Failed to load ${type}: ${path} (${error || 'Unknown error'})`);
    }
  }

  // -----------------------
  // Three.js setup
  // -----------------------
  const THREE = window.THREE;
  if (!THREE) {
    logDebugError('Three.js not loaded! Check the CDN script in mazeminigame.html.');
    return;
  }
  console.log('[DEBUG] Three.js loaded, initializing renderer...');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log('[DEBUG] Renderer initialized.');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.02);
  console.log('[DEBUG] Scene created.');

  const camera = new THREE.PerspectiveCamera(72, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, CONFIG.playerHeight, 0);
  scene.add(camera);
  console.log('[DEBUG] Camera added to scene.');

  const ambientLight = new THREE.AmbientLight(0x666666);
  scene.add(ambientLight);
  const cameraLight = new THREE.PointLight(0xffffff, 1.0, 12, 2);
  camera.add(cameraLight);
  console.log('[DEBUG] Lights added.');

  // Materials
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 1, metalness: 0 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

  // Groups
  const wallGroup = new THREE.Group();
  const decorGroup = new THREE.Group();
  scene.add(wallGroup, decorGroup);
  console.log('[DEBUG] Wall and decor groups added to scene.');

  // -----------------------
  // Maze Grid
  // -----------------------
  let grid = { cols: 0, rows: 0, cellSize: 1, cells: [] }; // 1=wall,0=floor

  // -----------------------
  // Player state
  // -----------------------
  const player = {
    pos: { x: 1.5, y: 1.5 },
    yaw: 0,
    pitch: 0,
    speed: 3.2,
    radius: CONFIG.playerRadius,
    height: CONFIG.playerHeight
  };

  // -----------------------
  // Input
  // -----------------------
  const keys = {};
  window.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === 'm' || e.key === 'M') toggleMinimap();
    if (e.key === 'd' || e.key === 'D') toggleDebug();
    if (e.key === 'v' || e.key === 'V') toggleVHS();
  });
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  // Pointer lock
  canvas.addEventListener('click', () => canvas.requestPointerLock?.());
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener('mousemove', onMouseMove);
    } else {
      document.removeEventListener('mousemove', onMouseMove);
    }
  });
  function onMouseMove(e) {
    const sensitivity = 0.0025;
    player.yaw -= e.movementX * sensitivity;
    player.pitch -= e.movementY * sensitivity;
    player.pitch = Math.max(-Math.PI/2 + 0.02, Math.min(Math.PI/2 - 0.02, player.pitch));
  }

  // -----------------------
  // Collision
  // -----------------------
  function isWallAt(mx, my) {
    if (mx < 0 || my < 0 || mx >= grid.cols || my >= grid.rows) return true;
    return grid.cells[Math.floor(my)][Math.floor(mx)] === 1;
  }
  function collidesAt(x, y) {
    const r = player.radius;
    const minX = Math.floor(x - r), maxX = Math.floor(x + r);
    const minY = Math.floor(y - r), maxY = Math.floor(y + r);
    for (let gy = minY; gy <= maxY; gy++) {
      for (let gx = minX; gx <= maxX; gx++) {
        if (isWallAt(gx, gy)) {
          const closestX = Math.max(gx, Math.min(x, gx + 1));
          const closestY = Math.max(gy, Math.min(y, gy + 1));
          const dx = x - closestX, dy = y - closestY;
          if (dx*dx + dy*dy < r*r) return true;
        }
      }
    }
    return false;
  }

  // -----------------------
  // Build Maze
  // -----------------------
  async function buildGridFromMaze() {
    console.log('[DEBUG] Building maze grid...');
    // generate random maze
    const cols = 40, rows = 30;
    const cells = Array.from({length: rows}, () => Array.from({length: cols}, () => 1));
    function carve(x,y) {
      const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(() => Math.random()-0.5);
      for (let [dx,dy] of dirs) {
        const nx = x+dx*2, ny=y+dy*2;
        if(ny>=0 && ny<rows && nx>=0 && nx<cols && cells[ny][nx]===1){
          cells[y+dy][x+dx]=0; cells[ny][nx]=0;
          carve(nx,ny);
        }
      }
    }
    cells[1][1]=0; carve(1,1);
    grid = { cols, rows, cellSize:1, cells };
    console.log('[DEBUG] Maze grid generated.');

    // Floor
    const floorGeo = new THREE.PlaneGeometry(cols, rows);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.rotation.x=-Math.PI/2;
    floorMesh.position.set(cols/2-0.5, 0, rows/2-0.5);
    scene.add(floorMesh);
    console.log('[DEBUG] Floor added to scene.');

    // Walls
    const boxGeo = new THREE.BoxGeometry(1, CONFIG.wallHeight,1);
    while(wallGroup.children.length) wallGroup.remove(wallGroup.children[0]);
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(cells[r][c]===1){
          const box = new THREE.Mesh(boxGeo, wallMaterial);
          box.position.set(c+0.5, CONFIG.wallHeight/2, r+0.5);
          wallGroup.add(box);
        }
      }
    }
    console.log(`[DEBUG] ${wallGroup.children.length} walls added to wallGroup.`);

    // Decorations (with enhanced error handling and visual debug)
    await placeDecorations();

    drawMinimap();
    console.log('[DEBUG] Maze built successfully.');
  }

  async function placeDecorations() {
    console.log('[DEBUG] Placing decorations...');
    while(decorGroup.children.length) decorGroup.remove(decorGroup.children[0]);
    totalAssets += CONFIG.decorImages.length; // Track for debug
    for(let i=0;i<15;i++){
      const r = Math.floor(Math.random()*grid.rows);
      const c = Math.floor(Math.random()*grid.cols);
      if(grid.cells[r][c]===0){
        const imgIndex = Math.floor(Math.random()*CONFIG.decorImages.length);
        const imgPath = CONFIG.decorImages[imgIndex];
        console.log(`[DEBUG] Attempting to load texture for decoration: ${imgPath}`);
        try {
          const tex = await new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(
              imgPath,
              (texture) => {
                trackAssetLoad(true, 'texture', imgPath);
                resolve(texture);
              },
              (progress) => console.log(`[DEBUG] Loading progress for ${imgPath}: ${progress.loaded}/${progress.total}`),
              (error) => {
                trackAssetLoad(false, 'texture', imgPath, error.message);
                // Create a fallback red sprite for visual debug
                const fallbackTex = new THREE.DataTexture(new Uint8Array([255,0,0,255]), 1, 1, THREE.RGBAFormat);
                fallbackTex.needsUpdate = true;
                resolve(fallbackTex);
              }
            );
          });
          const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
          const spr = new THREE.Sprite(mat);
          spr.position.set(c+0.5, 1.2, r+0.5);
          spr.scale.set(0.7,0.7,1);
          decorGroup.add(spr);
          console.log(`[DEBUG] Decoration sprite added at (${c+0.5}, 1.2, ${r+0.5})`);
        } catch (error) {
          logDebugError(`Skipping decoration due to load failure: ${imgPath} - ${error}`);
        }
      }
    }
    console.log(`[DEBUG] ${decorGroup.children.length} decorations placed.`);
  }

  // -----------------------
  // Minimap
  // -----------------------
  function drawMinimap() {
    minimapCanvas.width = grid.cols;
    minimapCanvas.height = grid.rows;
    for(let r=0;r<grid.rows;r++){
      for(let c=0;c<grid.cols;c++){
        mapCtx.fillStyle = grid.cells[r][c]===1 ? '#222' : '#000';
        mapCtx.fillRect(c,r,1,1);
      }
    }
    // Draw player dot
    mapCtx.fillStyle = '#ff0000';
    mapCtx.fillRect(Math.floor(player.pos.x), Math.floor(player.pos.y), 1, 1);
    console.log('[DEBUG] Minimap updated.');
  }

  function toggleMinimap() {
    minimapWrap.style.display = minimapWrap.style.display==='none'?'block':'none';
    console.log(`[DEBUG] Minimap ${minimapWrap.style.display === 'block' ? 'shown' : 'hidden'}`);
  }

  // -----------------------
  // VHS / Noise overlay
  // -----------------------
  let vhsEnabled = true;
  function toggleVHS(){ vhsEnabled=!vhsEnabled; vhsOverlay.style.display=vhsEnabled?'block':'none'; console.log(`[DEBUG] VHS ${vhsEnabled ? 'enabled' : 'disabled'}`); }

  // -----------------------
  // Jumpscares (with enhanced error handling)
  // -----------------------
  let jumpscareCount = 0;
  function triggerJumpscare() {
    if(jumpscareCount>=CONFIG.maxJumpscares) return;
    jumpscareCount++;
    const idx = Math.floor(Math.random()*CONFIG.jumpscareImages.length);
    const imgPath = CONFIG.jumpscareImages[idx];
    const audioPath = CONFIG.jumpscareAudios[idx];
    console.log(`[DEBUG] Triggering jumpscare with image: ${imgPath} and audio: ${audioPath}`);
    jumpscareImg.src = imgPath;
    jumpscareImg.onerror = () => trackAssetLoad(false, 'jumpscare image', imgPath);
    jumpscareImg.onload = () => trackAssetLoad(true, 'jumpscare image', imgPath);
    jumpscareOverlay.style.display = 'block';
    try {
      const audio = new Audio(audioPath);
      audio.onerror = () => trackAssetLoad(false, 'jumpscare audio', audioPath);
      audio.oncanplaythrough = () => trackAssetLoad(true, 'jumpscare audio', audioPath);
      audio.play();
    } catch (error) {
      logDebugError(`Jumpscare audio play failed: ${audioPath} - ${error}`);
    }
    const duration = CONFIG.jumpscareDurationRange[0] + Math.random()*(CONFIG.jumpscareDurationRange[1]-CONFIG.jumpscareDurationRange[0]);
    setTimeout(() => {
      jumpscareOverlay.style.display = 'none';
      console.log('[DEBUG] Jumpscare overlay hidden.');
    }, duration);
  }

  // -----------------------
  // Ambient sounds (with enhanced error handling)
  // -----------------------
  function playAmbient() {
    const idx = Math.floor(Math.random()*CONFIG.ambientList.length);
    const audioPath = CONFIG.ambientList[idx];
    console.log(`[DEBUG] Playing ambient audio: ${audioPath}`);
    try {
      const audio = new Audio(audioPath);
      audio.volume = 0.35;
      audio.onerror = () => trackAssetLoad(false, 'ambient audio', audioPath);
      audio.oncanplaythrough = () => trackAssetLoad(true, 'ambient audio', audioPath);
      audio.play();
      const nextTime = CONFIG.ambientIntervalMin + Math.random()*(CONFIG.ambientIntervalMax - CONFIG.ambientIntervalMin);
      setTimeout(playAmbient, nextTime);
    } catch (error) {
      logDebugError(`Ambient audio failed: ${audioPath} - ${error}`);
    }
  }

  // -----------------------
  // Start Game
  // -----------------------
  startBtn.addEventListener('click', async () => {
    console.log('[DEBUG] Start button clicked, initializing game...');
    intro.style.display='none';
    canvas.requestPointerLock?.();
    await buildGridFromMaze();
    playAmbient();
    animate();
  });

  // -----------------------
  // Animate
  // -----------------------
  let lastTime = performance.now();
  function animate(now=performance.now()){
    const dt = (now-lastTime)/1000; lastTime=now;

    // Move
    let dx=0,dz=0;
    if(keys['w']) dz-=player.speed*dt;
    if(keys['s']) dz+=player.speed*dt;
    if(keys['a']) dx-=player.speed*dt;
    if(keys['d']) dx+=player.speed*dt;

    // Rotate relative to yaw
    const sin = Math.sin(player.yaw), cos=Math.cos(player.yaw);
    const nx = player.pos.x + dx*cos - dz*sin;
    const nz = player.pos.y + dx*sin + dz*cos;

    if(!collidesAt(nx, player.pos.y)) player.pos.x = nx;
    if(!collidesAt(player.pos.x, nz)) player.pos.y = nz;

    camera.position.set(player.pos.x, CONFIG.playerHeight, player.pos.y);
    camera.rotation.set(player.pitch, player.yaw, 0);

    // Update minimap player position
    drawMinimap();

    // Random jumpscare chance
    if(Math.random()<0.0009) triggerJumpscare();

    // Update debug overlay
    updateDebug();

    // Render check
    try {
      renderer.render(scene, camera);
      console.log('[DEBUG] Scene rendered successfully.');
    } catch (error) {
      logDebugError(`Rendering failed: ${error}`);
    }

    requestAnimationFrame(animate);
  }

})();
