// Database Configuration
// Read-Only DB User

module.exports = {
	// if OPENSHIFT env variables are present, use the available connection info:
	if (process.env.OPENSHIFT_MONGODB_DB_URL) {
	    remoteUrl : process.env.OPENSHIFT_MONGODB_DB_URL +
	    process.env.OPENSHIFT_APP_NAME;
	} else {
		remoteUrl : '127.0.0.1:27017/' + process.env.OPENSHIFT_APP_NAME	
	}
};

