
/**
 * WARNING: this is probably not the best practice for storing this data
 * I'm guessing it should be a service or maybe use the SqlStorage object
 * But static data in a class was just easier
 */

export class DataService {
	static orgs;
	static users;
	static types;
	static data;

	static update(query) {
		var queryOrgs = offset => {
			query.get(['OrganizationDetail', 'query'], { offset: offset }).subscribe(
				data => {
					data.result.forEach(org => {
						this.orgs.push({
							name: org.name,
							value: org
						});
					});

					if (data.resultInfo.hasMore) {
						queryOrgs(this.orgs.length);
					}
				}
			);
		}

		this.orgs = [];
		queryOrgs(0);


		var queryUsers = offset => {
			query.get(['User', 'query'], { offset: offset }).subscribe(
				data => {
					data.result.forEach(user => {
						this.users.push({
							name: user.uid,
							value: user.uid
						});
					});

					if (data.resultInfo.hasMore) {
						queryUsers(this.users.length);
					}
				}
			);
		}

		this.users = []
		queryUsers(0);


		var getFields = design => {
			var fields = [design.identification.naturalIdentifier];

			for (var field in design.fieldData) {
				if (design.fieldData[field].summary == 'true') {
					if (field != design.identification.naturalIdentifier) {
						fields.push(field);
					}
				}
			}

			return fields;
		}

		var getDesign = type => {
			query.get([type]).subscribe(
				data => {
					let name = data.design.feature.localization.en_US[type];
					this.types.push({ name: name, details: type, value: type });

					this.data[type] = {
						id: 'uid',
						name: name,
						url: data.design.globalObjectType,
						fields: getFields(data.design)
					}
				}
			);
		}

		this.types = [
			{ name: 'Goods Dispatch Detail', value: 'GoodsDispatchDetail' },
			{ name: 'Order Detail', value: 'OrderDetail' },
			{ name: 'Packing List Detail', value: 'PackingListDetail' },
			{ name: 'Invoice Detail', value: 'InvoiceDetail' }
		];
		this.data = {
			'GoodsDispatchDetail': { 'name': 'Goods Dispatch Detail', },
			'OrderDetail': { 'id': 'orderUid', 'name': 'Order Detail', 'url': 'OrderDetail', 'fields': ['poNumber'] },
			'PackingListDetail': { 'name': 'Packing List Detail', },
			'InvoiceDetail': { 'id': 'invoiceUid', 'name': 'Invoice Detail', 'url': 'InvoiceFolder', 'fields': ['invoiceNumber'] }
		};

		query.get().subscribe(
			data => {
				data.objectType.forEach(type => {
					if (type.startsWith('$')) {
						getDesign(type);
					}
				});
			}
		);
	}
}