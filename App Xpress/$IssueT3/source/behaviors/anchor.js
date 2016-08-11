/// <reference path='C:\Users\dbrunwasser\Storage\Intellisense\facade.d.ts' />

/**
 * A data structure stroing information about the possible anchor object types
 */
var objectTypes = {
	'GoodsDispatchDetail': { 'name': 'Goods Dispatch Detail', },
	'OrderDetail': { 'name': 'Order Detail', 'fields': ['poNumber'], 'id': 'orderUid', 'url': 'OrderDetail' },
	'PackingListDetail': { 'name': 'Packing List Detail', },
	'InvoiceDetail': { 'name': 'Invoice Detail', 'fields': ['invoiceNumber'], 'id': 'invoiceUid', 'url': 'InvoiceFolder' }
};

// For some reason this is necessary to ensure Facade.DesignRegistry.get('') works below
// Without this here, that function would sometimes return nothing
Facade.Behaviors.App.preLoad(function () {
	return Facade.Resolver.design('');
});

// After the design list is queried, we can make queries for each individual design
Facade.Behaviors.App.onLoad(function () {
	// Store a list of queries and get the list of object designs
	var queries = [], designs = Facade.DesignRegistry.get('');

	designs.get('objectType').getRaw().forEach(type => {
		// For each custom object, add a query for it to the list
		if (type.startsWith('$')) {
			queries.push(Facade.Resolver.design(type));
		}
	});

	// Combine and execute all of the design queries
	return Facade.Promises.combine(queries);
});

// Converts the object type structure into a picklist for the dropdown
Facade.Behaviors.Page.onLoad(function () {
	// Get a list of all queries again
	Facade.DesignRegistry.get('').get('objectType').getRaw().forEach(type => {
		if (type.startsWith('$')) {

			// For each custom object type, get its design
			var design = Facade.DesignRegistry.get(type);
			if (design) {
				// If it has a design, localize its name and find the natural identifier
				var name = Facade.Localization.localize(type);
				var naturalId = design.get('design').get('identification').get('naturalIdentifier');

				// Start a list of fields with the naturalIidentifier and get a list of all fields in the design
				var fields = [naturalId], objectFields = design.getFields();
				objectFields.forEach(field => {
					// For each field, if the field isn't the natural identifier but is a summary field, add it to the list
					if (field != naturalId && field.get('summary') == 'true') {
						fields.push(field.get('i18nKey'));
					}
				});

				// Add the object type to the data structure with the proper name, fields, id, and url
				objectTypes[type] = { name: name, fields: fields, id: 'uid', url: type }
			}
		}
	});

	// Create an array of object types
	var objectList = [];

	for (var key in objectTypes) {
		// Add the name and key of each object type to the array
		objectList.push({ 'value': key, 'label': objectTypes[key].name });
	}

	// Register the array as a picklist for the object type dropdown
	Facade.PicklistRegistry.register('anchorList', new Facade.Prototypes.Picklist(objectList));
});



// Sets the add item popover template to the anchor.html file
Facade.Components.Table.forName('anchorTable').itemAddForm().setTemplate('anchor');

// Hide the submit button on the popover since it does nothing
Facade.Components.Table.forName('anchorTable').itemAddPopover()
	.buttonbar().button('submit').setMask(Facade.Constants.Mask.HIDDEN);



// Anchor table link logic
Facade.Components.Link.forKind('anchorLink').setLink(function (args) {
	var data = args.components.tableRow.getPathData();
	var link = new Facade.Prototypes.Link();

	if (data.get('objectType') && objectTypes[data.get('objectType')]) {
		// Create a new link by building a URL to the custom object instances
		link = new Facade.Prototypes.Link(
			Facade.UrlBuilder.build('/en/trade/' + objectTypes[data.get('objectType')].url, {
				'globalObjectType': data.get('objectType'), 'key': data.get('objectId')
			})
		);
	}

	// Set the link label and return
	link.setLabel(data.get('objectName'));
	return link;
});

// Sets the type text field to include the nice name
Facade.Components.Text.forKind('anchorText').setLabel(function (args) {
	// Gets the raw type of the object
	var type = this.getPathData().getRaw();

	if (type && objectTypes[type]) {
		// If there is a type, get the name and return a string
		var name = objectTypes[type].name;
		return name + ' - ' + type;
	}
	return type;
});



// Lookup field logic
Facade.Components.Lookup.forName('anchorLookup')

	// Can only select one object at a time
	.setSelectMultiple(false)

	// Sets the lookup text to match the dropdown value
	.setLabel(function () {
		var type = Facade.PageRegistry.getComponent('anchorDropdown').getSelectedKey();
		return 'Select ' + objectTypes[type].name + ' - ' + type;
	})

	// Hides the lookup button if the dropdown is empty
	.setMask(function () {
		var dropdown = Facade.PageRegistry.getComponent('anchorDropdown');

		if (dropdown.getSelectedKey()) {
			return Facade.Constants.Mask.NORMAL;
		}
		return Facade.Constants.Mask.HIDDEN;
	})

	// Sets the lookup to use the correct lookup data based on the dropdown selection
	.setData(function () {
		var selection = Facade.PageRegistry.getComponent('anchorDropdown').getSelectedKey();

		// Returns a resolver object for the selected type
		return new Facade.Prototypes.ResolverData(selection + 'Lookup', {
			'type': selection, 'isList': true, 'resolver': function () {
				return Facade.Resolver.query(selection);
			}
		});
	})

	// Handles when a user selects an object in the lookup
	.setOnLookup(function () {
		var data = Facade.PageRegistry.getPrimaryData();
		var key = Facade.PageRegistry.getComponent('anchorDropdown').getSelectedKey();
		var selection = this.getSelectionSet().getSelection();

		// Creates a new GenericAnchor object from the lookup selection
		var anchor = {
			'objectName': selection.get(objectTypes[key].fields[0]),
			'objectType': key,
			'objectId': selection.get(objectTypes[key].id)
		}

		// Gets the list or creates one, adds the anchor, and saves it
		list = data.get('anchors') || new Facade.Prototypes.DataList([], { 'type': '$GenericAnchorT1' });
		list.push(new Facade.Prototypes.Data(anchor, { 'type': '$GenericAnchorT1' }));
		data.set('anchors', list);

		// Closes the popover
		Facade.PageRegistry.getComponent('anchorTable').getItemAddPopover().hide();
	})

	// Sets the table columns of the lookup based on the dropdown selection
	.lookupTable().setFields(function () {
		var dropdown = Facade.PageRegistry.getComponent('anchorDropdown');
		return objectTypes[dropdown.getSelectedKey()].fields;
	});