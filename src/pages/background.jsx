import { useEffect, useRef } from "react";

export default function StockBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Handle Resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Track Mouse for Crosshair Interaction
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Generate Initial Candlesticks
    const candles = [];
    const numCandles = Math.ceil(window.innerWidth / 40); // 1 candle every 40px

    for (let i = 0; i < numCandles; i++) {
      let lastClose = 200 + Math.random() * 300;
      candles.push(generateCandle(i * 40, lastClose));
    }

    function generateCandle(x, lastClose) {
      const change = (Math.random() - 0.5) * 60;
      const open = lastClose;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      const isGreen = close >= open;

      return { x, open, close, high, low, isGreen, speed: 0.5 + Math.random() * 0.5 };
    }

    // Animation Loop
    const render = () => {
      // Dark slate trading platform background color
      ctx.fillStyle = "#0f172a"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Interactive Crosshair
      const { x: mouseX, y: mouseY } = mouseRef.current;
      if (mouseX >= 0 && mouseY >= 0) {
        ctx.strokeStyle = "rgba(148, 163, 184, 0.15)"; // Soft slate line
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]); // Dashed line like trading view
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(0, mouseY);
        ctx.lineTo(canvas.width, mouseY);
        ctx.stroke();

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(mouseX, 0);
        ctx.lineTo(mouseX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      }

      // Draw and Update Candlesticks
      candles.forEach((c) => {
        // Move candles left to simulate live ticker movement
        c.x -= c.speed;

        // If a candle goes off-screen left, wrap it around to the right side
        if (c.x < -20) {
          c.x = canvas.width + 20;
          const leftNeighbor = candles.find(candle => candle.x > canvas.width - 60) || c;
          Object.assign(c, generateCandle(c.x, leftNeighbor.close));
        }

        const color = c.isGreen ? "rgba(34, 197, 94, 0.25)" : "rgba(239, 68, 68, 0.25)";
        const wickColor = c.isGreen ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)";
        
        ctx.lineWidth = 2;

        // Draw Wick (High/Low Line)
        ctx.strokeStyle = wickColor;
        ctx.beginPath();
        ctx.moveTo(c.x, c.low);
        ctx.lineTo(c.x, c.high);
        ctx.stroke();

        // Draw Candle Body (Open/Close Box)
        ctx.fillStyle = color;
        const bodyHeight = Math.abs(c.close - c.open) || 2; // Min 2px height
        const bodyTop = Math.min(c.open, c.close);
        ctx.fillRect(c.x - 6, bodyTop, 12, bodyHeight);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Clean up events on unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />;
}
