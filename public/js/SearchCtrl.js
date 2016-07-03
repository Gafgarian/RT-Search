var app = angular.module('RTSearch', []);

app.factory('List', function ($http, $q){
    this.getlist = function(){   
	    return $http.get('/api/shows').then(function(response) {
	        return response.data;
        });                 
    }
    return this;
});

app.controller('SearchController', function($scope, List) {

	var database = 0;
	var db;

	// DB Arrays
	var allShows = [];
	var roosterteeth = [];
	var achievementhunter = [];
	var theknow = [];
	var funhaus = [];
	var screwattack = [];

	$scope.menuItems = ['All Sites','Rooster Teeth', 'Achievement Hunter', 'The Know', 'Funhaus', 'ScrewAttack'];
	$scope.activeMenu = $scope.menuItems[0];

   	$scope.setActive = function(menuItem) {
    	$scope.activeMenu = menuItem;
 	}
 
	$scope.initLoad = function() {
		List.getlist().then(function(response){
			$scope.buildShows(response);
		});
	}

	$scope.switchTable = function(db) {
		if (db != database) {
			var item = this.menuItems[db];
			var tempArray = [];

			database = db;
			$scope.setActive(item);

			switch (db) {
        		case 1:
        			tempArray = roosterteeth;
        			break;
        		case 2:
        			tempArray = achievementhunter;
        			break;
        		case 3:
        			tempArray = theknow;
        			break;
        		case 4:
        			tempArray = funhaus;
        			break;
        		case 5:
        			tempArray = screwattack;
        			break;
        		default:
        			tempArray = allShows;
        	}

			$scope.tableUpdate(tempArray);
		}
	}

	$scope.buildShows = function (arrItems) {

		this.shows = arrItems;
		for (var i = 0; i < this.shows.length; i++) {
        	this.shows[i].recid = i;
        	this.shows[i].duration = parseInt(this.shows[i].duration);
        	this.shows[i].sortDuration = this.shows[i].duration;
        	this.shows[i].sponsor = (this.shows[i].sponsor === "true");
        	switch (this.shows[i].site) {
        		case 'roosterTeeth':
        			roosterteeth.push(this.shows[i]);
        			break;
        		case 'achievementHunter' :
        			achievementhunter.push(this.shows[i]);
        			break;
        		case 'theKnow' :
        			theknow.push(this.shows[i]);
        			break;
        		case 'funhaus' :
        			funhaus.push(this.shows[i]);
        			break;
        		case 'screwAttack' :
        			screwattack.push(this.shows[i]);
        			break;
        		default:
        			allShows.push(this.shows[i]);
        	}

        }

		allShows = allShows.concat(roosterteeth,achievementhunter,theknow,funhaus,screwattack);
		$scope.tableUpdate(allShows);
	}

	$scope.tableUpdate = function (arrItems) {

		var config = {
	        grid: { 
	            name: 'grid',
	            records : arrItems,
	            show: { 
	                footer    : true,
	                toolbar    : true,
	                toolbarColumns: false
	            },
	            searches: [
					{ field: 'title', caption: 'Title', type: 'text' },
					{ field: 'caption', caption: 'Description', type: 'text' },
					{ field: 'show', caption: 'Show', type: 'text' },
				],
	            columns: [                
	                { field: 'recid', caption: 'ID', size: '0px', sortable: true, resizable: true, hidden: true },
	                { field: 'title', caption: 'Title', size: '100%', resizable: true, sortable: true,
	                	render: function(record) {
	                		return '<div class="wrap-content">' + record.title + '</div>';
	                	}
	                },
	                { field: 'caption', caption: 'Description', size: '100%', resizable: true, sortable: false,
	                	render: function(record) {
	                		return '<div class="wrap-content">' + record.caption + '</div>';
	                	}
	                },
	                { field: 'link', caption: 'Video Link', size: '0px', resizable: true, sortable: false, hidden: true },
	                { field: 'image', caption: 'Thumbnail', size: '158px', resizable: true, sortable: false, 
		                render: function (record) {
			                return '<img src="' + record.image + '" class="tn-image"/>';
			            } 
			        },
			        { field: 'site', caption: 'Site', size: '0px', resizable: true, sortable: true, hidden: true },
			        { field: 'show', caption: 'Show', size: '80px', resizable: true, sortable: true,
			        	render: function(record) {
	                		return '<div class="wrap-content">' + record.show + '</div>';
	                	}
	                },
			        { field: 'season', caption: 'Season', size: '60px', resizable: true, sortable: true,
			        	render: function(record) {
	                		return '<div class="wrap-content">' + record.season + '</div>';
	                	}
	                },
			        { field: 'sortDuration', caption: 'SortDuration', size: '0px', resizable: true, sortable: true, hidden: true },
	                { field: 'duration', caption: 'Duration', size: '75px', resizable: true, sortable: true,
	                	render: function (record) {
	                		var time = record.duration;
	                		var min = Math.floor(time / 60);
	                		var sec = time - min * 60;
	                		var hours = Math.floor(time / 3600);
							time = time - hours * 3600;
	                		var finalTime = timeConvert(hours, min, sec);
			                return '<div class="text-center">' + finalTime + '</div>';
			            }
			        },
	                { field: 'sponsor', caption: 'Sponsor', size: '65px', resizable: true, sortable: true,
	                	render: function(record) {
	                		if (record.sponsor) {
	                			return '<div class="text-center"><i class="fa fa-star" aria-hidden="true"></i></div>';
	                		}
	                	} 
	                }
	            ],
	            onClick: function(event) {
			        var grid = this;
				    event.onComplete = function () {
				        var record = grid.getSelection();
				        var url = grid.getCellValue(record, 3);
				        var win = window.open(url, '_blank');
							win.focus();
				    }
			    }
	        }
	    }

	    function timeConvert(hours, minutes, seconds) {
		    function str_pad_left(string,pad,length) {
				return (new Array(length+1).join(pad)+string).slice(-length);
			}
			return str_pad_left(hours,'0',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
	    }

		$('#main').hide();
		$('#main').w2destroy('grid');
        $('#main').w2grid(config.grid);
        w2ui.grid.on('sort', function (event) {
			if (event.field == "duration") {
				event.preventDefault();
				w2ui['grid'].sort('sortDuration');
			}
		});
		$('.loader').hide();
        $('#main').show();
    }

    $scope.initLoad();	
});


