'use strict';

let darkmodeState;

const Settings = {
	'MAIN_TABLE_WIDTH': 3,
	'COMBO_TABLE_WIDTH': 3,
	'DEFAULT_MAX_CAP': 100,
}

const Menu = {
	// Combo Items:
	"Combination Items:": {
		header: true,
	},
	"Baz Special": {
		price: 265,
		max: 2,
		emoji: '🙂',
		items: ["Fries", "Fries", "Fries", "Fries", "Soda"],
	},
	// Burger Meals:
	"Burger Meals:": {
		header: true,
	},
	"Godfather Special": {
		price: 315,
		items: ["Large Pizza", "Large Pizza", "Large Pizza", "Prosciutto Plater", "Mozzarella Sticks", "2L Soda", "2L Soda", "2L Soda"],
	},
	// Individual Items:
	"Individual Items:": {
		header: true,
	},
	"Prosciutto Plater": {
		price: 80,
		items: ["Prosciutto Plater"],
	},
	"Chicken Parmesan": {
		price: 50,
		items: ["Chicken Parmesan"],
	},
	"Chicken Alfredo": {
		price: 50,
		items: ["Chicken Alfredo"],
	},
	"Large Pizza": {
		price: 45,
		items: ["Large Pizza"],
	},
	"Medium Pizza": {
		price: 45,
		items: ["Medium Pizza"],
	},
	"Fries": {
		price: 15,
		items: ["Fries"],
	},
	"Chicken Fingers": {
		price: 15,
		items: ["Chicken Fingers"],
	},
	"Deep Fried Pickles": {
		price: 15,
		items: ["Deep Fried Pickles"],
	},
	"Mozzarella Sticks": {
		price: 25,
		items: ["Mozzarella Sticks"],
	},
	"Cheesy Bread": {
		price: 25,
		items: ["Cheesy Bread"],
	},
	"Garlic Bread": {
		price: 25,
		items: ["Garlic Bread"],
	},
	"Chicken Bite": {
		price: 15,
		items: ["Chicken Bite"],
	},
	"Water": {
		price: 30,
		items: ["Water"],
	},
	"Soda": {
		price: 30,
		items: ["Soda"],
	},
	"2L Soda": {
		price: 40,
		items: ["2L Soda"],
	},
	//,
//"10 Pack BurgerBits": {
 //  price: 1375,
 //  max: 1,
 //  noDiscount: true,
  // lastItem: true,
   //items: ["10 Pack BurgerBits"],
//}
};
const INDIVIDUAL_ITEMS = [
	"Godfather Special", "Prosciutto Plater", "Large Pizza", "Medium Pizza", "Fries", "Soda", "2L Soda", "Chicken Fingers", "Deep Fried Pickles", "Chicken Bite", "Mozzarella Sticks", "Water", "Cheesy Bread", "Garlic Bread", "Chicken Parmesan", "Chicken Alfredo"
];

const buttons = {
	"buffer": {
		html: '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp|&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'
	},
	"new_order": {
		html: '<div class="btn" onclick="newOrder();" title="Clear current order"><i class="fa fa-refresh" aria-hidden="true"></i> New Order</div>',
	},
	"set_combos": {
		html: '<div class="btn" onclick="toggleCombos()" title="Select current active combos"><i class="fa fa-cog" aria-hidden="true"></i> Combo Settings</div>',
	},
	"save": {
		html: '<div class="btn" onclick="updateSelected()" title="Save selected combos"><i class="fa fa-floppy-o" aria-hidden="true"></i> Save Combination Items</div>',
	},
	"deselect_combos": {
		html: '<div class="btn" onclick="deselectCombos()" title="Deselect all combos"><i class="fa fa-times-circle-o" aria-hidden="true"></i> Deselect All</div>',
	}
};

const discounts = {
	"five_off": {
		percent: .5,
		desc: '5% Discount (Police EMS & Employees...)',
	},
	"monday_special": {
		percent: .10,
		desc: 'Monday Special (10% off)',
	},
};

function getOccurrence(array, value) {
	return array.filter((v) => (v === value)).length;
}

