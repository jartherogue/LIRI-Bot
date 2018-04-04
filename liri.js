var config = require("./.env").config;
//setting variables for linking and using information from various files and for various API calls.
var fs = require("fs");
var keys = require("./keys.js");
var request = require("request");
var inquirer = require("inquirer");
var Twitter = require('twitter');
var Spotify = require("node-spotify-api");
var pick = require('object.pick');

var rogueMyBidding = function () {
    fs.readFile('random.txt', 'utf8', function (err, data) {
        if (err) throw err;
        var randoArray = data.split(',');
        if (randoArray.length == 2) {
            pick(randoArray[0], randoArray[1]);
        } else if (randoArray.length == 1) {
            pick(randoArray[0]);
        }
    });
}
//OMDB call for LIRI.
var rogueMovie = function (movieName) {
    request('http://www.omdbapi.com/?apikey=7e5a37b3&t=' + movieName + "&y=&plot=short&r=json", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            //According to omdb API docs I should be able to set Rotten Tomato to "true" and it will call the rating.
            // request.set_default('tomatoes', True)

            var movieData = JSON.parse(body);
            console.log('Title: ' + movieData.Title);
            console.log('Year: ' + movieData.Year);
            console.log('Rated: ' + movieData.Rated);
            console.log('IMDB Rating: ' + movieData.imdbRating);
            console.log('Actors: ' + movieData.Actors);
            //I thought I could use npm object.pick to grab the tomato rating from OMDB. It didn't work. 
            // pick(movieData.Rating[1]);
            // console.log(movieData.Rating[1]);
            console.log('Rotten Tomato Score: ' + movieData.tomato_rating);
        }
    });
}

//Creating requested twitter functionality.
var rogueTweets = function () {
    //getting twitter keys from .env file.
    var client = new Twitter({
        consumer_key: config.TWITTER_CONSUMER_KEY
        , consumer_secret: config.TWITTER_CONSUMER_SECRET
        , access_token_key: config.TWITTER_ACCESS_TOKEN_KEY
        , access_token_secret: config.TWITTER_ACCESS_TOKEN_SECRET
    })
    var params = { screen_name: 'JARtheRogue' };

    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            // console.log(tweets);
            for (i = 0; i < tweets.length; i++) {
                console.log(tweets[i].created_at);
                console.log(" ");
                console.log(tweets[i].text);
            }
        }
    });
}
//Spotify functionality
//Getting my Spotify Keys from .env
var spotSearch = new Spotify({
    id: config.SPOTIFY_ID
    , secret: config.SPOTIFY_SECRET
});

var findName = function (artist) {
    return artist.name;
}
//function to run spotify call. 
var rogueSpotify = function (songName) {
    spotSearch.search({ type: "track", query: songName }
        , function (err, data) {
            if (err) {
                console.log("error occurred: " + err);
                return;
            }
            var songs = data.tracks.items;
            for (i = 0; i < songs.length; i++) {
                console.log(i);
                console.log("Artist(s): " + songs[i].artists.map(
                    findName));
                console.log("Song Name: " + songs[i].name);
                console.log("Release Date: " + songs[i].album.release_date);
                console.log("album: " + songs[i].album.name);
                console.log("---------------------------------------------------------");
            }
        });
}
//switch case to take in user inputs. Wanted to use inquirer, but this seemed easier and was crunched for time. Would rather have inquirer use.
var userReq = function (caseData, functionData) {
    switch (caseData) {
        case "my-tweets":
            rogueTweets();
            break;
        case "spotify-this-song":
            rogueSpotify(functionData);
            break;
        case "movie-this":
            rogueMovie(functionData);
        case "do-what-it-says":
            rogueMyBidding();
            break;
        default:
            console.log("LIRI don't know nothin bout dat!");
    }
}

var runUserReq = function (uIOne, uITwo) {
    userReq(uIOne, uITwo);
};

runUserReq(process.argv[2], process.argv[3]);