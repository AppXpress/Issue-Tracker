import {Component} from '@angular/core';
import {NavController, NavParams, ViewController, Loading, Toast} from 'ionic-angular';

import {Attachments} from '../../components/attachments';
import {DataService, ImageService, QueryService, SelectService} from '../../services';
import {IssuePage} from '../display/issue';


/**
 * A page for editing and creating issues.
 * 
 * @export
 * @class IssueEditor
 */
@Component({
	templateUrl: 'build/pages/update/issue.html',
	providers: [ImageService, SelectService],
	directives: [Attachments]
})
export class IssueEditor {
	private data;
	private item;
	private isNew;
	private issue;
	private attachments = [];

	/**
	 * Creates an instance of IssueEditor.
	 * 
	 * @param {NavParams} params
	 * @param {NavController} nav
	 * @param {ViewController} view
	 * @param {DisplayService} display
	 * @param {ImageService} image
	 * @param {QueryService} query
	 */
	constructor(
		params: NavParams,
		private nav: NavController,
		private view: ViewController,
		private image: ImageService,
		private query: QueryService,
		private select: SelectService
	) {
		this.data = DataService.data;
		this.item = params.data.issue;

		// If an issue was passed to the editor
		if (this.item) {
			// Query a copy from the system
			this.query.get(['$IssueT3', this.item.uid]).subscribe(
				data => {
					this.issue = data;
				}
			);
		} else {
			// Otherwise create a new issue
			this.isNew = true;
			this.issue = { type: '$IssueT3' };
		}
	}

	/**
	 * Set the assigned to field on the issue.
	 * 
	 * @param {any} event The mouse click event
	 */
	setAssignedTo(event) {
		// Show an organization selection popover
		this.select.org(org => {
			// Set the assigned to field to match the organization
			this.issue.assignedTo = {
				name: org.name,
				memberId: org.organizationId
			}
		}, event);
	}

	clearAssignedTo(event: MouseEvent) {
		delete this.issue.assignedTo;
		event.stopPropagation();
	}

	/**
	 * Adds an attachment image.
	 * 
	 * @param {any} isNew Whether the camera should take a new picture or use an existing one
	 */
	addAttachment(isNew) {
		this.image.addImage(isNew, attachment => {
			this.attachments.push(attachment);
		});
	}

	/**
	 * Removes an attachment image.
	 * 
	 * @param {any} attachment The attachment to remove
	 */
	removeAttachment(attachment) {
		this.attachments = this.attachments.filter(item => {
			return item != attachment;
		});
	}

	/**
	 * Add an achor (transaction) to the issue.
	 * 
	 * @param {any} event The mouse click event
	 */
	addAnchor(event) {
		// Show an object type selection popover
		this.select.type(type => {
			// Show an item selection popover of the selected type
			this.select.item(type, item => {
				// Set the anchors list to itself or a new list if it didn't exist
				this.issue.anchors = this.issue.anchors || [];

				// Push the selected anchor to the anchor list
				this.issue.anchors.push({
					objectType: type,
					objectId: item[DataService.data[type].uid],
					objectName: item[DataService.data[type].fields[0]]
				});
			});
		});
	}

	/**
	 * Add a participant to the issue.
	 * 
	 * @param {any} event The mouse click event
	 */
	addParticipant(event) {
		// Show an organization selection popover from the popover service
		this.select.org(org => {
			// Set the participants list to itself or a new list if it didn't exist
			this.issue.participants = this.issue.participants || [];

			// Push the new part to the participants list
			this.issue.participants.push({
				party: { name: org.name, memberId: org.organizationId }
			});
		}, event);
	}

	/**
	 * Remove an item from a list in an issue.
	 * 
	 * @param {any} list The name of the list to remove the item from
	 * @param {any} item The item to remove from the list
	 */
	remove(list, item) {
		this.issue[list].splice(this.issue[list].indexOf(item), 1);
	}

	/**
	 * Save changes to an existing or new issue.
	 */
	save() {
		if (this.isNew) {
			this.create();
		} else {
			this.update();
		}
	}

	/**
	 * Cancel edits to an issue.
	 */
	cancel() {
		this.view.dismiss();
	}

	/**
	 * Create a new issue using the given data.
	 */
	create() {
		// Show a loading indicator to the user
		let loading = Loading.create({
			content: 'Loading...'
		});
		this.nav.present(loading);

		// Query for the issue design to get the licensees
		this.query.get(['$IssueT3']).subscribe(
			data => {
				// Set the licensee to the first one in the design
				this.issue.licensee = { memberId: data.licensee.orgId[0] };

				// Post the new issue data to the system
				this.query.post(JSON.stringify(this.issue), ['$IssueT3']).subscribe(
					data => {
						// Gets the path data for uploading attachments
						let path = ['$IssueT3', data.create.result.uid, 'attach'];

						// Uses the image service to upload and attach all images
						this.image.uploadImages(this.attachments, path, () => {
							// Once complete, dismiss the loading indicator and the editor view
							loading.dismiss().then(value => {
								// Passes true to indicate that the messages should be reloaded
								this.view.dismiss(true);
							});
						});
					},
					error => {
						// If failed, close the loading indicator and show an error toast
						loading.dismiss().then(value => {
							this.nav.present(Toast.create({
								message: 'Something went wrong, try again later',
								duration: 3000,
							}));
						});
					}
				)
			}
		)
	}

	/**
	 * Save changes to an existing issue.
	 */
	update() {
		// Show a loading indicator to the user
		let loading = Loading.create({
			content: 'Loading...'
		});
		this.nav.present(loading);

		// Add the fingerprint to the headers
		let headers = { "If-Match": this.issue.fingerprint };

		// Post the chanes to the system using the API
		this.query.post(JSON.stringify(this.issue), ['$IssueT3', this.issue.uid], {}, headers).subscribe(
			data => {
				// If successful, delete all properties locally
				for (var property in this.item) {
					delete this.item[property];
				}
				// Store the new properties in the local copy
				for (var property in data.data) {
					this.item[property] = data.data[property];
				}

				// Gets the path data for uploading attachments
				let path = ['$IssueT3', data.data.uid, 'attach'];

				// Uses the image service to upload and attach all images
				this.image.uploadImages(this.attachments, path, () => {
					// Once complete, dismiss the loading indicator and the editor view
					loading.dismiss().then(value => {
						// Passes true to indicate that the messages should be reloaded
						this.view.dismiss(true);
					});
				});
			},
			error => {
				// On failure, hide the loading indicator and display an error message
				loading.dismiss().then(value => {
					this.nav.present(Toast.create({
						message: 'Something went wrong, try again later',
						duration: 3000,
					}));
				});
			}
		);
	}
}