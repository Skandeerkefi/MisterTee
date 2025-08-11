import { useEffect, useRef } from "react";

export function GraphicalBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Resize canvas
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		// Particles
		interface Particle {
			x: number;
			y: number;
			size: number;
			speedX: number;
			speedY: number;
			color: string;
			alpha: number;
		}

		const particles: Particle[] = [];
		const particleCount = 40;
		const colors = [
			"rgba(255, 0, 0, ", // red
			"rgba(255, 255, 255, ", // white
			"rgba(120, 120, 120, ", // gray
		];

		for (let i = 0; i < particleCount; i++) {
			const color = colors[Math.floor(Math.random() * colors.length)];
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: Math.random() * 2 + 1,
				speedX: (Math.random() - 0.5) * 0.3,
				speedY: (Math.random() - 0.5) * 0.3,
				color,
				alpha: Math.random() * 0.3 + 0.1,
			});
		}

		// Floating T-shirts
		interface FloatingItem {
			x: number;
			y: number;
			size: number;
			speedX: number;
			speedY: number;
			rotation: number;
			rotationSpeed: number;
			layer: number;
			opacity: number;
		}

		const tshirtImage = new Image();
		tshirtImage.src =
			"https://i.ibb.co/ksFzpHVx/Capture-d-cran-2025-08-11-133856-removebg-preview.png";

		const shirts: FloatingItem[] = [];
		const shirtCount = 25;

		for (let i = 0; i < shirtCount; i++) {
			const layer = Math.floor(Math.random() * 3); // 0 = far, 2 = close
			const baseSize = [50, 80, 120][layer];
			shirts.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: baseSize + Math.random() * 40,
				speedX: (Math.random() - 0.5) * (0.1 + layer * 0.05),
				speedY: (Math.random() - 0.5) * (0.1 + layer * 0.05),
				rotation: Math.random() * Math.PI * 2,
				rotationSpeed: (Math.random() - 0.5) * 0.002,
				layer,
				opacity: 0.3 + layer * 0.3,
			});
		}

		let time = 0;
		let animationFrameId: number;

		const render = () => {
			time += 0.01;

			// Background
			ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Particles
			particles.forEach((p) => {
				p.x += p.speedX;
				p.y += p.speedY;

				if (p.x > canvas.width) p.x = 0;
				if (p.x < 0) p.x = canvas.width;
				if (p.y > canvas.height) p.y = 0;
				if (p.y < 0) p.y = canvas.height;

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = `${p.color}${p.alpha})`;
				ctx.fill();
			});

			// Floating shirts
			shirts.forEach((shirt, idx) => {
				// Wavy motion
				shirt.x +=
					shirt.speedX + Math.sin(time + idx) * 0.1 * (shirt.layer + 1);
				shirt.y +=
					shirt.speedY + Math.cos(time + idx) * 0.1 * (shirt.layer + 1);
				shirt.rotation += shirt.rotationSpeed;

				if (shirt.x > canvas.width) shirt.x = -shirt.size;
				if (shirt.x < -shirt.size) shirt.x = canvas.width;
				if (shirt.y > canvas.height) shirt.y = -shirt.size;
				if (shirt.y < -shirt.size) shirt.y = canvas.height;

				ctx.save();
				ctx.globalAlpha = shirt.opacity;
				ctx.shadowColor = "rgba(0,0,0,0.5)";
				ctx.shadowBlur = 15;

				ctx.translate(shirt.x + shirt.size / 2, shirt.y + shirt.size / 2);
				ctx.rotate(shirt.rotation);
				ctx.drawImage(
					tshirtImage,
					-shirt.size / 2,
					-shirt.size / 2,
					shirt.size,
					shirt.size
				);
				ctx.restore();
			});

			animationFrameId = requestAnimationFrame(render);
		};

		tshirtImage.onload = () => {
			render();
		};

		return () => {
			window.removeEventListener("resize", resizeCanvas);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className='fixed top-0 left-0 w-full h-full pointer-events-none -z-10'
		/>
	);
}

export default GraphicalBackground;
