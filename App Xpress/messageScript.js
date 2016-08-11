function messageOnCreate(object, event, params) {
	// Populate created by and created on fields
	object.createdBy = Providers.getSessionProvider().getCurrentUserId();
	object.createdOn = (new Date()).toISOString();

	// Save changes
	Providers.getPersistenceProvider().save(object);
}

function messageOnSave(object, event, params) {
	// Create a fetch request for the issue this message is on and execute it
	var issue = Providers.getPersistenceProvider().createFetchRequest('$IssueT3', 310, object.issue.rootId).execute();

	// Cycle through each participant object in the issue
	issue.participants.forEach(function (participant) {
		// Grant view access to each user in the participants list
		Providers.getViewAccessProvider().grantRuntimeAccess(participant.party.memberId);
	});

	// Save new permissions
	Providers.getPersistenceProvider().save(object);
}