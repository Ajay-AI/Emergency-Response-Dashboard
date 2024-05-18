export default function animation() {
    window.onload = function () {
    
        let span = document.querySelector(".earthquake-span");

        var audio = document.getElementById("myAudio");

        function playAnimation() {
            audio.currentTime = 0;
            audio.play();
            span.style.animationPlayState = 'running';
            setTimeout(pauseAnimation, 5000);
        }

        function pauseAnimation() {
            span.style.animationPlayState = 'paused';
            audio.pause();
            setTimeout(playAnimation, 30000);
        }

        pauseAnimation();
    };
}