function formatItems(items) {
	let newArray = [];
	let imageIcons = '';

	INDIVIDUAL_ITEMS.forEach(item => {
		let occ = getOccurrence(items, item);
		let imageName = item.toLowerCase().replace(' ', '_');
		let imageIcon = `<img src="images/${imageName}.png" title="${occ}x ${item}" width="30" height="30"> `
		if (occ > 0) newArray.push(`- ${occ}x ${imageIcon}${item}`);
	});

	return newArray;
}

function add(item) {
	let elem = document.getElementById(`${item}-#`);
	if (!elem) return alert(`ERROR: ${item} is not available to add to the cart!`);
	let number = Number(elem.innerText);
	let max = Menu[item].max || Settings.DEFAULT_MAX_CAP;
	if (number + 1 <= max) {
		elem.innerText = number + 1;
		report();
	} else {
		alert(`You cannot add more than ${max}x ${item} in 1 order!`);
	}
}

function remove(item) {
	let elem = document.getElementById(`${item}-#`);
	if (!elem) return alert(`ERROR: ${item} is not available to remove to the cart!`);
	let number = Number(elem.innerText);
	if (number - 1 >= 0) {
		elem.innerText = Number(number) - 1;
		report();
	}
}

function set(item, quantity) {
	let elem = document.getElementById(`${item}-#`);
	if (!elem) return alert(`ERROR: ${item} is not available in the cart!`);
	if (isNaN(Number(quantity))) {
		return alert(`ERROR: ${quantity} is not a number!`);
	}
	quantity = Math.round(Number(quantity));
	let max = Menu[item].max || Settings.DEFAULT_MAX_CAP;
	if (max && quantity > max) {
		alert(`You cannot add more than ${max}x ${item} in 1 order!`);
		return;
	}
	elem.innerText = quantity;
	report();
}

function editQuantity(item) {
	let currentQuantity = 0;
	let elem = document.getElementById(`${item}-#`);
	if (elem) currentQuantity = elem.innerText;
	let quantity = prompt(`Enter quantity for ${item}:`, currentQuantity);
	if (!quantity) return set(item, 0);
	set(item, quantity);
}

function getEmptyOrder() {
	let buffer = [];
	buffer.push('<img src="https://i.imgur.com/IGPlB1i.png" width="25%">');
	buffer.push("");
	buffer.push("<strong>ITEMS ORDERED:</strong>");
	buffer.push("");
	buffer.push("");
	buffer.push("");
	buffer.push(`<strong>SUBTOTAL:</strong> <span class="green">$0</span>`);
	document.getElementById('reportBody').innerHTML = buffer.join("\n");
}

function getDiscount() {
	let discountCount = 0;
	let activeDiscount = 0;
	Object.keys(discounts).forEach(discount => {
		let checkBox = document.getElementById(`${discount}-DISCOUNT`);
		if (checkBox && checkBox.checked) {
			discountCount++;
			activeDiscount = discounts[discount].percent;
		}
	});
	if (discountCount > 1) return false;
	if (discountCount == 1) return activeDiscount;
	return "NONE";
}

function report() {
	let buffer = [];
	buffer.push('<img src="https://i.imgur.com/IGPlB1i.png" width="25%">');
	buffer.push("");
	let curDarkmode = document.getElementById('darkmode').checked;
	if (curDarkmode) {
		if (darkmodeState === 'false') updateDarkmode();
	} else if (!curDarkmode) {
		if (darkmodeState === 'true') updateDarkmode();
	}
	let total = 0;
	let allItems = [];
	if (selectingCombos) return;
	let discountSelected = getDiscount();
	if (!discountSelected) {
		alert("You cannot have more than one sale/discount at once!");
		clearDiscounts();
	}

	Object.keys(Menu).forEach(item => {
		if (Menu[item].header) return;
		let selected = true;
		if (Menu[item].emoji) selected = isSelected(item);

		if (!selected) return;
		let discount = (Menu[item].noDiscount ? false : true);
		let price = Menu[item].price;
		if (discountSelected && discountSelected !== 'NONE' && !Menu[item].noDiscount) {
			console.log(discountSelected);
			price = price - Math.round(price * discountSelected);
		}
		let quantity = 0;
		quantity = document.getElementById(`${item}-#`).innerText;

		let items = Menu[item].items;
		total += price * quantity;
		if (quantity) {
			let count = 0;
			while (count < quantity) {
				count++;
				allItems = allItems.concat(items);
			}
		}
	});
	buffer.push("<strong>ITEMS ORDERED:</strong>");
	let formatted = formatItems(allItems.sort());
	buffer.push(formatted.join('\n'));
	buffer.push("");
	buffer.push("");
	buffer.push(`<strong>TOTAL:</strong> <span class="green">$${total}</span>`);

	return document.getElementById('reportBody').innerHTML = buffer.join("\n");
}

