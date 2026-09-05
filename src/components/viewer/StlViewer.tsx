"use client"

import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Center } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { Suspense, useEffect, useState, useRef } from 'react'
import * as THREE from 'three'
import { 
  RotateCw, 
  Grid, 
  Layers, 
  RefreshCw,
  Box,
  Maximize2
} from 'lucide-react'

interface StlViewerProps {
  modelUrl: string
  color?: string
  bedSize?: { x: number; y: number; z: number }
  modelDimensions?: { x: number; y: number; z: number; volume?: number }
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
        metalness={0.15}
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
      {/* Textured PEI Spring Steel Bed Surface */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[x, 1, z]} />
        <meshStandardMaterial color="#0f141f" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Laser Precision Coordinate Grid */}
      <gridHelper args={[Math.max(x, z), 20, '#10b981', '#1e293b']} position={[0, 0.1, 0]} />

      {/* Build Volume Boundary Wireframe */}
      <mesh position={[0, y / 2, 0]}>
        <boxGeometry args={[x, y, z]} />
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  )
}

export default function StlViewer({
  modelUrl,
  color = '#10b981',
  bedSize = { x: 220, y: 220, z: 250 },
  modelDimensions
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
    <div className="relative w-full h-[460px] bg-[#090b10] rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-2xl group">
      {/* CAD HUD Coordinate Markers */}
      <div className="absolute top-3 left-3 text-slate-400 dark:text-slate-600 font-mono text-[10px] pointer-events-none select-none z-10">
        ┌ POS [0, 0]
      </div>
      <div className="absolute top-3 right-3 text-slate-400 dark:text-slate-600 font-mono text-[10px] pointer-events-none select-none z-10">
        CAM // 3D ┐
      </div>

      {/* Chamber Top Info Bar */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 glass-panel px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-600 dark:text-slate-300 z-10 flex items-center gap-3 shadow-lg">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          CHAMBER // ONLINE
        </span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="text-slate-500 dark:text-slate-400">BED: 60°C</span>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{bedSize.x}×{bedSize.y}×{bedSize.z} MM</span>
      </div>

      {/* Corner Dimension Widget if available */}
      {modelDimensions && (
        <div className="absolute top-14 right-3 glass-panel p-2.5 rounded-xl border border-white/10 z-10 text-[10px] font-mono text-slate-300 hidden sm:flex flex-col gap-0.5 pointer-events-none">
          <span className="text-slate-500 uppercase">Размеры детали</span>
          <span className="font-bold text-white">{modelDimensions.x}×{modelDimensions.y}×{modelDimensions.z} мм</span>
          {modelDimensions.volume && (
            <span className="text-emerald-400 font-semibold">{modelDimensions.volume} см³</span>
          )}
        </div>
      )}

      {/* 3D Canvas Viewport */}
      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-[#090b10] z-10 font-mono">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            ЗАГРУЗКА 3D-СЕТКИ...
          </p>
        </div>
      }>
        <Canvas
          key={key}
          shadows
          camera={{ position: [110, 110, 110], fov: 45 }}
          onError={(e: any) => setLoadingError(e?.message || 'Не удалось инициализировать 3D-сцену')}
        >
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[15, 30, 20]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight position={[-15, -30, -20]} intensity={0.4} color="#06b6d4" />
          <pointLight position={[0, 60, 0]} intensity={0.8} color="#10b981" />

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
            autoRotateSpeed={1.0}
            makeDefault
          />
        </Canvas>
      </Suspense>

      {/* Floating HUD Island Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-white/10 z-20 flex items-center gap-2 shadow-2xl backdrop-blur-xl">
        {/* Wireframe toggle */}
        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          title="Сетка полигонов (Wireframe)"
          className={`p-2 rounded-xl text-xs font-mono transition flex items-center gap-1.5 ${
            wireframe 
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-glow-emerald' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
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
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
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
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'text-slate-400 hover:text-white hover:bg-white/10'
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
          className="p-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-white/10 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Сброс</span>
        </button>
      </div>

      {/* Viewport Control Tips */}
      <div className="absolute bottom-4 left-6 hidden lg:block font-mono text-[9px] text-slate-400 dark:text-slate-600 pointer-events-none select-none">
        [ЛКМ: ВРАЩЕНИЕ // ПКМ: ПАНОРАМА // СКРОЛЛ: ЗУМ]
      </div>

      {loadingError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#090b10]/95 text-red-400 p-6 text-center z-30 font-mono">
          <div>
            <p className="font-bold text-sm">ОШИБКА РЕНДЕРИНГА STL:</p>
            <p className="text-xs text-slate-400 mt-1">{loadingError}</p>
          </div>
        </div>
      )}
    </div>
  )
}