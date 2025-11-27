let client = new websocket_client();
let current_id = 0;

// Weapon name to icon file mapping
const weaponIcons = {
    'Guardians': 'Guardians.png',
    'FallingDamage': 'Guardians.png',
    'GenericCollisionDamage': 'Guardians.png',
    'GenericMeleeDamage': 'Guardians.png',
    'GenericExplosion': 'Guardians.png',
    'Magnum': 'Magnum.png',
    'PlasmaPistol': 'PlasmaPistol.png',
    'Needler': 'Needler.png',
    'SMG': 'SmG.png',
    'PlasmaRifle': 'PlasmaRifle.png',
    'BattleRifle': 'BattleRifle.png',
    'Carbine': 'Carbine.png',
    'Shotgun': 'Shotgun.png',
    'SniperRifle': 'SniperRifle.png',
    'BeamRifle': 'BeamRifle.png',
    'BrutePlasmaRifle': 'BrutePlasmaRifle.png',
    'RocketLauncher': 'RocketLauncher.png',
    'FlakCannon': 'FuelRod.png',
    'BruteShot': 'BruteShot.png',
    'Disintegrator': 'Guardians.png',
    'SentinelBeam': 'SentinelBeam.png',
    'SentinelRPG': 'RocketLauncher.png',
    'EnergySword': 'EnergySword.png',
    'FragGrenade': 'Guardians.png',
    'PlasmaGrenade': 'Guardians.png',
    'FlagMeleeDamage': 'Flag.png',
    'BombMeleeDamage': 'AssaultBomb.png',
    'BallMeleeDamage': 'OddBall.png',
    'HumanTurret': 'Guardians.png',
    'PlasmaTurret': 'Guardians.png',
    'Banshee': 'Guardians.png',
    'Ghost': 'Guardians.png',
    'Mongoose': 'Guardians.png',
    'Scorpion': 'Guardians.png',
    'SpectreDriver': 'Guardians.png',
    'SpectreGunner': 'Guardians.png',
    'WarthogDriver': 'Guardians.png',
    'WarthogGunner': 'Guardians.png',
    'Wraith': 'Guardians.png',
    'Tank': 'Guardians.png',
    'BombExplosionDamage': 'AssaultBomb.png'
};

client.add_message_recieved_callback('kill_feed_push', (killData) => {
    const killer = killData.killer;
    const victim = killData.victim;
    const weapon = killData.weapon;

    // Get weapon icon
    const weaponIcon = weaponIcons[weapon] || 'Guardians.png';

    // Create kill feed entry
    const entry = document.createElement('div');
    entry.className = 'kill-entry';
    entry.id = 'kill_' + current_id;

    entry.innerHTML = `
        <span class="victim">${victim}</span>
        <span class="killed-text">killed by</span>
        <span class="killer">${killer}</span>
        <img class="weapon-icon" src="Weapons/${weaponIcon}" alt="${weapon}" />
    `;

    // Add to container (prepend so newest is on top)
    const container = document.getElementById('kill-feed-container');
    container.prepend(entry);

    current_id++;

    // Fade out and remove after delay
    fadeOutAndRemove(entry, 1000, 4000);

    // Limit to 5 visible entries
    const entries = container.querySelectorAll('.kill-entry');
    if (entries.length > 5) {
        entries[entries.length - 1].remove();
    }
});

function fadeOutAndRemove(element, duration, delay) {
    setTimeout(function() {
        let startTime = null;

        function fade(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = elapsed / duration;
            const opacity = Math.max(1 - progress, 0);
            element.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(fade);
            } else {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
        }

        requestAnimationFrame(fade);
    }, delay);
}

function start() {
    client.request_feature_enable("kills_push");
}

document.addEventListener("DOMContentLoaded", function() {
    client.connect(`ws://${window.config.host}:${window.config.port}`).then(() => {
        start();
    }).catch((error) => {
        alert("WebSocket Connection Error");
        console.error("Connection Error:", error);
    });
});
