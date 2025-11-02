// Zen Diffuser Animation
document.addEventListener('DOMContentLoaded', function() {
    // Create diffuser container
    const diffuserContainer = document.createElement('div');
    diffuserContainer.className = 'zen-diffuser';
    diffuserContainer.innerHTML = `
        <div class="diffuser-mist">
            <div class="mist-particle mist-1"></div>
            <div class="mist-particle mist-2"></div>
            <div class="mist-particle mist-3"></div>
            <div class="mist-particle mist-4"></div>
            <div class="mist-particle mist-5"></div>
        </div>
        <div class="diffuser-body">
            <div class="diffuser-top"></div>
            <div class="diffuser-middle"></div>
            <div class="diffuser-base"></div>
            <div class="wood-grain"></div>
        </div>
    `;

    document.body.appendChild(diffuserContainer);

    // Add appear animation
    setTimeout(() => {
        diffuserContainer.classList.add('diffuser-ready');
    }, 300);

    // Spray mist every 5 seconds
    setInterval(() => {
        diffuserContainer.classList.add('spraying');

        setTimeout(() => {
            diffuserContainer.classList.remove('spraying');
        }, 2000);
    }, 5000);

    // First spray after 2 seconds
    setTimeout(() => {
        diffuserContainer.classList.add('spraying');

        setTimeout(() => {
            diffuserContainer.classList.remove('spraying');
        }, 2000);
    }, 2000);
});
