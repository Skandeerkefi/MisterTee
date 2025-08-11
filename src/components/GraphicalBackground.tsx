import { useEffect, useRef } from "react";

export function GraphicalBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas dimensions to match window
		const resizeCanvas = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		// Initialize
		resizeCanvas();
		window.addEventListener("resize", resizeCanvas);

		// Create particles
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
		const particleCount = 50;
		const colors = [
			"rgba(255, 0, 0, ",
			"rgba(255, 255, 255, ",
			"rgba(100, 100, 100, ",
		];

		// Create initial particles
		for (let i = 0; i < particleCount; i++) {
			const color = colors[Math.floor(Math.random() * colors.length)];
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: Math.random() * 3 + 1,
				speedX: (Math.random() - 0.5) * 0.5,
				speedY: (Math.random() - 0.5) * 0.5,
				color,
				alpha: Math.random() * 0.5 + 0.1,
			});
		}

		// Animation
		let animationFrameId: number;

		const render = () => {
			// Clear canvas with slight transparency for trailing effect
			ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Update and draw particles
			particles.forEach((particle) => {
				// Move particle
				particle.x += particle.speedX;
				particle.y += particle.speedY;

				// Wrap around edges
				if (particle.x > canvas.width) particle.x = 0;
				if (particle.x < 0) particle.x = canvas.width;
				if (particle.y > canvas.height) particle.y = 0;
				if (particle.y < 0) particle.y = canvas.height;

				// Draw particle
				ctx.beginPath();
				ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
				ctx.fillStyle = `${particle.color}${particle.alpha})`;
				ctx.fill();
			});

			// Draw connecting lines between nearby particles
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x;
					const dy = particles[i].y - particles[j].y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < 100) {
						// Make line opacity based on distance
						const opacity = 0.1 * (1 - distance / 100);
						ctx.strokeStyle = `rgba(255, 0, 0, ${opacity})`;
						ctx.lineWidth = 0.5;
						ctx.beginPath();
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.stroke();
					}
				}
			}

			animationFrameId = requestAnimationFrame(render);
		};

		render();

		// Cleanup
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
