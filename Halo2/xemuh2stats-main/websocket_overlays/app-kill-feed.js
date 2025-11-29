let client = new websocket_client();
let current_id = 0;

// Team color mapping
const teamColors = {
    '_game_team_red': '#FF4444',
    '_game_team_blue': '#4488FF',
    '_game_team_yellow': '#FFFF44',
    '_game_team_green': '#44FF44',
    '_game_team_purple': '#AA44AA',
    '_game_team_orange': '#FF8844',
    '_game_team_brown': '#8B4513',
    '_game_team_pink': '#FF69B4',
    '_game_team_neutral': '#AAAAAA'
};

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
    const killerTeam = killData.killer_team || '';
    const victim = killData.victim;
    const victimTeam = killData.victim_team || '';
    const weapon = killData.weapon;

    // Determine background class based on killer's team
    let teamClass = 'neutral';
    if (killerTeam.includes('red')) {
        teamClass = 'red';
    } else if (killerTeam.includes('blue')) {
        teamClass = 'blue';
    }

    // Get weapon icon
    const weaponIcon = weaponIcons[weapon] || 'Guardians.png';

    // Create kill feed entry
    const entry = document.createElement('div');
    entry.className = 'kill-entry ' + teamClass;
    entry.id = 'kill_' + current_id;

    // Format: {killer} killed {weapon icon} {victim}
    entry.innerHTML = `
        <span class="killer">${killer}</span>
        <span class="killed-text">killed</span>
        <img class="weapon-icon" src="Weapons/${weaponIcon}" alt="${weapon}" />
        <span class="victim">${victim}</span>
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

// Handle score events (flag captures, bomb arms)
client.add_message_recieved_callback('score_event_push', (scoreData) => {
    const player = scoreData.player;
    const playerTeam = scoreData.player_team || '';
    const eventType = scoreData.event_type;
    const oppositeTeam = scoreData.opposite_team || '';

    // Determine background class based on player's team
    let teamClass = 'neutral';
    if (playerTeam.includes('red')) {
        teamClass = 'red';
    } else if (playerTeam.includes('blue')) {
        teamClass = 'blue';
    }

    // Create score event entry
    const entry = document.createElement('div');
    entry.className = 'kill-entry ' + teamClass;
    entry.id = 'kill_' + current_id;

    // Format based on event type
    if (eventType === 'flag_capture') {
        // Get opposite team name for display (oppositeTeam is "Red", "Blue", etc.)
        let oppositeTeamName = "the enemy's";
        const oppLower = oppositeTeam.toLowerCase();
        if (oppLower === 'red') {
            oppositeTeamName = "Red Team's";
        } else if (oppLower === 'blue') {
            oppositeTeamName = "Blue Team's";
        } else if (oppLower === 'yellow') {
            oppositeTeamName = "Yellow Team's";
        } else if (oppLower === 'green') {
            oppositeTeamName = "Green Team's";
        }

        entry.innerHTML = `
            <span class="killer">${player}</span>
            <span class="killed-text">captured</span>
            <img class="weapon-icon" src="Weapons/Flag.png" alt="Flag" />
            <span class="victim">${oppositeTeamName} flag!</span>
        `;
    } else if (eventType === 'bomb_arm') {
        entry.innerHTML = `
            <span class="killer">${player}</span>
            <span class="killed-text">armed</span>
            <img class="weapon-icon" src="Weapons/AssaultBomb.png" alt="Bomb" />
            <span class="victim">the bomb!</span>
        `;
    } else {
        // Unknown event type, skip
        return;
    }

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

function start() {
    client.request_feature_enable("kills_push");
    client.request_feature_enable("scores_push");
}

document.addEventListener("DOMContentLoaded", function() {
    client.connect(`ws://${window.config.host}:${window.config.port}`).then(() => {
        start();
    }).catch((error) => {
        alert("WebSocket Connection Error");
        console.error("Connection Error:", error);
    });
});
