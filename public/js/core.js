var app = angular.module('instantSearch', []);

app.factory('listLoad', function ($http, $q){
    this.getlist = function(){   
	    return $http.get('/api/shows').then(function(response) {
	        console.log(response);
	        return response.data;
        });                 
    }
    return this;
});

app.controller('SearchCtrl', function($scope,listLoad){
	this.currentPageNumber = 1;
    this.itemsPerPage = 10;
    this.shows = [];
	this.searchVisible = false;
	this.processing = true;
    
	listLoad.getlist().then(function (arrItems) {
		this.shows = arrItems;
        for (var i = 0; i < this.shows.length; i++) {
        	this.shows[i].recid = i;
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
	            columns: [                
	                { field: 'recid', caption: 'ID', size: '50px', sortable: true, resizable: true, hidden: true },
	                { field: 'title', caption: 'Title', size: '100%', resizable: true, searchable: 'text', sortable: true },
	                { field: 'link', caption: 'Video Link', size: '50px', resizable: true, sortable: true, hidden: true },
	                { field: 'image', caption: 'Thumbnail Link', size: '158px', resizable: true, sortable: false, 
		                render: function (record) {
			                return '<img src="' + record.image + '" class="tn-image"/>';
			            } 
			        },
	                { field: 'duration', caption: 'Duration', size: '75px', resizable: true, sortable: true,
	                	render: function (record) {
			                return '<div class="text-center">' + record.duration + '</div>';
			            }
			        },
	                { field: 'sponsor', caption: 'Sponsor', size: '65px', resizable: true, sortable: true,
	                	render: function(record) {
	                		if (record.sponsor) {
	                			return '<div class="text-center"><i class="fa fa-star" aria-hidden="true"></i></div>';
	                		}
	                	} 
	                },
	                { field: 'uploaded', caption: 'Elapsed Uploaded', size: '125px', resizable: true, sortable: true,
	                	render: function (record) {
			                return '<div class="text-center">' + record.uploaded + '</div>';
			            }
			        },
	            ],
	            onClick: function(event) {
			        var grid = this;
				    event.onComplete = function () {
				        var record = grid.getSelection();
				        var url = grid.getCellValue(record, 2);
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
	    $('.loader').hide();
        $('#main').w2grid(config.grid);
        $('#main').show();
    });
});
