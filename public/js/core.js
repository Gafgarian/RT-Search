var app = angular.module('instantSearch', []);

app.factory('listLoad', function ($http, $q){
    this.getlist = function(db, database){
    	if (db != database) {

    	}  
	    return $http.get('/api/shows').then(function(response) {
	        return response.data;
        });            
    }
    return this;
});

app.controller('SearchCtrl', function($scope, listLoad) {
	var database = 'rooosterteeth';
	var db;

	$scope.menuItems = ['Rooster Teeth', 'Achievement Hunter', 'The Know', 'Funhaus', 'ScrewAttack'];
	$scope.activeMenu = $scope.menuItems[0];

   	$scope.setActive = function(menuItem) {
    	$scope.activeMenu = menuItem;
 	}

	$scope.switchTable = function(db) {
		var item = this.menuItems[db];
		this.setActive(item);
	}
	
	this.currentPageNumber = 1;
    this.itemsPerPage = 10;
    this.shows = [];
	this.searchVisible = false;
	this.processing = true;
    
	listLoad.getlist(db, database).then(function (arrItems) {
		database = db;
		this.shows = arrItems;
        // for (var i = 0; i < this.shows.length; i++) {
        // 	var duration = this.shows[i].duration;
        // 	var minutes = Math.floor(duration/60);
        // 	var seconds = duration - minutes * 60;
        // }
        for (var i = 0; i < this.shows.length; i++) {
        	this.shows[i].recid = i;
        	this.shows[i].duration = parseInt(this.shows[i].duration);
        	this.shows[i].sortDuration = this.shows[i].duration;
        	this.shows[i].sponsor = (this.shows[i].sponsor === "true");
        }
	    var config = {
	        grid: { 
	            name: 'grid',
	            records : this.shows,
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
	                { field: 'caption', caption: 'Description', size: '200px', resizable: true, sortable: false,
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
			        { field: 'show', caption: 'Show', size: '150px', resizable: true, sortable: true,
			        	render: function(record) {
	                		return '<div class="wrap-content">' + record.show + '</div>';
	                	}
	                },
			        { field: 'season', caption: 'Season', size: '100px', resizable: true, sortable: true,
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
	    function refreshGrid(auto) {
	        w2ui.grid.autoLoad = auto;
	        w2ui.grid.skip(0);    
	    }
	    function timeConvert(hours, minutes, seconds) {
		    function str_pad_left(string,pad,length) {
				return (new Array(length+1).join(pad)+string).slice(-length);
			}
			return str_pad_left(hours,'0',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
	    }
	    $('.loader').hide();
        $('#main').w2grid(config.grid);
        w2ui.grid.on('sort', function (event) {
			if (event.field == "duration") {
				event.preventDefault();
				w2ui['grid'].sort('sortDuration');
			}
		});
        $('#main').show();
    });
});
