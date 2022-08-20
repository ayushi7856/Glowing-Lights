const svg = document.querySelector("svg");
const gubbins = document.querySelector("#gubbins");
const cableCont = document.querySelector("#cableCont");
const svgns = "http://www.w3.org/2000/svg";
const defs = document.createElementNS(svgns, "defs");
const cable = document.querySelector(".cable");
svg.appendChild(defs);
const button = document.querySelector(".button");

let tension = 1.3;
let numOfPoints = 22;

let randomBulb = gsap.utils.random(4, numOfPoints - 6, 2);

// hard coding some values for the start of the lights curve
let points = [175, 95, 175, 120, 175, 150];

let x = points[4];
let y = points[5];

let goingRight;
let goingUp;
let hasDoneRender;

let tl = gsap.timeline({ paused: true });
function addTimeline() {
	let brokenBulb = document.querySelector(".bulb:nth-of-type(4)");
	let brokenGlow = document.querySelector(".glow:nth-of-type(4)");
	tl
		.to(".bulb", {
			stagger: 0.07,
			"mix-blend-mode": "screen"
		})
		.to(
			".glow",
			{
				stagger: 0.07,
				opacity: 0.8
			},
			"<"
		)
		.to(".broken-bulb", {
			duration: 2,
			opacity: 0.1,
			"mix-blend-mode": "screen",
			yoyo: true,
			ease: RoughEase.ease.config({ points: 50, strength: 2, clamp: true })
		})
		.to(
			".broken-glow",
			{
				duration: 2,
				opacity: 1,
				yoyo: true,
				ease: RoughEase.ease.config({ points: 50, strength: 2, clamp: true })
			},
			"<"
		)
		.to(".broken-glow", {
			opacity: 0
		})
		.to(
			".broken-bulb",
			{
				opacity: 0.8,
				fill: "grey",
				"mix-blend-mode": "unset"
			},
			"<"
		);
}

function calcAngle(opp, adj) {
	return Math.atan(opp / adj);
}

function addGradient(loopCount) {
	var stops = [
		{
			color: `hsl(${loopCount * 10} 100% 100%)`,
			offset: "0%"
		},
		{
			color: `hsl(${loopCount * 10} 100% 80%)`,
			offset: "20%"
		},
		{
			color: `hsla(${loopCount * 10}, 100%, 80%, 0)`,
			offset: "100%"
		}
	];

	var gradient = document.createElementNS(svgns, "radialGradient");

	for (var i = 0, length = stops.length; i < length; i++) {
		var stop = document.createElementNS(svgns, "stop");
		stop.setAttribute("offset", stops[i].offset);
		stop.setAttribute("stop-color", stops[i].color);

		gradient.appendChild(stop);

		gradient.id = `gradient-${loopCount}`;
		gradient.setAttribute("x1", "0");
		gradient.setAttribute("x2", "0");
		gradient.setAttribute("y1", "0");
		gradient.setAttribute("y2", "1");
		defs.appendChild(gradient);
	}
}

function makeDot(xVal, yVal, color = "#3a3337", radius = "2", hook) {
	const dot = document.createElementNS(svgns, "circle");

	let pointx = xVal.toString();
	let pointy = yVal.toString();

	dot.setAttribute("cy", pointy);
	dot.setAttribute("cx", pointx);
	dot.setAttribute("r", radius);
	dot.setAttribute("fill", color);
	dot.classList.add(hook);

	cableCont.appendChild(dot);
}

function orderlyTanglez(num, isY) {
	if (isY) {
		if (num < 70) {
			goingUp = false;
			num = num + 60;
		}
		if (num > 190) {
			goingUp = true;
			num = num - 60;
		}
	} else {
		if (num < 20) {
			goingRight = true;
			num = num + 60;
		}
		if (num > 160) {
			goingRight = false;
			num = num - 60;
		}
	}
	return num;
}

function makePoints() {
	for (i = 0; i < numOfPoints; i++) {
		let newX;
		let newY;
		if (i % 2 == 0) {
			if (goingRight) {
				newX = x + gsap.utils.random([40, 30, 20, 30]);
				newY = y;
			} else {
				newX = x + gsap.utils.random([-35, -25, -15, -25]);
				newY = y;
			}
		} else {
			if (goingUp) {
				newY = y + gsap.utils.random([-27, -27, -37, 27, 37]);
				newX = x;
			} else {
				newY = y + gsap.utils.random([22, -22, 41, 36, -36]);
				newX = x;
			}
		}

		newX = orderlyTanglez(newX);
		newY = orderlyTanglez(newY, true);

		points.push(newX, newY);
		x = newX;
		y = newY;
	}
}

