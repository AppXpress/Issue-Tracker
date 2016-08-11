import {Component, Injectable} from '@angular/core';
import {NavController, NavParams, ViewController, Modal, Popover} from 'ionic-angular';

import {DataService, QueryService} from './services';


/**
 * A service for creating certain selection popovers.
 * 
 * @export
 * @class PopoverService
 */
@Injectable()
export class SelectService {

	/**
	 * Creates an instance of SelectService.
	 * 
	 * @param {QueryService} query
	 * @param {NavController} nav
	 */
	constructor(private query: QueryService, private nav: NavController) { }

	/**
	 * Private method for creating a popover with the correct event and on dismiss binding.
	 * 
	 * @private
	 * @param {any} call The function to call on selection
	 * @param {any} event The event that the popover is related to
	 * @param {any} type The type of popover to create
	 * @param {any} [args] The arguments to pass to the popover
	 */
	private popover(call, event, type, args?) {
		let popover = Popover.create(type, args);
		this.nav.present(popover, { ev: event });
		popover.onDismiss(data => {
			if (data) {
				call(data);
			}
		});
	}

	/**
	 * Creates an organization selection popover.
	 * 
	 * @param {any} onSelect The function to call on select
	 * @param {any} [event] The triggering event
	 */
	org(onSelect, event?) {
		this.popover(onSelect, event, SelectPopover,
			{ items: DataService.orgs }
		);
	}

	/**
	 * Creates a user selection popover.
	 * 
	 * @param {any} onSelect The function to call when a user is selected
	 * @param {any} [event] The event that triggered this popover
	 */
	user(onSelect, event?) {
		this.popover(onSelect, event, SelectPopover,
			{ items: DataService.users }
		);
	}

	/**
	 * Creates an action selection popover
	 * 
	 * @param {any} actions The actions to show in the popover
	 * @param {any} onSelect The function to call on selection
	 * @param {any} [event] The event that triggered the popover
	 */
	action(actions, onSelect, event?) {
		this.popover(onSelect, event, SelectPopover,
			{ items: actions }
		);
	}

	/**
	 * Creates an object type selection popover.
	 * 
	 * @param {any} onSelect The function to call when a type is selected
	 * @param {any} [event] The event that triggered this popover
	 */
	type(onSelect, event?) {
		this.popover(onSelect, event, SelectPopover,
			{ items: DataService.types }
		);
	}

	/**
	 * Creates an object item (instance) selection popover.
	 * 
	 * @param {any} type The type of object to select
	 * @param {any} onSelect The function to call when an instance is selected
	 * @param {any} [event] The event that created the popover
	 */
	item(type, onSelect, event?) {
		let modal = Modal.create(ItemModal, { type: type });
		this.nav.present(modal, { ev: event });
		modal.onDismiss(data => {
			if (data) {
				onSelect(data);
			}
		});
	}
}


/**
 * A generic selection popover.
 * 
 * @class SelectPopover
 */
@Component({
	template: `
<ion-toolbar>
	<ion-title>Tap an item</ion-title>
</ion-toolbar>

<ion-list text-wrap>
	<button ion-item *ngFor="let item of items" (click)="select(item.value)">
		<h2>{{item.name}}</h2>
		<p *ngIf="item.details">{{item.details}}</p>
	</button>
	<ion-item *ngIf="!items || items.length == 0">
		<h2>No items available</h2>
	</ion-item>
</ion-list>
	`
})
class SelectPopover {
	private items;

	/**
	 * Creates an instance of SelectPopover.
	 * 
	 * @param {NavParams} params
	 * @param {ViewController} view
	 */
	constructor(params: NavParams, private view: ViewController) {
		this.items = params.data.items;
	}

	/**
	 * Submits a popover selection.
	 * 
	 * @param {any} item The item selected from the popover
	 */
	select(item) {
		this.view.dismiss(item);
	}
}

/**
 * A modal window class for allowing the user to select an object instance.
 * 
 * @class ItemModal
 */
@Component({
	template: `
<ion-header>
	<ion-navbar>
		<ion-title>Tap an item</ion-title>
		
		<ion-buttons end>
			<button (click)="cancel()">
				<ion-icon name="close"></ion-icon>
			</button>
		</ion-buttons>
	</ion-navbar>
</ion-header>

<ion-content text-wrap>
	<ion-toolbar *ngIf="showFilter">
		<ion-input [(ngModel)]="search" placeholder="Enter an OQL search"></ion-input>

		<ion-buttons end>
			<button (click)="setFilter()">
				<ion-icon name="checkmark-circle"></ion-icon>
			</button>
			<button (click)="clearFilter()">
				<ion-icon name="close-circle"></ion-icon>
			</button>
		</ion-buttons>
	</ion-toolbar>

	<template [ngIf]="items">
		<button ion-item *ngFor="let item of items" (click)="select(item)">
			<h2>{{item[data.fields[0]] || "Not specified"}}</h2>

			<p *ngFor="let field of data.fields.slice(1)">
				<template [ngIf]="item[field] && item[field].toString() != {}.toString()">
					{{item[field] || "Not specified"}}
				</template>
			</p>
		</button>
	</template>

	<ion-item *ngIf="!items">
		<ion-spinner item-left></ion-spinner>
		<h2>Loading...</h2>
	</ion-item>

	<ion-item *ngIf="items && items.length == 0">
		<h2>No items found</h2>
	</ion-item>

	<button *ngIf="hasMore" full clear (click)="load()">
		Tap to view more
	</button>
</ion-content>
	`
})
class ItemModal {
	private hasMore = false;
	private search;
	private filter;
	private items;
	private data;
	private type;

	/** Filter isn't very good or user-fieldly so I disabled it for now */
	private showFilter = false;

	/**
	 * Creates an instance of ItemModal.
	 * 
	 * @param {NavParams} params
	 * @param {QueryService} query
	 * @param {ViewController} view
	 */
	constructor(params: NavParams, private query: QueryService, private view: ViewController) {
		this.type = params.data.type;
		this.data = DataService.data[this.type];

		this.load();
	}

	/**
	 * Sets the filter to the current input value and reloads.
	 * NOTE: filter is currently disabled.
	 */
	setFilter() {
		this.hasMore = false;
		this.filter = this.search;
		delete this.items;
		this.load();
	}

	/**
	 * Resets the filter and reloads the data.
	 * NOTE: filter is currently disabled.
	 */
	clearFilter() {
		this.hasMore = false;
		delete this.filter;
		delete this.items;
		this.load();
	}

	/**
	 * Selects an object instance and submits it.
	 * 
	 * @param {any} item The instance being selected
	 */
	select(item) {
		this.view.dismiss(item);
	}

	/**
	 * Closes the modal without selecting anything.
	 */
	cancel() {
		this.view.dismiss();
	}

	/**
	 * Loads objects from the system.
	 */
	load() {
		let keys = { offset: (this.items || []).length, oql: this.filter }
		this.query.get([this.type, 'query'], keys).subscribe(
			data => {
				// Sets the items list with the updated values
				this.items = (this.items || []).concat(data.result || []);

				// Shows or hides the 'more' button accordingly
				this.hasMore = data.resultInfo.hasMore;
			}
		);
	}
}