// Listen for a click on the checkbox
function updateDarkmode() {
	// Then toggle (add/remove) the .dark-theme class to the body
	let darkmode = document.getElementById('darkmode').checked;
	if (darkmode) {
		localStorage.setItem("darkmode", true);
		darkmodeState = 'true';
	} else if (!darkmode) {
		localStorage.setItem("darkmode", false);
		darkmodeState = 'false';
	}
	document.body.classList.toggle('dark-theme');
}

function isSelected(comboName) {
	let returnVal;
	let value = localStorage.getItem(`${comboName}-SELECTED`);
	if (!value || value === 'undefined' || value === 'false') {
		returnVal = false;
	} else {
		returnVal = true;
	}
	return returnVal;
}

let selectingCombos = false;
let pageReloaded = false;

function updateSelected() {
	if (!selectingCombos) return;
	Object.keys(Menu).forEach(item => {
		if (!Menu[item].header && Menu[item].emoji) {
			let checked = document.getElementById(`${item}-SELECTED`).checked;
			localStorage.setItem(`${item}-SELECTED`, checked);
		}
	});
	toggleCombos();
	pageReloaded = true;
	loadPage();
	newOrder();
}

function toggleCombos() {
	selectingCombos = !selectingCombos;
	if (selectingCombos) {
		let buffer = `<table border="0"><tr><td colspan="${Settings.COMBO_TABLE_WIDTH}"><center><i>Select active combination items:</i></center></td></tr><tr>`;
		let count = 0;
		Object.keys(Menu).forEach(item => {
			if (Menu[item].header || !Menu[item].emoji) return;
			let checked = (isSelected(item) ? "checked" : "");
			let tr = '';
			count++;
			if (count == Settings.COMBO_TABLE_WIDTH) {
				tr = `</tr><tr>`;
				count = 0;
			}
			buffer += `<td><input type="checkbox" id="${item}-SELECTED" name="${item}-SELECTED" value="${item}-SELECTED" ${checked}/>` +
				`<label for="${item}-SELECTED">${Menu[item].emoji} ${item}</label></td>${tr}`;
		});
		for (let i = count; i < Settings.COMBO_TABLE_WIDTH; i++) {
			buffer += `<td></td>`;
		}
		buffer += `<tr><td colspan="${Settings.COMBO_TABLE_WIDTH}"><center>${buttons['save'].html}<br />${buttons['deselect_combos'].html}</center></td></tr>`;
		buffer += `</table>`;

		document.getElementById('table').innerHTML = buffer;
		document.getElementById('action-buttons').innerHTML = '';
	} else {
		document.getElementById('table').innerText = '';
	}
}

function getIcon(item) {
	if (!Menu[item].fileRenameException) {
		item = item.replace('Meal', '').replace('Combo', '').trim();
	}
	if (!Menu[item]) return;
	let icon;
	if (Menu[item].emoji) {
		icon = Menu[item].emoji;
	} else {
		let fileName = `${item.toLowerCase().replace(' ', '_')}.png`;
		icon = `<img src="images/${fileName}" width="20" height="20">`;
	}
	return icon;
}

function clearDiscounts() {
	Object.keys(discounts).forEach(discount => {
		let checkBox = document.getElementById(`${discount}-DISCOUNT`);
		if (checkBox) checkBox.checked = false;
	});
}