function solve(points, tension) {
	if (points.length < 1) return "M0 0";
	if (tension == null) tension = 1;

	var size = points.length;

	var path = "M" + [points[0], points[1]];

	for (var i = 0; i < size - 6; i += 2) {
		var x0 = points[(i + 0) % size];
		var y0 = points[(i + 1) % size];
		var x1 = points[(i + 2) % size];
		var y1 = points[(i + 3) % size];
		var x2 = points[(i + 4) % size];
		var y2 = points[(i + 5) % size];
		var x3 = points[(i + 6) % size];
		var y3 = points[(i + 7) % size];

		var cp1x = x1 + ((x2 - x0) / 6) * tension;
		var cp1y = y1 + ((y2 - y0) / 6) * tension;

		var cp2x = x2 - ((x3 - x1) / 6) * tension;
		var cp2y = y2 - ((y3 - y1) / 6) * tension;

		path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];

		if (i > 1 && !hasDoneRender) {
			makeDot(x2, y2);

			let color = `hsl(${i * 10} 80% 70%)`;

			const bulb = document.createElementNS(svgns, "path");
			bulb.setAttribute(
				"d",
				`M${x2},${y2}c2,0,5,0,5,-5s-3,-9,-4,-9s-5,4,-5,9s3,5,4,5z`
			);
			bulb.setAttribute("fill", color);

			addGradient(i);

			const glow = document.createElementNS(svgns, "circle");

			let pointx = x2.toString();
			let pointy = y2.toString();

			glow.setAttribute("cy", pointy);
			glow.setAttribute("cx", pointx);
			glow.setAttribute("r", "20");
			glow.setAttribute("fill", `url(#gradient-${i})`);

			console.log(i, randomBulb);
			if (i === randomBulb) {
				bulb.classList.add("broken-bulb");
				glow.classList.add("broken-glow");
			} else {
				bulb.classList.add("bulb");
				glow.classList.add("glow");
			}

			gubbins.appendChild(glow);

			const opposite = cp2x - x2;
			const adjacent = cp2y - y2;
			let angle = calcAngle(opposite, adjacent) * (180 / Math.PI);

			angle = ((angle + 360 + 90) % 360) + 180;

			let lastLoop = points.length - 8;
			if (i === lastLoop) {
				bulb.setAttribute("transform", `rotate(${angle})`);

				gubbins.appendChild(bulb);

				addTimeline();
			} else {
				let randomRotation = gsap.utils.random([-90, 90]);
				bulb.setAttribute("transform", `rotate(${angle + randomRotation})`);

				gubbins.appendChild(bulb);
			}
		}
	}
	cable.setAttribute("d", path);
}

makePoints();
solve(points, tension);

Draggable.create("#plug", {
	type: "x,y",
	edgeResistance: 0.65,
	bounds: "#svg",
	inertia: true,
	liveSnap: {
		radius: 15,
		points: [
			{ x: 0, y: 0 },
			{ x: -10, y: -60 }
		]
	},
	onDragStart: function (e) {
		if (this.hitTest("#socket", "100%")) {
			tl.seek(0).pause();
		}
	},
	onDragEnd: function (e) {
		if (this.hitTest("#socket", "100%")) {
			tl.play();
		}
	},
	onDrag: function (e) {
		hasDoneRender = true;

		points[0] = this.x + 175;
		points[1] = this.y + 95;
		points[2] = this.x + 175;
		points[3] = this.y + 120;

		if (this.x < 0) {
			if (this.y > 0) {
				let rotation = ((this.y - this.x) / 2) * -1;
				gsap.set("#plug", {
					rotate: rotation,
					transformOrigin: "50% 100%"
				});
			} else {
				let rotation = ((this.y - this.x) / 2) * -1;
				gsap.set("#plug", {
					rotate: rotation,
					transformOrigin: "50% 100%"
				});
			}
		}

		solve(points, tension);

		if (this.hitTest("#socket")) {
			gsap.set("#plug", {
				rotate: 0,
				transformOrigin: "50% 100%"
			});
		}
	}
});
