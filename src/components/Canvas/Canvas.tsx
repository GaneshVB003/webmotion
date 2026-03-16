import { useRef, useEffect } from 'react'
import { useStore } from '../../store/editorStore'
import * as THREE from 'three'

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const textureRef = useRef<THREE.Texture | null>(null)
  
  const { project, currentTime, clips, assets } = useStore()

  useEffect(() => {
    if (!containerRef.current) return
    
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene
    
    const camera = new THREE.PerspectiveCamera(50, project.width / project.height, 0.1, 1000)
    camera.position.z = 5
    cameraRef.current = camera
    
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(640, 360)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer
    
    const geometry = new THREE.PlaneGeometry(4, 2.25)
    const material = new THREE.MeshBasicMaterial({ color: 0x222222 })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    meshRef.current = mesh
    
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()
    
    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    const clip = clips.find(c => currentTime >= c.startTime && currentTime < c.startTime + c.duration)
    const asset = clip ? assets.find(a => a.id === clip.assetId) : null

    if (meshRef.current && asset && asset.type === 'image') {
      const loader = new THREE.TextureLoader()
      loader.load(asset.src, (tex) => {
        tex.minFilter = THREE.LinearFilter
        textureRef.current = tex
        const mat = meshRef.current!.material as THREE.MeshBasicMaterial
        mat.map = tex
        mat.color = new THREE.Color(0xffffff)
        mat.needsUpdate = true
      })
    } else if (meshRef.current && !asset) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial
      mat.map = null
      mat.color = new THREE.Color(0x222222)
      mat.needsUpdate = true
      textureRef.current = null
    }
  }, [clips, assets, currentTime])

  return (
    <div ref={containerRef} style={{ width: 640, height: 360, background: '#000', borderRadius: 8, overflow: 'hidden' }} />
  )
}
