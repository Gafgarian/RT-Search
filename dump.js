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

var baseURL = 'http://roosterteeth.com/episode/';
var pageArray = [];
var resultsArray = [];
var linkArray = [];
var updateArray = [];
var pageCount = 0;
var updateOnly = false;
var time;
var lastPage;


var dbDump = new JsonDB('linkDump', true, true);
var dumpExists = fs.exists('linkDump.json', (exists) => {
    if (exists) {
        pageArray = dbDump.getData('/');
    }
});

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
    console.log('\n    ' + colors.yellow('Building link dump keywords for podcast'));
    init();
}

// Base initialization function
function init() {
    return basePrompt('    Make a choice', [
        ['Perform Keyword Search?',searchDB],
        ['Rebuild RT Podcast Link Database',isolateRT],
        ['Exit Program',exit]
    ], 0);
}

// Base initialization function
function isolateRT() {
    var tempArray = [];
    console.log('    ' + colors.cyan('Trimming RT Archive...'));
    for (var i = 0; i < linkArray.length; i++) {
        var tempObj = linkArray[i];
        var isPodcastLink = searchForWord(tempObj.link, '/rt-podcast-');
        if (isPodcastLink) {
            tempArray.push(tempObj);
        }
    }
    pageArray = tempArray;
    console.log(colors.yellow('    Database updated with ' + tempArray.length + ' links.'));
    buildDB();
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

function updateDB() {
    updateOnly = true;
    buildDB();
}

function buildDB() {
    if (pageCount < pageArray.length) {
        var tempObj = pageArray[pageCount];
        return reqFunc(tempObj.link, parse, '\n    Crawling ' + pageCount);
    }
    writeDB();
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
    console.log(colors.bold.blue('\n    BYE!'));
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
    var tempArray = [];
    baseLinks = $('.linkdump ul li a .link .title');
    baseLinks.each(function() {
        process.stdout.write(colors.cyan('.'));
        var base = $(this).html();
        tempArray.push(base);
    });
    pageArray[pageCount]['keyword'] = tempArray;
    pageCount++;
    buildDB();
}

function writeDB() {
    dbDump.push('/', pageArray);
    exit();
}














