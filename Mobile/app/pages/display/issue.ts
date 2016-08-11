import {Component} from '@angular/core';
import {NavController, NavParams, ActionSheet, Loading, Modal, Toast} from 'ionic-angular';

import {Attachments} from '../../components/attachments';
import {ImageService, QueryService, SelectService} from '../../services';
import {MessagesPage} from './messages';
import {IssueEditor} from '../update/issue';


/**
 * A page that displays information about an issue.
 * 
 * @export
 * @class DetailsPage
 */
@Component({
	templateUrl: 'build/pages/display/issue.html',
	providers: [ImageService, SelectService],
	directives: [Attachments]
})
export class IssuePage {
	private issue;
	private loading = false;
	private transitions = [];
	private editable = false;

	/**
	 * Creates an instance of IssuePage.
	 * 
	 * @param {NavParams} params
	 * @param {NavController} nav
	 * @param {DisplayService} display
	 * @param {ImageService} image
	 * @param {QueryService} query
	 */
	constructor(
		params: NavParams,
		private nav: NavController,
		private image: ImageService,
		private query: QueryService,
		private select: SelectService
	) {
		this.issue = params.data.issue;

		this.loadActions();
		this.loadAttachments();
	}

	/**
	 * Opens a message view for the current issue.
	 */
	messages() {
		this.nav.push(MessagesPage, { issue: this.issue });
	}

	/**
	 * Opens an editor page for updating an issue.
	 */
	edit() {
		let modal = Modal.create(IssueEditor, { issue: this.issue });
		this.nav.present(modal);
		modal.onDismiss(data => {
			// If the editor returned true, reload the issue
			if (data) {
				this.loadActions();
				this.loadAttachments();
			}
		});
	}

	/**
	 * Displays an options menu for the issue.
	 */
	actions(event) {
		this.select.action(this.transitions, value => {
			if (value == 'setOwner') {
				// If the selected action was set owner, create a popover
				this.select.user(user => {
					// After selection, store the new user in the owner field
					this.issue.owner = user;

					// Continue with the transition (it will basically just run an update post)
					this.transition(value);
				}, event);
			} else {
				// Runs the transition normally
				this.transition(value);
			}
		}, event);
	}

	/**
	 * Reloads the issue from the system.
	 */
	reload() {
		// Shows a loading message on the screen
		this.loading = true;

		// Clears the transitions list and resets the editable flag
		this.transitions = [];
		this.editable = false;

		// Queries for the issue with the stored ID
		this.query.get(['$IssueT3', this.issue.uid]).subscribe(
			data => {
				// On success delete all properties from the local copy
				for (var property in this.issue) {
					delete this.issue[property];
				}
				// Copy all properties from the server copy to the local copy
				for (var property in data) {
					this.issue[property] = data[property];
				}

				// Hide the loading message
				this.loading = false;

				// Load the actions and attachments for the issue
				this.loadActions();
				this.loadAttachments();
			},
			error => {
				// If there was an error, show a toast message
				this.nav.present(Toast.create({
					message: 'Something went wrong.',
					duration: 3000
				}));
			}
		)
	}

	/**
	 * Loads the attachments for the issue from the system.
	 */
	loadAttachments() {
		this.query.get(['$IssueT3', this.issue.uid, 'attachment']).subscribe(
			data => {
				// Set the issue attachments to the query result or an empty array
				this.issue.attachments = data.result || [];

				// Load attachments that are images.
				this.image.loadImages(this.issue.attachments);
			},
			error => {
				// If there was an error, show a toast message
				this.nav.present(Toast.create({
					message: 'Something went wrong.',
					duration: 3000
				}));
			}
		)
	}

	/**
	 * Gets the list of actions from the system.
	 */
	loadActions() {
		this.query.get(['$IssueT3', this.issue.uid, 'actionSet']).subscribe(
			data => {
				this.transitions = [];

				// Sets the editable flag based on the existance of the modify action
				this.editable = !!data.actionSet.detail.modify;


				// Loops through all returned actions
				for (var action in data.actionSet.detail) {
					// Only if the action is a workflow action
					if (action.startsWith('wf_')) {
						// Adds the transition to the list
						this.transitions.push({
							// Each transition item has it's English name and the workflow name
							name: data.actionSet.detail[action].i18n.en_US,
							value: action
						});
					}
				}

				// If you can take ownership for yourself
				if (data.actionSet.detail.wf_takeOwnership) {
					// Also add an option to the set owner to someone else
					this.transitions.push({
						name: 'Set Owner',
						value: 'setOwner'
					});
				}
			},
			error => {
				// If there was an error, show a toast message
				this.nav.present(Toast.create({
					message: 'Something went wrong.',
					duration: 3000
				}));
			}
		)
	}

	/**
	 * Transitions the issue using the specified action.
	 * 
	 * @param {any} action A string representing the aciton to execute
	 */
	transition(action) {
		// Create and display a loading indicator
		let loading = Loading.create({
			content: 'Loading...'
		});
		this.nav.present(loading);

		// Get the path and the headers for the API call
		let path;
		let headers = { 'If-Match': this.issue.fingerprint };

		if (action == 'setOwner') {
			// If setting the owner, don't run a transition
			path = ['$IssueT3', this.issue.uid];
		} else {
			// Otherwise, create a transition URL
			path = ['$IssueT3', this.issue.uid, 'transition', action];
		}

		// Call the REST API to transition the workflow, and subscribe to the response
		this.query.post(JSON.stringify(this.issue), path, {}, headers).subscribe(
			data => {
				// If running a transition and a message was returned with the transition
				if (action != 'setOwner' && data.transition.message) {
					// Hide the loading message
					loading.dismiss().then(value => {
						// Create an error message using the transition message
						let error = 'Action failed: ';
						data.transition.message.forEach(message => error += message.text);

						// Show a toast with the error message
						this.nav.present(Toast.create({
							message: error,
							duration: 3000
						}));
					});
				} else {
					// Uses a timeout because API transitions don't finish immediately
					setTimeout(() => {
						// Hide the loading message and reload the issue
						loading.dismiss().then(value => {
							this.reload();
						});
					}, 1000);
				}
			},
			error => {
				// Remove the loading indicator
				loading.dismiss().then(value => {
					// If there was an error, show a toast message
					this.nav.present(Toast.create({
						message: 'Something went wrong.',
						duration: 3000
					}));
				});
			}
		)
	}
}