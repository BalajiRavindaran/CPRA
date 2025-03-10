import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import WalletDetailPopup from "./WalletDetailPopup";
import { Info, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import * as THREE from "three";

interface Wallet {
  id: string;
  position: [number, number, number];
  riskScore: number;
  color: string;
}

interface Transaction {
  source: string;
  target: string;
  startTime: number;
  endTime: number;
  color: string;
}

interface GlobeVisualizationProps {
  wallets?: Wallet[];
  transactions?: Transaction[];
  isSimulating?: boolean;
  onWalletSelect?: (wallet: Wallet | null) => void;
  selectedWalletId?: string;
  connectedWalletIds?: string[];
}

const GlobeVisualization = ({
  wallets = [
    {
      id: "0x8f7d...e5a2",
      position: [20, 10, 0],
      riskScore: 78,
      color: "#ef4444",
    },
    {
      id: "0x3a9c...b7d1",
      position: [-30, 40, 0],
      riskScore: 45,
      color: "#f59e0b",
    },
    {
      id: "0x6e2b...c4f8",
      position: [0, -20, 0],
      riskScore: 25,
      color: "#22c55e",
    },
    {
      id: "0x1d7f...a3e9",
      position: [50, -10, 0],
      riskScore: 62,
      color: "#f59e0b",
    },
    {
      id: "0x9b4e...d2c5",
      position: [-40, -30, 0],
      riskScore: 85,
      color: "#ef4444",
    },
  ],
  transactions = [
    {
      source: "0x8f7d...e5a2",
      target: "0x3a9c...b7d1",
      startTime: 0,
      endTime: 3000,
      color: "#ef4444",
    },
    {
      source: "0x3a9c...b7d1",
      target: "0x6e2b...c4f8",
      startTime: 1000,
      endTime: 4000,
      color: "#f59e0b",
    },
    {
      source: "0x6e2b...c4f8",
      target: "0x1d7f...a3e9",
      startTime: 2000,
      endTime: 5000,
      color: "#22c55e",
    },
    {
      source: "0x9b4e...d2c5",
      target: "0x8f7d...e5a2",
      startTime: 3000,
      endTime: 6000,
      color: "#ef4444",
    },
  ],
  isSimulating = true,
  onWalletSelect = () => {},
  selectedWalletId,
  connectedWalletIds = [],
}: GlobeVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const nodesRef = useRef<THREE.Object3D[]>([]);
  const linksRef = useRef<THREE.Line[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [localConnectedWallets, setLocalConnectedWallets] = useState<string[]>(
    [],
  );
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>(
    [],
  );
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Use the props for selection state if provided
  const effectiveSelectedWallet = selectedWalletId
    ? wallets.find((w) => w.id === selectedWalletId) || null
    : selectedWallet;
  const effectiveConnectedWallets = selectedWalletId
    ? connectedWalletIds
    : localConnectedWallets;

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight,
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    );
    camera.position.z = 150;
    cameraRef.current = camera;

    // Create a circular platform instead of a grid
    const platformGeometry = new THREE.CircleGeometry(120, 64);
    const platformMaterial = new THREE.MeshBasicMaterial({
      color: 0x111111,
      transparent: true,
      opacity: 0.5,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.rotation.x = -Math.PI / 2; // Lay flat
    platform.position.z = -5; // Slightly behind the wallets
    scene.add(platform);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);

      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        // Don't auto-rotate the scene
        // We'll only rotate when user pans

        // Animate transaction data packets
        const now = Date.now();
        transactionAnimations.current.forEach((animation, packet) => {
          // Only start animation after its start time
          if (now > animation.startTime) {
            if (animation.active) {
              // Move packet along the curve
              animation.progress += animation.speed;

              if (animation.progress >= 1) {
                // Reset with delay
                animation.active = false;
                animation.progress = 0;
                packet.visible = false;

                // Schedule reactivation
                setTimeout(() => {
                  animation.active = true;
                  packet.visible = true;
                }, animation.delay);
              } else {
                // Update position along curve
                const point = animation.curve.getPoint(animation.progress);
                packet.position.copy(point);
              }
            }
          }
        });

        // Animate selected wallet pulsing effect
        nodesRef.current.forEach((node) => {
          if (node.userData && node.userData.originalScale) {
            // This is a selected wallet with animation data
            const time = now * 0.001; // Convert to seconds
            const phase = node.userData.animationPhase || 0;

            // Pulsing scale animation
            const scale = 1 + 0.1 * Math.sin(time * 2 + phase);
            node.scale.set(scale, scale, scale);

            // Rotate slightly for sparkle effect
            node.rotation.y = time * 0.5;
          }
        });

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Setup mouse event listeners for raycasting
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x =
        ((event.clientX - rect.left) / containerRef.current.clientWidth) * 2 -
        1;
      mouse.current.y =
        -((event.clientY - rect.top) / containerRef.current.clientHeight) * 2 +
        1;
    };

    const handleMouseClick = (event: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current || !containerRef.current)
        return;

      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(nodesRef.current);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        const walletData = object.userData;

        if (walletData) {
          setSelectedWallet(walletData);
          onWalletSelect(walletData);

          // Find connected wallets based on transactions
          const connected = transactions
            .filter(
              (t) => t.source === walletData.id || t.target === walletData.id,
            )
            .map((t) => (t.source === walletData.id ? t.target : t.source));

          setLocalConnectedWallets([...new Set(connected)]);

          // Calculate screen position for popup
          const vector = new THREE.Vector3();
          vector.setFromMatrixPosition(object.matrixWorld);
          vector.project(cameraRef.current);

          const rect = containerRef.current.getBoundingClientRect();
          const x =
            ((vector.x + 1) / 2) * containerRef.current.clientWidth + rect.left;
          const y =
            (-(vector.y - 1) / 2) * containerRef.current.clientHeight +
            rect.top;

          setPopupPosition({ x, y });
        }
      } else {
        // Clicked on empty space, clear selection
        setSelectedWallet(null);
        setLocalConnectedWallets([]);
        onWalletSelect(null);
      }
    };

    containerRef.current.addEventListener("mousemove", handleMouseMove);
    containerRef.current.addEventListener("click", handleMouseClick);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }

      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
        containerRef.current.removeEventListener("click", handleMouseClick);
        try {
          if (
            rendererRef.current &&
            containerRef.current.contains(rendererRef.current.domElement)
          ) {
            containerRef.current.removeChild(rendererRef.current.domElement);
          }
        } catch (error) {
          console.error("Error removing renderer:", error);
        }
      }

      // Dispose of Three.js objects
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  // Distribute wallets in a 2D circular pattern with even spacing
  const distributeWalletsEvenly = (wallets) => {
    if (wallets.length === 0) return wallets;

    // Use a perfectly even circular distribution
    return wallets.map((wallet, index) => {
      // Calculate position in a circle
      const angleStep = (2 * Math.PI) / wallets.length;
      const angle = index * angleStep;

      // Fixed radius based on number of wallets (larger radius for more wallets)
      const radius = Math.min(80, Math.max(40, wallets.length * 1.5));

      // No randomness for perfectly even distribution
      // Convert to Cartesian coordinates (keeping z at 0 for 2D effect)
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      const z = 0; // Keep all wallets in the same plane

      return {
        ...wallet,
        position: [x, y, z],
      };
    });
  };

  // Animation data for transactions
  const transactionAnimations = useRef(new Map());

  // Set a fixed camera distance that doesn't change with zoom
  const FIXED_CAMERA_DISTANCE = 150;

  // Update 3D visualization when wallets or transactions change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous nodes and links
    if (sceneRef.current) {
      nodesRef.current.forEach((node) => {
        if (node.parent === sceneRef.current) {
          sceneRef.current.remove(node);
        }
      });

      linksRef.current.forEach((link) => {
        if (link.parent === sceneRef.current) {
          sceneRef.current.remove(link);
        }
      });
    }
    nodesRef.current = [];
    linksRef.current = [];

    // Distribute wallets evenly in 3D space
    const distributedWallets = distributeWalletsEvenly(wallets);

    // Create nodes for wallets
    distributedWallets.forEach((wallet) => {
      // Only apply selection effects if we have a selected wallet
      const hasSelection =
        selectedWalletId !== undefined && selectedWalletId !== null;
      const isSelected = hasSelection && selectedWalletId === wallet.id;
      const isConnected =
        hasSelection && connectedWalletIds.includes(wallet.id);
      const isDimmed = hasSelection && !isSelected && !isConnected;

      // Adjust size based on risk and selection status
      const baseSize =
        wallet.riskScore >= 75 ? 3 : wallet.riskScore >= 50 ? 2 : 1.5;
      const size = isSelected
        ? baseSize * 1.5
        : isConnected
          ? baseSize * 1.2
          : baseSize;

      const geometry = new THREE.SphereGeometry(size);

      // Create glow effect for selected and connected wallets
      const material = new THREE.MeshStandardMaterial({
        color: wallet.color,
        emissive: wallet.color,
        emissiveIntensity: isSelected ? 1.5 : isConnected ? 1.0 : 0.3,
        opacity: isDimmed ? 0.3 : 1,
        transparent: isDimmed,
        metalness: isSelected ? 0.8 : isConnected ? 0.5 : 0.2,
        roughness: isSelected ? 0.2 : isConnected ? 0.4 : 0.7,
      });

      const sphere = new THREE.Mesh(geometry, material);

      // Position in 3D space using the distributed positions
      sphere.position.set(
        wallet.position[0],
        wallet.position[1],
        wallet.position[2],
      );

      // Store wallet data for raycasting
      sphere.userData = wallet;

      // Add pulsing animation for selected wallet
      if (isSelected) {
        // Store original scale for animation
        sphere.userData.originalScale = { x: 1, y: 1, z: 1 };
        sphere.userData.animationPhase = Math.random() * Math.PI * 2; // Random starting phase
      }

      sceneRef.current?.add(sphere);
      nodesRef.current.push(sphere);

      // Add glow effect for selected wallet
      if (isSelected) {
        const glowGeometry = new THREE.SphereGeometry(size * 1.3);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: wallet.color,
          transparent: true,
          opacity: 0.15,
        });
        const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
        glowSphere.position.copy(sphere.position);
        sceneRef.current?.add(glowSphere);
        nodesRef.current.push(glowSphere);

        // Add second larger glow for more effect
        const outerGlowGeometry = new THREE.SphereGeometry(size * 1.8);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
          color: wallet.color,
          transparent: true,
          opacity: 0.05,
        });
        const outerGlowSphere = new THREE.Mesh(
          outerGlowGeometry,
          outerGlowMaterial,
        );
        outerGlowSphere.position.copy(sphere.position);
        sceneRef.current?.add(outerGlowSphere);
        nodesRef.current.push(outerGlowSphere);
      }
    });

    // Create links for transactions
    // Limit the number of visible links to prevent visual clutter
    const maxVisibleLinks = Math.min(200, transactions.length);
    const visibleTransactions = transactions.slice(0, maxVisibleLinks);

    // Clear previous animation data
    transactionAnimations.current.clear();

    visibleTransactions.forEach((transaction, index) => {
      const source = distributedWallets.find(
        (w) => w.id === transaction.source,
      );
      const target = distributedWallets.find(
        (w) => w.id === transaction.target,
      );

      if (!source || !target) return;

      // Create a curved line between nodes
      const sourcePos = new THREE.Vector3(
        source.position[0],
        source.position[1],
        source.position[2],
      );
      const targetPos = new THREE.Vector3(
        target.position[0],
        target.position[1],
        target.position[2],
      );

      // Create a curve with a control point for better visualization
      const midPoint = new THREE.Vector3()
        .addVectors(sourcePos, targetPos)
        .multiplyScalar(0.5);
      // Add a small arc above the plane for better visibility
      const distance = sourcePos.distanceTo(targetPos);
      midPoint.z += distance * 0.2;

      const curve = new THREE.QuadraticBezierCurve3(
        sourcePos,
        midPoint,
        targetPos,
      );

      // Create the line geometry from the curve
      const points = curve.getPoints(20);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      // Create dashed line material with animation
      const material = new THREE.LineDashedMaterial({
        color: transaction.color,
        dashSize: 3,
        gapSize: 2,
        transparent: true,
        opacity: 0.7,
      });

      const line = new THREE.Line(geometry, material);
      line.computeLineDistances(); // Required for dashed lines
      sceneRef.current?.add(line);
      linksRef.current.push(line);

      // Create animated data packet for this transaction
      const packetGeometry = new THREE.SphereGeometry(0.8);
      const packetMaterial = new THREE.MeshStandardMaterial({
        color: transaction.color,
        emissive: transaction.color,
        emissiveIntensity: 0.7,
      });
      const packet = new THREE.Mesh(packetGeometry, packetMaterial);

      // Start at source position
      packet.position.copy(sourcePos);
      sceneRef.current?.add(packet);

      // Store animation data
      transactionAnimations.current.set(packet, {
        curve,
        progress: 0,
        speed: 0.002 + Math.random() * 0.003, // Random speed for variety
        active: true,
        line,
        startTime: index * 500, // Stagger start times
        delay: Math.random() * 5000, // Random delay for restarting
      });

      nodesRef.current.push(packet); // Add to nodes for cleanup
    });

    // Position camera at a fixed distance above the 2D plane
    if (cameraRef.current) {
      // Use fixed camera distance that doesn't change with wallet count
      cameraRef.current.position.z = FIXED_CAMERA_DISTANCE;
      // Keep camera looking straight down
      cameraRef.current.position.x = 0;
      cameraRef.current.position.y = 0;
    }
  }, [
    wallets,
    transactions,
    zoom,
    effectiveSelectedWallet,
    effectiveConnectedWallets,
  ]);

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  // Apply zoom effect only when zoom changes
  useEffect(() => {
    if (cameraRef.current) {
      // Use fixed base distance that doesn't change with wallet count
      cameraRef.current.position.z = FIXED_CAMERA_DISTANCE / zoom;
    }
  }, [zoom]);

  // Close wallet detail popup and reset all highlighting
  const handleClosePopup = () => {
    setSelectedWallet(null);
    setLocalConnectedWallets([]);
    onWalletSelect(null);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 3D Markov Chain container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Risk level legend */}
      <div className="absolute top-4 right-4 bg-background/80 p-2 md:p-3 rounded-md shadow-md z-10 text-xs md:text-sm">
        <h3 className="text-sm font-medium mb-2">Risk Levels</h3>
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span className="text-xs">High (75-100)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
            <span className="text-xs">Medium (50-74)</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-xs">Low (0-49)</span>
          </div>
        </div>
      </div>

      {/* Wallet detail popup is now handled by the parent component */}
    </div>
  );
};

export default GlobeVisualization;
