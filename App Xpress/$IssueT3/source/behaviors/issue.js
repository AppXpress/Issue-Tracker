/// <reference path='C:\Users\dbrunwasser\Storage\Intellisense\facade.d.ts' />

// Hide tools button, app (...) button, and actions button
Facade.Components.Docbar.toolsButton().setMask(Facade.Constants.Mask.HIDDEN);
Facade.Components.Docbar.appButton().setMask(Facade.Constants.Mask.HIDDEN);
Facade.Components.Docbar.actionsButton().setMask(Facade.Constants.Mask.HIDDEN);

// Show all document actions outside overflow
Facade.Components.Docbar.setMaxPromotedActions(10);

// Hide table actions button and show all actions outside overflow
Facade.Components.Table.bottomButtonbar().setMask(Facade.Constants.Mask.HIDDEN);
Facade.Components.Table.header().selectionbar().setMaxPromotedItems(10);



// Update party fields to not have default filters on lookup
Facade.Behaviors.App.onLoad(function () {
	Facade.PageRegistry.getPrimaryData().getDesign().getField('assignedTo').setPartyRole('');
	Facade.DesignRegistry.get('$ParticipantT3').getField('party').setPartyRole('');
});



Facade.Behaviors.Page.onLoad(function () {
	var data = Facade.PageRegistry.getPrimaryData();

	// Check if the data is new or is not closed
	if (data.isNew() || data.get('status') != 'closed') {
		// Enable edit mode by default
		Facade.PageRegistry.setEditMode(true);
	}

	if (data.isNew()) {
		let licensees = Facade.DesignRegistry.get('$IssueT3').get('licensee');
		data.set('licensee', { memberId: licensees.getRaw().orgId[0] });
	}
});



// Get user lookup component
Facade.Components.Lookup.forName('ownerLookup')

	// Set lookup data to user list
	.setData(new Facade.Prototypes.ResolverData('OwnerLookup', {
		'type': 'User', 'isList': true, 'resolver': function () {
			// Gets a list of users for the lookup
			return Facade.Resolver.query('User');
		}
	}))

	// Set the owner on lookup selection
	.setOnLookup(function () {
		Facade.PageRegistry.getPrimaryData().set('owner', this.getSelectionSet().getSelection().getLogin());
	})

	// Sets the fields of the inner lookup table
	.lookupTable().setFields(['login', 'name'])

// Sets the names of the lookup table fields
Facade.Components.Lookup.forName('ownerLookup').lookupTable().field('login').setLabel('User')
Facade.Components.Lookup.forName('ownerLookup').lookupTable().field('name').setLabel('Name');



// Add to docbar
Facade.Components.Docbar.buttonbar().appendButtons('ownerButton');

// Applies to the added button
Facade.Components.Docbar.buttonbar().button('ownerButton')

	.setLabel('Set Owner')

	// Show the lookup popover when the buttonbar button is clicked
	.setOnClick(function () {
		Facade.PageRegistry.getComponent('ownerLookup').getLookupPopover().show();
	})

	// Hide the buttonbar button when the issue is not in the assigned state
	.setMask(function () {
		var actionSet = Facade.DataCoordinator.getActionStrategy().getActionSet();
		if (actionSet.getActions().includes('wf_takeOwnership')) {
			return Facade.Constants.Mask.NORMAL;
		}
		return Facade.Constants.Mask.HIDDEN;
	});



// Make assigned to field read only after assignment
Facade.Components.Field.forName('assignedTo').setMask(function () {
	var data = Facade.PageRegistry.getPrimaryData();

	if (data.isNew() || data.get('status') == 'opened') {
		return Facade.Constants.Mask.NORMAL;
	}
	return Facade.Constants.Mask.READONLY;
});



// Populates the issue attachment table
Facade.Components.Attachments.forName('issueAttachments').setAttachmentsData(function () {
	var data = Facade.PageRegistry.getPrimaryData();

	if (data.isNew()) {
		return new Facade.Prototypes.DataList([], { 'type': 'Attachment' });
	}

	return new Facade.Prototypes.ResolverData('Attachments' + data.getId(), {
		'type': 'Attachment', 'isList': true, 'resolver': function () {
			// Gets a list of attachments for each attachment table
			return Facade.Resolver.queryAttachments('$IssueT3', data.getId());
		}
	});
});



// Hides the attachments and messages sections when the issue is new
Facade.Components.Section.forKind('hideNew')

	.setMask(function () {
		var data = Facade.PageRegistry.getPrimaryData();

		if (data.isNew()) {
			return Facade.Constants.Mask.HIDDEN;
		}
		return Facade.Constants.Mask.NORMAL;
	});