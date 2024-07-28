const K_TRUE = "true";
const K_FALSE = "false";

var oImgFace;	//smile face
var oLeftBox;	//box that display the rest count of mine
var oRightBox;	//box that display the used time
var row_count, col_count;
var mine_count;
var time_count = 0;	//time used
var rest_mine;	//remaining mines
var timer_id;
var is_begin = false;	//is game started?
var is_end = false;	//is game ended?
var is_first_click = false; //is first block opened
var oMainFrame;	//game main frame
var nickname;

//initialize the mine area
function InitMineArea(row, col, mine_num, mine_index) {
	var accumulate = row * col;
	var mine_array = new Array(accumulate);
	var mine_pos = new Array(accumulate);
	var i, j, index;
	var k, l, temp;
	var cur = 0;	//curent pos

	for (i = 0; i < accumulate; i++) {
		//init to self index
		mine_pos[i] = i;
	}

	//generate the random mine area
	for (i = 0; i < (2 * accumulate); i++) {
		//generate 2 positions that between 0 and accumulate
		k = Math.round(Math.random() * accumulate);
		l = Math.round(Math.random() * accumulate);
		//exchange the 2 positions
		temp = mine_pos[k];
		mine_pos[k] = mine_pos[l];
		mine_pos[l] = temp;
	}

	//init the mine_array to default(nothing)
	for (i = 0; i < row; i++) {
		for (j = 0; j < col; j++) {
			index = col * i + j;
			mine_array[index] = 0;	//default is nothing
		}
	}

	//if first click is a mine, regenerate the mine area value
	//put the first click index to the end of random array
	if (mine_index) {
		for (i = 0; i < mine_num; i++) {
			if (mine_pos[i] === mine_index) {
				var cur_pos = mine_pos[i];
				mine_pos[i] = mine_pos[accumulate];
				mine_pos[accumulate] = cur_pos;
				break;
			}
		}
	}

	//set the mine's position
	for (i = 0; i < mine_num; i++) {
		//mine's pos is define in the front (mine_num) indexes of mine_pos(array)
		mine_array[mine_pos[i]] = 9;
	}

	//(i-1,j-1) (i-1,j) (i-1,j+1)
	//(i,j-1)   (i,j)	(i,j+1)
	//(i+1,j-1) (i+1,j) (i+1,j+1)
	//generate the number beside a mine
	for (i = 0; i < row; i++) {
		for (j = 0; j < col; j++) {
			//(i-1,j-1) (i-1,j) (i-1,j+1)
			//(i,j-1)   (i,j)	(i,j+1)
			//(i+1,j-1) (i+1,j) (i+1,j+1)			
			index = col * i + j;
			//when ever there is a mine;
			if (mine_array[index] === 9) {
				//the row (i) 
				//(i,j-1)
				if ((j - 1) >= 0) {
					index = col * i + j - 1;
					if (mine_array[index] != 9) mine_array[index]++;
				}
				//(i,j+1)
				if ((j + 1) < col) {
					index = col * i + j + 1;
					if (mine_array[index] != 9) mine_array[index]++;
				}

				//the row (i-1)
				if ((i - 1) >= 0) {
					//(i-1,j)
					index = col * (i - 1) + j;
					if (mine_array[index] != 9) mine_array[index]++;
					//(i-1,j-1)
					if ((j - 1) >= 0) {
						index = col * (i - 1) + j - 1;
						if (mine_array[index] != 9) mine_array[index]++;
					}
					//(i-1,j+1)
					if ((j + 1) < col) {
						index = col * (i - 1) + j + 1;
						if (mine_array[index] != 9) mine_array[index]++;
					}
				}

				//the row (i+1)
				if ((i + 1) < row) {
					//(i+1,j)
					index = col * (i + 1) + j;
					if (mine_array[index] != 9) mine_array[index]++;
					//(i+1,j-1)
					if ((j - 1) >= 0) {
						index = col * (i + 1) + j - 1;
						if (mine_array[index] != 9) mine_array[index]++;
					}
					//(i+1,j+1)
					if ((j + 1) < col) {
						index = col * (i + 1) + j + 1;
						if (mine_array[index] != 9) mine_array[index]++;
					}
				}
			}
		}
	}

	return mine_array;
}

//Refresh the main frame and restart the game
function RefreshMainFrame() {
	is_begin = false;
	is_end = false;
	time_count = 0;
	rest_mine = mine_count;
	is_first_click = false;
	window.clearInterval(timer_id);
	var oldFrame = oMainFrame;
	oMainFrame = new MainFrame(row_count, col_count, mine_count);
	document.getElementById("playground").replaceChild(oMainFrame, oldFrame);
}

