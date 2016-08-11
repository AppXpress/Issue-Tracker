function onCreate(object, event, params) {
	// Set created on and created by fields
	object.createdBy = Providers.getSessionProvider().getCurrentUserId();
	object.createdOn = (new Date()).toISOString();

	// Assume this org must be added to participants and get its ID
	var addOrg = true, orgId = Providers.getSessionProvider().getCurrentOrgId();

	// Initialize the participants list if it doesn't exist
	object.participants = object.participants || [];

	// Check each participant in the list
	object.participants.forEach(function (org) {
		// If it matches the current org, indiciate that we don't need to add it
		if (org.party && org.party.memberId == orgId) {
			addOrg = false;
		}
	});

	// If the org needs to be added, push it to the list
	if (addOrg) {
		object.participants.push({ party: { memberId: orgId } });
	}

	Providers.getPersistenceProvider().save(object);
}

function onSave(object, event, params) {
	// Set the modified on and modified by fields
	object.modifiedBy = Providers.getSessionProvider().getCurrentUserId();
	object.modifiedOn = (new Date()).toISOString();

	// Assume assigned to is set and needs to be added to the participants list
	var addOrg = true, assignment = object.assignedTo ? object.assignedTo.memberId : undefined;

	// Initialize the participants list if it doesn't exist
	object.participants = object.participants || [];

	// Loop through the list
	object.participants.forEach(function (org) {
		if (org.party) {
			// Grant viewing permissions to each participant
			Providers.getViewAccessProvider().grantRuntimeAccess(org.party.memberId);

			// If the issue was assigned and is in the list, indiciate it doesn't need to be added
			if (assignment && org.party.memberId == assignment) {
				addOrg = false;
			}
		}
	});

	// If the issue was assigned and needs to be added, push to the list and grant permissions
	if (assignment && addOrg) {
		object.participants.push({ party: { memberId: assignment } });
		Providers.getViewAccessProvider().grantRuntimeAccess(assignment);
	}

	Providers.getPersistenceProvider().save(object);
}

function postSave(object, event, params) {
	// Create a query for all messages on this issue and execute it
	var messages = Providers.getQueryProvider().createQuery('$MessageT4', 310).setOQL('issue.rootId = \'' + object.uid + '\'').execute();

	if (messages && messages.length > 0) {
		// Cycle through each message on the issue
		messages.forEach(function (message) {
			// Trigger a save on the message so their participant permissions are updated
			Providers.getPersistenceProvider().save(message);
		});
	}
}

function takeOwnershipPostTransition(object, event, params) {
	// Set the owner field to the current user
	object.owner = Providers.getSessionProvider().getCurrentUserId();
	Providers.getPersistenceProvider().save(object);
}

function releaseOwnershipPostTransition(object, event, params) {
	// Set the owner field to nothing
	object.owner = ' ';
	Providers.getPersistenceProvider().save(object);
}

function assignValidate(object, event, params) {
	if (object.assignedTo == null) {
		// Throw error if assigned to field is not set
		Providers.getMessageProvider().error().msgKey('assignedToNullError').fieldPath('$IssueT3/assignedTo').build();
	}
}