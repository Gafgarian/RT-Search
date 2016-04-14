// grab the packages we need
var JsonDB = require('node-json-db');
var request = require('request');
var cheerio = require('cheerio');
var prompt = require('prompt');
var colors = require('colors');
var open = require('open');

const fs = require('fs');

prompt.message = '';

var promptType = ['integer','string']; // promptType[0, 1]

var baseURL = 'http://roosterteeth.com/episode/recently-added?page=';
var pageArray = [];
var resultsArray = [];
var linkArray = [];
var updateArray = [];
var pageCount = 0;
var updateOnly = false;
var time;
var lastPage;

var db = new JsonDB('rtArchive', true, true);
var exists = fs.exists('rtArchive.json', (exists) => {
    if (exists) {
        linkArray = db.getData('/');
        time = fs.statSync('rtArchive.json').mtime;
    }
    setup();
});

function setup() {
    prompt.start();
    console.log('\n    ' + colors.red.underline.bold('Rooster Teeth Video Search'));
    console.log(colors.yellow('    Database last updated - ' + time));
    init();
}

// Base initialization function
function init() {
    return basePrompt('    Make a choice', [
        ['Perform Search?',searchDB],
        ['Database Functions?',promptDB],
        ['Exit Program',exit]
    ], 0);
}

// Base prompt template
function basePrompt(promptText, options, type) {
    if (type === 0) {
        for (var i = 0; i < options.length; i++) {
            if (i > options.length - 3 || i === 0) {
                console.log('');
            }
            console.log(colors.white("    " + (i + 1) + ") " + options[i][0]));
        }
    }
    prompt.get([{
        name: 'choice',
        description: colors.blue(promptText),
        type: promptType[type],
        required: true
    }], function (err, result) {     
        if (type === 0) {  
            if (result.choice > options.length || result.choice < 1) {
                console.log(colors.red('    Invalid selection. Please choose again.'));
                return basePrompt(promptText, options, type);
            } else {
                var row = options[result.choice - 1];
                return row[row.length - 1](row);
            }
        } else if (type === 1) {
            process.stdout.write(colors.cyan('\n    Searching...\n    This may take some time'));
            resultsArray = [];
            for (var i = 0; i < linkArray.length; i++) {
                var isSiteFound = searchForWord(linkArray[i][1], result.choice);
                if (isSiteFound) {
                    process.stdout.write(colors.cyan('.'));
                    var name = linkArray[i][0].replace('&#x2013;','-').replace('&apos;',"'").replace('&quot;','"').replace('&quot;','"');
                    linkArray[i][0] = name;
                    linkArray[i].push(openLink);
                    resultsArray.push(linkArray[i]);
                    // resultsArray.push([linkArray[i], openLink]);
                }
            }
            searchResults();
        }
    });
}

function openLink(episode) {
    console.log(colors.magenta('    Opening ' + episode[0] + '\n    Please Wait...\n'));
    open(episode[1]);
    return basePrompt('    Would you like to search again?', [
        ['Search Again',searchDB],
        ['Exit Program',exit]
    ], 0);
}

function promptDB() {
    return basePrompt('    Make a choice', [
        ['Update Database?',updateDB],
        ['Rebuild Database (NOTE: Rebuilding can take awhile)?',areYouSure],
        ['Exit Program',exit]
    ], 0);
}

function areYouSure() {
    return basePrompt('    Are You Sure', [
        ['Yes',buildDB],
        ['No',init],
        ['Exit Program',exit]
    ], 0);
}

function updateDB() {
    updateOnly = true;
    buildDB();
}

function buildDB() {
    var initUrl = baseURL + 1;
    reqFunc(initUrl, parse, '    Initializing crawl...\n    This may take some time\n');
}

function searchDB() {
    if (linkArray.length < 1) {
        console.log(colors.red('    Database is empty.'));
        return basePrompt('    Would you like to build it now?', [
            ['Rebuild Database (NOTE: Rebuilding can take awhile)?',buildDB],
            ['Close Program',exit]
        ], 0);
    } else {
        return basePrompt('    Enter Search String', null, 1);
    }
}

function searchResults() {
    console.log(colors.magenta('\n    ' + resultsArray.length + ' matches found'));
    resultsArray.push(['Search Again',searchDB]);
    resultsArray.push(['Exit Program',exit]);
    return basePrompt('    Make a choice', resultsArray, 0);
}

function exit() {
    console.log(colors.bold.blue('    BYE!'));
    return process.exit();
}

function searchForWord($, word) {
  return($.indexOf(word.toLowerCase()) !== -1);
}

function reqFunc(url, callback, text) {
    
    process.stdout.write(colors.cyan(text));

    // Make the request
    request(url, function(error, response, body) {
        // Check status code (200 is HTTP OK)
        if(error || response.statusCode !== 200) {
            console.log(colors.red("    Error received - Status code: " + response.statusCode));
            return;
        }

        // Parse the document body
        var $ = cheerio.load(body);
        callback($);
    });
}

// Parse request
function parse($) {
    if (pageCount === 0) {
        if (!updateOnly) {
            lastPage = $('ul.controls a').eq(-2).text();
        } else {
            var tempTime = time.getDay();
            var now = new Date().getDay();
            var diff = now - tempTime;
            lastPage = diff * 4 + 2;
        }
        return linkBuilder();        
    } else {
        baseLinks = $('main ul.episode-blocks a');
        baseLinks.each(function() {
            process.stdout.write(colors.cyan('.'));
            var base = $(this);
            var link = base.attr('href');

            var name = base.children('.name').html();
            var time = base.next().html();
            var image = 'http://' + base.find($('img')).attr('src');
            var sponsor = base.find($('.ion-star')).length > 0;
            var length = base.find($('.timestamp')).text();

            updateArray.push([name, link, time, image, sponsor, length]);
        });
    }
    if (pageCount < pageArray.length) {
        return linkBuilder();    
    } else {
        console.log(colors.cyan('\n    Build complete!'));
        if (!updateOnly) {
            linkArray = updateArray;
            db.push('/',linkArray);
            return init();
        } else {
            return updateDiff();
        }
    }
}

// Build array of links
function linkBuilder() {
    if (pageCount === 0) {
        var tempUrl;
        var tempArray = [];
        for (var i = 1; i <= lastPage; i++) {
            tempUrl = baseURL + i;
            tempArray.push(tempUrl);
        }
        pageArray = tempArray;    
    } 
    return gatherEpisodes();
}

function gatherEpisodes() {
    pageCount++;
    return reqFunc(pageArray[pageCount - 1], parse, '\n    Building page ' + pageCount + ' episode list');
}

function updateDiff() {
    var tempArray = [];
    for (var i = 0; i < updateArray.length; i++) {
        if (updateArray[i][1] != linkArray[0][1]) {
            tempArray.push(updateArray[i]);
        } else {
            if (tempArray.length > 0) {
                tempArray.reverse();
                for (var i = 0; i < tempArray.length; i++) {
                    linkArray.unshift(tempArray[i]);    
                }
                console.log(colors.yellow('    Database updated with ' + tempArray.length + ' links.'));
                db.push('/',linkArray);                
            } else {
                console.log(colors.yellow('    No new links found!'));
            }
            break;
        }
    }
    return init();
}














