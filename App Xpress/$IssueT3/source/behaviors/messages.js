/// <reference path='C:\Users\dbrunwasser\Storage\Intellisense\facade.d.ts' />

/**
 * Existing messages
 */

Facade.Components.Include.forName('messageInclude')
	.setTemplate('message');


/**
 * Message List
 */

// The core list for the messages embedded field
Facade.Components.List.forName('messageList')
	// Set the data for each message to a resolver prototype
	.setData(new Facade.Prototypes.ResolverData('messages', {
		'type': '$MessageT4', 'isList': true, 'resolver': function () {
			return Facade.Resolver.query('$MessageT4', {
				'params': { 'oql': 'issue.rootId = ' + Facade.PageRegistry.getPrimaryData().getId() + ' ORDER BY createTimestamp' }
			});
		}
	}));

// Text fields in list
Facade.Components.Field.forKind('messageText')
	// Labels the message field with creation information
	.setLabel(function (arg) {
		let message = arg.components.listItem.getPathData();
		return message.get('createdBy') + ' on ' + message.get('createdOn');
	});

// Attachments tables in list
Facade.Components.Attachments.forKind('messageAttachments')
	// Sets the attachments for each message
	.setAttachmentsData(function () {
		var message = arguments[0].components.listItem.getPathData();

		if (!message.getId()) {
			return new Facade.Prototypes.DataList([], { 'type': 'Attachment' });
		}

		return new Facade.Prototypes.ResolverData('MessageAttachments' + message.getId(), {
			'type': 'Attachment', 'isList': true, 'resolver': function () {
				return Facade.Resolver.queryAttachments('$MessageT4', message.getId());
			}
		});
	})

	// Hides the attachments table if there are no messages
	.setMask(function () {
		var key = 'MessageAttachments' + this.getPathData().get('uid');
		var attachments = Facade.DataRegistry.get(key);
		if (!attachments || attachments.getLength()) {
			return Facade.Constants.Mask.NORMAL;
		}
		return Facade.Constants.Mask.HIDDEN;
	});



/**
 * New messages
 */

// Add a new message object and new attachments object to the data registry
Facade.Behaviors.App.onLoad(function () {
	reload();
});


// Reload the list of messages
function reload() {
	// Remove old data from registry
	Facade.DataRegistry.evict('messages');
	Facade.DataRegistry.evict('newMessage');
	Facade.DataRegistry.evict('newAttachments');

	// Add a new message register
	Facade.DataRegistry.register('newMessage', new Facade.Prototypes.Data(
		{ 'text': '' }, { 'type': '$MessageT4', isNew: true }
	));

	// Add a new attachments register
	Facade.DataRegistry.register('newAttachments', new Facade.Prototypes.DataList(
		[], { 'type': 'Attachment' }
	));
}


// Mask helper function to prevent code repetition
function hideWhenClosed() {
	var data = Facade.PageRegistry.getPrimaryData();

	if (data.get('status') == 'closed') {
		return Facade.Constants.Mask.HIDDEN;
	}
	return Facade.Constants.Mask.NORMAL;
}

// Button for typing a new message
Facade.Components.Button.forName('createButton')
	.setMask(hideWhenClosed)

	.setOnClick(function () {
		attaching = false;
		Facade.PageRegistry.getComponent('messagePopover').show();
	});


// Button for typing a new message and attaching to it
Facade.Components.Button.forName('createAndAttachButton')
	.setMask(hideWhenClosed)

	.setOnClick(function () {
		attaching = true;
		Facade.PageRegistry.getComponent('messagePopover').show();
	});


// Makes the reload button call the reload method
Facade.Components.Button.forName('reloadButton').setOnClick(reload);



/**
 * New message popover
 */

// Simple flag indiciting whether or not to show an attachment step
var attaching;


// Sets the buttons available on the message popover
Facade.Components.Popover.forName('messagePopover').buttonbar().setButtons(() => {
	if (attaching) {
		// If attaching, show different buttons depending on the step
		if (Facade.DataRegistry.get('newMessage').isNew()) {
			return ['next', 'cancel'];
		}
		return ['save'];
	}
	return ['save', 'cancel'];
});


// Saves a message to the system
function save() {
	var message = Facade.DataRegistry.get('newMessage');

	// Set the message licensee to that of the issue
	message.set('licensee', Facade.PageRegistry.getPrimaryData().get('licensee'));

	// Set the root pointer of the message to point to this issue
	message.set('issue', {
		'reference': 'Issue',
		'rootId': Facade.PageRegistry.getPrimaryData().getId(),
		'rootType': '$IssueT3',
		'externalType': '$IssueT3'
	});

	// Persist will save the new message to the server
	return Facade.Resolver.persist(message);
}

// Closes the popover
function close() {
	Facade.PageRegistry.getComponent('messagePopover').hide();
	reload();
}

// The next button saves the message, this will automatically advance to the next step
Facade.Components.Popover.forName('messagePopover').buttonbar().button('next').setOnClick(save);

// The save button saves the message and closes the popover
Facade.Components.Popover.forName('messagePopover').buttonbar().button('save')
	.setOnClick(() => {
		return save().then(() => {
			close();
		});
	});

// The cancel button just closes the popover
Facade.Components.Popover.forName('messagePopover').buttonbar().button('cancel').setOnClick(close);


// Disables the new message text field after saving
Facade.Components.Field.forName('newText')
	.setMask(() => {
		if (Facade.DataRegistry.get('newMessage').isNew()) {
			return Facade.Constants.Mask.NORMAL;
		}
		return Facade.Constants.Mask.READONLY;
	});

// The new attachments table
Facade.Components.Attachments.forName('newAttachments')

	// Hides the new message attachments before the instance is created
	.setMask(function () {
		if (Facade.DataRegistry.get('newMessage').get('uid')) {
			return Facade.Constants.Mask.NORMAL;
		}
		return Facade.Constants.Mask.HIDDEN;
	})

	// Set the anchor of the new message attachments
	.setAnchor(function () {
		return Facade.DataRegistry.get('newMessage');
	})

	// Set the source of data for the new message attachments
	.setAttachmentsData(function () {
		var attachments = Facade.DataRegistry.get('newAttachments');
		if (!attachments) {
			attachments = new Facade.Prototypes.DataList([], { 'type': 'Attachment' });
			Facade.DataRegistry.register('newAttachments', attachments);
		}
		return attachments;
	});