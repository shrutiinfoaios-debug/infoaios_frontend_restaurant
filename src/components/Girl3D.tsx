import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const LiveDashboard = () => {
  const [orders, setOrders] = useState([
    { id: '#1234', item: 'Pizza Margherita', status: 'Preparing' },
    { id: '#1235', item: 'Caesar Salad', status: 'Ready' },
    { id: '#1236', item: 'Pasta Carbonara', status: 'Delivered' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prev => {
        const statuses = ['Preparing', 'Ready', 'Delivered'];
        return prev.map(order => ({
          ...order,
          status: statuses[Math.floor(Math.random() * statuses.length)]
        }));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '8px',
      fontSize: '6px',
      color: 'white',
      fontFamily: 'monospace',
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '4px', fontWeight: 'bold', fontSize: '7px' }}>LIVE ORDERS</div>
      {orders.map((order, i) => (
        <div key={order.id} style={{ 
          marginBottom: '3px', 
          padding: '3px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '5px'
        }}>
          <span>{order.id}</span>
          <span style={{ 
            color: order.status === 'Delivered' ? '#4ade80' : 
                   order.status === 'Ready' ? '#fbbf24' : '#60a5fa'
          }}>
            {order.status}
          </span>
        </div>
      ))}
      <div style={{ 
        marginTop: '6px', 
        padding: '3px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        textAlign: 'center',
        fontSize: '5px',
        animation: 'pulse 2s infinite'
      }}>
        📊 Real-time Updates
      </div>
    </div>
  );
};

const Girl3DModel = () => {
  const groupRef = useRef<THREE.Group>(null);
  const phoneRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      {/* Modern Office Chair Base with wheels */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.12, 32]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Chair wheels */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <mesh 
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 0.45,
            -0.95,
            Math.sin((angle * Math.PI) / 180) * 0.45
          ]}
          castShadow
        >
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
      ))}

      {/* Chair pole */}
      <mesh position={[0, -0.55, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.6, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
      </mesh>

      {/* Ergonomic chair seat */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.12, 0.55]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0, -0.18, 0.05]} castShadow>
        <boxGeometry args={[0.58, 0.1, 0.5]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Chair backrest */}
      <mesh position={[0, 0.4, -0.22]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.9, 0.1]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0, 0.42, -0.18]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.52, 0.85, 0.08]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* Chair armrests */}
      <mesh position={[-0.32, 0.05, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.45]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.32, 0.05, 0]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.45]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Lower Body - sitting naturally */}
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 3.5, 0, 0]} castShadow>
        <boxGeometry args={[0.45, 0.18, 0.65]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Coral/red shirt body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.55, 0.7, 0.32]} />
        <meshStandardMaterial color="#e57373" />
      </mesh>

      {/* Shirt collar */}
      <mesh position={[-0.08, 0.98, 0.15]} rotation={[0, -0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>
      <mesh position={[0.08, 0.98, 0.15]} rotation={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshStandardMaterial color="#d32f2f" />
      </mesh>

      {/* Shirt sleeves */}
      <mesh position={[-0.3, 0.65, 0]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#e57373" />
      </mesh>
      <mesh position={[0.3, 0.65, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#e57373" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.12, 0.18, 16]} />
        <meshStandardMaterial color="#f5d0b0" />
      </mesh>

      {/* Realistic head with better proportions */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#ffd4b8" roughness={0.8} />
      </mesh>

      {/* Professional long hair with volume */}
      <mesh position={[0, 1.55, -0.12]} castShadow>
        <sphereGeometry args={[0.38, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.3]} />
        <meshStandardMaterial color="#1a0f0a" roughness={0.4} />
      </mesh>
      
      {/* Hair ponytail - long and styled */}
      <mesh position={[0, 1.42, -0.42]} rotation={[0.6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.08, 0.7, 16]} />
        <meshStandardMaterial color="#1a0f0a" roughness={0.4} />
      </mesh>

      {/* Front bangs */}
      <mesh position={[0, 1.48, 0.22]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.15, 0.08]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>

      {/* Side hair volume */}
      <mesh position={[-0.3, 1.42, 0]} rotation={[0, 0.2, 0.15]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.18]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>
      <mesh position={[0.3, 1.42, 0]} rotation={[0, -0.2, -0.15]} castShadow>
        <boxGeometry args={[0.12, 0.35, 0.18]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>

      {/* Big expressive eyes */}
      <mesh position={[-0.11, 1.38, 0.32]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#4a2511" />
      </mesh>
      <mesh position={[0.11, 1.38, 0.32]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#4a2511" />
      </mesh>

      {/* Eye highlights for life */}
      <mesh position={[-0.09, 1.4, 0.35]} castShadow>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.13, 1.4, 0.35]} castShadow>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>

      {/* Black pupils */}
      <mesh position={[-0.11, 1.38, 0.34]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.11, 1.38, 0.34]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Styled eyebrows */}
      <mesh position={[-0.11, 1.46, 0.32]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.14, 0.025, 0.02]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>
      <mesh position={[0.11, 1.46, 0.32]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.14, 0.025, 0.02]} />
        <meshStandardMaterial color="#1a0f0a" />
      </mesh>

      {/* Cute nose */}
      <mesh position={[0, 1.3, 0.34]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#ffb89d" />
      </mesh>

      {/* Friendly smile */}
      <mesh position={[0, 1.21, 0.33]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.09, 0.02, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#ff6b9d" />
      </mesh>

      {/* Rosy cheeks */}
      <mesh position={[-0.2, 1.28, 0.28]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffb8c5" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.2, 1.28, 0.28]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#ffb8c5" transparent opacity={0.6} />
      </mesh>

      {/* Left Arm - resting on desk */}
      <mesh position={[-0.38, 0.58, 0.25]} rotation={[0.7, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.075, 0.065, 0.55, 16]} />
        <meshStandardMaterial color="#e57373" />
      </mesh>
      <mesh position={[-0.42, 0.25, 0.48]} rotation={[1.4, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.18, 16]} />
        <meshStandardMaterial color="#ffd4b8" />
      </mesh>
      {/* Left hand */}
      <mesh position={[-0.45, 0.15, 0.58]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffd4b8" />
      </mesh>

      {/* Right Arm - using headset microphone */}
      <mesh position={[0.38, 0.65, 0.18]} rotation={[0.6, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.075, 0.065, 0.55, 16]} />
        <meshStandardMaterial color="#e57373" />
      </mesh>
      <mesh position={[0.48, 0.35, 0.38]} rotation={[1.2, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.065, 0.055, 0.18, 16]} />
        <meshStandardMaterial color="#ffd4b8" />
      </mesh>
      {/* Right hand on desk */}
      <mesh position={[0.52, 0.15, 0.52]} castShadow>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ffd4b8" />
      </mesh>

      {/* Professional headset */}
      <group position={[0, 1.35, 0]}>
        {/* Headband */}
        <mesh position={[0, 0.08, -0.05]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.38, 0.025, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} />
        </mesh>
        {/* Headband padding */}
        <mesh position={[0, 0.15, -0.05]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.08, 0.04]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
        {/* Left earpiece */}
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.06]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
        </mesh>
        <mesh position={[-0.32, 0, 0.02]} castShadow>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
        {/* Right earpiece */}
        <mesh position={[0.35, 0, 0]} rotation={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.06]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
        </mesh>
        <mesh position={[0.32, 0, 0.02]} castShadow>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#2d2d2d" />
        </mesh>
        {/* Microphone boom */}
        <mesh position={[0.32, -0.05, 0.15]} rotation={[0, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} />
        </mesh>
        {/* Microphone head with active indicator */}
        <group ref={phoneRef} position={[0.42, -0.18, 0.25]}>
          <mesh castShadow>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
          </mesh>
          {/* Active call indicator - green light */}
          <mesh position={[0, 0, 0.032]}>
            <sphereGeometry args={[0.015, 16, 16]} />
            <meshStandardMaterial color="#00e676" emissive="#00e676" emissiveIntensity={2} />
          </mesh>
        </group>
      </group>

      {/* Professional desk - larger and more realistic */}
      <mesh position={[0, -0.05, 0.7]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.1, 1.1]} />
        <meshStandardMaterial color="#6b4423" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Desk edge trim */}
      <mesh position={[0, 0, 1.25]} castShadow>
        <boxGeometry args={[2.2, 0.08, 0.06]} />
        <meshStandardMaterial color="#5a3a1e" />
      </mesh>

      {/* Large desktop monitor - professional setup */}
      <mesh position={[-0.05, 0.08, 0.58]} castShadow>
        <boxGeometry args={[0.15, 0.02, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
      </mesh>
      {/* Monitor stand base */}
      <mesh position={[-0.05, 0.02, 0.58]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.02, 32]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.7} />
      </mesh>

      {/* Large monitor screen */}
      <mesh position={[-0.05, 0.5, 0.55]} castShadow>
        <boxGeometry args={[1.1, 0.7, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Monitor bezel */}
      <mesh position={[-0.05, 0.5, 0.57]} castShadow>
        <boxGeometry args={[1.05, 0.65, 0.01]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Live dashboard on large monitor */}
      <Html
        position={[-0.05, 0.5, 0.575]}
        transform
        occlude
        style={{
          width: '420px',
          height: '260px',
          pointerEvents: 'none'
        }}
      >
        <LiveDashboard />
      </Html>

      {/* Wall clock behind */}
      <group position={[0.9, 1.4, -0.5]}>
        {/* Clock background - turquoise */}
        <mesh castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.05, 32]} />
          <meshStandardMaterial color="#80deea" />
        </mesh>
        {/* Clock face */}
        <mesh position={[0, 0, 0.03]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.01, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Hour hand */}
        <mesh position={[0, 0.05, 0.04]} rotation={[0, 0, Math.PI / 6]} castShadow>
          <boxGeometry args={[0.02, 0.12, 0.01]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Minute hand */}
        <mesh position={[0.02, 0.08, 0.04]} rotation={[0, 0, Math.PI / 3]} castShadow>
          <boxGeometry args={[0.015, 0.16, 0.01]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Center dot */}
        <mesh position={[0, 0, 0.045]}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {/* Professional chat bubbles - AI Restaurant theme */}
      <group position={[-0.95, 1.75, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.65, 0.24, 0.06]} />
          <meshStandardMaterial color="#1e3a5f" opacity={0.95} transparent />
        </mesh>
        <Text
          position={[0, 0, 0.035]}
          fontSize={0.07}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.6}
        >
          Restaurant AI{'\n'}Receptionist
        </Text>
      </group>

      <group position={[0.85, 1.65, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.2, 0.05]} />
          <meshStandardMaterial color="#10b981" opacity={0.95} transparent />
        </mesh>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Taking orders...
        </Text>
      </group>

      <group position={[0.75, 1.3, 0.25]}>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
        </mesh>
      </group>

      <group position={[0.95, 1.05, 0.3]}>
        <mesh castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#f87171" emissive="#f87171" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
};

export const Girl3D = () => {
  useEffect(() => {
    console.log('Girl3D component mounted');
    
    return () => {
      console.log('Girl3D component unmounted');
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <Canvas
        shadows
        camera={{ position: [0, 1, 4], fov: 60 }}
        style={{ background: '#f5f5f5' }}
        onCreated={({ gl }) => {
          console.log('Canvas created successfully');
          gl.setClearColor('#f5f5f5');
        }}
        frameloop="demand"
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        }}
      >
        <color attach="background" args={['#f5f5f5']} />
        
        {/* Enhanced but optimized Lights */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={0.8} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <hemisphereLight intensity={0.4} groundColor="#666666" />

        {/* 3D Girl Model */}
        <Girl3DModel />

        {/* Interactive Controls with reduced complexity */}
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={7}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          autoRotate={false}
          enableDamping={false}
        />

        {/* Turquoise/cyan background blob */}
        <mesh position={[-1.5, 1.2, -2.8]} receiveShadow>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshStandardMaterial 
            color="#80deea" 
            emissive="#4dd0e1" 
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Background wall */}
        <mesh position={[0, 0, -3]} receiveShadow>
          <planeGeometry args={[15, 15]} />
          <meshStandardMaterial 
            color="#f5f5f5" 
            emissive="#e0f7fa" 
            emissiveIntensity={0.1}
          />
        </mesh>
      </Canvas>

      {/* Instruction text */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none">
        <p className="text-[10px] sm:text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-border/30">
          🖱️ Drag to rotate • 🔍 Scroll to zoom • ✋ Right-click to pan
        </p>
      </div>
    </div>
  );
};