//Smile face button
function FaceButton() {
	var oButtonContainer = document.createElement("div");
	var oButtonSelf = document.createElement("div");
	oButtonContainer.className = "container_border";
	oButtonContainer.style.width = "30px";
	oButtonSelf.className = "img_button_up";
	oButtonSelf.style.width = "24px";
	oButtonSelf.style.height = "24px";
	//set whether the button is paused
	oButtonSelf.setAttribute("pushed", false);

	oImgFace = document.createElement("img");
	oImgFace.border = 0;
	oImgFace.src = "images/smile.gif";
	oImgFace.style.padding = "0px";
	oImgFace.style.margin = "2px 0 0 0px";

	with(oButtonSelf) {
		onmousedown = function () {
			oButtonSelf.className = "img_button_down";
			oButtonSelf.setAttribute("pushed", true);
		}

		onmouseout = function () {
			if (oButtonSelf.getAttribute("pushed") === K_TRUE) {
				oButtonSelf.className = "img_button_up";
				oButtonSelf.setAttribute("pushed", false);
			}
		}

		onmouseup = function () {
			//if the button hasn't been pushed, then onmouseup is disabled
			if (oButtonSelf.getAttribute("pushed") === K_FALSE) {
				return false;
			}
			oButtonSelf.className = "img_button_up";
			oButtonSelf.setAttribute("pushed", false);
			RefreshMainFrame();
		}
	}

	oButtonSelf.appendChild(oImgFace);
	oButtonContainer.appendChild(oButtonSelf);

	return oButtonContainer;
}

//Expand the main frame after game over
function ExpandAll() {
	var i;
	var oMine, oBomb, oError;
	var accumulate = row_count * col_count;
	for (i = 0; i < accumulate; i++) {
		oMine = document.getElementById("mine_" + i);
		if (oMine.getAttribute("expanded") === K_FALSE) {
			switch (parseInt(oMine.getAttribute("mine_value"), 10)) {
				case 9:
					if (oMine.getAttribute("marked") === K_TRUE) {
						//keep the flag if tagged correctly
						oMine.className = "mine_down_bomb";
						break;
					}
					//else show a mine flag
					if (oMine.hasChildNodes()) {
						oMine.removeChild(oMine.firstChild);
					}
					oMine.className = "mine_down_bomb";
					oBomb = document.createElement("img");
					oBomb.style.width = "15px";
					oBomb.style.height = "15px";
					oBomb.style.padding = "0px";
					oBomb.style.margin = "0px";
					oBomb.src = "images/bomb.gif";
					oMine.appendChild(oBomb);
					oMine.setAttribute("expanded", true);
					break;
				default:
					if (oMine.getAttribute("marked") === K_TRUE) {
						oMine.className = "mine_wrong_flag";
						oError = document.createElement("img");
						oError.style.width = "15px";
						oError.style.height = "15px";
						oError.style.padding = "0px";
						oError.style.margin = "0px";
						oError.src = "images/error.gif";
						oMine.appendChild(oError);
					} else {
						oMine.className = "mine_down";
						oMine.innerText = oMine.getAttribute("mine_value");
					}
					oMine.setAttribute("expanded", true);
					break;
			}
		}
	}
}

//Check if the player win the game
function CheckGameStatus() {
	var i, j;
	var is_win = true;
	var accumulate = row_count * col_count;
	if (rest_mine != 0) {
		is_win = false;
	} else {
		for (i = 0; i < accumulate; i++) {
			oMine = document.getElementById("mine_" + i);
			if (oMine.getAttribute("expanded") === K_FALSE && oMine.getAttribute("mine_value") != 9) {
				is_win = false;
				break;
			}
		}
	}

	if (is_win) {
		window.clearInterval(timer_id);
		oImgFace.src = "images/smile_win.gif";
		is_end = true;
	}
}

