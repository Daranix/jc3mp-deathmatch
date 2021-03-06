$(document).ready(function() {
    //stuff
    let num_players = 0;
    let num_ingame = 0;
    let min_players = 2;

    jcmp.CallEvent('dm/MainUILoaded');

    jcmp.AddEvent('dm/NumPlayers', (num, needed) => {
        num_players = num;
        min_players = needed;
        $("#numonline").text(num_players.toString());
        UpdateText();
    })

    jcmp.AddEvent('dm/NumPlayersIngame', (num) => {
        num_ingame = num;
        $("#numingame").text(num_ingame.toString());
        UpdateText();
    })

    function UpdateText()
    {
        if (num_ingame > 0)
        {
            UpdateTime();
        }
        else if (num_ingame == 0 && num_players < min_players)
        {
            if (min_players-num_players == 1)
            {
                $("div.playersinfo").text(`Waiting for at least ${min_players-num_players} more player before starting game...`);
            }
            else
            {
                $("div.playersinfo").text(`Waiting for at least ${min_players-num_players} more players before starting game...`);
            }
        }
        else if (num_ingame == 0 && num_players >= min_players)
        {
            $("div.playersinfo").text("Starting new game soon...");
        }
    }

    $("#numonline").text("0");
    $("#numingame").text("0");

    document.onkeypress = (e) => {
        jcmp.CallEvent('dm/KeyPress', e.keyCode);
    };

    
    setInterval(function() 
    {
        jcmp.CallEvent('dm/SecondTick');
    }, 1000);

    let ingame_time = 0;

    jcmp.AddEvent('dm/decreaseingametime', () => 
    {
        ingame_time -= 1;
        ingame_time = (ingame_time < 0) ? 0 : ingame_time;
        UpdateText();
    });

    jcmp.AddEvent('dm/setingametime', (num) => 
    {
        setTimeout(function() // Delay it slightly so that num_players can be set before
        {
            ingame_time = num;
            UpdateText();
        }, 500);
    });

    function UpdateTime()
    {
        let minutes = Math.floor(ingame_time / 60);
        let seconds = ingame_time % 60;
        if (seconds < 10)
        {
            seconds = "0" + seconds;
        }
        //$("div.playersinfo").text(`A game is currently in progress, please wait: ${minutes}:${seconds}`);
        $("div.playersinfo").text(`A game is currently in progress. Press X to spectate.`);
    }

    jcmp.AddEvent('dm/changebordercolor', (color) => {
        $("div.playersinfo").css("color", color);
    })

    jcmp.AddEvent('dm/pickupweaponsound', () => {
        var x = document.createElement("AUDIO");
        x.setAttribute("src","./music/pickup.ogg");
        x.volume = 0.25;
        x.play();
    })

    jcmp.AddEvent('dm/RadarTimeoutStart', () => {
        setTimeout(function() 
        {
            jcmp.CallEvent('dm/RadarTimeoutEnd');
        }, 60 * 1000);
    })

});