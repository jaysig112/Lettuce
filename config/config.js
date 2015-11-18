//File for holding all of the configurations.
//This makes it easy to swap out constants throughout the app

module.exports = {



    //Configuration for riot services
    riot: {
        apiKey: process.env.RIOT_API_KEY,
        //The interval at which to pull data from riot
        updateInterval: '00 00 * * * *', //should hopefully execute every hour
        staticInfoUpdateInterval: '00 00 00 01 * *', //Once a month on the 1st

        ourTeam: ['khanny17', 'crappycupojoe', 'jaysig112', 'Evlzilla', 'TheHasbrouck'],

        teamId: 'TEAM-fb806f80-0020-11e5-aaad-c81f66dcfb5a',

        endpointUrls: {
            champion: 'https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion',
            summoner: 'https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/',
            team: 'https://na.api.pvp.net/api/lol/na/v2.4/team/'
        }
    }

};
