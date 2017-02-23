
const lang = require('./lang');
dm.lobby = [];

setInterval(function() 
{
    CheckGame();
}, 1000);

if (dm.config.integrated_mode)
{
    setInterval(function() 
    {
        IntegratedBroadcast();
    }, dm.config.integrated_settings.chat.broadcast_interval * 1000);
}

let wait_time = (dm.config.testing_settings.enabled) ? dm.config.testing_settings.wait_time : dm.config.game_settings.wait_time;
let min_players = (dm.config.testing_settings.enabled) ? dm.config.testing_settings.min_players : dm.config.game_settings.min_players;

let timer;


// Continuously checks if a game should start or end
function CheckGame()
{
    let players = dm.lobby;

    if (dm.game.current_game == null)
    {
        if (players.length >= min_players && timer == null)
        {
            lang.broadcast(lang.formatMessage(lang.msgs.on_start_soon, {time: wait_time}));
            timer = setTimeout(function() 
            {
                players.forEach(player =>
                {
                    jcmp.events.CallRemote('FadeInCountdown', player);
                });
                timer = setTimeout(function() 
                {
                    players = dm.lobby;
                    if (players.length >= min_players)
                    {
                        let players_array = [];
                        players.forEach(player =>
                        {
                            players_array[player.networkId] = player;
                        });
                        lang.broadcast(lang.formatMessage(lang.msgs.on_starting, {num_players: players_array.length}));
                        StartGame(players_array, dm.game.current_arena);
                    }
                    else if (dm.game.current_game == null)
                    {
                        players.forEach(p => 
                        {
                            jcmp.events.CallRemote('EndGame', p);
                            jcmp.events.CallRemote('CleanupIngameUI', p);
                        });
                    }

                    if (dm.config.integrated_mode)
                    {
                        dm.lobby = []; // Reset lobby only if integrated mode is on
                    }
                    clearTimeout(timer);
                    timer = null;
                }, wait_time * 0.3 * 1000);
            }, wait_time * 0.7 * 1000);
        }
    }
    else if(dm.game.current_game != null)
    {
        if (!dm.config.testing_settings.enabled)
        {
            CheckIfGameShouldEnd(); // If we aren't testing with one person, do normal checks
        }

        if (dm.game.current_game.active)
        {
            dm.game.current_game.decrease_time();
        }
        else if (!dm.game.current_game.active && dm.game.current_game.get_num_loaded() >= min_players)
        {
            dm.game.current_game.begin_game();
        }

    }


}

// Starts a game with given players and arena data
function StartGame(players, arena)
{
    dm.game.current_game = new dm.deathmatch(players, arena);
    dm.game.current_game.start();
}

function CheckIfGameShouldEnd()
{
    if (dm.game.current_game.players.length <= 1)
    {
        StopGame();
    }
}

function StopGame()
{
    dm.game.current_game.players.forEach(function(player) 
    {
        dm.game.current_game.player_won(player);
    });

    setTimeout(function() 
    {
        if (dm.game.current_game != null)
        {
            EndGame();
        }
    }, 5500);
}

function EndGame()
{
    dm.game.current_game.end();
    dm.game.current_game = null;
    dm.game.current_arena = dm.game.arenas[Math.floor(Math.random() * dm.game.arenas.length)];
    jcmp.events.CallRemote('ChangeArena', null, JSON.stringify(dm.game.current_arena.defaults.centerPoint));
}

function IntegratedBroadcast()
{
    lang.broadcast(lang.formatMessage(lang.msgs.on_interval, {num_players: dm.lobby.length}));
}

function AddPlayerToLobby(player)
{
    dm.lobby.push(player);
}

function RemovePlayerFromLobby(player)
{
    dm.lobby = dm.lobby.filter(p => p.networkId != player.networkId);
}

module.exports = 
{
    CheckIfGameShouldEnd,
    AddPlayerToLobby,
    RemovePlayerFromLobby,
    EndGame
}