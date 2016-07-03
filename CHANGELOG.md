# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added

## 1.2.0 - 7/3/16
### Added
- Fixed CRON job database updates
- Moved completely off recently added scraping. Now leveraging Mobile App API. Much faster but possibly missing videos.
- Seperate Schemas created for each site's database
- JOBS writes all found episodes to database as single collection for faster table loading after DB is accessed
- Shifted directory structure to be more like actual MEAN stack build 
- Added site selector nav at top of page
- Table load based on site selected from nav
- Fixed local build variables
- Fixed styling for columns
- Wrote duration script to allow sorting by actual duration of video
- Fixed boolean sort for Sponsor only content
- Added link to this changelog on page
- Added Twitter link to page
- Adeed RT site profile to page

## 1.1.3 - 7/1/16
### Added
- Added GA Tracking code
- Fixed missing Openshift config variables

## 1.1.2 - 6/8/16
### Added
- Added table load date for logging

## 1.1.1 - 6/7/16
### Added
- Fixed image sizing for mobile

## 1.1.0 - 6/6/16
### Added
- Made adjustments to table UI for mobile view
- Added different header background image

## 1.0.0 - 6/5/16
### Added
- Initial web App deployed

## 0.0.1 - 3/23/16
### Added
- Initial CLI made public
