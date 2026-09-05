"use client"

import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Center } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Suspense, useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { 
  RotateCw, 
  Grid, 
  Eye, 
  Maximize2, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Cpu,
  Compass
} from 'lucide-react'

interface StlViewerProps {
  modelUrl: string
  color?: string
  bedSize?: { x: number; y: number; z: number }
}

function Model({ url, color, wireframe }: { url: string; color: string; wireframe: boolean }) {
  const geometry = useLoader(STLLoader, url)

  useEffect(() => {
    if (geometry) {
      geometry.computeVertexNormals()
    }
  }, [geometry])

  return (
    <mesh castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color={color}
        roughness={0.35}
        metalness={0.12}
        wireframe={wireframe}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function PrinterBed({ size, showGrid }: { size: { x: number; y: number; z: number }; showGrid: boolean }) {
  const { x, y, z } = size

  if (!showGrid) return null

  return (
    <group position={[0, -y / 2, 0]}>
      {/* PEI Spring Steel Bed Surface */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[x, 1, z]} />
        <meshStandardMaterial color="#11141c" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Illuminated Coordinate Grid */}
      <gridHelper args={[Math.max(x, z), 20, '#ff5500', '#27314a']} position={[0, 0.1, 0]} />

      {/* Build Volume Boundary Wireframe */}
      <mesh position={[0, y / 2, 0]}>
        <boxGeometry args={[x, y, z]} />
        <meshBasicMaterial
          color="#ff5500"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </group>
  )
}

export default function StlViewer({
  modelUrl,
  color = '#ff5500',
  bedSize = { x: 220, y: 220, z: 250 }
}: StlViewerProps) {
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  // Interactive HUD States
  const [wireframe, setWireframe] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    setLoadingError(null)
    setKey(prev => prev + 1)
  }, [modelUrl])

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <div className="relative w-full h-[450px] bg-carbon-950 rounded-3xl overflow-hidden border border-carbon-800 shadow-2xl group">
      {/* CAD HUD Corner Crosshairs */}
      <div className="absolute top-3 left-3 text-carbon-700 font-mono text-xs pointer-events-none select-none z-10">
        ┌ [0, 0]
      </div>
      <div className="absolute top-3 right-3 text-carbon-700 font-mono text-xs pointer-events-none select-none z-10">
        ┐
      </div>
      <div className="absolute bottom-3 left-3 text-carbon-700 font-mono text-xs pointer-events-none select-none z-10">
        └
      </div>
      <div className="absolute bottom-3 right-3 text-carbon-700 font-mono text-xs pointer-events-none select-none z-10">
        ┘
      </div>

      {/* Chamber Top Info Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-carbon-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-carbon-700/60 text-[10px] font-mono text-slate-400 z-10 flex items-center gap-3">
        <span className="flex items-center gap-1 text-cyber-lime font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-cyber-lime animate-pulse"></span>
          CHAMBER // ACTIVE
        </span>
        <span className="text-carbon-700">|</span>
        <span className="text-slate-400">BED: 60°C</span>
        <span className="text-carbon-700">|</span>
        <span className="text-industrial-400 font-semibold">{bedSize.x}×{bedSize.y}×{bedSize.z}mm</span>
      </div>

      {/* 3D Canvas Viewport */}
      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-carbon-950 z-10 font-mono">
          <div className="w-10 h-10 border-4 border-industrial-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-semibold uppercase tracking-widest text-industrial-400">
            ИНИЦИАЛИЗАЦИЯ 3D-СЕТКИ...
          </p>
        </div>
      }>
        <Canvas
          key={key}
          shadows
          camera={{ position: [110, 110, 110], fov: 45 }}
          onError={(e: any) => setLoadingError(e?.message || 'Не удалось инициализировать 3D-сцену')}
        >
          {/* Chamber LED Lighting Rig */}
          <ambientLight intensity={0.65} />
          <directionalLight
            position={[15, 30, 20]}
            intensity={1.4}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-15, -30, -20]} intensity={0.35} color="#00f0ff" />
          <pointLight position={[0, 60, 0]} intensity={0.6} color="#ff5500" />

          <Center>
            <Model url={modelUrl} color={color} wireframe={wireframe} />
          </Center>

          <PrinterBed size={bedSize} showGrid={showGrid} />

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            minDistance={20}
            maxDistance={600}
            autoRotate={autoRotate}
            autoRotateSpeed={1.2}
            makeDefault
          />
        </Canvas>
      </Suspense>

      {/* Floating Interactive Toolbar HUD */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-carbon-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-carbon-700/80 z-20 flex items-center gap-2 shadow-2xl">
        {/* Wireframe toggle */}
        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          title="Сетка полигонов (Wireframe)"
          className={`p-2 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
            wireframe 
              ? 'bg-industrial-500 text-white shadow-glow-orange-sm' 
              : 'text-slate-400 hover:text-white hover:bg-carbon-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Wireframe</span>
        </button>

        {/* Auto-rotate toggle */}
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          title="Авто-вращение"
          className={`p-2 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
            autoRotate 
              ? 'bg-carbon-800 text-cyber-lime border border-carbon-700' 
              : 'text-slate-400 hover:text-white hover:bg-carbon-800'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline text-[11px]">Вращение</span>
        </button>

        {/* Grid toggle */}
        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          title="Печатный стол и сетка"
          className={`p-2 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
            showGrid 
              ? 'bg-carbon-800 text-industrial-400 border border-carbon-700' 
              : 'text-slate-400 hover:text-white hover:bg-carbon-800'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Стол 3D</span>
        </button>

        {/* Reset Camera */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="Сброс положения камеры"
          className="p-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-carbon-800 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Сброс</span>
        </button>
      </div>

      {/* Viewport Control Instructions */}
      <div className="absolute bottom-4 left-6 hidden lg:block font-mono text-[9px] text-slate-500 pointer-events-none select-none">
        [ЛКМ: ВРАЩЕНИЕ // ПКМ: ПАНОРАМА // СКРОЛЛ: ЗУМ]
      </div>

      {loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-carbon-950/90 text-red-400 p-6 text-center z-30 font-mono">
          <div>
            <p className="font-bold text-sm">ОШИБКА РЕНДЕРИНГА STL:</p>
            <p className="text-xs text-slate-400 mt-1">{loadingError}</p>
          </div>
        </div>
      )}
    </div>
  )
}
