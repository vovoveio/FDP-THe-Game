    window.onbeforeunload = function() { return "Você tem certeza que quer sair? A partida será encerrada."; };

    let botDifficulty = 3;
        // Sistema de sons diferenciados
    const soundEffects = {
        // Sons básicos
        dealCard: { freq: 440, type: 'sine', duration: 0.15, volume: 0.3 },
        makeBid: { freq: 523, type: 'sine', duration: 0.12, volume: 0.25 },
        playCard: { freq: 392, type: 'triangle', duration: 0.2, volume: 0.35 },
        
        // Sons de vitória/derrota
        winTrick: { freq: 880, type: 'sine', duration: 0.25, volume: 0.4 },
        loseLife: { freq: 220, type: 'sawtooth', duration: 0.35, volume: 0.45 },
        wrongBid: { freq: 196, type: 'square', duration: 0.3, volume: 0.4 },
        
        // Sons especiais
        megaStreak: { freq: 1046, type: 'sine', duration: 0.4, volume: 0.5 },
        gameEnd: { freq: 523, type: 'sine', duration: 0.5, volume: 0.45, fadeOut: true },
        
        // Sons de interação
        cardFlip: { freq: 880, type: 'sine', duration: 0.08, volume: 0.2 },
        errorBuzz: { freq: 150, type: 'sawtooth', duration: 0.2, volume: 0.35 }
    };
    
    // Função de som aprimorada
    function playSound(soundKey, customFreq = null) {
        const sound = soundEffects[soundKey];
        if (!sound) return;
        
        try {
            const freq = customFreq || sound.freq;
            const o = au.createOscillator();
            const g = au.createGain();
            
            o.type = sound.type;
            o.frequency.value = freq;
            
            g.gain.setValueAtTime(sound.volume, au.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, au.currentTime + sound.duration);
            
            o.connect(g);
            g.connect(au.destination);
            o.start();
            o.stop(au.currentTime + sound.duration);
        } catch(e) {
            // Silencia erro de áudio
        }
    }
    
    // Som de fanfarra para vitória de rodada (mais elaborado)
    function playVictoryFanfare() {
        try {
            const notes = [523, 659, 784, 1046];
            notes.forEach((note, i) => {
                setTimeout(() => {
                    const o = au.createOscillator();
                    const g = au.createGain();
                    o.type = 'sine';
                    o.frequency.value = note;
                    g.gain.setValueAtTime(0.25, au.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.0001, au.currentTime + 0.2);
                    o.connect(g);
                    g.connect(au.destination);
                    o.start();
                    o.stop(au.currentTime + 0.2);
                }, i * 120);
            });
        } catch(e) {}
    }
    const botTalk = {
        provoke: ["Tá jogando dormindo? 😂", "Essa vida aí já era hein!", "Ficou no cheiro!", "Minha avó jogava melhor que isso...", "Aceita que dói menos!", "FDP neles! 🔥", "Foi mal, sou profissional.", "Isso é FDP, não é paciência!", "Pode ir pedindo música já?", "Tô só aquecendo.", "Essa doeu até em mim.", "Caiu na minha armadilha!", "Famoso Gap", "Ih, sentiu a pressão? O dedo Chegou a tremer na carta."],
        unlucky: ["Não acredito que perdi essa vida...", "Baralho tá viciado!", "Que azar do caramba.", "Me roubaram na cara dura!", "Tava tudo planejado, menos isso.", "Vou denunciar esse bot!", "Na próxima eu não perdoo.", "Foi sorte sua, só isso.", "Alguém anotou a placa?", "Mão podre da desgraça!"],
        bid: ["Essa mão tá melzinho na chupeta.", "Vou de leve nessa rodada.", "Aperta o cinto!", "Eita, agora o bicho vai pegar.", "Zero chance de eu errar essa.", "Boa sorte, vocês vão precisar.", "Vixi, o forbidden me quebrou.", "Tô sentindo o cheiro da vitória."],
        win_trick: ["A casa sempre vence!", "Zapa neles!", "Aprende como se faz.", "Não adianta chorar.", "Já tá no bolso.", "Próxima!", "Chama o VAR!", "Ai meu Deus como é bom ser vida loka", "O pai é bom de mais!"]
    };

    function botSpeak(botName, category) {
        const phrases = botTalk[category];
        const text = phrases[Math.floor(Math.random() * phrases.length)];
        const emoji = chatEmojis[Math.floor(Math.random() * chatEmojis.length)];
        addChatMsg(botName, text, emoji);
        if(isHost) broadcast({ type: 'CHAT_MSG', user: botName, text: text, emoji: emoji });
    }

    function logEvent(msg, type = 'info') {
        const log = document.getElementById('game-log');
        const entry = document.createElement('div');
        if (type === 'win') entry.style.color = '#ffd966';
        entry.innerText = `> ${msg}`;
        log.prepend(entry);
    }

    const chatEmojis = ["😎", "🃏", "🔥", "🚀", "🤣", "🤔", "👀", "🥶", "💸", "🎮", "🤖", "🤡"];
    
    function addChatMsg(user, text, emoji = "") {
        const box = document.getElementById('chat-box');
        const div = document.createElement('div');
        div.className = 'chat-msg';
        const prefix = emoji ? `${emoji} ` : "";
        div.innerHTML = `<b>${prefix}${user}:</b> ${text}`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    function sendChat() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if(!text) return;
        const randomEmoji = chatEmojis[Math.floor(Math.random() * chatEmojis.length)];
        const msg = { type: 'CHAT_MSG', user: playerName, text: text, emoji: randomEmoji };
        if(isHost) { addChatMsg("Você", text, randomEmoji); broadcast(msg); } 
        else if(conn) { addChatMsg("Você", text, randomEmoji); conn.send(msg); }
        input.value = '';
    }

    function toggleMusic() {
        const music = document.getElementById('bg-music');
        const btn = document.getElementById('toggle-music');
        if (music.paused) { music.play().catch(()=>{}); btn.innerText = "🔊 Som Ligado"; } 
        else { music.pause(); btn.innerText = "🔇 Som Desligado"; }
    }

    const music = document.getElementById('bg-music');
    document.addEventListener('click', () => {
        if (music.paused) {
            music.volume = 0.12;
            music.play().catch(()=>{});
        }
    }, { once: true });

    const playerName = prompt("Como você quer ser chamado?", "Jogador") || "Jogador";

    if (playerName === "Wellxz?") {
        document.querySelectorAll('audio').forEach(el => { el.pause(); el.currentTime = 0; });
        const eeAudio = new Audio("https://www.myinstants.com/media/sounds/naruto-main-theme.mp3");
        eeAudio.loop = true;
        eeAudio.volume = 0.4;
        const eeStyle = document.createElement('style');
        eeStyle.innerHTML = `#ee-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #050505; z-index: 10000; display: flex; justify-content: center; align-items: center; font-family: 'Courier New', monospace; } .ee-box { border-left: 5px solid #00ff41; background: #0a0a0a; padding: 50px; max-width: 700px; box-shadow: 0 0 40px rgba(0,255,65,0.1); position: relative; } .ee-title { color: #00ff41; font-size: 2rem; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 3px; } .ee-text { color: #fff; line-height: 1.6; font-size: 1.1rem; border-top: 1px solid #333; padding-top: 20px; } .ee-btn { margin-top: 30px; background: #00ff41; border: none; color: #000; padding: 10px 30px; cursor: pointer; font-weight: bold; font-family: 'Courier New'; transition: 0.3s; } .ee-btn:hover { background: #fff; box-shadow: 0 0 20px #fff; } .cursor { display: inline-block; width: 10px; height: 20px; background: #00ff41; margin-left: 5px; animation: blink 0.8s infinite; } @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }`;
        document.head.appendChild(eeStyle);
        const eeOverlay = document.createElement('div');
        eeOverlay.id = 'ee-overlay';
        eeOverlay.innerHTML = `<div class="ee-box"><h1 class="ee-title">> ACCESS_GRANTED</h1><div class="ee-text" id="type-area"></div><span class="cursor"></span><br><button class="ee-btn" id="btn-exit" style="visibility: hidden;">[ RETORNAR_AO_SISTEMA ]</button></div>`;
        document.body.appendChild(eeOverlay);
        const startEE = () => { eeAudio.play().catch(() => {}); };
        document.addEventListener('click', startEE, { once: true });
        startEE();
        const info = `Você acaba de encontrar um segredo guardado nas linhas deste código.\nChegar até aqui exige curiosidade, algo que nem todos possuem.\n\nSobre Mim: Wellington Desenvolvedor entusiasta, lenda no YU-GI-OH, o melhor jogador de super nintendo que já existiu e apaixonado por criar experiências únicas.\n\nEste sistema é meu campo de testes para a dominação mundial (ou só para umas jogatinas de FDP com o tema do Naruto).`;
        let index = 0;
        function type() {
            if (index < info.length) {
                document.getElementById("type-area").innerHTML += info.charAt(index).replace(/\n/g, '<br>');
                index++;
                setTimeout(type, 30);
            } else {
                document.getElementById("btn-exit").style.visibility = "visible";
            }
        }
        setTimeout(type, 1000);
        document.getElementById('btn-exit').onclick = () => { eeOverlay.remove(); eeAudio.volume = 0.5; };
    }

    function showToast(msg) {
        const container = document.getElementById('toast-container');
        const div = document.createElement('div');
        div.className = 'toast';
        div.innerText = msg;
        container.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    function renderTable() {
        const area = document.getElementById('table-area');
        area.innerHTML = '';
        const positions = [{top: '65%', left: '50%'}, {top: '50%', left: '66%'}, {top: '30%', left: '50%'}, {top: '50%', left: '35%'}];
        tableCards.forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'card-wrapper';
            const pos = positions[item.owner];
            wrapper.style.top = pos.top;
            wrapper.style.left = pos.left;
            const el = document.createElement('div');
            const isRed = (item.card.s === '♥' || item.card.s === '♦');
            el.className = `card played-card ${isRed ? 'red' : 'black'}`;
            el.innerHTML = `<div class="rank">${item.card.v}</div><div class="center">${item.card.s}</div><div class="suit-mini">${item.card.s}</div>`;
            const nameLabel = document.createElement('div');
            nameLabel.className = 'card-owner-name';
            nameLabel.innerText = players[item.owner].name;
            wrapper.appendChild(el);
            wrapper.appendChild(nameLabel);
            area.appendChild(wrapper);
        });
    }
    
    // Função para limpar a zona de palpites
    function clearBetZone() {
        const betZone = document.getElementById('bet-zone');
        betZone.innerHTML = '';
    }
    
    // Função para mostrar feedback visual quando um jogador joga uma carta
    function showPlayFeedback(playerId) {
        const playerSlot = document.getElementById(`p${playerId+1}`);
        if (!playerSlot) return;
        
        // Adiciona uma animação de flash
        playerSlot.classList.add('play-feedback');

        const handDiv = document.getElementById(`h${playerId+1}`);
        if (handDiv && handDiv.lastChild) {
            const cardRect = handDiv.lastChild.getBoundingClientRect();
            const centerX = cardRect.left + cardRect.width / 2;
            const centerY = cardRect.top + cardRect.height / 2;
            createParticles(centerX, centerY, 15);
        }
        
        // Mostra um indicador temporário no info-box
        const infoBox = document.getElementById(`i${playerId+1}`);
        if (infoBox) {
            const originalHTML = infoBox.innerHTML;
            infoBox.innerHTML = originalHTML + '<br><span style="color: var(--gold); font-size: 11px;">🎴 Jogou!</span>';
            setTimeout(() => {
                if (infoBox) infoBox.innerHTML = originalHTML;
            }, 800);
        }
        
        // Remove a animação após 500ms
        setTimeout(() => {
            playerSlot.classList.remove('play-feedback');
        }, 500);
    }
        // Função para adicionar efeito de brilho na carta vencedora
    function addWinnerGlowToCard(ownerId) {
        // Procura a carta vencedora na mesa
        const tableArea = document.getElementById('table-area');
        if (!tableArea) return;
        
        const cardWrappers = tableArea.querySelectorAll('.card-wrapper');
        if (!cardWrappers.length) return;
        
        // Encontra a carta do jogador vencedor
        let winnerCard = null;
        for (let wrapper of cardWrappers) {
            const nameLabel = wrapper.querySelector('.card-owner-name');
            if (nameLabel && nameLabel.innerText === players[ownerId].name) {
                winnerCard = wrapper.querySelector('.card');
                break;
            }
        }
        
        if (!winnerCard) return;
        
        // Adiciona o efeito de brilho
        winnerCard.classList.add('winner-glow');
        
        // Cria estrelas ao redor da carta
        const rect = winnerCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.className = 'winner-star';
                const angle = (i * 60) * Math.PI / 180;
                const radius = 35;
                star.style.left = (centerX + Math.cos(angle) * radius - 10) + 'px';
                star.style.top = (centerY + Math.sin(angle) * radius - 10) + 'px';
                document.body.appendChild(star);
                
                setTimeout(() => star.remove(), 500);
            }, i * 50);
        }
        
        // Remove a classe após a animação
        setTimeout(() => {
            if (winnerCard) winnerCard.classList.remove('winner-glow');
        }, 700);
        
        // Som de vitória (mais alegre)
        playSound('winTrick');
    }

    let peer, conn;
    let isHost = false;
    let myPlayerIndex = 0;
    let connections = [];

    const au = new (window.AudioContext || window.webkitAudioContext)();
    function sfx(f, t, d) {
        const o = au.createOscillator();
        const g = au.createGain();
        o.type = t;
        o.frequency.value = f;
        g.gain.exponentialRampToValueAtTime(0.0001, au.currentTime + d);
        o.connect(g);
        g.connect(au.destination);
        o.start();
        o.stop(au.currentTime + d);
    }

    const suits = ['♣', '♥', '♠', '♦'];
    const values = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
    const power = {'4♣':100,'7♥':99,'A♠':98,'7♦':97,'3':10,'2':9,'A':8,'K':7,'J':6,'Q':5,'7':4,'6':3,'5':2,'4':1};

    let players = [
        { id: 0, name: playerName || "Jogador", lives: 3, hand: [], bid: 0, won: 0, bot: false, hasBetted: false, remote: false, },
        { id: 1, name: "Bot 1", lives: 3, hand: [], bid: 0, won: 0, bot: true, hasBetted: false, remote: false },
        { id: 2, name: "Bot 2", lives: 3, hand: [], bid: 0, won: 0, bot: true, hasBetted: false, remote: false },
        { id: 3, name: "Bot 3", lives: 3, hand: [], bid: 0, won: 0, bot: true, hasBetted: false, remote: false }
    ];

    let currentCards = 1;
    let turnStarter = 0;
    let roundStarter = 0;
    let tableCards = [];

    function initPeer() {
        peer = new Peer();
        peer.on('open', id => { document.getElementById('my-id').innerText = id; });
        peer.on('connection', c => { isHost = true; setupConn(c); document.getElementById('setup-view').style.display = 'none'; document.getElementById('lobby-view').style.display = 'block'; document.getElementById('host-start-btn').style.display = 'inline-block'; });
    }

    function connectToPeer() {
        const remoteId = document.getElementById('peer-id-input').value;
        if(!remoteId) return alert("Insira um ID!");
        conn = peer.connect(remoteId);
        setupConn(conn);
        document.getElementById('conn-status').innerText = "Conectando...";
    }

    function setupConn(c) {
        c.on('open', () => {
            if(!isHost) {
                conn = c;
                document.getElementById('setup-view').style.display = 'none';
                document.getElementById('lobby-view').style.display = 'block';
                document.getElementById('conn-status').innerText = "Conectado ao Host!";
            } else {
                connections.push(c);
                let nextSlot = players.find(p => p.bot);
                if(nextSlot) { nextSlot.bot = false; nextSlot.remote = true; nextSlot.name = "Amigo " + nextSlot.id; nextSlot.connId = c.peer; }
                updateLobbyList();
                broadcast({ type: 'LOBBY_UPDATE', players: players });
            }
        });
        c.on('data', data => handleNetworkData(data));
    }

    function updateLobbyList() {
        const list = document.getElementById('player-list');
        list.innerHTML = players.map(p => `<li style="margin:8px 0;">🔥 ${p.name} ${p.bot ? '(Bot)' : p.id === 0 && isHost ? '(Host)' : '(Player)'}</li>`).join('');
    }

    function startSolo() {
        isHost = true;
        botDifficulty = parseInt(document.getElementById('ai-difficulty').value);
        document.getElementById('multiplayer-overlay').style.display = 'none';
        startGame();
    }

    initPeer();

    function broadcast(data) { connections.forEach(c => c.send(data)); }
    function sendTo(playerIdx, data) {
        const p = players[playerIdx];
        const target = connections.find(c => c.peer === p.connId);
        if(target) target.send(data);
    }

    function handleNetworkData(data) {
        if(data.type === 'CHAT_MSG') { addChatMsg(data.user, data.text, data.emoji); if(isHost) broadcast(data); }
        if(data.type === 'LOBBY_UPDATE') { players = data.players; myPlayerIndex = players.findIndex(p => p.connId === peer.id); updateLobbyList(); }
        if(data.type === 'START_GAME') { document.getElementById('multiplayer-overlay').style.display = 'none'; document.getElementById('winner-overlay').style.display = 'none'; }
        if(data.type === 'SYNC_STATE') { players = data.players; tableCards = data.tableCards; currentCards = data.currentCards; updateStatus(data.status); render(); renderTable(); if(data.activeId !== undefined) highlightPlayer(data.activeId); if(data.winner) showWinner(data.winner); }
        if(data.type === 'ASK_BID') { askBid(data.forbidden).then(val => { conn.send({ type: 'RES_BID', value: val, from: myPlayerIndex }); }); }
        if(data.type === 'ASK_CARD') { waitCard().then(card => { conn.send({ type: 'RES_CARD', value: card, from: myPlayerIndex }); }); }
        if(isHost) {
            if(data.type === 'RES_BID' && window.resolverBid) { window.resolverBid(data.value); window.resolverBid = null; }
            if(data.type === 'RES_CARD' && window.resolverCard) { 
                const p = players[data.from];
                const cardIdx = p.hand.findIndex(c => c.id === data.value.id);
                if(cardIdx !== -1) p.hand.splice(cardIdx, 1);
                window.resolverCard(data.value); 
                window.resolverCard = null; 
            }
        }
    }

    function showWinner(name) {
        const winnerOverlay = document.getElementById('winner-overlay');
        winnerOverlay.style.display = 'flex';
        document.getElementById('winner-name').innerText = name;
    }

    function updateStatus(m) { document.getElementById('status-bar').innerHTML = m; }

    function highlightPlayer(id) {
        document.querySelectorAll('.player-slot').forEach(s => s.classList.remove('active-turn'));
        if(id !== null) { 
            const el = document.getElementById(`p${id+1}`);
            if(el) el.classList.add('active-turn'); 
        }
    }

    async function startGame() {
        if(isHost) broadcast({ type: 'START_GAME' });
        document.getElementById('multiplayer-overlay').style.display = 'none';
        document.getElementById('winner-overlay').style.display = 'none';
        if(!isHost && conn) return;
        roundStarter = Math.floor(Math.random() * 4);
        gameLoop();
    }

    function resetGame() {
        if(!isHost) return;
        players.forEach(p => { p.lives = 3; p.hand = []; p.bid = 0; p.won = 0; p.hasBetted = false; });
        currentCards = 1;
        document.getElementById('winner-overlay').style.display = 'none';
        broadcast({ type: 'START_GAME' });
        startGame();
    }

    async function gameLoop() {
        if (currentCards > 10) return updateStatus("FIM DO JOGO!");
        players.forEach(p => { p.hand = []; p.bid = 0; p.won = 0; p.hasBetted = false; });
        tableCards = [];
        let deck = [];
        for(let s of suits) for(let v of values) deck.push({s, v, id: v+s});
        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
        shuffle(deck);
        for(let i=0; i<currentCards; i++) { players.forEach(p => { if(p.lives > 0) p.hand.push(deck.pop()); }); }
         // ========== SOM DE DISTRIBUIÇÃO ==========
        playSound('dealCard');
        // =========================================
        sync(); 
        turnStarter = roundStarter;
        await handleBids();
        await handleTricks();
        let alive = players.filter(p => p.lives > 0);
        if (alive.length <= 1) {
            let winName = alive.length === 1 ? alive[0].name : "Empate!";
            sync("FIM!", null, winName);
            showWinner(winName);
            return;
        }
        roundStarter = (roundStarter + 1) % 4;
        currentCards++;
        gameLoop();
    }

    function sync(msg = "", active = null, winner = null) {
        if(!isHost) return;
        render();
        renderTable();
        broadcast({ type: 'SYNC_STATE', players: players, tableCards: tableCards, currentCards: currentCards, status: msg, activeId: active, winner: winner });
    }

    async function handleBids() {
        let bidder = roundStarter;
        let sum = 0;
        let activePlayers = players.filter(p => p.lives > 0);
        let processed = 0;
        while(processed < activePlayers.length) {
            let p = players[bidder];
            if(p.lives > 0) {
                let forbidden = (processed === activePlayers.length - 1 && currentCards > 1) ? (currentCards - sum) : -1;
                highlightPlayer(bidder);
                if (p.bot) {
                    updateStatus(`${p.name} pensando...`);
                    await new Promise(r => setTimeout(r, 600));
                    let strength = 0;
                    p.hand.forEach(c => {
                        let pwr = power[c.id] || power[c.v];
                        if (pwr >= 98) strength += 1; 
                        else if (pwr >= 9) strength += 0.7; 
                        else if (pwr >= 7) strength += 0.3; 
                    });
                    if (botDifficulty === 0) {
                        p.bid = Math.round(strength);
                    } else if (botDifficulty === 3) {
                        if (currentCards === 1) {
                            let visiblePowers = players.filter(pl => pl.id !== bidder && pl.lives > 0).map(pl => power[pl.hand[0].id] || power[pl.hand[0].v]);
                            let avgOther = visiblePowers.reduce((a,b) => a+b,0) / visiblePowers.length;
                            p.bid = avgOther < 7 ? 1 : 0;
                        } else {
                            p.bid = strength > 1.2 ? Math.ceil(strength) : Math.floor(strength);
                        }
                    } else {
                        p.bid = Math.ceil(strength * 0.85);
                        if (botDifficulty === 2) {
                            if (strength < 0.3 && Math.random() > 0.8) p.bid = 1; 
                            if (processed === 0 && strength > 1) p.bid += (Math.random() > 0.7 ? 1 : 0);
                        }
                    }
                    if (p.bid > currentCards) p.bid = currentCards;
                    if (p.bid === forbidden) {
                        p.bid = (p.bid === 0 || strength > 0.6) ? p.bid + 1 : p.bid - 1;
                    }
                    if (p.bid < 0) p.bid = 0;
                    if(Math.random() > 0.7) botSpeak(p.name, 'bid');
                } else if (p.remote) {
                    updateStatus(`Aguardando palpite de ${p.name}...`);
                    sendTo(bidder, { type: 'ASK_BID', forbidden });
                    p.bid = await new Promise(res => { window.resolverBid = res; });
                } else {
                    updateStatus("Sua vez! Qual seu palpite?");
                    p.bid = await askBid(forbidden);
                }
                sum += p.bid;
                p.hasBetted = true;
                 playSound('makeBid');
                logEvent(`${p.name} deu o palpite: ${p.bid}`);
                sync();
                processed++;
            }
            bidder = (bidder + 1) % 4;
        }
        // Após todos os palpites, limpar a zona de botões
        clearBetZone();
    }

    function askBid(forbidden) {
        return new Promise(res => {
            const zone = document.getElementById('bet-zone');
            zone.innerHTML = '';
            for(let i=0; i<=currentCards; i++) {
                let b = document.createElement('button');
                b.className = 'bet-btn';
                b.innerText = i;
                if(i === forbidden) b.disabled = true;
                b.onclick = () => { zone.innerHTML=''; res(i); };
                zone.appendChild(b);
            }
        });
    }

    async function handleTricks() {
        for(let t=0; t<currentCards; t++) {
            tableCards = [];
            let pIdx = turnStarter;
            let playedCount = 0;
            let activeCount = players.filter(p => p.lives > 0).length;
            while(playedCount < activeCount) {
                let p = players[pIdx];
                if(p.lives > 0) {
                    highlightPlayer(pIdx);
                    let card;
                    if(p.bot) {
                        updateStatus(`${p.name} jogando...`);
                        await new Promise(r => setTimeout(r, 800));
                        p.hand.sort((a,b) => (power[a.id]||power[a.v]) - (power[b.id]||power[b.v]));
                        let currentBest = tableCards.length === 0 ? 0 : Math.max(...tableCards.map(tc => power[tc.card.id] || power[tc.card.v]));
                        if (botDifficulty >= 1) {
                            let pwrMap = p.hand.map(c => ({card: c, p: power[c.id] || power[c.v]}));
                            if (p.won < p.bid) {
                                let winCards = pwrMap.filter(c => c.p > currentBest).sort((a,b) => a.p - b.p);
                                if (winCards.length > 0) card = (playedCount === activeCount - 1) ? winCards[0].card : winCards[winCards.length - 1].card;
                                else card = p.hand[0];
                            } else {
                                let loseCards = pwrMap.filter(c => c.p < currentBest).sort((a,b) => b.p - a.p);
                                if (tableCards.length > 0 && loseCards.length > 0) card = loseCards[0].card; 
                                else card = p.hand[0];
                                if (botDifficulty === 3 && tableCards.length > 0) {
                                    let melar = pwrMap.find(c => c.p === currentBest);
                                    if (melar) card = melar.card;
                                }
                            }
                        } else {
                            card = p.won < p.bid ? p.hand.pop() : p.hand.shift();
                        }
                        p.hand = p.hand.filter(c => c.id !== card.id);
                    } else if (p.remote) {
                        updateStatus(`Aguardando carta de ${p.name}...`);
                        sendTo(pIdx, { type: 'ASK_CARD' });
                        card = await new Promise(res => { window.resolverCard = res; });
                    } else {
                        updateStatus("Sua vez! Escolha uma carta.");
                        card = await waitCard();
                    }
                    tableCards.push({card, owner: pIdx});
                    playSound('playCard');
                    logEvent(`${p.name} jogou ${card.v}${card.s}`);
                    // Mostrar feedback visual de jogada
                    showPlayFeedback(pIdx);
                    sync(null, pIdx);
                    playedCount++;
                }
                pIdx = (pIdx + 1) % 4;
            }
            let winIdx = calcWinner(tableCards);
            players[winIdx].won++;
            turnStarter = winIdx;
             // ========== NOVO: EFEITO DE BRILHO NA CARTA VENCEDORA ==========
            // Aguarda um pequeno delay para a carta aparecer na mesa
            setTimeout(() => {
                addWinnerGlowToCard(winIdx);
            }, 100);
            // ==============================================================
            if(players[winIdx].bot && Math.random() > 0.5) botSpeak(players[winIdx].name, 'win_trick');
            logEvent(`🏆 ${players[winIdx].name} venceu a mesa!`, 'win');
            showToast(`${players[winIdx].name} venceu a mesa!`);
            playVictoryFanfare();
            await new Promise(r => setTimeout(r, 1500));
            tableCards = []; 
            sync();
        }
        await endRound();
    }

    function waitCard() {
        return new Promise(res => {
            const cards = document.querySelectorAll(`#h${myPlayerIndex+1} .card`);
            cards.forEach((c, i) => {
                c.onclick = () => {
                    cards.forEach(el => el.onclick = null);
                    let card = players[myPlayerIndex].hand.splice(i,1)[0];
                    res(card);
                };
            });
        });
    }

    function calcWinner(list) {
        let sc = list.map(x => ({...x, pwr: power[x.card.id] || power[x.card.v]}));
        let counts = {}; sc.forEach(s => counts[s.pwr] = (counts[s.pwr] || 0) + 1);
        let valid = sc.filter(s => counts[s.pwr] === 1);
        if (valid.length === 0) {
            let max = Math.max(...sc.map(s => s.pwr));
            let ties = sc.filter(s => s.pwr === max);
            const suitsP = {'♣':4,'♥':3,'♠':2,'♦':1};
            return ties.sort((a,b) => suitsP[b.card.s] - suitsP[a.card.s])[0].owner;
        }
        return valid.sort((a,b) => b.pwr - a.pwr)[0].owner;
    }

    async function endRound() {
        players.forEach(p => { 
            if(p.lives > 0 && p.bid !== p.won) {
                p.lives--; 
                 
                if(p.id === myPlayerIndex) {
                    let randomBot = players.filter(b => b.bot && b.lives > 0)[0];
                    if(randomBot) botSpeak(randomBot.name, 'provoke');
                } else if (p.bot) {
                    botSpeak(p.name, 'unlucky');
                    playSound('loseLife');
                }
            }
        });
        logEvent("--- Fim da rodada! ---");
        sync();
        await new Promise(r => setTimeout(r, 2000));
    }

    function render() {
    players.forEach((p, i) => {
        const info = document.getElementById(`i${i+1}`);
        const h = document.getElementById(`h${i+1}`);
        if (p.lives <= 0) { 
            info.innerHTML = `<b>${p.name}</b><br><span style="color:#b95c5c;">💀 ELIMINADO</span>`; 
            h.innerHTML = ''; 
            return; 
        }
        info.innerHTML = `<b>${p.name}</b> ${p.hasBetted ? '<span class="bet-done">✅</span>' : ''}<br>❤️ ${p.lives} | Palpite: ${p.bid} | Fez: ${p.won}`;
        h.innerHTML = '';
        
        p.hand.forEach((c, idx) => {
            const el = document.createElement('div');
            const isRed = (c.s === '♥' || c.s === '♦');
            
            let showCard = false;
            
            if (currentCards === 1) {
                // Primeira rodada: vejo as cartas dos outros, mas não a minha
                if (i !== myPlayerIndex) {
                    showCard = true;
                } else {
                    showCard = false;
                }
            } else {
                // Demais rodadas: vejo minha carta, as dos oponentes ficam ocultas
                if (i === myPlayerIndex) {
                    showCard = true;
                } else {
                    showCard = false;
                }
            }
            
            if (showCard) {
                el.className = `card ${isRed ? 'red' : 'black'}`;
                // Adiciona os elementos das linhas laterais
                el.innerHTML = `
                    <div class="rank">${c.v}</div>
                    <div class="center">${c.s}</div>
                    <div class="suit-mini">${c.v}</div>
                    <div class="center-line-left"></div>
                    <div class="center-line-right"></div>
                `;
            } else {
                el.className = `card hidden-card`;
                el.innerHTML = '<span>?</span>';
            }
            h.appendChild(el);
        });
    });
    updateScoreList();
}

    function updateScoreList() {
        const container = document.getElementById('score-list');
        container.innerHTML = players.map(p => `<div class="score-item">${p.name}  ❤️ ${p.lives}</div>`).join('');
    }

    function toggleModal() {
        const modal = document.getElementById('instruction-modal');
        modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    }
        // Função para criar partículas ao jogar carta
    function createParticles(x, y, count = 12) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Variação aleatória de direção
                const angle = (Math.random() * Math.PI * 2);
                const distance = 30 + Math.random() * 50;
                const xMove = Math.cos(angle) * distance;
                const yMove = Math.sin(angle) * distance - 20; // tende para cima
                
                // Adiciona variação de cor dourada
                if (Math.random() > 0.7) {
                    particle.classList.add('particle-gold');
                }
                
                // Define a posição inicial no local da carta
                particle.style.left = (x - 3) + 'px';
                particle.style.top = (y - 3) + 'px';
                
                // Define a direção usando variáveis CSS
                particle.style.setProperty('--x', xMove + 'px');
                particle.style.setProperty('--y', yMove + 'px');
                
                document.body.appendChild(particle);
                
                // Remove a partícula após a animação
                setTimeout(() => {
                    particle.remove();
                }, 800);
            }, i * 30); // efeito cascata
        }
    }
    
        // Função para animar a perda de vida no placar
    function animateLifeLost(playerId) {
        const scoreItems = document.querySelectorAll('.score-item');
        // Encontra o item do jogador que perdeu vida
        const playerScoreItem = scoreItems[playerId];
        if (!playerScoreItem) return;
        
        // Adiciona a animação principal
        playerScoreItem.classList.add('life-lost-animation');
        
        // Encontra o coração no texto e anima
        const originalText = playerScoreItem.innerHTML;
        // Procura o coração ou o texto de vida
        if (originalText.includes('❤️')) {
            playerScoreItem.innerHTML = originalText.replace('❤️', '<span class="heart-break">💔</span>');
            setTimeout(() => {
                playerScoreItem.innerHTML = originalText;
            }, 600);
        }
        
        // Remove a animação após terminar
        setTimeout(() => {
            playerScoreItem.classList.remove('life-lost-animation');
        }, 600);
        
        // Efeito sonoro de perda de vida (tom mais grave)
        sfx(300, 'sawtooth', 0.3);
        
        // Pequena vibração no slot do jogador
        const playerSlot = document.getElementById(`p${playerId+1}`);
        if (playerSlot) {
            playerSlot.style.transform = 'scale(0.98)';
            setTimeout(() => {
                playerSlot.style.transform = '';
            }, 200);
        }
    }
        // Função para animar a perda de vida no placar (versão corrigida)
    function animateLifeLost(playerId) {
        // Verifica se o playerId é válido
        if (playerId === undefined || playerId === null) return;
        
        const scoreItems = document.querySelectorAll('.score-item');
        // Verifica se existe o item do jogador
        if (!scoreItems || scoreItems.length <= playerId) return;
        
        const playerScoreItem = scoreItems[playerId];
        if (!playerScoreItem) return;
        
        // Adiciona a animação principal
        playerScoreItem.classList.add('life-lost-animation');
        
        // Animação do coração (apenas visual, sem alterar o HTML permanentemente)
        const heartSpan = playerScoreItem.querySelector('.heart-temp');
        if (heartSpan) {
            heartSpan.remove();
        }
        
        // Efeito sonoro de perda de vida (tom mais grave) - apenas se não for multiplayer remoto
        try {
            sfx(300, 'sawtooth', 0.3);
        } catch(e) {
            // Ignora erro de áudio
        }
        
        // Pequena vibração no slot do jogador
        const playerSlot = document.getElementById(`p${playerId+1}`);
        if (playerSlot) {
            playerSlot.style.transform = 'scale(0.98)';
            setTimeout(() => {
                if (playerSlot) playerSlot.style.transform = '';
            }, 200);
        }
        
        // Remove a animação após terminar
        setTimeout(() => {
            if (playerScoreItem) {
                playerScoreItem.classList.remove('life-lost-animation');
            }
        }, 600);
    }