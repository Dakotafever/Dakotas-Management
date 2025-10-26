// mazemini.js - Babylon.js 3D First-Person Haunted Maze
// With debug logging and asset error handling

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
  const canvas = document.getElementById('babylon-canvas');
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
  // Debug overlay
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
    const fps = Math.round(engine.getFps());
    debugDiv.innerHTML = `
      FPS: ${fps}<br>
      Player Pos: (${camera.position.x.toFixed(2)}, ${camera.position.z.toFixed(2)})<br>
      Jumpscares: ${jumpscareCount}/${CONFIG.maxJumpscares}<br>
      Assets Loaded: ${loadedAssets}/${totalAssets}<br>
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

  // Asset loading tracking
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
  // Babylon.js Setup
  // -----------------------
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.02;

  const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(1.5, CONFIG.playerHeight, 1.5), scene);
  camera.setTarget(new BABYLON.Vector3(0, 0, 1));
  camera.attachControls(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // -----------------------
  // Maze Grid
  // -----------------------
  let grid = { cols: 0, rows: 0, cellSize: 1, cells: [] };

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

  // -----------------------
  // Collision
  // -----------------------
  function isWallAt(mx, my) {
    if (mx < 0 || my < 0 || mx >= grid.cols || my >= grid.rows) return true;
    return grid.cells[Math.floor(my)][Math.floor(mx)] === 1;
  }
  function collidesAt(x, y) {
    const r = CONFIG.playerRadius;
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

    // Floor
    const floor = BABYLON.MeshBuilder.CreateGround("floor", {width: cols, height: rows}, scene);
    floor.position = new BABYLON.Vector3(cols/2-0.5, 0, rows/2-0.5);
    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    floor.material = floorMat;

    // Walls
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(cells[r][c]===1){
          const box = BABYLON.MeshBuilder.CreateBox("wall", {width:1, height:CONFIG.wallHeight, depth:1}, scene);
          box.position = new BABYLON.Vector3(c+0.5, CONFIG.wallHeight/2, r+0.5);
          const wallMat = new BABYLON.StandardMaterial("wallMat", scene);
          wallMat.diffuseColor = new BABYLON.Color3(0.13, 0.13, 0.13);
          box.material = wallMat;
        }
      }
    }

    // Decorations
    await placeDecorations();

    drawMinimap();
    console.log('[DEBUG] Maze built successfully.');
  }

  async function placeDecorations() {
    console.log('[DEBUG] Placing decorations...');
    totalAssets += CONFIG.decorImages.length;
    for(let i=0;i<15;i++){
      const r = Math.floor(Math.random()*grid.rows);
      const c = Math.floor(Math.random()*grid.cols);
      if(grid.cells[r][c]===0){
        const imgIndex = Math.floor(Math.random()*CONFIG.decorImages.length);
        const imgPath = CONFIG.decorImages[imgIndex];
        try {
          const tex = new BABYLON.Texture(imgPath, scene);
          tex.onLoadObservable.add(() => trackAssetLoad(true, 'texture', imgPath));
          tex.onErrorObservable.add(() => trackAssetLoad(false, 'texture', imgPath));
          const spr = BABYLON.MeshBuilder.CreatePlane("decor", {width:0.7, height:0.7}, scene);
          spr.position = new BABYLON.Vector3(c+0.5, 1.2, r+0.5);
          const mat = new BABYLON.StandardMaterial("decorMat", scene);
          mat.diffuseTexture = tex;
          spr.material = mat;
        } catch (error) {
          logDebugError(`Skipping decoration due to load failure: ${imgPath} - ${error}`);
        }
      }
    }
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
    mapCtx.fillStyle = '#ff0000';
    mapCtx.fillRect(Math.floor(camera.position.x), Math.floor(camera.position.z), 1, 1);
  }

  function toggleMinimap() {
    minimapWrap.style.display = minimapWrap.style.display==='none'?'block':'none';
  }

  // -----------------------
  // VHS / Noise overlay
  // -----------------------
  let vhsEnabled = true;
  function toggleVHS(){ vhsEnabled=!vhsEnabled; vhsOverlay.style.display=vhsEnabled?'block':'none'; }

  // -----------------------
  // Jumpscares
  // -----------------------
  let jumpscareCount = 0;
  function triggerJumpscare() {
    if(jumpscareCount>=CONFIG.maxJumpscares) return;
    jumpscareCount++;
    const idx = Math.floor(Math.random()*CONFIG.jumpscareImages.length);
    jumpscareImg.src = CONFIG.jumpscareImages[idx];
    jumpscareOverlay.style.display = 'block';
    try {
      // Babylon audio (if needed, but using HTML audio for simplicity)
      const audio = new Audio(CONFIG.jumpscareAudios[idx]);
      audio.play();
    } catch (error) {
      logDebugError(`Jumpscare audio failed: ${error}`);
    }
    setTimeout(() => jumpscareOverlay.style.display='none', CONFIG.jumpscareDurationRange[0] + Math.random()*(CONFIG.jumpscareDurationRange[1]-CONFIG.jumpscareDurationRange[0]));
  }

  // -----------------------
  // Ambient sounds
  // -----------------------
  function playAmbient() {
    const idx = Math.floor(Math.random()*CONFIG.ambientList.length);
    try {
      const audio = new Audio(CONFIG.ambientList[idx]);
      audio.volume = 0.35;
      audio.play();
      setTimeout(playAmbient, CONFIG.ambientIntervalMin + Math.random()*(CONFIG.ambientIntervalMax - CONFIG.ambientIntervalMin));
    } catch (error) {
      logDebugError(`Ambient audio failed: ${error}`);
    }
  }

  // -----------------------
  // Start Game
  // -----------------------
  startBtn.addEventListener('click', async () => {
    console.log('[DEBUG] Start button clicked, initializing game...');
    intro.style.display = 'none';
    canvas.requestPointerLock?.();
    await buildGridFromMaze();
    playAmbient();
    engine.runRenderLoop(() => {
      // Movement
      const speed = 3.2;
      const dt = engine.getDeltaTime() / 1000;
      let dx = 0, dz = 0;
      if (keys['w']) dz -= speed * dt;
      if (keys['s']) dz += speed * dt;
      if (keys['a']) dx -= speed * dt;
      if (keys['d']) dx += speed * dt;

      // Rotate relative to yaw
      const sin = Math.sin(camera.rotation.y), cos = Math.cos(camera.rotation.y);
      const nx = camera.position.x + dx * cos - dz * sin;
      const nz = camera.position.z + dx * sin + dz * cos;

      if (!collidesAt(nx, camera.position.z)) camera.position.x = nx;
      if (!collidesAt(camera.position.x, nz)) camera.position.z = nz;

      // Update minimap
      drawMinimap();

      // Random jumpscare chance
      if (Math.random() < 0.0009) triggerJumpscare();

      // Update debug overlay
      updateDebug();

      // Render scene
      scene.render();
    });
  });

  // -----------------------
  // Window Resize
  // -----------------------
  window.addEventListener('resize', () => {
    engine.resize();
  });

})();