function newOrder() {
	Object.keys(Menu).forEach(item => {
		if (Menu[item].header) return;
		let selected = isSelected(item);
		if (Menu[item].emoji && !selected) return;
		document.getElementById(`${item}-#`).innerText = 0;
	});
	pageReloaded = true;
	clearDiscounts();
	report();
}

function deselectCombos() {
	Object.keys(Menu).forEach(item => {
		if (!Menu[item].emoji) return;
		let checkBox = document.getElementById(`${item}-SELECTED`);
		if (checkBox) checkBox.checked = false;
	});
}

function loadPage() {
	if (!pageReloaded) {
		let darkmodeSetting = localStorage.getItem("darkmode");
		if (!darkmodeSetting || darkmodeSetting === 'undefined' || darkmodeSetting === 'false') {
			localStorage.setItem("darkmode", false);
			darkmodeState = 'false';
		}
		if (darkmodeSetting == 'true') {
			document.getElementById('darkmode').checked = true;
			document.body.classList.toggle('dark-theme');
			darkmodeState = 'true';
		}
	}
	let table = '<table><tr>';
	let count = 0;
	Object.keys(Menu).forEach(item => {
		if (Menu[item].header) {
			for (let i = count; i < Settings.MAIN_TABLE_WIDTH; i++) {
				table += `<td></td>`;
			}
			table += `</tr><tr><td colspan="${Settings.MAIN_TABLE_WIDTH}"><center><strong><u>${item}</u></strong></center></td></tr><tr>`;
			count = 0;
		} else {
			let icon = getIcon(item);
			let comboName = item;
			if (comboName.includes("Combo") || comboName.includes("Meal")) {
				if (comboName !== 'Papa Combo') {
					comboName = comboName.replace(" Combo", "").replace(" Meal", "");
				}
			}
			if (Menu[item].emoji) {
				if (!isSelected(item)) return;
			} else {
				let fileName = `${comboName.toLowerCase().replace(' ', '_')}.png`;
			}
			let qty = 0;
			if (pageReloaded && (Menu[item].emoji && isSelected(item))) {
				let element = document.getElementById(`${item}-#`);
				if (element) qty = document.getElementById(`${item}-#`).innerText;
			}

			table += "<td><center><button class=\"btn\" title='Add 1x " + item + "' onClick='add(\"" + item + "\")'><strong>" + icon + item + "</strong></button><br />" +
				`Qty: <strong><span id="${item}-#">${qty}</span></strong> | $${Menu[item].price} | ` +
				"<i class=\"fa fa-pencilfa fa-pencil-square\" aria-hidden=\"true\" title='Manually edit " + item + " quantity' onClick='editQuantity(\"" + item + "\")'></i> " +
				"<i class=\"fa fa-minus-circle\" aria-hidden=\"true\" title='Remove 1x " + item + "' onClick='remove(\"" + item + "\")'></i></td>";
			count++;
			if (count == Settings.MAIN_TABLE_WIDTH) {
				table += `</tr><tr>`
				count = 0;
			}
			if (Menu[item].lastItem) {
				for (let i = count; i < Settings.MAIN_TABLE_WIDTH; i++) {
					table += `<td></td>`;
				}
			}
		}
	});

	table += `</tr><tr><td colspan="${Settings.MAIN_TABLE_WIDTH}">`
	Object.keys(discounts).forEach(discount => {
		table += `<input type="checkbox" id="${discount}-DISCOUNT" name="${discount}-DISCOUNT" value="${discount}-DISCOUNT" />` +
			`<label for="${discount}-DISCOUNT">${discounts[discount].desc}</label><br />`;
	});
	table += `</td></tr></table>`;

	document.getElementById('table').innerHTML = table;

	let activeButtons = `${buttons['buffer'].html}${buttons['new_order'].html}`;
	if (!selectingCombos) activeButtons += ` | ${buttons['set_combos'].html}`;
	document.getElementById('action-buttons').innerHTML = activeButtons;

	if (!pageReloaded) getEmptyOrder();

	let inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
	inputs.forEach(i => i.addEventListener('keyup', report, false));

	let checkboxes = document.querySelectorAll('input[type="checkbox"], input[type="radio"]');
	checkboxes.forEach(i => i.addEventListener('click', report, false));
}