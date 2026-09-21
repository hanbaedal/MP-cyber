"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Html } from "@react-three/drei";
import { Suspense } from "react";

type Theme = "modern" | "traditional" | "park" | "cafe";

const THEME_COLORS: Record<
  Theme,
  { wall: string; floor: string; accent: string; light: string }
> = {
  modern: {
    wall: "#d7e2e4",
    floor: "#8a9a9e",
    accent: "#2f5d62",
    light: "#fff6e8",
  },
  traditional: {
    wall: "#ebe0d0",
    floor: "#6b4f3a",
    accent: "#8b3a2a",
    light: "#ffe8c8",
  },
  park: {
    wall: "#c9d9c4",
    floor: "#5d7a56",
    accent: "#3d5c45",
    light: "#f4ffe8",
  },
  cafe: {
    wall: "#e8d9cc",
    floor: "#7a5c48",
    accent: "#5c4033",
    light: "#fff0df",
  },
};

function Room({
  theme,
  name,
  portraitUrl,
}: {
  theme: Theme;
  name: string;
  portraitUrl?: string;
}) {
  const c = THEME_COLORS[theme] || THEME_COLORS.modern;

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 3.2, 1]} intensity={1.4} color={c.light} />
      <spotLight position={[0, 4, 2]} angle={0.5} penumbra={0.6} intensity={1.2} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={c.floor} />
      </mesh>

      {/* back wall */}
      <mesh position={[0, 2.2, -4]}>
        <boxGeometry args={[10, 4.5, 0.2]} />
        <meshStandardMaterial color={c.wall} />
      </mesh>
      {/* side walls */}
      <mesh position={[-5, 2.2, 0]}>
        <boxGeometry args={[0.2, 4.5, 10]} />
        <meshStandardMaterial color={c.wall} />
      </mesh>
      <mesh position={[5, 2.2, 0]}>
        <boxGeometry args={[0.2, 4.5, 10]} />
        <meshStandardMaterial color={c.wall} />
      </mesh>

      {/* altar table */}
      <mesh position={[0, 0.55, -2.6]}>
        <boxGeometry args={[2.4, 0.7, 0.9]} />
        <meshStandardMaterial color="#4a3b32" />
      </mesh>

      {/* portrait frame */}
      <mesh position={[0, 1.7, -2.95]}>
        <boxGeometry args={[1.15, 1.45, 0.08]} />
        <meshStandardMaterial color="#2a2420" />
      </mesh>
      <mesh position={[0, 1.7, -2.9]}>
        <planeGeometry args={[1, 1.25]} />
        <meshStandardMaterial color="#cfc6bb" />
      </mesh>

      {/* candles */}
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.2}>
        <mesh position={[-0.75, 1.05, -2.35]}>
          <cylinderGeometry args={[0.05, 0.06, 0.35, 12]} />
          <meshStandardMaterial color="#f2efe8" emissive="#ffb347" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0.75, 1.05, -2.35]}>
          <cylinderGeometry args={[0.05, 0.06, 0.35, 12]} />
          <meshStandardMaterial color="#f2efe8" emissive="#ffb347" emissiveIntensity={0.35} />
        </mesh>
      </Float>

      {/* flower pots */}
      <mesh position={[-1.4, 0.95, -2.4]}>
        <cylinderGeometry args={[0.18, 0.14, 0.25, 16]} />
        <meshStandardMaterial color={c.accent} />
      </mesh>
      <mesh position={[1.4, 0.95, -2.4]}>
        <cylinderGeometry args={[0.18, 0.14, 0.25, 16]} />
        <meshStandardMaterial color={c.accent} />
      </mesh>

      {/* bench */}
      <mesh position={[0, 0.35, 1.2]}>
        <boxGeometry args={[2.2, 0.15, 0.55]} />
        <meshStandardMaterial color="#5a4a40" />
      </mesh>

      <Html position={[0, 3.2, -3.7]} center>
        <div
          style={{
            color: "#1f2a2c",
            fontSize: "18px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            textShadow: "0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          {name}
        </div>
      </Html>

      {portraitUrl ? (
        <Html position={[0, 0.25, -2.15]} center>
          <div style={{ color: "#6b7280", fontSize: "12px" }}>영정 · 추모의 공간</div>
        </Html>
      ) : null}

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={9}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 1.2, -1.5]}
      />
    </>
  );
}

export default function MemorialRoom3D({
  theme = "modern",
  name,
  portraitUrl,
}: {
  theme?: Theme;
  name: string;
  portraitUrl?: string;
}) {
  return (
    <div className="room3d">
      <Suspense fallback={<div className="room3d-fallback">3D 추모실 불러오는 중…</div>}>
        <Canvas camera={{ position: [0, 2.2, 5.5], fov: 50 }} shadows>
          <Room theme={theme} name={name} portraitUrl={portraitUrl} />
        </Canvas>
      </Suspense>
      <p className="room3d-hint">마우스로 드래그해 공간을 둘러보세요</p>
    </div>
  );
}