//Expand the area where there is no mine
function ExpandMineArea(mine_index) {
	var i, j, cur_row, cur_col;
	var oMine, temp_array, cur_array = new Array();
	cur_array.push(mine_index);
	while (cur_array.length > 0) {
		temp_array = new Array();
		for (i = 0; i < cur_array.length; i++) {
			oMine = document.getElementById("mine_" + cur_array[i]);
			//if it is expanded already, then don't expand again
			if (oMine.getAttribute("expanded") === K_TRUE) {
				continue;
			}

			oMine.setAttribute("expanded", true);
			oMine.className = "mine_down";
			oMine.innerText = oMine.getAttribute("mine_value");
			//when the mine's value is "0", expand the relative mine area
			if (oMine.getAttribute("mine_value") == 0) {
				cur_row = Math.floor(cur_array[i] / col_count);
				cur_col = cur_array[i] % col_count;

				//(i-1,j-1) (i-1,j) (i-1,j+1)
				//(i,j-1)   (i,j)	(i,j+1)
				//(i+1,j-1) (i+1,j) (i+1,j+1)	

				//the row (i-1)
				if ((cur_row - 1) >= 0) {
					//(i-1,j-1)
					if ((cur_col - 1) >= 0) {
						j = col_count * (cur_row - 1) + cur_col - 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
					//(i-1,j)
					j = col_count * (cur_row - 1) + cur_col;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
					//(i-1,j+1)
					if ((cur_col + 1) < col_count) {
						j = col_count * (cur_row - 1) + cur_col + 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
				}

				//the row (i)
				//(i,j-1)
				if ((cur_col - 1) >= 0) {
					j = col_count * cur_row + cur_col - 1;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
				}
				//(i,j+1)
				if ((cur_col + 1) < col_count) {
					j = col_count * cur_row + cur_col + 1;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
				}

				//the row (i+1)
				if ((cur_row + 1) < row_count) {
					//(i+1,j-1)
					if ((cur_col - 1) >= 0) {
						j = col_count * (cur_row + 1) + cur_col - 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
					//(i+1,j)
					j = col_count * (cur_row + 1) + cur_col;
					if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
						temp_array.push(j);
					}
					//(i+1,j+1)
					if ((cur_col + 1) < col_count) {
						j = col_count * (cur_row + 1) + cur_col + 1;
						if (document.getElementById("mine_" + j).getAttribute("expanded") === K_FALSE) {
							temp_array.push(j);
						}
					}
				}
			}
		}
		cur_array = temp_array;
	}
}

//create main frame
function MainFrame(row, col, mine_num) {
	var i, j, index;
	var cur_mine;
	var oFragment = document.createDocumentFragment();
	row_count = row;
	col_count = col;
	mine_count = mine_num;
	rest_mine = mine_num;

	//create mine area value, save to array
	var mine_array = InitMineArea(row, col, mine_num);
	//create a new table
	var oMineTable = document.createElement("table");
	oMineTable.cellPadding = 0;
	oMineTable.cellSpacing = 0;
	oMineTable.id = "oMineTable";
	//create thead
	var oTBody = document.createElement("tbody");

	//create a div contains the mine table
	var oContainer = document.createElement("div");
	oContainer.className = "container_border";

	for (i = 0; i < row; i++) {
		var oRow = document.createElement("tr");
		for (j = 0; j < col; j++) {
			index = col * i + j;
			cur_mine = MineButton(mine_array[index], index);
			var oCell = document.createElement("td");
			oCell.appendChild(cur_mine);
			oRow.appendChild(oCell);
		}
		oTBody.appendChild(oRow);
	}

	oMineTable.appendChild(oTBody);
	oContainer.appendChild(oMineTable);
	oFragment.appendChild(oContainer);

	return oFragment;
}

//Create mine button, and bind click event
function MineButton(mine_value, mine_index) {
	var oMine = document.createElement("div");
	var temp_value; //value under current block
	var oBomb, oFlag; //object of "mine" and "mine flag"
	var source; //click source
	var expanded, marked, detected; //expanded, marked as mine, guess as a mine
	oMine.id = "mine_" + mine_index;
	oMine.className = "mine_up";
	oMine.style.width = "18px";
	oMine.style.height = "18px";
	oMine.setAttribute("mine_value", mine_value);
	oMine.setAttribute("mine_index", mine_index);

	//set whether it is marked as a mine
	oMine.setAttribute("marked", false);

	//if this is a mine, then set whether it is expanded as exploded 
	oMine.setAttribute("opened", false);

	//set whether it is expanded
	oMine.setAttribute("expanded", false);

	//set whether mouse button is pushed
	oMine.setAttribute("pushed", false);

	//set whether the guess flag is set
	oMine.setAttribute("detected", false);

	//oMine.innerText = mine_value;

	//left mouse button response to onmouseup event, right mouse button response to onmousedown event
	with(oMine) {
		onmousedown = function (event) {
			handleMouseEvent(event);
		}

		onmouseup = function (event) {
			if (event.button === 0 && this.getAttribute("pushed") === K_TRUE) {
				handleLeftClick(this);
			}
		}

		oncontextmenu = function (event) {
			event.preventDefault(); // Disable the default right-click context menu
			handleRightClick(this);
			return false;
		}

		// Handle touch events for mobile devices
		ontouchstart = function (event) {
			event.preventDefault(); // Prevent default touch behavior
			this.touchStartTime = new Date().getTime(); // Record the time when the touch starts
			handleMouseEvent({ target: this, button: 0 }); // Simulate left mouse button down
		}

		ontouchend = function (event) {
			event.preventDefault(); // Prevent default touch behavior
			var touchEndTime = new Date().getTime(); // Record the time when the touch ends
			var touchDuration = touchEndTime - this.touchStartTime; // Calculate the touch duration
			if (touchDuration < 500) { // If touch duration is less than 500ms, treat it as a left click
				handleLeftClick(this);
			} else { // Otherwise, treat it as a right click
				handleRightClick(this);
			}
		}
	}

	return oMine;
}

// Handle mouse events
function handleMouseEvent(event) {
	var oMine = event.target;
	if (event.button === 0) {
		oMine.className = "mine_down";
		oMine.setAttribute("pushed", true);
	}
}

// Handle left click
function handleLeftClick(oMine) {
	oMine.setAttribute("pushed", false);
	//if this block is marked as a mine, then disable
	if (oMine.getAttribute("marked") === K_TRUE) {
		return false;
	}

	if (is_end) {
		return false;
	}

	if (oMine.getAttribute("expanded") === K_TRUE) {
		return false;
	}
	oMine.setAttribute("expanded", true);

	//if this block is a mine
	if (parseInt(oMine.getAttribute("mine_value"), 10) === 9) {
		//face image is failure
		oImgFace.src = "images/smile_fail.gif";
		//show the mine
		oBomb = document.createElement("img");
		oBomb.style.width = "15px";
		oBomb.style.height = "15px";
		oBomb.style.padding = "0px";
		oBomb.style.margin = "0px";
		oBomb.src = "images/bomb.gif";
		oMine.appendChild(oBomb);
		//end of game
		is_end = true;
		//expand the main frame
		window.clearInterval(timer_id);
		ExpandAll();
	} else {
		oMine.className = "mine_down";
		//expand the safe area if this block is "0"
		if (oMine.getAttribute("mine_value") === "0") {
			ExpandMineArea(parseInt(oMine.getAttribute("mine_index"), 10));
		} else {
			oMine.innerText = oMine.getAttribute("mine_value");
		}
	}

	if (!is_begin) {
		is_begin = true;
		timer_id = window.setInterval(function () {
			time_count++;
			oRightBox.innerText = time_count;
		}, 1000);
	}

	CheckGameStatus();
}

// Handle right click
function handleRightClick(oMine) {
	if (is_end) {
		return false;
	}

	if (oMine.getAttribute("expanded") === K_TRUE) {
		return false;
	}

	if (oMine.getAttribute("detected") === K_TRUE) {
		//cancel the guess flag
		oMine.className = "mine_up";
		oMine.setAttribute("detected", false);
		return false;
	}

	if (oMine.getAttribute("marked") === K_FALSE) {
		oFlag = document.createElement("img");
		oFlag.style.width = "15px";
		oFlag.style.height = "15px";
		oFlag.style.padding = "0px";
		oFlag.style.margin = "0px";
		oFlag.src = "images/flag.gif";
		oMine.appendChild(oFlag);
		oMine.setAttribute("marked", true);
		rest_mine--;
		oLeftBox.innerText = rest_mine;
	} else {
		oMine.removeChild(oMine.firstChild);
		oMine.setAttribute("marked", false);
		rest_mine++;
		oLeftBox.innerText = rest_mine;
	}

	if (!is_begin) {
		is_begin = true;
		timer_id = window.setInterval(function () {
			time_count++;
			oRightBox.innerText = time_count;
		}, 1000);
	}

	CheckGameStatus();
}

//Init the game
function Init() {
	oMainFrame = new MainFrame(row_count, col_count, mine_count);
	document.getElementById("playground").appendChild(oMainFrame);

	oLeftBox = document.getElementById("mine_count");
	oLeftBox.innerText = mine_count;
	oRightBox = document.getElementById("time_count");
	oRightBox.innerText = 0;

	var oFaceContainer = document.getElementById("face_button");
	oFaceContainer.appendChild(FaceButton());
}

//Process player's config
function StartGame() {
	var obj = document.getElementById("difficulty");
	var value = obj.value;
	switch (value) {
		case "beginner":
			row_count = 9;
			col_count = 9;
			mine_count = 10;
			break;
		case "intermediate":
			row_count = 16;
			col_count = 16;
			mine_count = 40;
			break;
		case "advanced":
			row_count = 16;
			col_count = 30;
			mine_count = 99;
			break;
	}

	RefreshMainFrame();
}

window.onload = function () {
	document.getElementById("start_button").onclick = StartGame;
}
