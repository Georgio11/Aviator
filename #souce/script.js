
let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");

let startBtn = document.querySelector(".btn");
let moneyNum = document.querySelector(".input p span");
let minusBtn = document.querySelector(".minus");
let plusBtn = document.querySelector(".plus");
let modal = document.querySelector(".modal");

let container = document.querySelector(".container");
let betting = document.querySelectorAll(".betting");
let listElems = document.querySelectorAll(".lang_list li");
let animationRequestId = null;
let num = 0;
let modificateValue = 0;
let selectedBetting = 0;
let gameCount = 0;

function calculateY(x) {
    return (0.5 * x * x) / 2;
}

function calculateIntegral(a, b, n) {
    const dx = (b - a) / n;
    let integral = 0;

    for (let i = 0; i < n; i++) {
        const xLeft = a + i * dx;
        const y = calculateY(xLeft);
        integral += y * dx;
    }

    return integral;
}

const canvasWidth = 1000;
const canvasHeight = 550;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const scaleX = canvasWidth / 1000;
const scaleY = canvasHeight / 250000;

let animationStartTime;
const animationDuration = 10000; // 10 секунд
let progress = 0;
const integralThreshold = 10000; // Значення інтегралу, при якому лінію буде замальовуватися

const image = new Image();
image.src = "images/plain.webp";
const imageWidth = 130;
const imageHeight = 90;

function integrate(x) {
    return calculateIntegral(0, x, 1000); // 1000 - кількість відрізків для інтегрування
}

function shouldStopAnimation(elapsedTime) {
    if (elapsedTime >= 3000 && elapsedTime <= 9000) {
        return Math.random() < 0.005;
    }

    return elapsedTime > 9000;
}

function formatProgress(progress) {
    return (progress * 20).toFixed(2);
}

function animate(timestamp) {
    if (!animationStartTime) {
        animationStartTime = timestamp;
    }

    const elapsedTime = timestamp - animationStartTime;
    progress = elapsedTime / animationDuration;

    if (progress <= 1 && !shouldStopAnimation(elapsedTime)) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        ctx.beginPath();
        ctx.moveTo(0, canvasHeight);

        const maxX = 1000 * progress;
        for (let x = 0; x <= maxX; x++) {
            const y = calculateY(x);
            ctx.lineTo(x * scaleX, canvasHeight - y * scaleY);
        }

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        const integralValue = integrate(maxX);
        if (integralValue >= integralThreshold) {
            ctx.lineTo(maxX * scaleX, canvasHeight);
            ctx.lineTo(0, canvasHeight);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fill();
        }

        const xForImage = maxX;
        const yForImage = calculateY(xForImage);
        ctx.save();
        ctx.translate(xForImage * scaleX, canvasHeight - yForImage * scaleY);
        ctx.rotate(progress * -Math.PI / 6);
        ctx.drawImage(image, -imageWidth / 4.5, -imageHeight / 1.1, imageWidth, imageHeight);
        ctx.restore();
        const progressText = `${formatProgress(progress)}x`;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 70px CustomFont";
        ctx.fillText(progressText, canvasWidth / 2.3, canvasHeight / 2.3);

        animationRequestId = requestAnimationFrame(animate);
    } else {
        if (animationRequestId) {
            cancelAnimationFrame(animationRequestId);
        }
        setTimeout(() => {
            modal.classList.add('opacity');
        }, 1500);
    }
}

function startAnimation() {
    gameCount++;
    animationRequestId = requestAnimationFrame(animate);
    startBtn.disabled = true;
    modal.classList.add('active');
}

function updateMoneyNum() {
    moneyNum.innerHTML = num + modificateValue;
    updateMinusBtnState();
}

function updateMinusBtnState() {
    minusBtn.disabled = modificateValue <= 0;
}

function adaptationElements() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const aspectClass = aspectRatio >= 2
        ? 'modificate1'
        : aspectRatio >= 1.5
            ? 'modificate2'
            : aspectRatio > 1
                ? 'modificate3'
                : 'modificate4';

    container.className = `container ${aspectClass}`;
    modal.className = `modal ${aspectClass}`;
    updateMoneyNum();
}

adaptationElements();

window.addEventListener('resize', adaptationElements);

function updateBetting(value) {
    selectedBetting = parseFloat(value);
    modificateValue = selectedBetting;
    updateMoneyNum();
}

betting.forEach(btn => {
    btn.addEventListener('click', (e) => {
        updateBetting(e.target.textContent);
    });
});

function plus() {
    modificateValue += 0.5;
    updateMoneyNum();
}

function minus() {
    if (modificateValue > 0) {
        modificateValue -= 0.5;
        updateMoneyNum();
    }
}

startBtn.addEventListener('click', startAnimation);
plusBtn.addEventListener('click', plus);
minusBtn.addEventListener('click', minus);

