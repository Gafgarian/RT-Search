var request = require('request');
var cheerio = require('cheerio');
var prompt = require('prompt');
var colors = require('colors');
var open = require('open');


var searchWord = "";
var showArray = [];
var seasonArray = [];
var episodeList = [];
var pagesToVisit = [];
var count = 0;

var siteArray = [
            // Base URL
            ['http://roosterteeth.com',
            // Search terms
            ['rooster','rt','rooster teeth','roosterteeth','teeth']
        ],
            // Base URL
            ['http://achievementhunter.com',
            // Search terms
            ['hunter','ah','achieve','achievement','achievementhunter']
        ],
            // Base URL
            ['http://fun.haus',
            // Search terms
            ['funhaus','fh','fun','haus']
        ],
            // Base URL
            ['http://screwattack.com',
            // Search terms
            ['screw','sa','screw attack','attack','screwattack']
        ],
            // Base URL
            ['http://theknow.tv',
            // Search terms
            ['know','the know','theknow']
        ]
    ];

init();

function init() {
    console.log(colors.cyan('List of sites: '));
    console.log('    Rooster Teeth');
    console.log('    Achievement Hunter');
    console.log('    Funhaus');
    console.log('    ScrewAttack');
    console.log('    The Know');
    prompt.start();
      // 
      // Get two properties from the user: username and email 
      // 
    prompt.get([{
        name: 'site',
        description: colors.blue('Which site is the show on?'),
        type: 'string',
        required: true
    }], function (err, result) {       
        // 
        // Log the results. 
        //
        for (var i = 0; i < siteArray.length; i++) {
            var tempArray = siteArray[i][1];
            var length = tempArray.length;
            for (var j = 0; j < length; j++) {
                var isSiteFound = searchForWord(result.site, tempArray[j]);
                if (isSiteFound) {
                    console.log(colors.green('    Site Found: ' + siteArray[i][0]));
                    return showList(siteArray[i][0]);
                }
            }
        }
        console.log(colors.red('Unable to find site match. Please try again.'));
        init();
    });
}

function showList(baseURL) {
    console.log('');
    console.log('Searching for shows...');

    var searchURL = baseURL + "/show"
    reqFunc(searchURL, collectShows);
}

function visitPage(baseURL) {
    console.log('');
    console.log('Searching for episodes...');

    var searchURL = baseURL + "/season"
    reqFunc(searchURL, collectSeasons);
}

function searchForWord($, word) {
  return($.indexOf(word.toLowerCase()) !== -1);
}

function reqFunc(url, callback) {

    // Make the request
    request(url, function(error, response, body) {
        // Check status code (200 is HTTP OK)
        if(response.statusCode !== 200) {
            console.log("Status code: " + response.statusCode);
            return;
        }
        // Parse the document body
        var $ = cheerio.load(body);
        callback(url, $);
    });
}

function collectShows(url, $) {
    var showLinks = $("a[href^='" + url + "']");

    showLinks.each(function() {
        var name = $(this).children('.name').text();
        var link = $(this).attr('href');
        var isWordFound = searchForWord(link, url + '/');
        if(isWordFound && name != '') {
            showArray.push([name,link]);
        }
    });

    showArray.sort();
    var tempValue = showArray[0];
    for (var i = 0; i < showArray.length; i++) {
        if (tempValue != showArray[i + 1]) {
            showArray.splice(i,1);
        }
        tempValue = showArray[i];
    }


    // List Shows
    if (showArray.length < 1) {
        return console.log(colors.red('Sorry! No shows found! '));
    }

    console.log(colors.green('Shows Found! '));
    console.log('');

    for (var i = 0; i < showArray.length; i++) {
        console.log((i+1) + ") " + showArray[i][0]);
    }
    console.log('');

    prompt.get([{
        name: 'show',
        description: colors.blue('Which show do you want to view episodes for?'),
        required: true
    }], function (err, result) {       
        // 
        // Log the results. 
        //
        if (result.show > showArray.length + 1 || result.show < 1) {
            console.log(colors.red('Unable to find site match. Please try again.'));
            init();
        } else {
            return visitPage(showArray[result.show-1][1]);
        }
    });
}

function collectSeasons(url, $) {
    var seasonLinks = $("a[href^='" + url + "']");

    seasonLinks.each(function() {
        var link = $(this).attr('href');
        seasonArray.push(link);
    });

    for (var i = 0; i < seasonArray.length; i++) {
        reqFunc(seasonArray[i], collectEpisodes);
    }
}

function collectEpisodes(url, $) {
   count++;
    var relativeLinks = $("a[href^='http']");
    relativeLinks.each(function() {
        var link = $(this).attr('href');
        var isWordFound = searchForWord(link, "page=");
        if(isWordFound) {
           pagesToVisit.push(link);
        }
    });

    if (count === seasonArray.length) {
        searchEpisodes();    
    }
}

function searchEpisodes() {
    count = 0;
    console.log(colors.green((pagesToVisit.length + 1) + " Pages Found"));
    console.log('');
    prompt.get([{
        name: 'search',
        description: colors.blue('What is your search keyword?'),
        type: 'string',
        required: true
    }], function (err, result) { 
        console.log('This may take some time...');
        searchWord = result.search;
        for (var i = 0; i < pagesToVisit.length; i++) {
            reqFunc(pagesToVisit[i], listEpisodes);
        }
    });
}

function listEpisodes(url, $) {
    count++;
    var relativeLinks = $("a[href^='http']");
    relativeLinks.each(function() {
        var link = $(this).attr('href');
        var name = $(this).children('.name').text();
        var isWordFound = searchForWord(link, searchWord);
        if(isWordFound) {
           episodeList.push([name,link]);
        }
    });
    // console.log('Found ' + (episodeList.length + 1) + ' episodes matching...searching...');

    if (count === pagesToVisit.length) {
        cleanUp();    
    }
}

function cleanUp() {
    if (episodeList.length > 0) {
        console.log(colors.green('SUCCESS! ' + (episodeList.length + 1) + ' episodes found'));
        console.log('');
        episodeList.sort();

        var tempValue = episodeList[0];
        for (var i = 0; i < episodeList.length; i++) {
            if (tempValue != episodeList[i + 1]) {
                episodeList.splice(i,1);
            }
            tempValue = episodeList[i];
        }

        for (var i = 0; i < episodeList.length; i++) {
            console.log((i+1) + ") " + episodeList[i][0] + "  -  " + episodeList[i][1]);
        }
        console.log('');
        prompt.get([{
            name: 'choice',
            description: colors.cyan('Choose video to view:'),
            type: 'string',
            required: true
        }], function (err, result) { 
            if (result.choice > episodeList.length + 1 || result.choice < 1) {
                console.log(colors.red('Unable to find site match. Please try again.'));
                return searchEpisodes();
            } else {
                return open(episodeList[result.choice - 1][1]);
            }
        });
    } else {

        console.log('1) New Search?');
        console.log('2) Start Over?');
        prompt.get([{
            name: 'choice',
            description: colors.red('Unable to find any matches. New search or start over?'),
            type: 'string',
            required: true
        }], function (err, result) { 
            if (result.choice == 1) {
                searchEpisodes();
            } else if (result.choice == 2) {
                init();
            } else {
                console.log(colors.red('Invalid Option'));
            }
        });
    }
}












